import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, getUserRole, type UserRole } from '@/lib/mock-api';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { STUDENT_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { StudentWithJoinsListSchema, type StudentWithJoins } from '@/lib/validators/students';

export type StudentRow = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  grade: string;
};

type StudentLoadErrorReason = 'database' | 'validation';
type AllowedRole = Exclude<UserRole, 'tutor'>;

const STUDENT_ERROR_MESSAGES = {
  admin: {
    database: 'Student data is temporarily unavailable. Please retry in a moment.',
    validation: 'Student data format is invalid. Please try again later.',
  },
  parent: {
    database: 'Your student list is temporarily unavailable. Please try again in a moment.',
    validation: 'There was a problem preparing your students list. Please try again.',
  },
} as const satisfies Record<AllowedRole, Record<StudentLoadErrorReason, string>>;

const parseStudentUser = (users: StudentWithJoins['users']) => {
  const user = pickFirstEmbedded(users);

  return {
    name: [user?.first_name, user?.last_name].filter(Boolean).join(' '),
    email: user?.email ?? '',
  };
};

const mapStudentRow = (student: Pick<StudentWithJoins, 'id' | 'user_id' | 'grade' | 'users'>) => {
  const user = parseStudentUser(student.users);

  return {
    id: student.id,
    user_id: student.user_id,
    name: user.name,
    email: user.email,
    grade: student.grade ?? '—',
  };
};

export async function getStudents(role?: UserRole) {
  const resolvedRole = role ?? (await getUserRole());
  const supabase = createSupabaseServiceClient();

  if (resolvedRole === 'tutor') forbidden();
  const allowedRole: AllowedRole = resolvedRole;

  let studentsQuery = supabase.from('students').select(STUDENT_SELECT_WITH_JOINS);

  if (resolvedRole !== 'admin') {
    const userID = await getCurrentUserID();
    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userID)
      .single();

    if (parentErr || !parent) notFound();
    studentsQuery = studentsQuery.eq('parent_id', parent.id);
  }

  const { data, error } = await studentsQuery;
  if (error) {
    throw new Error(STUDENT_ERROR_MESSAGES[allowedRole]['database']);
  }

  const parsedStudents = StudentWithJoinsListSchema.safeParse(data ?? []);
  if (!parsedStudents.success) {
    throw new Error(STUDENT_ERROR_MESSAGES[allowedRole]['validation']);
  }

  return parsedStudents.data.map(mapStudentRow);
}
