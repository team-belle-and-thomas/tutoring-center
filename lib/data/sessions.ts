import 'server-only';
import { notFound } from 'next/navigation';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { pickFirstEmbedded } from '@/lib/utils/normalize';

// Session Detail Types
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
