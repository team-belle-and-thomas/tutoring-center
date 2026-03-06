'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useTransition } from 'react';
import { fetchParentDashboardData } from '@/app/dashboard/actions';
import { GradeChart } from '@/components/charts/grade-overview';
import { HomeworkChart } from '@/components/charts/homework-chart';
import { ConfidenceChart, PerformanceChart } from '@/components/charts/performance-chart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  averageConfidenceByDate,
  averageHomeworkByDate,
  averagePerformanceByDate,
  getUniqueSubjectsFromStudentData,
} from '@/lib/dashboard-utils';
import type {
  ConfidenceDataPoint,
  DateRange,
  GradeDataPoint,
  HomeworkDataPoint,
  PerformanceDataPoint,
  StudentProgressData,
} from '@/lib/data/dashboard';
import { subDays, subMonths } from 'date-fns';

interface ParentProgressDashboardProps {
  students: StudentProgressData[];
  defaultStudentId: number | null;
  selectedStudentId?: number | null;
  selectedSubject?: string;
  selectedDateRange?: string;
  grades?: GradeDataPoint[];
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
        <div className='rounded-lg border p-6'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-[200px] w-full' />
        </div>
        <div className='rounded-lg border p-6'>
          <Skeleton className='h-6 w-24 mb-4' />
          <Skeleton className='h-[200px] w-full' />
        </div>
      </div>
    </>
  );
}

export function ParentProgressDashboard({
  students: initialStudents,
  defaultStudentId,
  selectedStudentId: initialSelectedStudentId,
  selectedSubject: initialSelectedSubject,
  selectedDateRange: initialDateRange = 'all',
  grades: initialGrades = [],
}: ParentProgressDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(
    initialSelectedStudentId ?? defaultStudentId
  );
  const [dateRange, setDateRange] = React.useState<DateRangeOption>(initialDateRange as DateRangeOption);
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(initialSelectedSubject || 'all');
  const [students, setStudents] = React.useState<StudentProgressData[]>(initialStudents);
  const grades = initialGrades;

  const updateURL = (updates: { student?: number | null; subject?: string | null; range?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.student !== undefined) {
      if (updates.student) {
        params.set('student', updates.student.toString());
      } else {
        params.delete('student');
      }
    }

    if (updates.subject !== undefined) {
      if (updates.subject && updates.subject !== 'all') {
        params.set('subject', updates.subject);
      } else {
        params.delete('subject');
      }
    }

    if (updates.range !== undefined) {
      if (updates.range && updates.range !== 'all') {
        params.set('range', updates.range);
      } else {
        params.delete('range');
      }
    }

    const newURL = params.toString() ? `?${params.toString()}` : '/dashboard';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(newURL as any);
  };

  const handleStudentChange = (studentId: number) => {
    setSelectedStudentId(studentId);
    setSelectedSubject('all');
    updateURL({ student: studentId, subject: 'all', range: dateRange });
  };

  const handleSubjectChange = (subject: string | null) => {
    setSelectedSubject(subject);
    updateURL({ subject: subject === 'all' ? null : subject });
    const range = getDateRange(dateRange);
    startTransition(async () => {
      const data = await fetchParentDashboardData(range, subject ?? undefined);
      setStudents(data.students);
    });
  };

  const handleDateRangeChange = (newRange: DateRangeOption) => {
    setDateRange(newRange);
    updateURL({ range: newRange });
    const range = getDateRange(newRange);
    startTransition(async () => {
      const data = await fetchParentDashboardData(range, selectedSubject ?? undefined);
      setStudents(data.students);
    });
  };

  const selectedStudent = students.find(s => s.studentId === selectedStudentId);
  const availableSubjects = selectedStudent ? getUniqueSubjectsFromStudentData(selectedStudent) : [];

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
    ? (averagePerformanceByDate(filteredPerformance) as PerformanceDataPoint[])
    : filteredPerformance;

  const displayConfidence = isAllSubjects
    ? (averageConfidenceByDate(filteredConfidence) as ConfidenceDataPoint[])
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
              onValueChange={value => handleStudentChange(Number(value))}
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
            <div className='flex items-center gap-2'>
              <Select
                value={selectedSubject ?? 'all'}
                onValueChange={value => handleSubjectChange(value === 'all' ? null : value)}
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
              {selectedStudent && (
                <span className='text-sm text-muted-foreground'>{filteredPerformance.length} sessions</span>
              )}
            </div>
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
      ) : selectedStudent ? (
        <>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
            {grades.length > 0 ? (
              <GradeChart data={grades} subject={selectedSubject} />
            ) : (
              <div className='rounded-lg border p-6'>
                <p className='text-muted-foreground text-sm'>No grades recorded yet</p>
              </div>
            )}
            <HomeworkChart data={displayHomework} />
            <PerformanceChart data={displayPerformance} />
            <ConfidenceChart data={displayConfidence} />
          </div>
        </>
      ) : null}
    </div>
  );
}
