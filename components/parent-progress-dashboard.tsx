'use client';

import React, { useMemo, useState } from 'react';
import { GradeChart } from '@/components/charts/grade-overview';
import { HomeworkChart } from '@/components/charts/homework-chart';
import { ConfidenceChart, PerformanceChart } from '@/components/charts/performance-chart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  averageConfidenceByDate,
  averagePerformanceByDate,
  DATE_RANGE_OPTIONS,
  getUniqueSubjectsFromStudentData,
  type DateRangeOption,
} from '@/lib/dashboard-utils';
import type {
  ConfidenceDataPoint,
  GradeDataPoint,
  HomeworkDataPoint,
  PerformanceDataPoint,
  StudentProgressData,
} from '@/lib/data/dashboard';
import { isWithinInterval, parseISO, subDays, subMonths } from 'date-fns';

interface ParentProgressDashboardProps {
  students: StudentProgressData[];
  defaultStudentId: number | null;
  grades: GradeDataPoint[];
}

function isWithinDateRange(dateStr: string, range: DateRangeOption): boolean {
  if (range === 'all') return true;

  const date = parseISO(dateStr);
  const now = new Date();

  switch (range) {
    case '30d':
      return isWithinInterval(date, { start: subDays(now, 30), end: now });
    case '3m':
      return isWithinInterval(date, { start: subMonths(now, 3), end: now });
    case '6m':
      return isWithinInterval(date, { start: subMonths(now, 6), end: now });
    default:
      return true;
  }
}

export function ParentProgressDashboard({
  students: initialStudents,
  defaultStudentId,
  grades: initialGrades,
}: ParentProgressDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(defaultStudentId);
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const selectedStudent = useMemo(
    () => initialStudents.find(s => s.studentId === selectedStudentId),
    [initialStudents, selectedStudentId]
  );

  const availableSubjects = useMemo(
    () => (selectedStudent ? getUniqueSubjectsFromStudentData(selectedStudent) : []),
    [selectedStudent]
  );

  const filteredData = useMemo(() => {
    if (!selectedStudent) {
      return {
        performance: [] as PerformanceDataPoint[],
        confidence: [] as ConfidenceDataPoint[],
        homework: [] as HomeworkDataPoint[],
        grades: [] as GradeDataPoint[],
        sessionCount: 0,
      };
    }

    const isAllSubjects = selectedSubject === 'all';

    let performance = selectedStudent.performance;
    let confidence = selectedStudent.confidence;
    let homework = selectedStudent.homework;

    if (!isAllSubjects) {
      performance = performance.filter((p: PerformanceDataPoint) => p.subject === selectedSubject);
      confidence = confidence.filter((c: ConfidenceDataPoint) => c.subject === selectedSubject);
      homework = homework.filter((h: HomeworkDataPoint) => h.subject === selectedSubject);
    }

    if (dateRange !== 'all') {
      performance = performance.filter((p: PerformanceDataPoint) => isWithinDateRange(p.date, dateRange));
      confidence = confidence.filter((c: ConfidenceDataPoint) => isWithinDateRange(c.date, dateRange));
      homework = homework.filter((h: HomeworkDataPoint) => isWithinDateRange(h.date, dateRange));
    }

    const filteredGrades = isAllSubjects
      ? initialGrades
      : initialGrades.filter((g: GradeDataPoint) => g.subject.toLowerCase() === selectedSubject.toLowerCase());

    return {
      performance: isAllSubjects ? averagePerformanceByDate(performance) : performance,
      confidence: isAllSubjects ? averageConfidenceByDate(confidence) : confidence,
      homework: homework,
      grades: filteredGrades,
      sessionCount: performance.length,
    };
  }, [selectedStudent, selectedSubject, dateRange, initialGrades]);

  const handleStudentChange = (studentId: number) => {
    setSelectedStudentId(studentId);
    setSelectedSubject('all');
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
  };

  const handleDateRangeChange = (newRange: DateRangeOption) => {
    setDateRange(newRange);
  };

  if (initialStudents.length === 0) {
    return (
      <div className='flex h-[400px] items-center justify-center text-muted-foreground'>
        No students are linked to your account. Please contact support to add students.
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
              onValueChange={(value: string) => handleStudentChange(Number(value))}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select student' />
              </SelectTrigger>
              <SelectContent side='bottom'>
                {initialStudents.map((student: StudentProgressData) => (
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
              <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='All subjects' />
                </SelectTrigger>
                <SelectContent side='bottom'>
                  <SelectItem value='all'>All subjects (avg)</SelectItem>
                  {availableSubjects.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <span className='text-sm text-muted-foreground'>{filteredData.sessionCount} sessions</span>
              )}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Date Range</label>
          <div className='flex gap-1'>
            {DATE_RANGE_OPTIONS.map((option: { value: DateRangeOption; label: string }) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleDateRangeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-2'>
          {filteredData.grades.length > 0 ? (
            <GradeChart
              data={filteredData.grades}
              subject={selectedSubject === 'all' ? null : selectedSubject}
              description='Academic grades over time. Shows letter grade trends by subject or overall average across all subjects.'
            />
          ) : (
            <div className='rounded-lg border px-6 pt-6 pb-6'>
              <p className='text-muted-foreground text-sm'>No grades recorded yet</p>
            </div>
          )}
          <HomeworkChart
            data={filteredData.homework}
            description='Homework completion rate. Shows the percentage of assigned homework that was completed before the next session.'
          />
          <PerformanceChart
            data={filteredData.performance}
            description='Performance rating based on session evaluations. Tracks improvement in understanding and mastery of subject material.'
          />
          <ConfidenceChart
            data={filteredData.confidence}
            description='Confidence score based on tutor observations. Tracks how confident the student feels about the material.'
          />
        </div>
      )}
    </div>
  );
}
