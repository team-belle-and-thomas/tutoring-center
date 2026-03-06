import { z } from 'zod';
import { id, isoDateTime, page, pageSize } from './shared';

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
  parent_id: id,
  session_id: id.optional(),
  student_id: id,
  amount: z.number().int(),
  balance_after: z.number().nonnegative().int(),
  type: z.enum(['Purchase', 'Session Debit', 'Cancellation Fee', 'Refund', 'Adjustment']),
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

// Output validation for sessions + joins, wasn't exported so i copied it here for transactions. Should probably be moved to a shared file if we need it in multiple places
const EmbeddedRecordSchema = z.record(z.unknown());
const EmbeddedOneSchema = z.union([EmbeddedRecordSchema, z.array(EmbeddedRecordSchema), z.null()]).optional();

export const TransactionsWithJoinsSchema = z.object({
  id: z.number(),
  parent_id: z.number(),
  student_id: z.number(),
  session_id: z.number().nullable(),
  amount: z.number().int(),
  balance_after: z.number().positive().int(),
  type: TransactionTypeSchema,
  created_at: z.string(), // ISO date string

  parent: EmbeddedOneSchema,
  student: EmbeddedOneSchema,
  session: EmbeddedOneSchema,
});

export type TransactionCreateInput = z.infer<typeof TransactionCreateSchema>;
export type TransactionListQueryInput = z.infer<typeof TransactionListQuerySchema>;

export const TransactionsWithJoinsListSchema = z.array(TransactionsWithJoinsSchema);
export type TransactionsWithJoins = z.infer<typeof TransactionsWithJoinsSchema>;
