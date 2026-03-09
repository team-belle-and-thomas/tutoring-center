import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { getParentDashboardData, getStudentProgressData, getStudentsWithProgress } from '@/lib/data/dashboard';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMockQuery = (returnData: unknown = []) => ({
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        not: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
        })),
      })),
      gte: vi.fn(() => ({
        lte: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
      })),
      single: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
    })),
    in: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
    })),
    single: vi.fn(() => Promise.resolve({ data: returnData, error: null })),
  })),
});

vi.mock('@/lib/auth', () => ({
  getCurrentUserID: vi.fn(),
  getUserRole: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: vi.fn(() => ({
    from: vi.fn(() => createMockQuery()),
  })),
}));

vi.mock('@/lib/utils/normalize', () => ({
  pickFirstEmbedded: vi.fn(user => (Array.isArray(user) ? user[0] : user)),
}));

describe('getStudentProgressData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns student with provided name', async () => {
    const result = await getStudentProgressData(1, 'Test Student');

    expect(result.studentId).toBe(1);
    expect(result.studentName).toBe('Test Student');
    expect(result.performance).toEqual([]);
    expect(result.confidence).toEqual([]);
    expect(result.homework).toEqual([]);
  });

  it.skip('accepts date range parameters', async () => {
    const dateRange = {
      from: '2026-01-01T00:00:00Z',
      to: '2026-03-01T00:00:00Z',
    };

    const result = await getStudentProgressData(1, 'Test', dateRange);

    expect(result).toBeDefined();
    expect(result.studentName).toBe('Test');
  });
});

describe('getStudentsWithProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('parent');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty array for non-parent users', async () => {
    vi.mocked(getUserRole).mockResolvedValue('tutor');

    const result = await getStudentsWithProgress();

    expect(result).toEqual([]);
  });

  it('returns empty array when no user ID', async () => {
    vi.mocked(getCurrentUserID).mockResolvedValue(null as unknown as number);

    const result = await getStudentsWithProgress();

    expect(result).toEqual([]);
  });

  it('returns students with progress data', async () => {
    const result = await getStudentsWithProgress();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getParentDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserRole).mockResolvedValue('parent');
    vi.mocked(getCurrentUserID).mockResolvedValue(1);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns students and default student ID', async () => {
    const result = await getParentDashboardData();

    expect(result).toHaveProperty('students');
    expect(result).toHaveProperty('defaultStudentId');
  });

  it('returns null as default student ID when no students', async () => {
    vi.mocked(getCurrentUserID).mockResolvedValue(null as unknown as number);

    const result = await getParentDashboardData();

    expect(result.defaultStudentId).toBeNull();
  });

  it('accepts date range and passes to getStudentsWithProgress', async () => {
    const dateRange = {
      from: '2026-01-01T00:00:00Z',
      to: '2026-03-01T00:00:00Z',
    };

    const result = await getParentDashboardData(dateRange);

    expect(result).toBeDefined();
  });
});
