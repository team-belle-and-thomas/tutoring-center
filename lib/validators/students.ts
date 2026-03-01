import { z } from 'zod';
import { EmbeddedOneUserSchema } from './shared';

export const StudentWithJoinsSchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable(),
  birth_date: z.string().nullable(),
  grade: z.string().nullable(),
  learning_goals: z.string().nullable(),
  users: EmbeddedOneUserSchema,
});

export const StudentWithJoinsListSchema = z.array(StudentWithJoinsSchema);

export type StudentWithJoins = z.infer<typeof StudentWithJoinsSchema>;
