import React from 'react';
import { describe, expect, it, vi } from 'vitest';

globalThis.React = React;

vi.mock('@/lib/data/admin-dashboard', () => ({
  AT_RISK_THRESHOLD: 2,
  getAdminMetrics: vi.fn(async () => ({
    sessionsTodayCount: 3,
    pendingNotesCount: 2,
    pendingNotesCreditsAtRisk: 4,
    atRiskParentsCount: 1,
    creditsCaptured: 8,
    creditsLeaked: 1,
    leakageRate: 1 / 9,
  })),
  getAtRiskParents: vi.fn(async () => [
    { parent_id: 7, name: 'Pat Parent', email: 'pat@example.com', amount_available: 1 },
  ]),
  getDebitSessionIds: vi.fn(async () => new Set([101])),
}));

vi.mock('@/lib/data/sessions', () => ({
  getSessions: vi.fn(async () => [
    {
      id: 101,
      student_name: 'Student One',
      tutor_id: 1,
      tutor_name: 'Tutor One',
      tutor_email: 'tutor1@example.com',
      student_id: 11,
      subject_id: 21,
      subject_name: 'Mathematics',
      scheduled_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      hours: 1,
      status: 'Completed',
    },
    {
      id: 102,
      student_name: 'Student Two',
      tutor_id: 2,
      tutor_name: 'Tutor Two',
      tutor_email: 'tutor2@example.com',
      student_id: 12,
      subject_id: 22,
      subject_name: 'Science',
      scheduled_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      hours: 1,
      status: 'Pending-Notes',
    },
  ]),
}));

vi.mock('@/components/admin-dashboard/metric-card', () => ({
  MetricCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid='metric-card'>
      {label}:{value}
    </div>
  ),
}));

vi.mock('@/components/admin-dashboard/sessions-today-table', () => ({
  SessionsTodayTable: ({ sessions }: { sessions: Array<{ id: number }> }) => (
    <div data-testid='sessions-today'>sessions:{sessions.length}</div>
  ),
}));

vi.mock('@/components/admin-dashboard/sessions-view', () => ({
  SessionsView: ({
    title,
    sessions,
    withContact,
  }: {
    title: string;
    sessions: Array<{ id: number }>;
    withContact?: boolean;
  }) => (
    <div data-testid='sessions-view'>
      {title}:{sessions.length}:{withContact ? 'contact' : 'plain'}
    </div>
  ),
}));

vi.mock('@/components/admin-dashboard/at-risk-view', () => ({
  AtRiskView: ({ title, parents }: { title: string; parents: Array<{ parent_id: number }> }) => (
    <div data-testid='at-risk-view'>
      {title}:{parents.length}
    </div>
  ),
}));

describe('AdminDashboardContent', () => {
  it('renders the pending notes detail view for admins', async () => {
    const { AdminDashboardContent } = await import('@/components/admin-dashboard/admin-dashboard-content');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const markup = renderToStaticMarkup(await AdminDashboardContent({ view: 'pending-notes' }));

    expect(markup).toContain('Sessions Today:3');
    expect(markup).toContain('Pending Notes:1:contact');
    expect(markup).toContain('Sessions Billed:8');
  });

  it('renders the at-risk accounts view', async () => {
    const { AdminDashboardContent } = await import('@/components/admin-dashboard/admin-dashboard-content');
    const { renderToStaticMarkup } = await import('react-dom/server');

    const markup = renderToStaticMarkup(await AdminDashboardContent({ view: 'accounts-needing-attention' }));

    expect(markup).toContain('Accounts Needing Attention:1');
  });
});
