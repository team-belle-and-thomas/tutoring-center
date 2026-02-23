import client from './client';
import { deductCredits } from './credits';

/**
 * Places a tutoring session reservation for a student with a tutor in a specific subject at a scheduled time. The function calculates the duration of the session and determines the number of slot units based on 30-minute intervals. It then inserts the session details into the 'sessions' table in the database and returns the inserted session data or an error if the query fails.
 * @param parent_id: The id of the parent making the reservation
 * @param student_id: The id of the student for whom the reservation is being made
 * @param tutor_id: The id of the tutor with whom the session is being scheduled
 * @param subject_id: The id of the subject for which the session is being scheduled
 * @param scheduled_at: The scheduled start time of the session in ISO 8601 format
 * @param ends_at: The scheduled end time of the session in ISO 8601 format
 * @returns The scheduled session or an error if the query fails
 */
export async function placeSession(
  parent_id: number,
  student_id: number,
  tutor_id: number,
  subject_id: number,
  scheduled_at: string,
  ends_at: string
) {
  // Calculate the cost of credits of the session
  const start_time = new Date(scheduled_at);
  const end_time = new Date(ends_at);
  const duration = (end_time.getTime() - start_time.getTime()) / (1000 * 60 * 60); // Get the duration in hours
  const slot_units = Math.ceil(duration / 0.5); // Assuming each slot is 30 minutes

  const { data, error } = await client
    .from('sessions')
    .insert({
      parent_id,
      student_id,
      tutor_id,
      subject_id,
      scheduled_at,
      ends_at,
      slot_units,
      status: 'Scheduled',
    })
    .select('*')
    .single();

  if (error) {
    return { data: null, error };
  }

  // Check if the parent has enough credits and deduct them after placing the session
  const { data: balanceData, error: balanceError } = await deductCredits(parent_id, slot_units);
  if (balanceError) {
    // If there's an error deducting credits, delete the session that was just created
    await client.from('sessions').delete().eq('id', data.id);
    return { data: null, error: balanceError };
  }
  return { data, error: null };
}
