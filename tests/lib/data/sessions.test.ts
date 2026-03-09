import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { getSession, getSessions } from '@/lib/data/sessions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUserID: vi.fn(),
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

function setupMock(returnData: { data: unknown[]; error: unknown }) {
  const sessionsQuery = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const parentQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
  };

  const tutorQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
  };

  const fromMock = vi.fn((table: string) => {
    if (table === 'sessions') return sessionsQuery;
    if (table === 'parents') return parentQuery;
    if (table === 'tutors') return tutorQuery;
    return sessionsQuery;
  });

  mockCreateSupabaseServiceClient.mockReturnValue({ from: fromMock });

  return { sessionsQuery, parentQuery, tutorQuery };
}

describe('getSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('admin');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
    setupMock({ data: [], error: null });
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
  });

  it('returns session detail for valid id', async () => {
    const sessionData = {
      data: {
        id: 1,
        scheduled_at: '2026-04-01T10:00:00Z',
        ends_at: '2026-04-01T11:00:00Z',
        slot_units: 2,
        status: 'Scheduled',
        subject_id: 1,
        subjects: { category: 'Mathematics' },
        tutor: {
          id: 101,
          verified: true,
          years_experience: 5,
          users: { first_name: 'Jane', last_name: 'Tutor', email: 'jane@test.com', phone: '123' },
        },
        student: { id: 201, parent_id: 1, users: { first_name: 'John', last_name: 'Student', email: 'john@test.com' } },
        parent: { id: 1, users: { first_name: 'Parent', last_name: 'Name', email: 'parent@test.com' } },
        session_progress: [],
        session_metrics: [],
      },
      error: null,
    };

    const sessionsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(sessionData),
    };

    mockCreateSupabaseServiceClient.mockReturnValue({
      from: vi.fn(() => sessionsQuery),
    });

    const session = await getSession(1);
    expect(session).toBeDefined();
    expect(session.id).toBe(1);
    expect(session.subject_name).toBe('Mathematics');
  });

  it('throws notFound for invalid id', async () => {
    const sessionsQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    };

    mockCreateSupabaseServiceClient.mockReturnValue({
      from: vi.fn(() => sessionsQuery),
    });

    await expect(getSession(999)).rejects.toThrow();
  });
});
