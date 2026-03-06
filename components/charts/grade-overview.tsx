'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GradeDataPoint } from '@/lib/data/dashboard';
import { letterGradeToNumber, numberToLetterGrade } from '@/lib/grade-utils';
import { format } from 'date-fns';
import { HelpCircle, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface GradeChartProps {
  data: GradeDataPoint[];
  subject?: string | null;
  title?: string;
  description?: string;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e',
  A: '#22c55e',
  'A-': '#4ade80',
  'B+': '#84cc16',
  B: '#84cc16',
  'B-': '#a3e635',
  'C+': '#eab308',
  C: '#eab308',
  'C-': '#facc15',
  'D+': '#f97316',
  D: '#f97316',
  'D-': '#fb923c',
  F: '#ef4444',
};

function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade] || '#6b7280';
}

function averageGrades(grades: GradeDataPoint[]): GradeDataPoint {
  const numericSum = grades.reduce((sum, g) => sum + letterGradeToNumber(g.grade), 0);
  const avgNumeric = Math.round(numericSum / grades.length);
  const avgLetter = numberToLetterGrade(avgNumeric);

  return {
    id: 0,
    subject: 'Average',
    grade: avgLetter,
    createdAt: grades[grades.length - 1]?.createdAt || new Date().toISOString(),
  };
}

function processGradesData(
  data: GradeDataPoint[],
  subject?: string | null
): {
  chartData: Array<{ date: string; numericGrade: number; grade: string; formattedDate: string }>;
  latestGrade: string;
  trend: string;
} {
  let filteredData = data;

  if (subject && subject !== 'all') {
    filteredData = data.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
  }

  if (filteredData.length === 0) {
    return { chartData: [], latestGrade: '-', trend: 'stable' };
  }

  let chartData: Array<{ date: string; numericGrade: number; grade: string; formattedDate: string }>;

  if (!subject || subject === 'all') {
    const byDate = new Map<string, GradeDataPoint[]>();

    for (const grade of filteredData) {
      const dateKey = grade.createdAt.split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(grade);
    }

    chartData = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, dayGrades]) => {
        const avg = averageGrades(dayGrades);
        return {
          date: dateKey,
          numericGrade: letterGradeToNumber(avg.grade),
          grade: avg.grade,
          formattedDate: format(new Date(dateKey), 'MMM d'),
        };
      });
  } else {
    chartData = filteredData.map(grade => ({
      date: grade.createdAt,
      numericGrade: letterGradeToNumber(grade.grade),
      grade: grade.grade,
      formattedDate: format(new Date(grade.createdAt), 'MMM d'),
    }));
  }

  const latestGrade = chartData[chartData.length - 1]?.grade ?? '-';

  let trend = 'stable';
  if (chartData.length >= 2) {
    const prev = chartData[chartData.length - 2].numericGrade;
    const curr = chartData[chartData.length - 1].numericGrade;
    if (curr > prev) trend = 'improving';
    else if (curr < prev) trend = 'declining';
  }

  return { chartData, latestGrade, trend };
}

export function GradeChart({ data, subject, title = 'Grades', description }: GradeChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center text-muted-foreground'>No grades recorded yet</div>
        </CardContent>
      </Card>
    );
  }

  const { chartData, latestGrade, trend } = processGradesData(data, subject);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center text-muted-foreground'>
            No grades found for {subject}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <CardTitle>{title}</CardTitle>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className='h-4 w-4 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent className='max-w-xs'>
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold' style={{ color: getGradeColor(latestGrade) }}>
            {latestGrade}
          </span>
          {trend === 'improving' && <TrendingUp className='h-4 w-4 text-green-600' />}
          {trend === 'declining' && <TrendingDown className='h-4 w-4 text-red-600' />}
          {trend === 'stable' && <Minus className='h-4 w-4 text-muted-foreground' />}
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[200px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey='formattedDate' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[50, 100]}
                ticks={[50, 60, 70, 80, 90, 100]}
                tick={{ fontSize: 12, textAnchor: 'middle' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={numberToLetterGrade}
                width={30}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>{item.formattedDate}</p>
                        <p className='text-sm text-muted-foreground'>
                          Grade: <span style={{ color: getGradeColor(item.grade) }}>{item.grade}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type='monotone'
                dataKey='numericGrade'
                stroke='#4f86f7'
                strokeWidth={3}
                dot={{ fill: '#4f86f7', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
