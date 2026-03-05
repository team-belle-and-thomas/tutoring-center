'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HomeworkDataPoint } from '@/lib/data/dashboard';
import { format } from 'date-fns';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HomeworkChartProps {
  data: HomeworkDataPoint[];
  title?: string;
}

export function HomeworkChart({ data, title = 'Homework Completion' }: HomeworkChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center text-muted-foreground'>
            No homework data available yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(point => ({
    ...point,
    formattedDate: format(new Date(point.date), 'MMM d'),
    value: point.completed ? 1 : 0,
  }));

  const completedCount = data.filter(d => d.completed).length;
  const totalCount = data.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle>{title}</CardTitle>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold'>{completionRate.toFixed(0)}%</span>
          <span className='text-sm text-muted-foreground'>
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[200px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData}>
              <XAxis dataKey='formattedDate' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={value => (value === 1 ? '✓' : '✗')}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>{data.formattedDate}</p>
                        <p className='text-sm text-muted-foreground'>
                          {data.completed ? '✓ Completed' : '✗ Not completed'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.completed ? 'hsl(var(--chart-3, 142 76% 36%))' : 'hsl(var(--destructive))'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
