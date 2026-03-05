import { z } from 'zod';

export const GradeInputSchema = z
  .object({
    student_id: z.number().int().positive('Student is required'),
    subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
    grade: z.number().min(0, 'Grade must be at least 0').max(100, 'Grade must be at most 100'),
  })
  .strict();

export type GradeInput = z.infer<typeof GradeInputSchema>;

export function percentageToLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}
