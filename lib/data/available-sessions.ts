import 'server-only';
import { SLOT_DURATION_MINS, TIMEZONE } from '@/lib/constants';
import { getIsoDateWeekday, isoDatesInRange, tzDateTimeToUtcIso, tzDateToUtcIso } from '@/lib/date-utils.server';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { FREE_SLOT_STATUSES, type FreeSlotStatus } from '@/lib/supabase/types';
import type { WeekDay } from '@/lib/supabase/types';
import type { AvailableSession } from '@/lib/validators/sessions';

function generateSlots(dateStr: string, startTime: string, endTime: string, timezone = TIMEZONE) {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const rawStartTotalMinutes = startHour * 60 + startMinute;
  // Snap to the next slot boundary so slots always begin on a clean interval.
  const alignedStartMinutes = Math.ceil(rawStartTotalMinutes / SLOT_DURATION_MINS) * SLOT_DURATION_MINS;
  const endTotalMinutes = endHour * 60 + endMinute;
  const slots: AvailableSession[] = [];

  for (
    let currentMinutes = alignedStartMinutes;
    currentMinutes + SLOT_DURATION_MINS <= endTotalMinutes;
    currentMinutes += SLOT_DURATION_MINS
  ) {
    const slotStartHour = Math.floor(currentMinutes / 60);
    const slotStartMinute = currentMinutes % 60;
    const slotEndHour = Math.floor((currentMinutes + SLOT_DURATION_MINS) / 60);
    const slotEndMinute = (currentMinutes + SLOT_DURATION_MINS) % 60;
    slots.push({
      scheduled_at: tzDateTimeToUtcIso(dateStr, slotStartHour, slotStartMinute, timezone),
      ends_at: tzDateTimeToUtcIso(dateStr, slotEndHour, slotEndMinute, timezone),
    });
  }

  return slots;
}

type AvailabilityRow = { week_day: WeekDay; start_time: string; end_time: string };
type BookedRow = { scheduled_at: string; ends_at: string };
type BookedRowWithStatus = BookedRow & { status?: string | null };
type EmbeddedTutorRow = {
  availability: AvailabilityRow[] | null;
  sessions: BookedRowWithStatus[] | null;
};

export const AVAILABLE_SLOTS_ERROR_MESSAGES = {
  database: 'Available slots are temporarily unavailable. Please retry in a moment.',
  tutorSubject: 'Tutor does not teach this subject',
} as const;

export function buildAvailableSlots(
  availability: AvailabilityRow[],
  booked: BookedRow[],
  from: string,
  to: string,
  timezone = TIMEZONE
) {
  const bookedTimeRanges = booked.map(row => ({
    startMs: new Date(row.scheduled_at).getTime(),
    endMs: new Date(row.ends_at).getTime(),
  }));

  const availabilityByWeekday = new Map<WeekDay, AvailabilityRow[]>();
  for (const row of availability) {
    const existing = availabilityByWeekday.get(row.week_day) ?? [];
    availabilityByWeekday.set(row.week_day, [...existing, row]);
  }

  const slots: AvailableSession[] = [];
  const seen = new Set<string>();

  for (const dateStr of isoDatesInRange(from, to)) {
    const availabilityWindows = availabilityByWeekday.get(getIsoDateWeekday(dateStr)) ?? [];

    for (const window of availabilityWindows) {
      for (const slot of generateSlots(dateStr, window.start_time, window.end_time, timezone)) {
        if (seen.has(slot.scheduled_at)) continue;
        const slotFrom = new Date(slot.scheduled_at).getTime();
        const slotTo = new Date(slot.ends_at).getTime();
        if (!Number.isFinite(slotFrom) || !Number.isFinite(slotTo)) continue;

        const isBooked = bookedTimeRanges.some(range => slotFrom < range.endMs && slotTo > range.startMs);
        if (!isBooked) {
          seen.add(slot.scheduled_at);
          slots.push(slot);
        }
      }
    }
  }

  return slots.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

function filterActiveBookedSessions(rows: BookedRowWithStatus[] | null, fromUtc: string, toUtc: string) {
  return (rows ?? [])
    .filter(
      row =>
        !FREE_SLOT_STATUSES.includes(row.status as FreeSlotStatus) && row.scheduled_at < toUtc && row.ends_at > fromUtc
    )
    .map(({ scheduled_at, ends_at }) => ({ scheduled_at, ends_at }));
}

export async function getAvailableSlots(
  tutorId: number,
  subjectId: number,
  from: string,
  to: string,
  timezone = TIMEZONE
) {
  const supabase = createSupabaseServiceClient();
  const fromUtc = tzDateToUtcIso(from, timezone);
  const toUtc = tzDateToUtcIso(to, timezone);

  const { data: tutor, error } = await supabase
    .from('tutors')
    .select(
      `
      subjects!inner(id),
      availability(week_day, start_time, end_time),
      sessions(scheduled_at, ends_at, status)
    `
    )
    .eq('id', tutorId)
    .eq('subjects.id', subjectId)
    .filter('sessions.status', 'not.in', `(${FREE_SLOT_STATUSES.join(',')})`)
    .filter('sessions.scheduled_at', 'lt', toUtc)
    .filter('sessions.ends_at', 'gt', fromUtc)
    .maybeSingle();

  if (error) {
    throw new Error(AVAILABLE_SLOTS_ERROR_MESSAGES.database);
  }
  if (!tutor) {
    throw new Error(AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject);
  }

  const { availability, sessions } = tutor as EmbeddedTutorRow;
  if (!availability?.length) return [];

  const booked = filterActiveBookedSessions(sessions, fromUtc, toUtc);
  return buildAvailableSlots(availability, booked, from, to, timezone);
}
