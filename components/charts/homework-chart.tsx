'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { HomeworkDataPoint } from '@/lib/data/dashboard';
import { HelpCircle } from 'lucide-react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface HomeworkChartProps {
  data: HomeworkDataPoint[];
  title?: string;
}

const COLORS = ['#2eb88d', '#ef4444'];

const HOMEWORK_DESCRIPTION =
  'Homework completion rate. Shows the percentage of assigned homework that was completed before the next session.';

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

  const completedCount = data.filter(d => d.completed).length;
  const notCompletedCount = data.length - completedCount;
  const completionRate = data.length > 0 ? (completedCount / data.length) * 100 : 0;

  const chartData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount },
  ];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <CardTitle>{title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className='h-4 w-4 text-muted-foreground' />
              </TooltipTrigger>
              <TooltipContent className='max-w-xs'>
                <p>{HOMEWORK_DESCRIPTION}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold'>{completionRate.toFixed(0)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[200px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey='value'
                labelLine={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const chartData = payload[0];
                    const total = completedCount + notCompletedCount;
                    const pct = total > 0 ? ((chartData.value / total) * 100).toFixed(0) : 0;
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>
                          {chartData.name}: {chartData.value} ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='flex justify-center gap-6 mt-2'>
          {chartData.map((entry, index) => (
            <div key={entry.name} className='flex items-center gap-2'>
              <div className='h-3 w-3 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className='text-sm'>
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
