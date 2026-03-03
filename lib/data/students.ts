import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, type UserRole } from '@/lib/mock-api';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { STUDENT_DETAIL_SELECT_WITH_JOINS, STUDENT_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import type { SessionStatus } from '@/lib/validators/sessions';
import {
  StudentDetailWithJoinsSchema,
  StudentWithJoinsListSchema,
  type StudentDetailSession,
  type StudentWithJoins,
} from '@/lib/validators/students';

export type StudentRow = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  grade: string;
};

export type StudentSessionRow = {
  id: number;
  scheduled_at: string;
  ends_at: string;
  status: SessionStatus;
  slot_units: number;
  subject_category: string;
  tutor_name: string;
};

export type StudentProfileDetail = {
  id: number;
  user_id: number;
  parent_id: number | null;
  name: string;
  email: string;
  phone: string;
  grade: string;
  birth_date: string | null;
  learning_goals: string | null;
  sessions: StudentSessionRow[];
};

type StudentLoadErrorReason = 'database' | 'validation';
type AllowedRole = Exclude<UserRole, 'tutor'>;

const isValidRole = (value: unknown): value is UserRole => value === 'admin' || value === 'parent' || value === 'tutor';

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
    phone: user?.phone ?? '—',
  };
};

const mapStudentRow = (student: Pick<StudentWithJoins, 'id' | 'user_id' | 'grade' | 'users'>) => {
  const user = parseStudentUser(student.users);

  return {
    id: student.id,
    user_id: student.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    grade: student.grade ?? '—',
  };
};

const RECENT_SESSIONS_LIMIT = 5;

const mapSessionRow = (session: StudentDetailSession): StudentSessionRow => {
  const subject = pickFirstEmbedded(session.subject);
  const tutor = pickFirstEmbedded(session.tutor);
  const tutorUser = pickFirstEmbedded(tutor?.users);

  return {
    id: session.id,
    scheduled_at: session.scheduled_at,
    ends_at: session.ends_at,
    status: session.status,
    slot_units: session.slot_units,
    subject_category: subject?.category ?? '—',
    tutor_name: [tutorUser?.first_name, tutorUser?.last_name].filter(Boolean).join(' ') || '—',
  };
};

export async function getStudents(role: UserRole) {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch students.');
  }

  const supabase = createSupabaseServiceClient();

  if (role === 'tutor') forbidden();
  const allowedRole: AllowedRole = role;

  let studentsQuery = supabase.from('students').select(STUDENT_SELECT_WITH_JOINS);

  if (role !== 'admin') {
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

export async function getStudent(id: number, role: UserRole) {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch students.');
  }

  if (role === 'tutor') forbidden();

  const allowedRole: AllowedRole = role;
  const supabase = createSupabaseServiceClient();

  let parentId: number | null = null;
  if (role !== 'admin') {
    const userID = await getCurrentUserID();
    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userID)
      .single();

    if (parentErr || !parent) notFound();
    parentId = parent.id;
  }

  let studentQuery = supabase.from('students').select(STUDENT_DETAIL_SELECT_WITH_JOINS).eq('id', id);
  if (role !== 'admin' && parentId !== null) {
    studentQuery = studentQuery.eq('parent_id', parentId);
  }

  const { data: studentData, error: studentError } = await studentQuery
    .order('scheduled_at', { ascending: false, referencedTable: 'sessions' })
    .limit(RECENT_SESSIONS_LIMIT, { referencedTable: 'sessions' })
    .maybeSingle();

  if (studentError) {
    throw new Error(STUDENT_ERROR_MESSAGES[allowedRole]['database']);
  }
  if (!studentData) notFound();

  const parsedStudent = StudentDetailWithJoinsSchema.safeParse(studentData);
  if (!parsedStudent.success) {
    throw new Error(STUDENT_ERROR_MESSAGES[allowedRole]['validation']);
  }

  const student = parsedStudent.data;
  const sessions = (student.sessions ?? []).map(mapSessionRow);

  const user = parseStudentUser(student.users);

  return {
    id: student.id,
    user_id: student.user_id,
    parent_id: student.parent_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    grade: student.grade ?? '—',
    birth_date: student.birth_date,
    learning_goals: student.learning_goals,
    sessions,
  };
}
