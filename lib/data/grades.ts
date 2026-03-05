'server-only';

import { forbidden, notFound } from 'next/navigation';
import { getCurrentUserID, type UserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { GRADE_SELECT_FIELDS } from '@/lib/supabase/types';
import { GradeInputSchema, percentageToLetterGrade, type GradeInput } from '@/lib/validators/grades';

export type StudentForGradeForm = {
  id: number;
  name: string;
};

export type SubjectForGradeForm = {
  id: number;
  category: string;
};

type GradeErrorReason = 'database' | 'validation' | 'forbidden';

const GRADE_ERROR_MESSAGES = {
  database: 'Failed to save grade. Please try again.',
  validation: 'Grade data is invalid. Please check your input.',
  forbidden: 'You do not have permission to add grades for this student.',
} as const satisfies Record<GradeErrorReason, string>;

export async function getSubjectsForGradeForm() {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.from('subjects').select('id,category').order('category');

  if (error) {
    throw new Error(GRADE_ERROR_MESSAGES.database);
  }

  const uniqueSubjects = new Map<string, SubjectForGradeForm>();
  for (const subject of data ?? []) {
    if (!uniqueSubjects.has(subject.category)) {
      uniqueSubjects.set(subject.category, { id: subject.id, category: subject.category });
    }
  }

  return Array.from(uniqueSubjects.values());
}

export async function getStudentsForGradeForm(role: UserRole) {
  if (role === 'tutor') forbidden();

  const supabase = createSupabaseServiceClient();

  let query = supabase.from('students').select('id,parent_id,users:user_id(first_name,last_name)');

  if (role !== 'admin') {
    const userID = await getCurrentUserID();
    const { data: parent, error: parentErr } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userID)
      .single();

    if (parentErr || !parent) notFound();
    query = query.eq('parent_id', parent.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(GRADE_ERROR_MESSAGES.database);
  }

  return (data ?? []).map(student => ({
    id: student.id,
    name: [student.users?.first_name, student.users?.last_name].filter(Boolean).join(' ') || 'Unknown',
  }));
}

export async function addGrade(input: GradeInput) {
  const parsed = GradeInputSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(GRADE_ERROR_MESSAGES.validation);
  }

  const { student_id, subject, grade } = parsed.data;

  const supabase = createSupabaseServiceClient();

  const userID = await getCurrentUserID();
  const { data: parent, error: parentErr } = await supabase.from('parents').select('id').eq('user_id', userID).single();

  if (parentErr || !parent) {
    throw new Error(GRADE_ERROR_MESSAGES.forbidden);
  }

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id,parent_id')
    .eq('id', student_id)
    .single();

  if (studentErr || !student) {
    throw new Error(GRADE_ERROR_MESSAGES.validation);
  }

  if (student.parent_id === null || student.parent_id !== parent.id) {
    throw new Error(GRADE_ERROR_MESSAGES.forbidden);
  }

  const { data: subjectData, error: subjectErr } = await supabase
    .from('subjects')
    .select('id')
    .eq('category', subject.trim())
    .limit(1)
    .single();

  if (subjectErr || !subjectData) {
    throw new Error(GRADE_ERROR_MESSAGES.validation);
  }

  const letterGrade = percentageToLetterGrade(grade);

  const { data, error } = await supabase
    .from('student_grades')
    .insert({
      student_id,
      subject: subject.trim(),
      grade: letterGrade,
    })
    .select(GRADE_SELECT_FIELDS)
    .single();

  if (error) {
    throw new Error(GRADE_ERROR_MESSAGES.database);
  }

  return data;
}
