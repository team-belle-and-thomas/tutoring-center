import 'server-only';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { pickFirstEmbedded } from '@/lib/utils/normalize';

export type AdminMetrics = {
  sessionsTodayCount: number;
  pendingNotesCount: number;
  pendingNotesCreditsAtRisk: number;
  atRiskParentsCount: number;
  creditsCaptured: number;
  creditsLeaked: number;
  leakageRate: number;
};

export type AtRiskParent = {
  parent_id: number;
  name: string;
  email: string;
  amount_available: number;
};

export const AT_RISK_THRESHOLD = 2;

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const supabase = createSupabaseServiceClient();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const [sessionsTodayResult, pendingNotesResult, debitTransactionsResult, completedSessionsResult, atRiskResult] =
    await Promise.all([
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Scheduled')
        .gte('scheduled_at', startOfToday.toISOString())
        .lte('scheduled_at', endOfToday.toISOString()),
      supabase.from('sessions').select('id, slot_units').eq('status', 'Pending-Notes'),
      supabase.from('credit_transactions').select('amount').lt('amount', 0).not('session_id', 'is', null),
      supabase.from('sessions').select('id, slot_units, credit_transactions(id, amount)').eq('status', 'Completed'),
      supabase
        .from('credit_balances')
        .select('id', { count: 'exact', head: true })
        .lt('amount_available', AT_RISK_THRESHOLD),
    ]);

  const pendingNotes = pendingNotesResult.data ?? [];
  const pendingNotesCreditsAtRisk = pendingNotes.reduce((sum, session) => sum + session.slot_units, 0);
  const creditsCaptured = (debitTransactionsResult.data ?? []).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  type CompletedRow = {
    id: number;
    slot_units: number;
    credit_transactions: Array<{ amount: number; id: number }> | null;
  };

  const completedSessions = (completedSessionsResult.data ?? []) as CompletedRow[];
  const creditsLeaked = completedSessions
    .filter(session => !(session.credit_transactions ?? []).some(tx => tx.amount < 0))
    .reduce((sum, session) => sum + session.slot_units, 0);
  const leakageRate = creditsCaptured + creditsLeaked > 0 ? creditsLeaked / (creditsCaptured + creditsLeaked) : 0;

  return {
    sessionsTodayCount: sessionsTodayResult.count ?? 0,
    pendingNotesCount: pendingNotes.length,
    pendingNotesCreditsAtRisk,
    atRiskParentsCount: atRiskResult.count ?? 0,
    creditsCaptured,
    creditsLeaked,
    leakageRate,
  };
}

export async function getAtRiskParents(): Promise<AtRiskParent[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from('credit_balances')
    .select('amount_available, parents(id, users:user_id(first_name, last_name, email))')
    .lt('amount_available', AT_RISK_THRESHOLD)
    .order('amount_available', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.flatMap(row => {
    const parent = Array.isArray(row.parents) ? row.parents[0] : row.parents;
    if (!parent) {
      return [];
    }

    const userRaw = parent.users ? pickFirstEmbedded(parent.users) : null;
    if (!userRaw) {
      return [];
    }

    const user = userRaw as { email: string; first_name: string | null; last_name: string | null };

    return [
      {
        parent_id: parent.id,
        name: [user.first_name, user.last_name].filter(Boolean).join(' ') || '—',
        email: user.email,
        amount_available: row.amount_available,
      },
    ];
  });
}

export async function getDebitSessionIds(): Promise<Set<number>> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('credit_transactions')
    .select('session_id')
    .lt('amount', 0)
    .not('session_id', 'is', null);

  return new Set((data ?? []).map(tx => tx.session_id).filter((id): id is number => id !== null));
}
