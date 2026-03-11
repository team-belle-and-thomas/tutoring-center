import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, isValidRole, type UserRole } from '@/lib/auth';
import type { Enums, Tables } from '@/lib/supabase/database.types';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import {
  CREDIT_TRANSACTION_DETAIL_SELECT_WITH_JOINS,
  CREDIT_TRANSACTION_LIST_SELECT_WITH_JOINS,
} from '@/lib/supabase/types';
import { pickFirstEmbedded } from '@/lib/utils/normalize';

type CreditTransactionRecord = Tables<'credit_transactions'>;
type TransactionType = Enums<'transaction_type'>;
type SessionStatus = Enums<'session_status'>;

type Embedded<T> = T | T[] | null;

type UserNameRow = Pick<Tables<'users'>, 'first_name' | 'last_name'>;
type UserContactRow = Pick<Tables<'users'>, 'first_name' | 'last_name' | 'email' | 'phone'>;
type ParentListJoin = {
  users: Embedded<UserNameRow>;
};
type ParentDetailJoin = Pick<Tables<'parents'>, 'id' | 'user_id'> & {
  users: Embedded<UserContactRow>;
};
type StudentListJoin = {
  users: Embedded<UserNameRow>;
};
type StudentDetailJoin = Pick<Tables<'students'>, 'id' | 'user_id' | 'grade'> & {
  users: Embedded<UserContactRow>;
};
type TutorJoin = Pick<Tables<'tutors'>, 'id' | 'user_id'> & {
  users: Embedded<UserNameRow>;
};
type SessionJoin = Pick<Tables<'sessions'>, 'id' | 'scheduled_at' | 'ends_at' | 'status'> & {
  subject: Embedded<{
    category: string;
  }>;
  tutor: Embedded<TutorJoin>;
};
type CreditTransactionListWithJoins = CreditTransactionRecord & {
  parent: Embedded<ParentListJoin>;
  student: Embedded<StudentListJoin>;
};
type CreditTransactionDetailWithJoins = CreditTransactionRecord & {
  parent: Embedded<ParentDetailJoin>;
  student: Embedded<StudentDetailJoin>;
  session: Embedded<SessionJoin>;
};

type CreditTransactionSession = {
  id: number;
  scheduled_at: string;
  ends_at: string;
  status: SessionStatus;
  subject_name: string;
  tutor_name: string;
};

export type CreditTransactionRow = {
  id: number;
  created_at: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  parent_name: string;
  student_name: string;
  session_id: number | null;
};

export type CreditTransactionDetail = {
  id: number;
  created_at: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  session_id: number | null;
  parent: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  student: {
    id: number;
    name: string;
    email: string;
    phone: string;
    grade: string;
  };
  session: CreditTransactionSession | null;
};

const MISSING_VALUE = '—';

function getDisplayName(user: Pick<UserContactRow, 'first_name' | 'last_name'> | null | undefined) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(' ') || MISSING_VALUE;
}

function getEmail(user: Pick<UserContactRow, 'email'> | null | undefined) {
  return user?.email ?? MISSING_VALUE;
}

function getPhone(user: Pick<UserContactRow, 'phone'> | null | undefined) {
  return user?.phone ?? MISSING_VALUE;
}

function getSubjectName(subject: Embedded<{ category: string }>) {
  return pickFirstEmbedded(subject)?.category ?? MISSING_VALUE;
}

async function getCurrentParentId() {
  const userID = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: parent, error } = await supabase.from('parents').select('id').eq('user_id', userID).single();

  if (error || !parent) notFound();

  return parent.id;
}

function mapTransactionRow(transaction: CreditTransactionListWithJoins): CreditTransactionRow {
  const parent = pickFirstEmbedded(transaction.parent);
  const student = pickFirstEmbedded(transaction.student);
  const parentUser = pickFirstEmbedded(parent?.users);
  const studentUser = pickFirstEmbedded(student?.users);

  return {
    id: transaction.id,
    created_at: transaction.created_at,
    type: transaction.type,
    amount: transaction.amount,
    balance_after: transaction.balance_after,
    parent_name: getDisplayName(parentUser),
    student_name: getDisplayName(studentUser),
    session_id: transaction.session_id,
  };
}

function mapTransactionSession(transaction: CreditTransactionDetailWithJoins): CreditTransactionSession | null {
  const session = pickFirstEmbedded(transaction.session);

  if (!session) return null;

  const tutor = pickFirstEmbedded(session.tutor);
  const tutorUser = pickFirstEmbedded(tutor?.users);

  return {
    id: session.id,
    scheduled_at: session.scheduled_at,
    ends_at: session.ends_at,
    status: session.status,
    subject_name: getSubjectName(session.subject),
    tutor_name: getDisplayName(tutorUser),
  };
}

function mapTransactionDetail(transaction: CreditTransactionDetailWithJoins): CreditTransactionDetail {
  const parent = pickFirstEmbedded(transaction.parent);
  const student = pickFirstEmbedded(transaction.student);
  const parentUser = pickFirstEmbedded(parent?.users);
  const studentUser = pickFirstEmbedded(student?.users);

  return {
    id: transaction.id,
    created_at: transaction.created_at,
    type: transaction.type,
    amount: transaction.amount,
    balance_after: transaction.balance_after,
    session_id: transaction.session_id,
    parent: {
      id: transaction.parent_id,
      name: getDisplayName(parentUser),
      email: getEmail(parentUser),
      phone: getPhone(parentUser),
    },
    student: {
      id: transaction.student_id,
      name: getDisplayName(studentUser),
      email: getEmail(studentUser),
      phone: getPhone(studentUser),
      grade: student?.grade ?? MISSING_VALUE,
    },
    session: mapTransactionSession(transaction),
  };
}

export async function getCreditTransactions(role: UserRole) {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch credit transactions.');
  }

  if (role === 'tutor') forbidden();

  const supabase = createSupabaseServiceClient();
  let transactionsQuery = supabase
    .from('credit_transactions')
    .select(CREDIT_TRANSACTION_LIST_SELECT_WITH_JOINS)
    .order('created_at', { ascending: false });

  if (role === 'parent') {
    const parentId = await getCurrentParentId();
    transactionsQuery = transactionsQuery.eq('parent_id', parentId);
  }

  const { data, error } = await transactionsQuery;

  if (error) {
    throw new Error('Credit transactions are temporarily unavailable. Please try again.');
  }

  return ((data ?? []) as CreditTransactionListWithJoins[]).map(mapTransactionRow);
}

export async function getCreditTransaction(id: number, role: UserRole): Promise<CreditTransactionDetail> {
  if (!isValidRole(role)) {
    throw new Error('Role is required to fetch credit transactions.');
  }

  if (role === 'tutor') forbidden();
  if (Number.isNaN(id)) notFound();

  const supabase = createSupabaseServiceClient();
  let transactionQuery = supabase
    .from('credit_transactions')
    .select(CREDIT_TRANSACTION_DETAIL_SELECT_WITH_JOINS)
    .eq('id', id);

  if (role === 'parent') {
    const parentId = await getCurrentParentId();
    transactionQuery = transactionQuery.eq('parent_id', parentId);
  }

  const { data, error } = await transactionQuery.maybeSingle();

  if (error) {
    throw new Error('Credit transaction details are temporarily unavailable. Please try again.');
  }

  if (!data) notFound();

  return mapTransactionDetail(data as CreditTransactionDetailWithJoins);
}
