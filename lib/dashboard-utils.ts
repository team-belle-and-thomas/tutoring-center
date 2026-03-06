import type {
  ConfidenceDataPoint,
  DateRange,
  HomeworkDataPoint,
  PerformanceDataPoint,
  StudentProgressData,
} from '@/lib/data/dashboard';
import { subDays, subMonths } from 'date-fns';

export type DateRangeOption = 'all' | '30d' | '3m' | '6m';

export const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
];

export function getDateRange(option: DateRangeOption): DateRange {
  const now = new Date();
  switch (option) {
    case '30d':
      return { from: subDays(now, 30).toISOString(), to: undefined };
    case '3m':
      return { from: subMonths(now, 3).toISOString(), to: undefined };
    case '6m':
      return { from: subMonths(now, 6).toISOString(), to: undefined };
    default:
      return { from: undefined, to: undefined };
  }
}

export function getUniqueSubjectsFromStudentData(data: StudentProgressData): string[] {
  const subjects = new Set<string>();

  for (const p of data.performance) {
    if (p.subject && p.subject !== 'Unknown') {
      subjects.add(p.subject);
    }
  }
  for (const c of data.confidence) {
    if (c.subject && c.subject !== 'Unknown') {
      subjects.add(c.subject);
    }
  }
  for (const h of data.homework) {
    if (h.subject && h.subject !== 'Unknown') {
      subjects.add(h.subject);
    }
  }

  return Array.from(subjects).sort();
}

export function averagePerformanceByDate(items: PerformanceDataPoint[]): PerformanceDataPoint[] {
  const byDate = new Map<string, { scores: number[]; original: PerformanceDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { scores: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.scores.push(item.score);
    entry.original.push(item);
  }

  const result: PerformanceDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;
    result.push({ date: entry.original[0].date, score: avg, sessionId: 0, subject: '' });
  }

  return result;
}

export function averageConfidenceByDate(items: ConfidenceDataPoint[]): ConfidenceDataPoint[] {
  const byDate = new Map<string, { scores: number[]; original: ConfidenceDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { scores: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.scores.push(item.score);
    entry.original.push(item);
  }

  const result: ConfidenceDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;
    result.push({ date: entry.original[0].date, score: avg, sessionId: 0, subject: '' });
  }

  return result;
}

export function averageHomeworkByDate(items: HomeworkDataPoint[]): HomeworkDataPoint[] {
  const byDate = new Map<string, { completed: number[]; original: HomeworkDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { completed: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.completed.push(item.completed ? 1 : 0);
    entry.original.push(item);
  }

  const result: HomeworkDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.completed.reduce((a, b) => a + b, 0) / entry.completed.length;
    result.push({ date: entry.original[0].date, completed: avg >= 0.5, sessionId: 0, subject: '' });
  }

  return result;
}
