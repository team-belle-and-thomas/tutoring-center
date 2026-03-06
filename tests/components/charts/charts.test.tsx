import type { ConfidenceDataPoint, HomeworkDataPoint, PerformanceDataPoint } from '@/lib/data/dashboard';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid='card'>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid='card-header'>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid='card-content'>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid='card-title'>{children}</div>,
}));

vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid='line-chart'>{children}</div>,
  Line: vi.fn(),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  XAxis: vi.fn(),
  YAxis: vi.fn(),
  Tooltip: vi.fn(),
}));

vi.mock('date-fns', () => ({
  format: vi.fn((date: Date) => 'Jan 15'),
}));

const mockPerformanceData: PerformanceDataPoint[] = [
  { date: '2026-01-15T10:00:00Z', score: 3, sessionId: 1, subject: 'Mathematics' },
  { date: '2026-02-15T10:00:00Z', score: 4, sessionId: 2, subject: 'Mathematics' },
];

const mockConfidenceData: ConfidenceDataPoint[] = [
  { date: '2026-01-15T10:00:00Z', score: 2, sessionId: 1, subject: 'Mathematics' },
];

const mockHomeworkData: HomeworkDataPoint[] = [
  { date: '2026-01-15T10:00:00Z', completed: true, sessionId: 1, subject: 'Mathematics' },
  { date: '2026-02-15T10:00:00Z', completed: false, sessionId: 2, subject: 'Mathematics' },
];

describe('Chart Components', () => {
  it('PerformanceChart exports are valid', async () => {
    const { PerformanceChart } = await import('@/components/charts/performance-chart');
    expect(PerformanceChart).toBeDefined();
    expect(typeof PerformanceChart).toBe('function');
  });

  it('ConfidenceChart exports are valid', async () => {
    const { ConfidenceChart } = await import('@/components/charts/performance-chart');
    expect(ConfidenceChart).toBeDefined();
    expect(typeof ConfidenceChart).toBe('function');
  });

  it('HomeworkChart exports are valid', async () => {
    const { HomeworkChart } = await import('@/components/charts/homework-chart');
    expect(HomeworkChart).toBeDefined();
    expect(typeof HomeworkChart).toBe('function');
  });

  it('PerformanceChart renders with data', async () => {
    const { PerformanceChart } = await import('@/components/charts/performance-chart');
    const { renderToStaticMarkup } = await import('react');
    expect(() => renderToStaticMarkup(<PerformanceChart data={mockPerformanceData} />)).not.toThrow();
  });

  it('PerformanceChart renders empty state', async () => {
    const { PerformanceChart } = await import('@/components/charts/performance-chart');
    const { renderToStaticMarkup } = await import('react');
    expect(() => renderToStaticMarkup(<PerformanceChart data={[]} />)).not.toThrow();
  });

  it('ConfidenceChart renders with data', async () => {
    const { ConfidenceChart } = await import('@/components/charts/performance-chart');
    const { renderToStaticMarkup } = await import('react');
    expect(() => renderToStaticMarkup(<ConfidenceChart data={mockConfidenceData} />)).not.toThrow();
  });

  it('HomeworkChart renders with data', async () => {
    const { HomeworkChart } = await import('@/components/charts/homework-chart');
    const { renderToStaticMarkup } = await import('react');
    expect(() => renderToStaticMarkup(<HomeworkChart data={mockHomeworkData} />)).not.toThrow();
  });

  it('HomeworkChart renders empty state', async () => {
    const { HomeworkChart } = await import('@/components/charts/homework-chart');
    const { renderToStaticMarkup } = await import('react');
    expect(() => renderToStaticMarkup(<HomeworkChart data={[]} />)).not.toThrow();
  });
});
