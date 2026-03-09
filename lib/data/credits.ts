import 'server-only';
import { getCurrentUserID } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { getBalance } from '@/server/credits';

export type CreditBalance = {
  amount_available: number;
  amount_pending: number;
};

const EMPTY_BALANCE: CreditBalance = {
  amount_available: 0,
  amount_pending: 0,
};

export async function getCurrentParentBalance(): Promise<CreditBalance> {
  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: parent, error: parentError } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (parentError || !parent) {
    return EMPTY_BALANCE;
  }

  const { data, error } = await getBalance(parent.id, supabase);

  if (error || !data?.length) {
    return EMPTY_BALANCE;
  }

  return data[0];
}
