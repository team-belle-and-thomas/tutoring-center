import 'server-only';
import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, type UserRole } from '@/lib/mock-api';
import { allParents, allStudents } from '@/lib/mock-data';
import type { Enums, Tables } from '@/lib/supabase/database.types';

export type CreditTransactionRow = {
  id: number;
  created_at: string;
  type: Enums<'transaction_type'>;
  amount: number;
  balance_after: number;
  parent_name: string;
  student_name: string;
  session_id: number | null;
};

type CreditTransactionRecord = Tables<'credit_transactions'>;

// Temporary mock dataset for credit transactions while DB-backed querying is being finalized.
const MOCK_CREDIT_TRANSACTIONS: CreditTransactionRecord[] = [
  {
    id: 3001,
    parent_id: 1,
    student_id: 1,
    session_id: null,
    type: 'Purchase',
    amount: 12,
    balance_after: 22,
    created_at: '2026-03-02T18:30:00.000Z',
  },
  {
    id: 3002,
    parent_id: 1,
    student_id: 1,
    session_id: 2001,
    type: 'Session Debit',
    amount: -1,
    balance_after: 10,
    created_at: '2026-03-01T19:00:00.000Z',
  },
  {
    id: 3003,
    parent_id: 1,
    student_id: 2,
    session_id: 2002,
    type: 'Session Debit',
    amount: -1,
    balance_after: 11,
    created_at: '2026-02-28T20:00:00.000Z',
  },
  {
    id: 3004,
    parent_id: 1,
    student_id: 2,
    session_id: null,
    type: 'Adjustment',
    amount: 2,
    balance_after: 12,
    created_at: '2026-02-27T15:45:00.000Z',
  },
  {
    id: 3005,
    parent_id: 2,
    student_id: 3,
    session_id: null,
    type: 'Purchase',
    amount: 8,
    balance_after: 15,
    created_at: '2026-03-01T13:10:00.000Z',
  },
  {
    id: 3006,
    parent_id: 2,
    student_id: 3,
    session_id: 2003,
    type: 'Session Debit',
    amount: -1,
    balance_after: 7,
    created_at: '2026-02-28T16:20:00.000Z',
  },
  {
    id: 3007,
    parent_id: 3,
    student_id: 4,
    session_id: null,
    type: 'Purchase',
    amount: 10,
    balance_after: 19,
    created_at: '2026-02-26T14:00:00.000Z',
  },
  {
    id: 3008,
    parent_id: 3,
    student_id: 5,
    session_id: null,
    type: 'Cancellation Fee',
    amount: -1,
    balance_after: 9,
    created_at: '2026-02-25T14:00:00.000Z',
  },
  {
    id: 3009,
    parent_id: 3,
    student_id: 6,
    session_id: null,
    type: 'Refund',
    amount: 1,
    balance_after: 10,
    created_at: '2026-02-24T14:00:00.000Z',
  },
];

const mapTransactionRow = (tx: CreditTransactionRecord): CreditTransactionRow => {
  const parent = allParents.find(row => row.id === tx.parent_id);
  const parent_name = parent ? `${parent.first_name} ${parent.last_name}` : 'N/A';
  const student = allStudents.find(row => row.id === tx.student_id);
  const student_name = student ? `${student.first_name} ${student.last_name}` : 'N/A';

  return {
    id: tx.id,
    created_at: tx.created_at,
    type: tx.type,
    amount: tx.amount,
    balance_after: tx.balance_after,
    parent_name,
    student_name,
    session_id: tx.session_id,
  };
};

export async function getCreditTransactions(role: UserRole) {
  if (role === 'tutor') forbidden();

  let transactions = MOCK_CREDIT_TRANSACTIONS;

  if (role !== 'admin') {
    const userID = await getCurrentUserID();
    const parent = allParents.find(row => row.user_id === userID);

    if (!parent) notFound();
    transactions = transactions.filter(tx => tx.parent_id === parent.id);
  }

  const sortedTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (sortedTransactions.length === 0) return [];

  return sortedTransactions.map(mapTransactionRow);
}
