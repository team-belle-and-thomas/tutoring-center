import type { Database } from '@/lib/supabase/types';
import { z } from 'zod';

export const id = z.coerce.number().int().positive();
export const page = z.coerce.number().int().min(1).default(1);
export const pageSize = z.coerce.number().int().min(1).max(100).default(10);
export const units1to100 = z.coerce.number().int().min(1).max(100);
export const isoDateTime = z.string().datetime();

// adding Scott's helpers
export const EmbeddedRecordSchema = z.record(z.unknown());
export const EmbeddedOneSchema = z.union([EmbeddedRecordSchema, z.array(EmbeddedRecordSchema), z.null()]).optional();

export const EmbeddedUserSchema = z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
});

export type EmbeddedUser = Pick<
  Database['public']['Tables']['users']['Row'],
  'first_name' | 'last_name' | 'email' | 'phone'
>;

export const EmbeddedOneUserSchema = z.union([EmbeddedUserSchema, z.array(EmbeddedUserSchema), z.null()]).optional();
