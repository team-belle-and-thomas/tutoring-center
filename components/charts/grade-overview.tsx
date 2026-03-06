'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GradeDataPoint } from '@/lib/data/dashboard';
import { letterGradeToNumber } from '@/lib/grade-utils';
import { format } from 'date-fns';
import { HelpCircle, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { Line, LineChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface GradeChartProps {
  data: GradeDataPoint[];
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

export function GradeChart({ data, title = 'Grades', description }: GradeChartProps) {
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

  const chartData = data.map(grade => ({
    ...grade,
    numericGrade: letterGradeToNumber(grade.grade),
    formattedDate: format(new Date(grade.createdAt), 'MMM d'),
  }));

  const latestGrade = data[data.length - 1]?.grade ?? '-';
  const latestNumeric = letterGradeToNumber(latestGrade);

  let trend = 'stable';
  let trendValue = 0;

  if (data.length >= 2) {
    const prevNumeric = letterGradeToNumber(data[data.length - 2].grade);
    trendValue = latestNumeric - prevNumeric;
    if (trendValue > 0) trend = 'improving';
    else if (trendValue < 0) trend = 'declining';
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
          <span className='text-sm text-muted-foreground'>({latestNumeric}%)</span>
          {trend === 'improving' && <TrendingUp className='h-4 w-4 text-green-600' />}
          {trend === 'declining' && <TrendingDown className='h-4 w-4 text-red-600' />}
          {trend === 'stable' && <Minus className='h-4 w-4 text-muted-foreground' />}
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[200px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData}>
              <XAxis dataKey='formattedDate' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[50, 100]}
                ticks={[50, 60, 70, 80, 90, 100]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>{item.formattedDate}</p>
                        <p className='text-sm text-muted-foreground'>
                          Grade: <span style={{ color: getGradeColor(item.grade) }}>{item.grade}</span> (
                          {item.numericGrade}%)
                        </p>
                        <p className='text-xs text-muted-foreground'>{item.subject}</p>
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
