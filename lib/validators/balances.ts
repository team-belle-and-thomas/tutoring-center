import { z } from 'zod';
import { id } from './shared';

export const CreditBalanceSchema = z.object({
  parent_id: id,
  amount_available: z.number().int().nonnegative(),
  amount_pending: z.number().int().nonnegative(),
});

export const BalanceQuerySchema = z.object({
  parent_id: id.optional(),
});

export const BalanceUpdateSchema = z.object({
  parent_id: id.optional(),
  amount_available: z.number().int().nonnegative(),
  amount_pending: z.number().int().nonnegative(),
});

export type CreditBalance = z.infer<typeof CreditBalanceSchema>;
export type BalanceQueryInput = z.infer<typeof BalanceQuerySchema>;
export type BalanceUpdateInput = z.infer<typeof BalanceUpdateSchema>;
