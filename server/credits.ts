import client from './client';

/**
 * Gets the credit balance for a parent
 * @param parent_id: the id of the parent whose balance to retrieve
 * @returns the amount available and amount pending for the parent, or an error if the query fails
 */
export async function getBalance(parent_id: number) {
  const { data, error } = await client
    .from('credit_balances')
    .select('amount_available, amount_pending')
    .eq('parent_id', parent_id);
  return { data, error };
}

/**
 * Deduct credits from a parent's balance and add them to the pending amount
 * @param parent_id: The id of the parent whose balance to deduct credits from
 * @param amount: The amount of credits to deduct from the parent's balance
 * @returns The updated balance for the parent, or an error if the query fails or if the parent has insufficient credits
 */
export async function deductCredits(parent_id: number, amount: number) {
  const { data, error } = await getBalance(parent_id);
  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: new Error('No credit balance found for parent') };
  }

  const { amount_available, amount_pending } = data[0];

  if (amount_available < amount) {
    return { data: null, error: new Error('Insufficient credits') };
  }

  const { data: updateData, error: updateError } = await client
    .from('credit_balances')
    .update({
      amount_available: amount_available - amount,
      amount_pending: amount_pending + amount,
    })
    .eq('parent_id', parent_id)
    .select('amount_available, amount_pending')
    .single();

  return { data: updateData, error: updateError };
}
