// Helpers for grabbing types for the DB

import type { Database } from './database.types';
import { Constants } from './database.types';

export type { Database };

export type SessionStatus = Database['public']['Enums']['session_status'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type WeekDay = Database['public']['Enums']['week_day'];

export type SessionRow = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

export const SESSION_STATUS_OPTIONS = Constants.public.Enums.session_status;
export const TRANSACTION_TYPE_OPTIONS = Constants.public.Enums.transaction_type;
export const WEEKDAY_OPTIONS = Constants.public.Enums.week_day;

export const DEFAULT_SESSION_STATUS: SessionStatus = 'Scheduled';
export const CANCELED_SESSION_STATUS: SessionStatus = 'Canceled';

// Shared select fields so I don't have to repeat it
export const SESSION_SELECT_FIELDS =
  'id,tutor_id,student_id,subject_id,parent_id,slot_units,scheduled_at,ends_at,status' as const;

// Sessions + joined parent/tutor/student user info
export const SESSION_SELECT_WITH_JOINS = `
  id,
  tutor_id,
  student_id,
  subject_id,
  parent_id,
  slot_units,
  scheduled_at,
  ends_at,
  status,

  student:students!sessions_student_id_fkey (
    id,
    parent_id,
    grade,
    learning_goals,
    user:users!students_user_id_fkey (
      id,
      first_name,
      last_name,
      email
    )
  ),

  tutor:tutors!sessions_tutor_id_fkey (
    id,
    verified,
    years_experience,
    tagline,
    user:users!tutors_user_id_fkey (
      id,
      first_name,
      last_name,
      email
    )
  ),

  parent:parents!sessions_parent_id_fkey (
    id,
    billing_address,
    notification_preferences,
    user:users!parents_user_id_fkey (
      id,
      first_name,
      last_name,
      email
    )
  )
` as const;
