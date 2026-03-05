'use client';

import React, { useTransition } from 'react';
import { fetchParentDashboardData } from '@/app/dashboard/actions';
import { HomeworkChart } from '@/components/charts/homework-chart';
import { ConfidenceChart, PerformanceChart } from '@/components/charts/performance-chart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type {
  ConfidenceDataPoint,
  DateRange,
  HomeworkDataPoint,
  PerformanceDataPoint,
  StudentProgressData,
} from '@/lib/data/dashboard';
import { subDays, subMonths } from 'date-fns';

interface ParentProgressDashboardProps {
  students: StudentProgressData[];
  defaultStudentId: number | null;
}

type DateRangeOption = 'all' | '30d' | '3m' | '6m';

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
];

function getDateRange(option: DateRangeOption): DateRange {
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

function getUniqueSubjects(data: StudentProgressData): string[] {
  const subjects = new Set<string>();
  data.performance.forEach(p => subjects.add(p.subject));
  data.confidence.forEach(c => subjects.add(c.subject));
  data.homework.forEach(h => subjects.add(h.subject));
  return Array.from(subjects).sort();
}

function averageByDate(
  items: { date: string; score: number; subject: string }[]
): { date: string; score: number; subject: string }[] {
  const byDate = new Map<string, { scores: number[]; original: { date: string; score: number; subject: string }[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { scores: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.scores.push(item.score);
    entry.original.push(item);
  }

  const result: { date: string; score: number; subject: string }[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;
    result.push({ date: entry.original[0].date, score: avg, subject: '' });
  }

  return result;
}

function averageHomeworkByDate(
  items: { date: string; completed: boolean; subject: string }[]
): { date: string; completed: boolean; subject: string }[] {
  const byDate = new Map<
    string,
    { completed: number[]; original: { date: string; completed: boolean; subject: string }[] }
  >();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { completed: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.completed.push(item.completed ? 1 : 0);
    entry.original.push(item);
  }

  const result: { date: string; completed: boolean; subject: string }[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.completed.reduce((a, b) => a + b, 0) / entry.completed.length;
    result.push({ date: entry.original[0].date, completed: avg >= 0.5, subject: '' });
  }

  return result;
}

function ChartsSkeleton() {
  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
        <div className='rounded-lg border p-6'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-[200px] w-full' />
        </div>
        <div className='rounded-lg border p-6'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-[200px] w-full' />
        </div>
      </div>
      <div className='rounded-lg border p-6'>
        <Skeleton className='h-6 w-40 mb-4' />
        <Skeleton className='h-[200px] w-full' />
      </div>
    </>
  );
}

export function ParentProgressDashboard({ students: initialStudents, defaultStudentId }: ParentProgressDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(defaultStudentId);
  const [dateRange, setDateRange] = React.useState<DateRangeOption>('all');
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>('all');
  const [students, setStudents] = React.useState<StudentProgressData[]>(initialStudents);

  const handleDateRangeChange = (newRange: DateRangeOption) => {
    console.log('Changing date range to:', newRange, 'from:', getDateRange(newRange));
    setDateRange(newRange);
    const range = getDateRange(newRange);
    console.log('Fetching with range:', range);
    startTransition(async () => {
      const data = await fetchParentDashboardData(range);
      console.log('Got data:', data.students.length, 'students');
      if (data.students[0]) {
        console.log('Performance data points:', data.students[0].performance.length);
      }
      setStudents(data.students);
    });
  };

  const selectedStudent = students.find(s => s.studentId === selectedStudentId);
  const availableSubjects = selectedStudent ? getUniqueSubjects(selectedStudent) : [];

  let filteredPerformance: PerformanceDataPoint[] = [];
  let filteredConfidence: ConfidenceDataPoint[] = [];
  let filteredHomework: HomeworkDataPoint[] = [];
  const isAllSubjects = !selectedSubject || selectedSubject === 'all' || selectedSubject === null;

  if (selectedStudent) {
    if (isAllSubjects) {
      filteredPerformance = selectedStudent.performance.map(p => ({ ...p }));
      filteredConfidence = selectedStudent.confidence.map(c => ({ ...c }));
      filteredHomework = selectedStudent.homework.map(h => ({ ...h }));
    } else {
      filteredPerformance = selectedStudent.performance.filter(p => p.subject === selectedSubject);
      filteredConfidence = selectedStudent.confidence.filter(c => c.subject === selectedSubject);
      filteredHomework = selectedStudent.homework.filter(h => h.subject === selectedSubject);
    }
  }

  const displayPerformance = isAllSubjects
    ? (averageByDate(filteredPerformance) as PerformanceDataPoint[])
    : filteredPerformance;

  const displayConfidence = isAllSubjects
    ? (averageByDate(filteredConfidence) as ConfidenceDataPoint[])
    : filteredConfidence;

  const displayHomework = isAllSubjects
    ? (averageHomeworkByDate(filteredHomework) as HomeworkDataPoint[])
    : filteredHomework;

  if (students.length === 0) {
    return (
      <div className='flex h-[400px] items-center justify-center text-muted-foreground'>
        {initialStudents.length === 0
          ? 'No students are linked to your account. Please contact support to add students.'
          : 'No progress data available for the selected date range.'}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex gap-4'>
          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>Student</label>
            <Select
              value={selectedStudentId?.toString() ?? ''}
              onValueChange={value => {
                setSelectedStudentId(Number(value));
                setSelectedSubject('all');
              }}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select student' />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.studentId} value={student.studentId.toString()}>
                    {student.studentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <label className='text-sm font-medium'>Subject</label>
            <Select
              value={selectedSubject ?? 'all'}
              onValueChange={value => setSelectedSubject(value === 'all' ? null : value)}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='All subjects' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All subjects (avg)</SelectItem>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Date Range</label>
          <div className='flex gap-1'>
            {DATE_RANGE_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleDateRangeChange(option.value)}
                disabled={isPending}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {isPending ? (
        <ChartsSkeleton />
      ) : (
        selectedStudent && (
          <>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
              <PerformanceChart data={displayPerformance} />
              <ConfidenceChart data={displayConfidence} />
            </div>

            <div className='grid gap-4 md:grid-cols-1'>
              <HomeworkChart data={displayHomework} />
            </div>
          </>
        )
      )}
    </div>
  );
}
