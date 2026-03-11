import { ADMIN_DASHBOARD_VIEW_TITLES, type ViewKey } from '@/lib/admin-dashboard-views';
import { AT_RISK_THRESHOLD, getAdminMetrics, getAtRiskParents, getDebitSessionIds } from '@/lib/data/admin-dashboard';
import { getSessions } from '@/lib/data/sessions';
import type { Route } from 'next';
import { AtRiskView } from './at-risk-view';
import { MetricCard } from './metric-card';
import { SessionsTodayTable } from './sessions-today-table';
import { SessionsView } from './sessions-view';

export async function AdminDashboardContent({ view }: { view: ViewKey }) {
  const now = new Date();

  const [metrics, atRiskParents, sessions, debitSessionIds] = await Promise.all([
    getAdminMetrics(),
    getAtRiskParents(),
    getSessions('all'),
    getDebitSessionIds(),
  ]);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const sessionsTodayData = sessions.filter(session => {
    const scheduledAt = new Date(session.scheduled_at);
    return scheduledAt >= startOfToday && scheduledAt <= endOfToday;
  });
  const pendingNotesData = sessions.filter(session => session.status === 'Pending-Notes');
  const capturedData = sessions.filter(session => debitSessionIds.has(session.id));
  const leakedData = sessions.filter(session => session.status === 'Completed' && !debitSessionIds.has(session.id));

  const leakagePct = (metrics.leakageRate * 100).toFixed(1);
  const viewUrl = (nextView: ViewKey) => `/dashboard?view=${nextView}` as Route<string>;

  return (
    <div className='space-y-8 px-8'>
      <section>
        <p className='text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3'>Live</p>
        <div className='grid grid-cols-2 gap-4'>
          <MetricCard
            label={ADMIN_DASHBOARD_VIEW_TITLES['sessions-today']}
            value={metrics.sessionsTodayCount}
            sub='scheduled for today'
            href={viewUrl('sessions-today')}
            active={view === 'sessions-today'}
            tooltip='All sessions scheduled for today across all tutors. Mark no-shows or cancellations inline.'
          />
          <MetricCard
            label={ADMIN_DASHBOARD_VIEW_TITLES['accounts-needing-attention']}
            value={metrics.atRiskParentsCount}
            sub={`< ${AT_RISK_THRESHOLD} credits remaining`}
            subColor={metrics.atRiskParentsCount > 0 ? 'text-amber-500' : undefined}
            href={viewUrl('accounts-needing-attention')}
            active={view === 'accounts-needing-attention'}
            tooltip='Parents with fewer than 2 credits remaining.'
          />
        </div>
      </section>

      <section>
        <p className='text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3'>Revenue</p>
        <div className='grid grid-cols-3 gap-4'>
          <MetricCard
            label={ADMIN_DASHBOARD_VIEW_TITLES['pending-notes']}
            value={metrics.pendingNotesCount}
            sub={`${metrics.pendingNotesCreditsAtRisk} credit${metrics.pendingNotesCreditsAtRisk !== 1 ? 's' : ''} at risk`}
            subColor={metrics.pendingNotesCreditsAtRisk > 0 ? 'text-amber-500' : undefined}
            href={viewUrl('pending-notes')}
            active={view === 'pending-notes'}
            tooltip='Sessions where tutor notes have not been submitted yet.'
          />
          <MetricCard
            label={ADMIN_DASHBOARD_VIEW_TITLES['sessions-billed']}
            value={metrics.creditsCaptured}
            href={viewUrl('sessions-billed')}
            active={view === 'sessions-billed'}
            tooltip='Credits successfully debited for completed sessions.'
          />
          <MetricCard
            label={ADMIN_DASHBOARD_VIEW_TITLES['sessions-pending-billing']}
            value={metrics.creditsLeaked}
            sub={`${leakagePct}% unbilled rate`}
            subColor={metrics.creditsLeaked > 0 ? 'text-amber-500' : undefined}
            href={viewUrl('sessions-pending-billing')}
            active={view === 'sessions-pending-billing'}
            tooltip='Completed sessions without a matching credit deduction.'
          />
        </div>
      </section>

      <section>
        {view === 'sessions-today' && (
          <>
            <h2 className='text-xl font-semibold mb-4'>{ADMIN_DASHBOARD_VIEW_TITLES['sessions-today']}</h2>
            <SessionsTodayTable sessions={sessionsTodayData} />
          </>
        )}
        {view === 'pending-notes' && (
          <SessionsView title={ADMIN_DASHBOARD_VIEW_TITLES['pending-notes']} sessions={pendingNotesData} withContact />
        )}
        {view === 'sessions-billed' && (
          <SessionsView title={ADMIN_DASHBOARD_VIEW_TITLES['sessions-billed']} sessions={capturedData} />
        )}
        {view === 'sessions-pending-billing' && (
          <SessionsView title={ADMIN_DASHBOARD_VIEW_TITLES['sessions-pending-billing']} sessions={leakedData} />
        )}
        {view === 'accounts-needing-attention' && (
          <AtRiskView title={ADMIN_DASHBOARD_VIEW_TITLES['accounts-needing-attention']} parents={atRiskParents} />
        )}
      </section>
    </div>
  );
}
