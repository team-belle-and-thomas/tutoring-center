import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Database } from '@/lib/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deductCredits } from './credits';

/**
 * Places a tutoring session reservation for a student with a tutor in a specific subject at a scheduled time. The function calculates the duration of the session and determines the number of slot units based on 30-minute intervals. It then inserts the session details into the 'sessions' table in the database and returns the inserted session data or an error if the query fails.
 * @param parent_id: The id of the parent making the reservation
 * @param student_id: The id of the student for whom the reservation is being made
 * @param tutor_id: The id of the tutor with whom the session is being scheduled
 * @param subject_id: The id of the subject for which the session is being scheduled
 * @param scheduled_at: The scheduled start time of the session in ISO 8601 format
 * @param ends_at: The scheduled end time of the session in ISO 8601 format
 * @param supabase: optional Supabase client (defaults to server client)
 * @returns The scheduled session or an error if the query fails
 */
export async function placeSession(
  parent_id: number,
  student_id: number,
  tutor_id: number,
  subject_id: number,
  scheduled_at: string,
  ends_at: string,
  supabase?: SupabaseClient<Database>
) {
  const db = supabase || (await createSupabaseServerClient());
  // Calculate the cost of credits of the session
  const start_time = new Date(scheduled_at);
  const end_time = new Date(ends_at);
  if (end_time <= start_time) {
    return { data: null, error: new Error('End time must be after start time') };
  }

  let duration = (end_time.getTime() - start_time.getTime()) / (1000 * 60 * 60); // Get the duration in hours
  duration = Math.round(duration); // Convert to the nearest whole number of hours

  const { data, error } = await db
    .from('sessions')
    .insert({
      parent_id,
      student_id,
      tutor_id,
      subject_id,
      scheduled_at,
      ends_at,
      status: 'Scheduled',
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error };
  }

  // Check if the parent has enough credits and deduct them after placing the session
  const { error: balanceError } = await deductCredits(parent_id, duration, db);
  if (balanceError) {
    // If there's an error deducting credits, delete the session that was just created
    await db.from('sessions').delete().eq('id', data.id);
    return { data: null, error: balanceError };
  }
  return { data, error: null };
}
