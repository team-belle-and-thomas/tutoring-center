import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, getUserRole } from '@/lib/mock-api';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { SESSION_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import type { UserRole } from '@/lib/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { SessionWithJoinsListSchema, type SessionWithJoins } from '@/lib/validators/sessions';

export type SessionRow = {
  id: number;
  student_name: string;
  tutor_id: number;
  tutor_name: string;
  subject_id: number;
  subject_name: string;
  scheduled_at: string;
  ends_at: string;
  units: number;
  status: string;
};

type SessionLoadErrorReason = 'database' | 'validation';
type AllowedRole = Exclude<UserRole, 'tutor'>;

const isValidRole = (value: unknown): value is UserRole => value === 'admin' || value === 'parent' || value === 'tutor';

const SESSION_ERROR_MESSAGES = {
  admin: {
    database: 'Session data is temporarily unavailable. Please retry in a moment.',
    validation: 'Session data format is invalid. Please try again later.',
  },
  parent: {
    database: 'Your session list is temporarily unavailable. Please try again in a moment.',
    validation: 'There was a problem preparing your sessions list. Please try again.',
  },
} as const satisfies Record<AllowedRole, Record<SessionLoadErrorReason, string>>;

const parseStudentUser = (student: SessionWithJoins['student']) => {
  if (!student) return { name: '—' };

  // Handle array or object case
  const studentData = Array.isArray(student) ? student[0] : student;

  // Handle the users field which might be an array or object
  const usersData = studentData?.users;
  const user = usersData ? pickFirstEmbedded(usersData) : null;

  // Safely access properties
  const firstName =
    user && typeof user === 'object' ? ((user as Record<string, unknown>).first_name as string | null) : null;
  const lastName =
    user && typeof user === 'object' ? ((user as Record<string, unknown>).last_name as string | null) : null;

  return {
    name: [firstName, lastName].filter(Boolean).join(' ') || '—',
  };
};

const parseTutorUser = (tutor: SessionWithJoins['tutor']) => {
  if (!tutor) return { name: '—' };

  // Handle array or object case
  const tutorData = Array.isArray(tutor) ? tutor[0] : tutor;

  // Handle the users field which might be an array or object
  const usersData = tutorData?.users;
  const user = usersData ? pickFirstEmbedded(usersData) : null;

  // Safely access properties
  const firstName =
    user && typeof user === 'object' ? ((user as Record<string, unknown>).first_name as string | null) : null;
  const lastName =
    user && typeof user === 'object' ? ((user as Record<string, unknown>).last_name as string | null) : null;

  return {
    name: [firstName, lastName].filter(Boolean).join(' ') || '—',
  };
};

const mapSessionRow = (session: SessionWithJoins): SessionRow => {
  const student = parseStudentUser(session.student);
  const tutor = parseTutorUser(session.tutor);

  return {
    id: session.id,
    student_name: student.name,
    tutor_id: session.tutor_id,
    tutor_name: tutor.name,
    subject_id: session.subject_id,
    subject_name: 'Mathematics', // TODO: Add subject join to get actual name
    scheduled_at: session.scheduled_at,
    ends_at: session.ends_at,
    units: session.slot_units,
    status: session.status,
  };
};

export async function getSessions(kind: 'all' | 'upcoming' | 'past' = 'all') {
  const role = await getUserRole();
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch sessions.');
  }

  const resolvedRole = role;
  const supabase = createSupabaseServiceClient();

  if (resolvedRole === 'tutor') forbidden();
  const allowedRole: AllowedRole = resolvedRole;

  let sessionsQuery = supabase.from('sessions').select(SESSION_SELECT_WITH_JOINS);

  // Apply kind filter
  if (kind === 'upcoming') {
    const now = new Date().toISOString();
    sessionsQuery = sessionsQuery.gte('scheduled_at', now);
  } else if (kind === 'past') {
    const now = new Date().toISOString();
    sessionsQuery = sessionsQuery.lt('scheduled_at', now);
  }

  // Apply role-based filtering
  if (resolvedRole !== 'admin') {
    const userID = await getCurrentUserID();
    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userID)
      .single();

    if (parentErr || !parent) notFound();
    sessionsQuery = sessionsQuery.eq('parent_id', parent.id);
  }

  const { data, error } = await sessionsQuery;
  if (error) {
    throw new Error(SESSION_ERROR_MESSAGES[allowedRole]['database']);
  }

  const parsedSessions = SessionWithJoinsListSchema.safeParse(data ?? []);
  if (!parsedSessions.success) {
    throw new Error(SESSION_ERROR_MESSAGES[allowedRole]['validation']);
  }

  return parsedSessions.data.map(mapSessionRow);
}
