'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ConfidenceDataPoint, PerformanceDataPoint } from '@/lib/data/dashboard';
import { format } from 'date-fns';
import { HelpCircle } from 'lucide-react';
import { Line, LineChart, Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type MetricDataPoint = PerformanceDataPoint | ConfidenceDataPoint;

const CHART_COLORS = {
  performance: '#4f86f7',
  confidence: '#8b5cf6',
};

interface MetricChartProps {
  data: MetricDataPoint[];
  title: string;
  color: string;
  emptyMessage: string;
  description?: string;
}

export function MetricChart({ data, title, color, emptyMessage, description }: MetricChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex h-[200px] items-center justify-center text-muted-foreground'>{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(point => ({
    ...point,
    formattedDate: format(new Date(point.date), 'MMM d'),
  }));

  const latestScore = data[data.length - 1]?.score ?? 0;
  const firstScore = data[0]?.score ?? 0;
  const trend = latestScore - firstScore;

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
          <span className='text-2xl font-bold'>{latestScore.toFixed(1)}</span>
          <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-[200px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData}>
              <XAxis dataKey='formattedDate' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const chartData = payload[0].payload;
                    return (
                      <div className='rounded-lg border bg-background px-3 py-2 shadow-md'>
                        <p className='text-sm font-medium'>{chartData.formattedDate}</p>
                        <p className='text-sm text-muted-foreground'>Score: {chartData.score.toFixed(1)}/5</p>
                        {chartData.subject && <p className='text-xs text-muted-foreground'>{chartData.subject}</p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type='monotone'
                dataKey='score'
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceChart({ data, description }: { data: PerformanceDataPoint[]; description?: string }) {
  return (
    <MetricChart
      data={data}
      title='Performance'
      color={CHART_COLORS.performance}
      emptyMessage='No performance data available yet'
      description={description}
    />
  );
}

export function ConfidenceChart({ data, description }: { data: ConfidenceDataPoint[]; description?: string }) {
  return (
    <MetricChart
      data={data}
      title='Confidence'
      color={CHART_COLORS.confidence}
      emptyMessage='No confidence data available yet'
      description={description}
    />
  );
}
