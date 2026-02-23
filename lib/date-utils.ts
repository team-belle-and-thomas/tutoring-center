import { addDays, format, startOfDay, startOfWeek } from 'date-fns';

const NY_TZ = 'America/New_York';

export function getWeekStart(today: Date): Date {
  return startOfDay(startOfWeek(today, { weekStartsOn: 1 }));
}

export function getNextWeekStart(today: Date): Date {
  return addDays(getWeekStart(today), 7);
}

export function formatWeekRange(weekStart: Date): string {
  const sunday = addDays(weekStart, 6);
  return `${format(weekStart, 'MMM d')} – ${format(sunday, 'd')}`;
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatSessionTime(date: Date): string {
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: NY_TZ });
}

export function formatSessionDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: NY_TZ });
}

export function formatSessionDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: NY_TZ,
  });
}
