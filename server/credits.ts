import client from './client'

/**
 * Gets the credit balance for a parent
 * @param parent_id: the id of the parent whose balance to retrieve
 * @returns the amount available and amount pending for the parent, or an error if the query fails
 */
export async function getBalance(parent_id: number) {
    const { data, error } = await client
    .from('credit_balances')
    .select('amount_available, amount_pending')
    .eq('parent_id', parent_id)
    return { data, error }
}