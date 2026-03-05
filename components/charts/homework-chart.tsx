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

  const chartData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount },
  ];

  return (
    <Card>
      <CardHeader className='pb-2'>
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
                label={({ name, value }) => `${value} ${name}`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const chartData = payload[0];
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>
                          {chartData.name}: {chartData.value}
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
      </CardContent>
    </Card>
  );
}
