import { POST } from '@/app/api/sessions/route';
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

type SupabaseSetup = {
  parentRow?: { id: number } | null;
  parentErr?: { message: string } | null;
  overlaps?: Array<{ id: number }>;
  overlapErr?: { message: string } | null;
  insertRow?: { id: number } | null;
  insertErr?: { message: string } | null;
};

const BASE_BODY = {
  tutor_id: 11,
  student_id: 22,
  subject_id: 33,
  slot_units: 1,
  scheduled_at: '2026-03-02T15:00:00.000Z',
  ends_at: '2026-03-02T16:00:00.000Z',
};

function makeRequest(body: Record<string, unknown>) {
  return new Request('https://example.test/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function setCookies(role?: string, userId?: string) {
  mockCookies.mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name === 'user-role' && role) return { value: role };
      if (name === 'user-id' && userId) return { value: userId };
      return undefined;
    }),
  });
}

function setupSupabase({
  parentRow = { id: 7 },
  parentErr = null,
  overlaps = [],
  overlapErr = null,
  insertRow = { id: 1001 },
  insertErr = null,
}: SupabaseSetup = {}) {
  const parentSingle = vi.fn().mockResolvedValue({ data: parentRow, error: parentErr });
  const parentEq = vi.fn().mockReturnValue({ single: parentSingle });
  const parentSelect = vi.fn().mockReturnValue({ eq: parentEq });

  const overlapLimit = vi.fn().mockResolvedValue({ data: overlaps, error: overlapErr });
  const overlapQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    limit: overlapLimit,
  };

  const insertSingle = vi.fn().mockResolvedValue({ data: insertRow, error: insertErr });
  const insertSelect = vi.fn().mockReturnValue({ single: insertSingle });
  const insertQuery = {
    insert: vi.fn().mockReturnValue({ select: insertSelect }),
  };

  let sessionsFromCount = 0;
  const from = vi.fn((table: string) => {
    if (table === 'parents') {
      return { select: parentSelect };
    }

    if (table === 'sessions') {
      sessionsFromCount += 1;
      return sessionsFromCount === 1 ? overlapQuery : insertQuery;
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  mockCreateSupabaseServiceClient.mockReturnValue({ from });

  return {
    from,
    parentEq,
    overlapQuery,
    insertQuery,
  };
}

describe('POST /api/sessions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setCookies('parent', '42');
    setupSupabase();
  });

  it('returns 401 when role cookie is missing', async () => {
    setCookies(undefined, '42');

    const response = await POST(makeRequest({ ...BASE_BODY, parent_id: 999 }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 403 for tutor role', async () => {
    setCookies('tutor', '42');

    const response = await POST(makeRequest({ ...BASE_BODY, parent_id: 999 }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden');
  });

  it('derives parent_id from auth for parent role and ignores request parent_id', async () => {
    const { parentEq, insertQuery } = setupSupabase({
      parentRow: { id: 77 },
    });

    const response = await POST(makeRequest({ ...BASE_BODY, parent_id: 999 }));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(parentEq).toHaveBeenCalledWith('user_id', 42);
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        tutor_id: 11,
        student_id: 22,
        subject_id: 33,
        parent_id: 77,
      })
    );
    expect(body.data).toEqual({ id: 1001 });
  });

  it('returns 400 for admin requests without parent_id', async () => {
    setCookies('admin', '1');

    const response = await POST(makeRequest(BASE_BODY));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('parent_id is required');
  });

  it('returns 409 when an overlapping session exists', async () => {
    setCookies('admin', '1');
    setupSupabase({
      overlaps: [{ id: 1 }],
    });

    const response = await POST(makeRequest({ ...BASE_BODY, parent_id: 5 }));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe('Tutor already has a session in that time range');
  });
});
