import { z } from 'zod';

export const id = z.coerce.number().int().positive();
export const page = z.coerce.number().int().min(1).default(1);
export const pageSize = z.coerce.number().int().min(1).max(100).default(10);
export const units1to100 = z.coerce.number().int().min(1).max(100);
export const isoDateTime = z.string().datetime();
