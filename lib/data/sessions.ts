import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserID, getUserRole, type UserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { SESSION_SELECT_WITH_JOINS } from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';
import { SessionWithJoinsListSchema, type SessionWithJoins } from '@/lib/validators/sessions';

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
  hours: number;
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

  const studentData = Array.isArray(student) ? student[0] : student;
  const usersData = studentData?.users;
  const user = usersData ? pickFirstEmbedded(usersData) : null;

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

  const tutorData = Array.isArray(tutor) ? tutor[0] : tutor;
  const usersData = tutorData?.users;
  const user = usersData ? pickFirstEmbedded(usersData) : null;

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
    subject_name: 'Mathematics',
    scheduled_at: session.scheduled_at,
    ends_at: session.ends_at,
    hours: session.slot_units,
    status: session.status,
  };
};

export async function getSessions(kind: 'all' | 'upcoming' | 'past' = 'all') {
  const role = await getUserRole();
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch sessions.');
  }

  const supabase = createSupabaseServiceClient();

  let sessionsQuery = supabase.from('sessions').select(SESSION_SELECT_WITH_JOINS);

  if (kind === 'upcoming') {
    const now = new Date().toISOString();
    sessionsQuery = sessionsQuery.gte('scheduled_at', now);
  } else if (kind === 'past') {
    const now = new Date().toISOString();
    sessionsQuery = sessionsQuery.lt('scheduled_at', now);
  }

  if (role !== 'admin') {
    const userID = await getCurrentUserID();

    if (role === 'tutor') {
      const { data: tutor, error: tutorErr } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', userID)
        .single();

      if (tutorErr || !tutor) notFound();
      sessionsQuery = sessionsQuery.eq('tutor_id', tutor.id);
    } else {
      const { data: parent, error: parentErr } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', userID)
        .single();

      if (parentErr || !parent) notFound();
      sessionsQuery = sessionsQuery.eq('parent_id', parent.id);
    }
  }

  const { data, error } = await sessionsQuery;
  if (error) {
    throw new Error(SESSION_ERROR_MESSAGES[role as AllowedRole]['database']);
  }

  const parsedSessions = SessionWithJoinsListSchema.safeParse(data ?? []);
  if (!parsedSessions.success) {
    throw new Error(SESSION_ERROR_MESSAGES[role as AllowedRole]['validation']);
  }

  return parsedSessions.data.map(mapSessionRow);
}

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
    parent_id: number;
    parent_name: string;
    parent_email: string;
  };
  progress: {
    topics: string | null;
    homework_assigned: string | null;
    public_notes: string | null;
    internal_notes: string | null;
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
  tutor_id,
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
    public_notes,
    internal_notes
  ),
  session_metrics (
    confidence_score,
    session_performance,
    homework_completed,
    tutor_comments
  )
