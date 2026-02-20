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
