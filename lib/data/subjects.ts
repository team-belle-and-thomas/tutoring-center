import 'server-only';
import { forbidden } from 'next/navigation';
import { isUserRole, type UserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { SubjectRowListSchema, type SubjectRow } from '@/lib/validators/subjects';

type SubjectLoadErrorReason = 'database' | 'validation';
type AllowedRole = Exclude<UserRole, 'tutor'>;

export type SubjectTutorAssignment = {
  tutorId: number;
  subjectId: number;
};

export type SubjectOption = {
  key: string; // normalized subject category for subject rows with same category
  category: string;
  tutorCount: number;
  assignments: SubjectTutorAssignment[];
};

export type SelectedSubject = Pick<SubjectOption, 'key' | 'category'>;

export type SubjectSelection = {
  subject: SelectedSubject;
  assignments: SubjectTutorAssignment[];
};

const SUBJECT_ERROR_MESSAGES = {
  admin: {
    database: 'Loading subject records for admin views failed due to a temporary backend issue. Please try again.',
    validation: 'Subject data format is invalid. Please try again later.',
  },
  parent: {
    database: 'Subjects are temporarily unavailable. Please try again in a moment.',
    validation: 'There was a problem preparing subjects. Please try again.',
  },
} as const satisfies Record<AllowedRole, Record<SubjectLoadErrorReason, string>>;

const normalizeSubjectCategory = (category: string) => category.trim().toLowerCase().replace(/\s+/g, ' ');

const sortNumberAsc = (a: number, b: number) => a - b;

export const groupSubjectsByCategory = (subjects: SubjectRow[]) => {
  const grouped = new Map<
    string,
    {
      category: string;
      tutorToSubjectId: Map<number, number>;
    }
  >();

  for (const subject of subjects) {
    const normalizedCategory = normalizeSubjectCategory(subject.category);
    if (normalizedCategory === '') continue;

    const existing = grouped.get(normalizedCategory);

    if (!existing) {
      grouped.set(normalizedCategory, {
        category: subject.category.trim(),
        tutorToSubjectId: new Map([[subject.tutor_id, subject.id]]),
      });
      continue;
    }

    const assignedSubjectId = existing.tutorToSubjectId.get(subject.tutor_id);
    if (assignedSubjectId === undefined || subject.id < assignedSubjectId) {
      existing.tutorToSubjectId.set(subject.tutor_id, subject.id);
    }
  }

  return Array.from(grouped.entries())
    .map(([key, value]) => ({
      key,
      category: value.category,
      tutorCount: value.tutorToSubjectId.size,
      assignments: Array.from(value.tutorToSubjectId.entries())
        .sort(([leftTutorId], [rightTutorId]) => sortNumberAsc(leftTutorId, rightTutorId))
        .map(([tutorId, subjectId]) => ({ tutorId, subjectId })),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
};

export async function getSubjects(role: UserRole) {
  if (!isUserRole(role)) {
    throw new Error('Role is required to fetch students.');
  }

  if (role === 'tutor') forbidden();
  const allowedRole: AllowedRole = role;

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('subjects')
    .select('id,category,tutor_id')
    .not('category', 'is', null)
    .not('tutor_id', 'is', null)
    .order('category');

  if (error) {
    throw new Error(SUBJECT_ERROR_MESSAGES[allowedRole]['database']);
  }

  const parsedSubjects = SubjectRowListSchema.safeParse(data ?? []);
  if (!parsedSubjects.success) {
    throw new Error(SUBJECT_ERROR_MESSAGES[allowedRole]['validation']);
  }

  return groupSubjectsByCategory(parsedSubjects.data);
}
