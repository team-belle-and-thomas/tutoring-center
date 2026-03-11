import 'server-only';
import { notFound } from 'next/navigation';
import { getCurrentUserID } from '@/lib/auth';
import { EMPTY_CREDIT_BALANCE } from '@/lib/credit-balances';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { getBalance } from '@/server/credits';

async function getCurrentParentId() {
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

  return parent.id;
}

export async function getCurrentParentBalance() {
  const parentId = await getCurrentParentId();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await getBalance(parentId, supabase);

  if (error || !data?.length) {
    return EMPTY_CREDIT_BALANCE;
  }

  return data[0];
}

export async function getCurrentParentCredits() {
  const parentId = await getCurrentParentId();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await getBalance(parentId, supabase);

  if (error) {
    throw new Error('Your credit balance is temporarily unavailable. Please try again in a moment.');
  }

  return {
    parentId,
    balance: data?.[0] ?? EMPTY_CREDIT_BALANCE,
  };
}
