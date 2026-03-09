import 'server-only';
import { notFound } from 'next/navigation';
import { getCurrentUserID } from '@/lib/auth';
import { EMPTY_CREDIT_BALANCE } from '@/lib/credit-balances';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';

export async function getCurrentParentCredits() {
  const userId = await getCurrentUserID();
  const supabase = createSupabaseServiceClient();

  const { data: parent, error: parentError } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (parentError || !parent) {
    notFound();
  }

  const { data: balance, error: balanceError } = await supabase
    .from('credit_balances')
    .select('amount_available, amount_pending')
    .eq('parent_id', parent.id)
    .maybeSingle();

  if (balanceError) {
    throw new Error('Your credit balance is temporarily unavailable. Please try again in a moment.');
  }

  return {
    parentId: parent.id,
    balance: balance ?? EMPTY_CREDIT_BALANCE,
  };
}
