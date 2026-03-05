'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HomeworkDataPoint } from '@/lib/data/dashboard';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface HomeworkChartProps {
  data: HomeworkDataPoint[];
  title?: string;
}

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--destructive))'];

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
        <CardTitle>{title}</CardTitle>
        <div className='flex items-center gap-2'>
          <span className='text-2xl font-bold'>{completionRate.toFixed(0)}%</span>
          <span className='text-sm text-muted-foreground'>
            {completedCount}/{data.length}
          </span>
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
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const total = chartData.reduce((sum, item) => sum + item.value, 0);
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>
                          {data.name}: {data.value} ({total > 0 ? ((data.value / total) * 100).toFixed(0) : 0}%)
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
