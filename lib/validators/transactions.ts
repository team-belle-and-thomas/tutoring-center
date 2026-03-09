import { z } from 'zod';
import { EmbeddedOneSchema, id, isoDateTime, page, pageSize } from './shared';

export const TRANSACTION_TYPE_OPTIONS = [
  'Purchase',
  'Session Debit',
  'Cancellation Fee',
  'Refund',
  'Adjustment',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPE_OPTIONS)[number];
export const TransactionTypeSchema = z.enum(TRANSACTION_TYPE_OPTIONS);

export const TransactionCreateSchema = z.object({
  parent_id: id.optional(),
  session_id: id.nullable().optional(),
  student_id: id,
  amount: z.number().int(),
  balance_after: z.number().int().nonnegative(),
  type: TransactionTypeSchema,
});

export const TransactionListQuerySchema = z.object({
  parent_id: id.optional(),
  student_id: id.optional(),
  session_id: id.optional(),
  type: z.enum(['All', 'Purchase', 'Session Debit', 'Cancellation Fee', 'Refund', 'Adjustment']).default('All'),
  start_date: isoDateTime.optional(),
  end_date: isoDateTime.optional(),
  page,
  page_size: pageSize,
});

export const TransactionsWithJoinsSchema = z.object({
  id: z.number().int().positive(),
  parent_id: id,
  student_id: id,
  session_id: z.number().int().positive().nullable(),
  amount: z.number().int(),
  balance_after: z.number().int().nonnegative(),
  type: TransactionTypeSchema,
  created_at: z.string(),
  parent: EmbeddedOneSchema,
  student: EmbeddedOneSchema,
  session: EmbeddedOneSchema,
});

export const TransactionsWithJoinsListSchema = z.array(TransactionsWithJoinsSchema);

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>;
export type TransactionListQueryInput = z.infer<typeof TransactionListQuerySchema>;
export type TransactionsWithJoins = z.infer<typeof TransactionsWithJoinsSchema>;
