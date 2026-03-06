'use server';

import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';

export type ProgressReportFormData = {
  sessionId: number;
  topics: string;
  homeworkAssigned: string;
  publicNotes: string;
  internalNotes: string;
};

export async function submitProgressReport(formData: ProgressReportFormData) {
  const role = await getUserRole();
  if (role !== 'tutor') {
    throw new Error('Only tutors can submit progress reports');
  }

  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('tutor_id')
    .eq('id', formData.sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('Session not found');
  }

  const { data: tutor, error: tutorError } = await supabase.from('tutors').select('id').eq('user_id', userId).single();

  if (tutorError || !tutor) {
    throw new Error('Tutor profile not found');
  }

  if (session.tutor_id !== tutor.id) {
    throw new Error('You are not assigned to this session');
  }

  const { error: progressError } = await supabase.from('session_progress').upsert(
    {
      session_id: formData.sessionId,
      topics: formData.topics || null,
      homework_assigned: formData.homeworkAssigned || null,
      public_notes: formData.publicNotes || null,
      internal_notes: formData.internalNotes || null,
    },
    { onConflict: 'session_id' }
  );

  if (progressError) {
    throw new Error(progressError.message || 'Failed to submit progress report');
  }

  return { success: true };
}
