import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { getSession, getSessions } from '@/lib/data/sessions';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUserID: vi.fn(),
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: vi.fn(),
}));

const buildListQuery = (data: unknown[] = []) => {
  const query = {
    data,
    error: null,
    gte: vi.fn(() => query),
    neq: vi.fn(() => query),
    lt: vi.fn(() => query),
    eq: vi.fn(() => query),
  };

  return query;
};

const SESSION_DETAIL = {
  id: 1,
  tutor_id: 101,
  parent_id: 1,
  student_id: 201,
  scheduled_at: '2026-04-01T10:00:00Z',
  ends_at: '2026-04-01T11:00:00Z',
  slot_units: 2,
  status: 'Scheduled',
  subject_id: 1,
  subjects: { category: 'Mathematics' },
  tutor: { id: 101, users: { first_name: 'Jane', last_name: 'Tutor', email: 'jane@example.com', phone: '555-1111' } },
  student: { id: 201, parent_id: 1, users: { first_name: 'John', last_name: 'Student', email: 'john@example.com' } },
  parent: { id: 1, users: { first_name: 'Parent', last_name: 'Name', email: 'parent@test.com' } },
  session_progress: [],
  session_metrics: [],
};

function mockSupabaseClient() {
  const listQuery = buildListQuery([
    {
      ...SESSION_DETAIL,
      id: 2,
    },
  ]);

  vi.mocked(createSupabaseServiceClient).mockReturnValue({
    from: vi.fn((table: string) => {
      if (table === 'sessions') {
        return {
          select: vi.fn((selection: string) => {
            if (selection.includes('session_progress')) {
              return {
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({ data: SESSION_DETAIL, error: null })),
                })),
              };
            }

            return listQuery;
          }),
        };
      }

      if (table === 'parents' || table === 'tutors') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
            })),
          })),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  } as never);
}

describe('getSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('admin');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
    mockSupabaseClient();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns sessions for admin users', async () => {
    const sessions = await getSessions();
    expect(sessions).toBeDefined();
  });

  it('filters sessions for parent users', async () => {
    vi.mocked(getUserRole).mockResolvedValue('parent');
    const sessions = await getSessions();
    expect(sessions).toBeDefined();
  });

  it('filters sessions by upcoming', async () => {
    const sessions = await getSessions('upcoming');
    expect(sessions).toBeDefined();
  });

  it('filters sessions by past', async () => {
    const sessions = await getSessions('past');
    expect(sessions).toBeDefined();
  });
});

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('admin');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
    mockSupabaseClient();
  });

  it('returns session detail for valid id', async () => {
    const session = await getSession(1);
    expect(session).toBeDefined();
    expect(session.id).toBe(1);
    expect(session.subject_name).toBe('Mathematics');
  });

  it('throws notFound for invalid id', async () => {
    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      })),
    } as never);

    await expect(getSession(999)).rejects.toThrow();
  });
});
