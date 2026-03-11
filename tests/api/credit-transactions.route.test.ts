import { GET, POST } from '@/app/api/credit-transactions/route';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCookies, mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

function setCookies(role?: string, userId?: string) {
  mockCookies.mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === 'user-role' && role) return { value: role };
      if (name === 'user-id' && userId) return { value: userId };
      return undefined;
    }),
  });
}

function makePostRequest(body: Record<string, unknown>) {
  return new Request('https://example.test/api/credit-transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

type SupabaseSetup = {
  parentRow?: { id: number } | null;
  parentErr?: { message: string } | null;
  count?: number | null;
  countErr?: { message: string } | null;
  insertRow?: { id: number } | null;
  insertErr?: { message: string } | null;
};

function setupSupabase({
  parentRow = { id: 7 },
  parentErr = null,
  count = 0,
  countErr = null,
  insertRow = { id: 1001 },
  insertErr = null,
}: SupabaseSetup = {}) {
  const parentSingle = vi.fn().mockResolvedValue({ data: parentRow, error: parentErr });
  const parentEq = vi.fn().mockReturnValue({ single: parentSingle });
  const parentSelect = vi.fn().mockReturnValue({ eq: parentEq });

  const countQuery = {
    count,
    error: countErr,
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  };
  const transactionSelect = vi.fn(() => countQuery);

  const insertSingle = vi.fn().mockResolvedValue({ data: insertRow, error: insertErr });
  const insertSelect = vi.fn().mockReturnValue({ single: insertSingle });
  const transactionInsert = vi.fn().mockReturnValue({ select: insertSelect });

  const from = vi.fn((table: string) => {
    if (table === 'parents') {
      return { select: parentSelect };
    }

    if (table === 'credit_transactions') {
      return {
        select: transactionSelect,
        insert: transactionInsert,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  mockCreateSupabaseServiceClient.mockReturnValue({ from });

  return {
    from,
    parentEq,
    countQuery,
    transactionInsert,
  };
}

describe('credit transactions route auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setCookies('parent', '42');
    setupSupabase();
  });

  it('returns 401 for GET when role cookie is missing', async () => {
    setCookies(undefined, '42');

    const response = await GET(new Request('https://example.test/api/credit-transactions?parent_id=9'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('derives the parent id for GET when the caller is a parent', async () => {
    const { parentEq, countQuery } = setupSupabase({
      parentRow: { id: 88 },
      count: 0,
    });

    const response = await GET(
      new Request('https://example.test/api/credit-transactions?parent_id=999&page=1&page_size=20')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(parentEq).toHaveBeenCalledWith('user_id', 42);
    expect(countQuery.eq).toHaveBeenCalledWith('parent_id', 88);
    expect(body.data).toEqual([]);
    expect(body.filters.parent_id).toBe(88);
  });

  it('derives the parent id for POST when the caller is a parent', async () => {
    const { parentEq, transactionInsert } = setupSupabase({
      parentRow: { id: 55 },
      insertRow: { id: 2002 },
    });

    const response = await POST(
      makePostRequest({
        parent_id: 999,
        student_id: 22,
        amount: 4,
        balance_after: 8,
        type: 'Purchase',
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(parentEq).toHaveBeenCalledWith('user_id', 42);
    expect(transactionInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        parent_id: 55,
        student_id: 22,
        amount: 4,
        balance_after: 8,
        type: 'Purchase',
      })
    );
    expect(body.data).toEqual({ id: 2002 });
  });
});
