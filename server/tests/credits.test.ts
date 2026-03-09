import 'dotenv/config';
import { createSupabaseTestClient } from '@/tests/helpers/supabaseTestClient';
import { afterEach, describe, expect, it } from 'vitest';
import { deductCredits, getBalance } from '../credits';
import { placeSession } from '../reservations';

const client = createSupabaseTestClient();
const TEST_PARENT_ID = 1010;
const TEST_TUTOR_ID = 1011;
const TEST_STUDENT_ID = 1012;

describe('Credits Tests', () => {
  afterEach(async () => {
    // Clean up any test data after each test
    await client.from('credit_balances').delete().eq('parent_id', TEST_PARENT_ID);
    await client.from('sessions').delete().eq('parent_id', TEST_PARENT_ID);
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
    const { data, error: balanceError } = await getBalance(1010, client);

    expect(balanceError).toBeNull();
    expect(data).toBeDefined();

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
    const { data, error: deductError } = await deductCredits(1010, 3, client);

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
    const { data, error: deductError } = await deductCredits(1010, 3, client);

    expect(data).toBeNull();
    expect(deductError).toBeInstanceOf(Error);
    expect(deductError!.message).toBe('Insufficient credits');
  });

  it('deductCredits returns an error if the parent has no credit balance', async () => {
    // Attempt to deduct credits for a parent with no credit balance
    const { data, error: deductError } = await deductCredits(9999, 3, client);

    expect(data).toBeNull();
    expect(deductError).toBeInstanceOf(Error);
    expect(deductError!.message).toBe('No credit balance found for parent');
  });

  it('placeSession successfully places a session and deducts credits', async () => {
    // Insert a test balance for a parent
    const { data: test_id, error } = await client
      .from('credit_balances')
      .insert({
        parent_id: TEST_PARENT_ID,
        amount_available: 10,
        amount_pending: 0,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(test_id).toBeDefined();

    // Place a session for the parent
    const { data: session_data, error: session_error } = await placeSession(
      TEST_PARENT_ID,
      TEST_STUDENT_ID,
      TEST_TUTOR_ID,
      1, // subject_id
      new Date().toISOString(),
      new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Ends in 1 Hour
      client
    );

    expect(session_error).toBeNull();
    expect(session_data).toBeDefined();

    // Check that the session was created with the correct details
    expect(session_data!.parent_id).toBe(TEST_PARENT_ID);
    expect(session_data!.student_id).toBe(TEST_STUDENT_ID);
    expect(session_data!.tutor_id).toBe(TEST_TUTOR_ID);
    expect(session_data!.subject_id).toBe(1);
    expect(session_data!.status).toBe('Scheduled');

    // Check that the parent's balance was updated correctly
    const { data: balance_data, error: balance_error } = await getBalance(TEST_PARENT_ID, client);
    expect(balance_error).toBeNull();
    expect(balance_data).toBeDefined();
    expect(balance_data![0].amount_available).toBe(9);
    expect(balance_data![0].amount_pending).toBe(1);
  });

  it('placeSession returns an error if the parent has insufficient credits', async () => {
    // Insert a test balance for a parent
    const { data: test_id, error } = await client
      .from('credit_balances')
      .insert({
        parent_id: TEST_PARENT_ID,
        amount_available: 0,
        amount_pending: 0,
      })
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(test_id).toBeDefined();

    // Attempt to place a session for the parent
    const { data: session_data, error: session_error } = await placeSession(
      TEST_PARENT_ID,
      TEST_STUDENT_ID,
      TEST_TUTOR_ID,
      1, // subject_id
      new Date().toISOString(),
      new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Ends in 1 Hour
      client
    );

    expect(session_data).toBeNull();
    expect(session_error).toBeInstanceOf(Error);
    expect(session_error!.message).toBe('Insufficient credits');
  });
});
