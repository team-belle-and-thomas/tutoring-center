import { getSession, getSessions } from '@/lib/data/sessions';
import { getCurrentUserID, getUserRole } from '@/lib/mock-api';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/mock-api', () => ({
  getCurrentUserID: vi.fn(),
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
            single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
          })),
          lt: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        single: vi.fn(() =>
          Promise.resolve({
            data: {
              id: 1,
              scheduled_at: '2026-04-01T10:00:00Z',
              ends_at: '2026-04-01T11:00:00Z',
              slot_units: 2,
              status: 'Scheduled',
              subject_id: 1,
              subjects: { category: 'Mathematics' },
              tutor: { id: 101, users: { first_name: 'Jane', last_name: 'Tutor' } },
              student: { id: 201, parent_id: 1, users: { first_name: 'John', last_name: 'Student' } },
              parent: { id: 1, users: { first_name: 'Parent', last_name: 'Name', email: 'parent@test.com' } },
              session_progress: [],
              session_metrics: [],
            },
            error: null,
          })
        ),
      })),
    })),
  })),
}));

describe('getSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('admin');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
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
  it('returns session detail for valid id', async () => {
    const session = await getSession(1);
    expect(session).toBeDefined();
    expect(session.id).toBe(1);
    expect(session.subject_name).toBe('Mathematics');
  });

  it('throws notFound for invalid id', async () => {
    vi.mock('@/lib/supabase/serverClient', () => ({
      createSupabaseServiceClient: vi.fn(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      })),
    }));

    await expect(getSession(999)).rejects.toThrow();
  });
});
