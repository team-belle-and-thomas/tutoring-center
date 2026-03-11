import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, isValidRole, type UserRole } from '@/lib/auth';
import type { Enums, Tables } from '@/lib/supabase/database.types';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { pickFirstEmbedded } from '@/lib/utils/normalize';

type Embedded<T> = T | T[] | null;
type AllowedRole = Exclude<UserRole, 'tutor'>;
type TransactionType = Enums<'transaction_type'>;
type SessionStatus = Enums<'session_status'>;

type CreditTransactionRecord = Pick<
  Tables<'credit_transactions'>,
  'id' | 'created_at' | 'type' | 'amount' | 'balance_after' | 'session_id'
>;
type UserNameRow = Pick<Tables<'users'>, 'first_name' | 'last_name'>;
type TutorJoin = {
  users: Embedded<UserNameRow>;
};
type SubjectJoin = {
  category: string;
};
type SessionProgressJoin = Pick<
  Tables<'session_progress'>,
  'created_at' | 'updated_at' | 'topics' | 'homework_assigned' | 'public_notes'
>;
type ProgressSessionRecord = Pick<Tables<'sessions'>, 'id' | 'scheduled_at' | 'status'> & {
  subject: Embedded<SubjectJoin>;
  tutor: Embedded<TutorJoin>;
  session_progress: Embedded<SessionProgressJoin>;
};

export type StudentCreditHistoryItem = {
  id: number;
  created_at: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  session_id: number | null;
};

export type StudentProgressReportItem = {
  session_id: number;
  scheduled_at: string;
  status: SessionStatus;
  subject_name: string;
  tutor_name: string;
  report_created_at: string;
  report_updated_at: string;
  topics: string | null;
  homework_assigned: string | null;
  public_notes: string | null;
};

export type StudentDashboardDetails = {
  creditHistory: StudentCreditHistoryItem[];
  progressReports: StudentProgressReportItem[];
};

const MISSING_VALUE = '\u2014';

const CREDIT_HISTORY_LIMIT = 5;
const PROGRESS_REPORT_LIMIT = 5;

const CREDIT_HISTORY_SELECT = `
  id,
  created_at,
  type,
  amount,
  balance_after,
  session_id
` as const;

const PROGRESS_REPORT_SELECT = `
  id,
  scheduled_at,
  status,
  subject:subjects (
    category
  ),
  tutor:tutors (
    users:user_id (
      first_name,
      last_name
    )
  ),
  session_progress!inner (
    created_at,
    updated_at,
    topics,
    homework_assigned,
    public_notes
  )
` as const;

async function getScopedParentId(role: AllowedRole) {
  if (role !== 'parent') return null;

  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();
  const { data: parent, error } = await supabase.from('parents').select('id').eq('user_id', userId).single();

  if (error || !parent) notFound();

  return parent.id;
}

function getDisplayName(user: UserNameRow | null | undefined) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(' ') || MISSING_VALUE;
}

function mapCreditHistoryItem(transaction: CreditTransactionRecord): StudentCreditHistoryItem {
  return {
    id: transaction.id,
    created_at: transaction.created_at,
    type: transaction.type,
    amount: transaction.amount,
    balance_after: transaction.balance_after,
    session_id: transaction.session_id,
  };
}

function mapProgressReportItem(session: ProgressSessionRecord): StudentProgressReportItem | null {
  const progress = pickFirstEmbedded(session.session_progress);
  if (!progress) return null;

  const tutor = pickFirstEmbedded(session.tutor);
  const tutorUser = pickFirstEmbedded(tutor?.users);
  const subject = pickFirstEmbedded(session.subject);

  return {
    session_id: session.id,
    scheduled_at: session.scheduled_at,
    status: session.status,
    subject_name: subject?.category ?? MISSING_VALUE,
    tutor_name: getDisplayName(tutorUser),
    report_created_at: progress.created_at,
    report_updated_at: progress.updated_at,
    topics: progress.topics,
    homework_assigned: progress.homework_assigned,
    public_notes: progress.public_notes,
  };
}

export async function getStudentDashboardDetails(studentId: number, role: UserRole): Promise<StudentDashboardDetails> {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch student dashboard data.');
  }

  if (role === 'tutor') forbidden();
  if (Number.isNaN(studentId)) notFound();

  const allowedRole: AllowedRole = role;
  const supabase = createSupabaseServiceClient();
  const parentId = await getScopedParentId(allowedRole);

  let creditHistoryQuery = supabase
    .from('credit_transactions')
    .select(CREDIT_HISTORY_SELECT)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(CREDIT_HISTORY_LIMIT);

  let progressReportsQuery = supabase
    .from('sessions')
    .select(PROGRESS_REPORT_SELECT)
    .eq('student_id', studentId)
    .order('scheduled_at', { ascending: false })
    .limit(PROGRESS_REPORT_LIMIT);

  if (parentId !== null) {
    creditHistoryQuery = creditHistoryQuery.eq('parent_id', parentId);
    progressReportsQuery = progressReportsQuery.eq('parent_id', parentId);
  }

  const [{ data: creditHistoryData, error: creditHistoryError }, { data: progressReportsData, error: progressError }] =
    await Promise.all([creditHistoryQuery, progressReportsQuery]);

  if (creditHistoryError) {
    throw new Error('Student credit history is temporarily unavailable. Please try again.');
  }

  if (progressError) {
    throw new Error('Student progress reports are temporarily unavailable. Please try again.');
  }

  return {
    creditHistory: (creditHistoryData ?? []).map(item => mapCreditHistoryItem(item as CreditTransactionRecord)),
    progressReports: (progressReportsData ?? [])
      .map(item => mapProgressReportItem(item as ProgressSessionRecord))
      .filter((item): item is StudentProgressReportItem => item !== null),
  };
}
