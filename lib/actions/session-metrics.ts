'use server';

import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';

export type SessionMetricsFormData = {
  sessionId: number;
  confidenceScore: number;
  sessionPerformance: number;
  homeworkCompleted: boolean;
  tutorComments: string;
};

export async function submitSessionMetrics(formData: SessionMetricsFormData) {
  const role = await getUserRole();
  if (role !== 'tutor') {
    throw new Error('Only tutors can submit session metrics');
  }

  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('tutor_id, student_id')
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

  const { data: existingMetrics } = await supabase
    .from('session_metrics')
    .select('id')
    .eq('session_id', formData.sessionId)
    .single();

  let metricsError;
  if (existingMetrics) {
    const { error } = await supabase
      .from('session_metrics')
      .update({
        confidence_score: formData.confidenceScore,
        session_performance: formData.sessionPerformance,
        homework_completed: formData.homeworkCompleted,
        tutor_comments: formData.tutorComments || null,
        recorded_at: new Date().toISOString(),
      })
      .eq('session_id', formData.sessionId);
    metricsError = error;
  } else {
    const { error } = await supabase.from('session_metrics').insert({
      session_id: formData.sessionId,
      student_id: session.student_id,
      confidence_score: formData.confidenceScore,
      session_performance: formData.sessionPerformance,
      homework_completed: formData.homeworkCompleted,
      tutor_comments: formData.tutorComments || null,
      recorded_at: new Date().toISOString(),
    });
    metricsError = error;
  }

  if (metricsError) {
    // eslint-disable-next-line no-console
    console.error('Metrics error:', metricsError);
    throw new Error(metricsError.message || 'Failed to submit session metrics');
  }

  return { success: true };
}
