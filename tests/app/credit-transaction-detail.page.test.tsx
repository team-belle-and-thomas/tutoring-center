import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

globalThis.React = React;

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  forbidden: vi.fn(() => {
    throw new Error('forbidden');
  }),
  notFound: vi.fn(() => {
    throw new Error('notFound');
  }),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

vi.mock('@/lib/auth', () => ({
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/constants', () => ({
  TIMEZONE: 'America/New_York',
}));

vi.mock('@/lib/date-utils', () => ({
  formatSessionDay: vi.fn(() => 'Tue, Mar 10'),
  formatSessionTime: vi.fn((date: Date) => (date.getUTCHours() === 15 ? '10:00 AM' : '11:00 AM')),
}));

vi.mock('@/lib/data/credit-transactions', () => ({
  getCreditTransaction: vi.fn(),
}));

describe('SingleCreditTransactionPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders transaction detail content for admin users', async () => {
    const { getUserRole } = await import('@/lib/auth');
    const { getCreditTransaction } = await import('@/lib/data/credit-transactions');
    vi.mocked(getUserRole).mockResolvedValue('admin');
    vi.mocked(getCreditTransaction).mockResolvedValue({
      id: 42,
      created_at: '2026-03-10T15:00:00.000Z',
      type: 'Session Debit',
      amount: -1,
      balance_after: 9,
      session_id: 500,
      parent: { id: 1, name: 'Pat Parent', email: 'pat@example.com', phone: '555-1111' },
      student: { id: 2, name: 'Sam Student', email: 'sam@example.com', phone: '555-2222', grade: '8' },
      session: {
        id: 500,
        scheduled_at: '2026-03-10T15:00:00.000Z',
        ends_at: '2026-03-10T16:00:00.000Z',
        status: 'Completed',
        subject_name: 'Mathematics',
        tutor_name: 'Taylor Tutor',
      },
    });

    const { default: SingleCreditTransactionPage } = await import('@/app/dashboard/credit-transactions/[id]/page');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const markup = renderToStaticMarkup(await SingleCreditTransactionPage({ params: Promise.resolve({ id: '42' }) }));

    expect(markup).toContain('Credit Transaction #42');
    expect(markup).toContain('Pat Parent');
    expect(markup).toContain('Sam Student');
    expect(markup).toContain('Mathematics');
    expect(markup).toContain('/dashboard/sessions/500');
  });

  it('hides the parent card for parent users', async () => {
    const { getUserRole } = await import('@/lib/auth');
    const { getCreditTransaction } = await import('@/lib/data/credit-transactions');
    vi.mocked(getUserRole).mockResolvedValue('parent');
    vi.mocked(getCreditTransaction).mockResolvedValue({
      id: 43,
      created_at: '2026-03-10T15:00:00.000Z',
      type: 'Purchase',
      amount: 10,
      balance_after: 19,
      session_id: null,
      parent: { id: 1, name: 'Pat Parent', email: 'pat@example.com', phone: '555-1111' },
      student: { id: 2, name: 'Sam Student', email: 'sam@example.com', phone: '555-2222', grade: '8' },
      session: null,
    });

    const { default: SingleCreditTransactionPage } = await import('@/app/dashboard/credit-transactions/[id]/page');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const markup = renderToStaticMarkup(await SingleCreditTransactionPage({ params: Promise.resolve({ id: '43' }) }));

    expect(markup).toContain('Sam Student');
    expect(markup).not.toContain('Pat Parent');
    expect(markup).toContain('No session is linked to this credit transaction.');
  });
});
