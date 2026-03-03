import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, getUserRole } from '@/lib/mock-api';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { SESSION_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import type { UserRole } from '@/lib/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { SessionWithJoinsListSchema, type SessionWithJoins } from '@/lib/validators/sessions';

// ============================================
// Session List Types (Story 1-2)
// ============================================

export type SessionRow = {
  id: number;
  student_name: string;
  tutor_id: number;
  tutor_name: string;
  student_id: number;
  subject_id: number;
  subject_name: string;
  scheduled_at: string;
  ends_at: string;
  hours: number; // 1 unit = 1 hour
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
    validation: 'There was a problem preparing your students list. Please try again.',
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
    student_id: session.student_id,
    subject_id: session.subject_id,
    subject_name: 'Mathematics', // TODO: Add subject join to get actual name
    scheduled_at: session.scheduled_at,
    ends_at: session.ends_at,
    hours: session.slot_units, // 1 unit = 1 hour
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

// ============================================
// Session Detail Types (Story 2-2)
// ============================================

export type SessionDetailType = {
  id: number;
  scheduled_at: string;
  ends_at: string;
  slot_units: number;
  status: string;
  subject_id: number;
  subject_name: string;
  tutor: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  student: {
    id: number;
    name: string;
    parent_name: string;
    parent_email: string;
  };
  progress: {
    topics: string | null;
    homework_assigned: string | null;
    public_notes: string | null;
  } | null;
  metrics: {
    confidence_score: number | null;
    session_performance: number | null;
    homework_completed: boolean;
    tutor_comments: string | null;
  } | null;
};

// Extended select query for session detail with all joins
const SESSION_DETAIL_SELECT = `
  id,
  scheduled_at,
  ends_at,
  slot_units,
  status,
  subject_id,
  subjects:subject_id (
    category
  ),
  tutor:tutors (
    id,
    verified,
    years_experience,
    users:user_id (
      first_name,
      last_name,
      email,
      phone
    )
  ),
  student:students (
    id,
    parent_id,
    users:user_id (
      first_name,
      last_name,
      email
    )
  ),
  parent:parents (
    id,
    users:user_id (
      first_name,
      last_name,
      email
    )
  ),
  session_progress (
    topics,
    homework_assigned,
    public_notes
  ),
  session_metrics (
    confidence_score,
    session_performance,
    homework_completed,
    tutor_comments
  )
` as const;

export async function getSession(id: number): Promise<SessionDetailType> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.from('sessions').select(SESSION_DETAIL_SELECT).eq('id', id).single();

  if (error || !data) {
    notFound();
  }

  // Parse tutor user info
  const tutorData = Array.isArray(data.tutor) ? data.tutor[0] : data.tutor;
  const tutorUsersData = tutorData?.users;
  const tutorUser = tutorUsersData ? pickFirstEmbedded(tutorUsersData) : null;

  // Parse student user info
  const studentData = Array.isArray(data.student) ? data.student[0] : data.student;
  const studentUsersData = studentData?.users;
  const studentUser = studentUsersData ? pickFirstEmbedded(studentUsersData) : null;

  // Parse parent user info
  const parentData = Array.isArray(data.parent) ? data.parent[0] : data.parent;
  const parentUsersData = parentData?.users;
  const parentUser = parentUsersData ? pickFirstEmbedded(parentUsersData) : null;

  // Parse subject
  const subjectData = Array.isArray(data.subjects) ? data.subjects[0] : data.subjects;

  // Parse progress (take first if exists)
  const progressRaw = data.session_progress as unknown as Array<{
    topics: string | null;
    homework_assigned: string | null;
    public_notes: string | null;
  }> | null;
  const progress =
    progressRaw && progressRaw.length > 0
      ? {
          topics: progressRaw[0].topics,
          homework_assigned: progressRaw[0].homework_assigned,
          public_notes: progressRaw[0].public_notes,
        }
      : null;

  // Parse metrics (take first if exists)
  const metricsRaw = data.session_metrics as unknown as Array<{
    confidence_score: number | null;
    session_performance: number | null;
    homework_completed: boolean;
    tutor_comments: string | null;
  }> | null;
  const metrics =
    metricsRaw && metricsRaw.length > 0
      ? {
          confidence_score: metricsRaw[0].confidence_score,
          session_performance: metricsRaw[0].session_performance,
          homework_completed: metricsRaw[0].homework_completed,
          tutor_comments: metricsRaw[0].tutor_comments,
        }
      : null;

  return {
    id: data.id,
    scheduled_at: data.scheduled_at,
    ends_at: data.ends_at,
    slot_units: data.slot_units,
    status: data.status,
    subject_id: data.subject_id,
    subject_name: subjectData?.category || 'Unknown',
    tutor: {
      id: tutorData?.id || 0,
      name: tutorUser ? [tutorUser.first_name, tutorUser.last_name].filter(Boolean).join(' ') : '—',
      email: tutorUser?.email || '—',
      phone: tutorUser?.phone || '—',
    },
    student: {
      id: studentData?.id || 0,
      name: studentUser ? [studentUser.first_name, studentUser.last_name].filter(Boolean).join(' ') : '—',
      parent_name: parentUser ? [parentUser.first_name, parentUser.last_name].filter(Boolean).join(' ') : '—',
      parent_email: parentUser?.email || '—',
    },
    progress,
    metrics,
  };
}