` as const;

export async function getSession(id: number): Promise<SessionDetailType> {
  const role = await getUserRole();
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.from('sessions').select(SESSION_DETAIL_SELECT).eq('id', id).single();

  if (error || !data) {
    notFound();
  }

  const sessionParentData = data.parent as unknown as { id: number } | Array<{ id: number }> | null;
  const sessionParentId = Array.isArray(sessionParentData) ? sessionParentData[0]?.id : sessionParentData?.id;
  const sessionTutorId = data.tutor_id;

  if (role !== 'admin') {
    const userID = await getCurrentUserID();

    if (role === 'tutor') {
      const { data: tutor } = await supabase.from('tutors').select('id').eq('user_id', userID).single();
      if (!tutor || sessionTutorId !== tutor.id) {
        redirect('/dashboard/sessions');
      }
    } else {
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', userID).single();

      if (!parent || sessionParentId !== parent.id) {
        redirect('/dashboard/sessions');
      }
    }
  }

  const tutorData = Array.isArray(data.tutor) ? data.tutor[0] : data.tutor;
  const tutorUsersData = tutorData?.users;
  const tutorUser = tutorUsersData ? pickFirstEmbedded(tutorUsersData) : null;

  const studentData = Array.isArray(data.student) ? data.student[0] : data.student;
  const studentUsersData = studentData?.users;
  const studentUser = studentUsersData ? pickFirstEmbedded(studentUsersData) : null;

  const parentData = Array.isArray(data.parent) ? data.parent[0] : data.parent;
  const parentUsersData = parentData?.users;
  const parentUser = parentUsersData ? pickFirstEmbedded(parentUsersData) : null;

  const subjectData = Array.isArray(data.subjects) ? data.subjects[0] : data.subjects;

  const progressRaw = data.session_progress as
    | {
        topics: string | null;
        homework_assigned: string | null;
        public_notes: string | null;
        internal_notes: string | null;
      }
    | Array<{
        topics: string | null;
        homework_assigned: string | null;
        public_notes: string | null;
        internal_notes: string | null;
      }>
    | null;
  const progress =
    progressRaw && typeof progressRaw === 'object' && !Array.isArray(progressRaw)
      ? {
          topics: progressRaw.topics,
          homework_assigned: progressRaw.homework_assigned,
          public_notes: progressRaw.public_notes,
          internal_notes: progressRaw.internal_notes,
        }
      : Array.isArray(progressRaw) && progressRaw.length > 0
        ? {
            topics: progressRaw[0].topics,
            homework_assigned: progressRaw[0].homework_assigned,
            public_notes: progressRaw[0].public_notes,
            internal_notes: progressRaw[0].internal_notes,
          }
        : null;

  const metricsRaw = data.session_metrics as
    | {
        confidence_score: number | null;
        session_performance: number | null;
        homework_completed: boolean;
        tutor_comments: string | null;
      }
    | Array<{
        confidence_score: number | null;
        session_performance: number | null;
        homework_completed: boolean;
        tutor_comments: string | null;
      }>
    | null;
  const metrics =
    metricsRaw && typeof metricsRaw === 'object' && !Array.isArray(metricsRaw)
      ? {
          confidence_score: metricsRaw.confidence_score,
          session_performance: metricsRaw.session_performance,
          homework_completed: metricsRaw.homework_completed,
          tutor_comments: metricsRaw.tutor_comments,
        }
      : Array.isArray(metricsRaw) && metricsRaw.length > 0
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
      parent_id: studentData?.parent_id || 0,
      parent_name: parentUser ? [parentUser.first_name, parentUser.last_name].filter(Boolean).join(' ') : '—',
      parent_email: parentUser?.email || '—',
    },
    progress,
    metrics,
  };
}

export type TutorAssignedSession = {
  id: number;
  student_name: string;
  student_id: number;
  tutor_id: number;
  subject_name: string;
  scheduled_at: string;
  ends_at: string;
  status: string;
  needsProgressReport: boolean;
  needsMetrics: boolean;
};

// Mock data for development/testing
// const MOCK_TUTOR_SESSIONS: TutorAssignedSession[] = [
//   {
//     id: 1,
//     student_name: 'Sofia Santos',
//     student_id: 1,
//     tutor_id: 1,
//     subject_name: 'Mathematics',
//     scheduled_at: '2026-03-01T14:00:00Z',
//     ends_at: '2026-03-01T15:00:00Z',
//     status: 'Pending-Notes',
//     needsProgressReport: true,
//     needsMetrics: false,
//   },
//   {
//     id: 2,
//     student_name: 'Miguel Santos',
//     student_id: 2,
//     tutor_id: 1,
//     subject_name: 'Science',
//     scheduled_at: '2026-03-01T16:00:00Z',
//     ends_at: '2026-03-01T17:00:00Z',
//     status: 'Pending-Notes',
//     needsProgressReport: true,
//     needsMetrics: true,
//   },
//   {
//     id: 3,
//     student_name: 'Tyler Thompson',
//     student_id: 3,
//     tutor_id: 1,
//     subject_name: 'English',
//     scheduled_at: '2026-03-02T10:00:00Z',
//     ends_at: '2026-03-02T11:00:00Z',
//     status: 'Pending-Notes',
//     needsProgressReport: false,
//     needsMetrics: true,
//   },
// ];

export async function getTutorAssignedSessions(): Promise<TutorAssignedSession[]> {
  const role = await getUserRole();
  if (role !== 'tutor') {
    return [];
  }

  const tutorUserId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: tutorData, error: tutorError } = await supabase
    .from('tutors')
    .select('id')
    .eq('user_id', tutorUserId)
    .single();

  if (tutorError || !tutorData) {
    return [];
  }

  const tutorId = tutorData.id;

  const TUTOR_SESSION_SELECT = `
    id,
    tutor_id,
    student_id,
    subject_id,
    parent_id,
    slot_units,
    scheduled_at,
    ends_at,
    status,
    session_progress (id),
    session_metrics (id),
    student:students (
      users:user_id (
        first_name,
        last_name
      )
    ),
    subjects (
      category
    )
  ` as const;

  const { data, error } = await supabase.from('sessions').select(TUTOR_SESSION_SELECT).eq('tutor_id', tutorId);

  if (error || !data || data.length === 0) {
    return [];
  }

  const sessionsWithStatus = data.map(
    (session): TutorAssignedSession & { hasProgress: boolean; hasMetrics: boolean } => {
      const progressData = session.session_progress as unknown as { id: number } | null;
      const metricsData = session.session_metrics as unknown as { id: number } | null;
      const hasProgress = !!progressData;
      const hasMetrics = !!metricsData;

      const studentData = Array.isArray(session.student) ? session.student[0] : session.student;
      const studentUser = studentData?.users
        ? Array.isArray(studentData.users)
          ? studentData.users[0]
          : studentData.users
        : null;
      const studentName = studentUser
        ? `${studentUser.first_name || ''} ${studentUser.last_name || ''}`.trim()
        : 'Student';

      const subjectData = Array.isArray(session.subjects) ? session.subjects[0] : session.subjects;
      const subjectName = subjectData?.category || 'Subject';

      return {
        id: session.id,
        student_name: studentName,
        student_id: session.student_id,
        tutor_id: session.tutor_id,
        subject_name: subjectName,
        scheduled_at: session.scheduled_at,
        ends_at: session.ends_at,
        status: session.status,
        needsProgressReport: !hasProgress,
        needsMetrics: !hasMetrics,
        hasProgress,
        hasMetrics,
      };
    }
  );

  return (
    sessionsWithStatus
      .filter(session => !(session.hasProgress && session.hasMetrics))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ hasProgress, hasMetrics, ...session }) => session)
  );
}
