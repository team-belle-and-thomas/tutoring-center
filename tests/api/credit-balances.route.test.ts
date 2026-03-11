import { GET, PUT } from '@/app/api/credit-balances/route';
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

function makePutRequest(body: Record<string, unknown>) {
  return new Request('https://example.test/api/credit-balances', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

type SupabaseSetup = {
  parentRow?: { id: number } | null;
  parentErr?: { message: string } | null;
  balanceRows?: Array<{ parent_id: number; amount_available: number; amount_pending: number }>;
  balanceErr?: { message: string } | null;
  upsertRow?: { parent_id: number; amount_available: number; amount_pending: number } | null;
  upsertErr?: { message: string } | null;
};

function setupSupabase({
  parentRow = { id: 7 },
  parentErr = null,
  balanceRows = [{ parent_id: 7, amount_available: 4, amount_pending: 1 }],
  balanceErr = null,
  upsertRow = { parent_id: 7, amount_available: 5, amount_pending: 0 },
  upsertErr = null,
}: SupabaseSetup = {}) {
  const parentSingle = vi.fn().mockResolvedValue({ data: parentRow, error: parentErr });
  const parentEq = vi.fn().mockReturnValue({ single: parentSingle });
  const parentSelect = vi.fn().mockReturnValue({ eq: parentEq });

  const balanceEq = vi.fn().mockResolvedValue({ data: balanceRows, error: balanceErr });
  const balanceSelect = vi.fn().mockReturnValue({ eq: balanceEq });

  const upsertSingle = vi.fn().mockResolvedValue({ data: upsertRow, error: upsertErr });
  const upsertSelect = vi.fn().mockReturnValue({ single: upsertSingle });
  const balanceUpsert = vi.fn().mockReturnValue({ select: upsertSelect });

  const from = vi.fn((table: string) => {
    if (table === 'parents') {
      return { select: parentSelect };
    }

    if (table === 'credit_balances') {
      return {
        select: balanceSelect,
        upsert: balanceUpsert,
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  mockCreateSupabaseServiceClient.mockReturnValue({ from });

  return {
    from,
    parentEq,
    balanceEq,
    balanceUpsert,
  };
}

describe('credit balances route auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setCookies('parent', '42');
    setupSupabase();
  });

  it('returns 401 for GET when role cookie is missing', async () => {
    setCookies(undefined, '42');

    const response = await GET(new Request('https://example.test/api/credit-balances?parent_id=9'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 for GET when user is a tutor', async () => {
    setCookies('tutor', '42');

    const response = await GET(new Request('https://example.test/api/credit-balances?parent_id=9'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('derives the parent id for GET when the caller is a parent', async () => {
    const { parentEq, balanceEq } = setupSupabase({
      parentRow: { id: 77 },
      balanceRows: [{ parent_id: 77, amount_available: 8, amount_pending: 2 }],
    });

    const response = await GET(new Request('https://example.test/api/credit-balances?parent_id=999'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(parentEq).toHaveBeenCalledWith('user_id', 42);
    expect(balanceEq).toHaveBeenCalledWith('parent_id', 77);
    expect(body).toEqual({ parent_id: 77, amount_available: 8, amount_pending: 2 });
  });

  it('derives the parent id for PUT when the caller is a parent', async () => {
    const { parentEq, balanceUpsert } = setupSupabase({
      parentRow: { id: 55 },
      upsertRow: { parent_id: 55, amount_available: 6, amount_pending: 1 },
    });

    const response = await PUT(makePutRequest({ parent_id: 999, amount_available: 6, amount_pending: 1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(parentEq).toHaveBeenCalledWith('user_id', 42);
    expect(balanceUpsert).toHaveBeenCalledWith(
      {
        parent_id: 55,
        amount_available: 6,
        amount_pending: 1,
      },
      { onConflict: 'parent_id' }
    );
    expect(body).toEqual({ parent_id: 55, amount_available: 6, amount_pending: 1 });
  });
});
