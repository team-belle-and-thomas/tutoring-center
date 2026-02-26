import { clearAllModuleContexts } from 'next/dist/server/lib/render-server';
import { afterEach, describe, expect, it } from 'vitest';
import client from '../client';
import { deductCredits, getBalance } from '../credits';

const TEST_PARENT_ID = 1010;

describe('Credits Tests', () => {
  afterEach(async () => {
    // Clean up any test data after each test
    await client.from('credit_balances').delete().eq('parent_id', TEST_PARENT_ID);
  });

  it('getBalance returns the correct balance for a parent', async () => {
    // Insert a test balance for a parent
    const { data: test_id, error } = await client
      .from('credit_balances')
      .insert({
        parent_id: 1010,
        amount_available: 10,
        amount_pending: 5,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(test_id).toBeDefined();

    // Get the balance for the parent
    const { data, error: balanceError } = await getBalance(1010);

    expect(balanceError).toBeNull();
    expect(data).toBeDefined();

    console.dir(data!);
    expect(data![0].amount_available).toBe(10);
    expect(data![0].amount_pending).toBe(5);

    // Clean up the test data
    await client.from('credit_balances').delete().eq('id', test_id!.id);
  });

  it('deductCredits correctly deducts credits and updates the balance', async () => {
    // Insert a test balance for a parent
    const { data: test_id, error } = await client
      .from('credit_balances')
      .insert({
        parent_id: 1010,
        amount_available: 10,
        amount_pending: 5,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(test_id).toBeDefined();

    // Deduct credits from the parent's balance
    const { data, error: deductError } = await deductCredits(1010, 3);

    expect(deductError).toBeNull();
    expect(data).toBeDefined();
    expect(data!.amount_available).toBe(7);
    expect(data!.amount_pending).toBe(8);
  });

  it('deductCredits returns an error if the parent has insufficient credits', async () => {
    // Insert a test balance for a parent
    const { data: test_id, error } = await client
      .from('credit_balances')
      .insert({
        parent_id: 1010,
        amount_available: 2,
        amount_pending: 5,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(test_id).toBeDefined();

    // Attempt to deduct more credits than the parent has available
    const { data, error: deductError } = await deductCredits(1010, 3);

    expect(data).toBeNull();
    expect(deductError).toBeInstanceOf(Error);
    expect(deductError!.message).toBe('Insufficient credits');
  });

  it('deductCredits returns an error if the parent has no credit balance', async () => {
    // Attempt to deduct credits for a parent with no credit balance
    const { data, error: deductError } = await deductCredits(9999, 3);

    expect(data).toBeNull();
    expect(deductError).toBeInstanceOf(Error);
    expect(deductError!.message).toBe('No credit balance found for parent');
  });
});
