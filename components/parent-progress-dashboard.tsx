'use client';

import React, { useTransition } from 'react';
import { fetchParentDashboardData } from '@/app/dashboard/actions';
import { HomeworkChart } from '@/components/charts/homework-chart';
import { ConfidenceChart, PerformanceChart } from '@/components/charts/performance-chart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { DateRange, StudentProgressData } from '@/lib/data/dashboard';
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

export function ParentProgressDashboard({ students: initialStudents, defaultStudentId }: ParentProgressDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStudentId, setSelectedStudentId] = React.useState<number | null>(defaultStudentId);
  const [dateRange, setDateRange] = React.useState<DateRangeOption>('all');
  const [students, setStudents] = React.useState<StudentProgressData[]>(initialStudents);

  const handleDateRangeChange = (newRange: DateRangeOption) => {
    setDateRange(newRange);
    const range = getDateRange(newRange);
    startTransition(async () => {
      const data = await fetchParentDashboardData(range);
      setStudents(data.students);
    });
  };

  const selectedStudent = students.find(s => s.studentId === selectedStudentId);

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
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Student</label>
          <Select
            value={selectedStudentId?.toString() ?? ''}
            onValueChange={value => setSelectedStudentId(Number(value))}
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

      {isPending && <div className='flex items-center justify-center py-8 text-muted-foreground'>Loading...</div>}

      {!isPending && selectedStudent && (
        <>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
            <PerformanceChart data={selectedStudent.performance} />
            <ConfidenceChart data={selectedStudent.confidence} />
          </div>

          <div className='grid gap-4 md:grid-cols-1'>
            <HomeworkChart data={selectedStudent.homework} />
          </div>
        </>
      )}
    </div>
  );
}
