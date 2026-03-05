import 'server-only';
import { TIMEZONE } from '@/lib/constants';
import type { WeekDay } from '@/lib/supabase/types';

const WEEKDAY_NAME_BY_INDEX: WeekDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Splits a "YYYY-MM-DD" string into numeric [year, month, day] parts.
 */
function parseIsoDateParts(dateStr: string) {
  return dateStr.split('-').map(Number) as [number, number, number];
}

/**
 * Returns how many milliseconds `timezone` is offset from UTC at the given
 * UTC instant, accounting for DST.
 */
function getTzOffsetMs(utcDate: Date, timezone = TIMEZONE) {
  const dtParts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(utcDate);

  const get = (type: string) => {
    const val = Number(dtParts.find(part => part.type === type)?.value ?? '0');
    // Intl can return hour=24 at midnight; normalise to 0.
    return type === 'hour' && val === 24 ? 0 : val;
  };

  const tzComponentsAsUtcMs = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );

  return utcDate.getTime() - tzComponentsAsUtcMs;
}

/**
 * Converts a date + time ("YYYY-MM-DD") expressed in `timezone` to a UTC ISO string.
 */
export function tzDateTimeToUtcIso(dateStr: string, hour: number, minute: number, timezone = TIMEZONE) {
  const [year, month, day] = parseIsoDateParts(dateStr);

  const unadjustedMs = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(unadjustedMs + getTzOffsetMs(new Date(unadjustedMs), timezone)).toISOString();
}

/**
 * "YYYY-MM-DD" (timezone midnight) to a UTC ISO string.
 */
export function tzDateToUtcIso(dateStr: string, timezone = TIMEZONE) {
  return tzDateTimeToUtcIso(dateStr, 0, 0, timezone);
}

/**
 * Returns the day-of-week name for a "YYYY-MM-DD" date string.
 */
export function getIsoDateWeekday(dateStr: string) {
  const [year, month, day] = parseIsoDateParts(dateStr);
  return WEEKDAY_NAME_BY_INDEX[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

/**
 * Returns every "YYYY-MM-DD" date string in the range `[from, to)` (exclusive end).
 */
export function isoDatesInRange(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = parseIsoDateParts(from);
  const [toYear, toMonth, toDay] = parseIsoDateParts(to);
  const toMs = Date.UTC(toYear, toMonth - 1, toDay);
  const days: string[] = [];

  for (let currentMs = Date.UTC(fromYear, fromMonth - 1, fromDay); currentMs < toMs; currentMs += 86_400_000) {
    const date = new Date(currentMs);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    days.push(`${yyyy}-${mm}-${dd}`);
  }

  return days;
}
