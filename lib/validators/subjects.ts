import { z } from 'zod';

export const SubjectRowSchema = z.object({
  id: z.number(),
  category: z.string(),
  tutor_id: z.number(),
});

export const SubjectRowListSchema = z.array(SubjectRowSchema);

export type SubjectRow = z.infer<typeof SubjectRowSchema>;
