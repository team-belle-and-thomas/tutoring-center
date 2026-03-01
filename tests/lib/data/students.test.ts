import { getStudents } from '@/lib/data/students';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockGetUserRole,
  mockGetCurrentUserID,
  mockForbidden,
  mockNotFound,
  mockFrom,
  mockCreateSupabaseServiceClient,
} = vi.hoisted(() => ({
  mockGetUserRole: vi.fn(),
  mockGetCurrentUserID: vi.fn(),
  mockForbidden: vi.fn(),
  mockNotFound: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  forbidden: mockForbidden,
  notFound: mockNotFound,
}));

vi.mock('@/lib/mock-api', () => ({
  getUserRole: mockGetUserRole,
  getCurrentUserID: mockGetCurrentUserID,
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

const createMockQuery = (result: { data: unknown; error: unknown }) => {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    then: vi.fn((resolve: (value: { data: unknown; error: unknown }) => void, reject?: (reason?: unknown) => void) =>
      Promise.resolve(result).then(resolve, reject)
    ),
  } as const;
};

const setupSupabaseMock = ({
  students,
  parents,
}: {
  students: ReturnType<typeof createMockQuery>;
  parents?: ReturnType<typeof createMockQuery>;
}) => {
  const parentQuery = parents ?? createMockQuery({ data: null, error: null });
  mockFrom.mockImplementation((table: string) => {
    if (table === 'students') return students;
    if (table === 'parents') return parentQuery;
    throw new Error(`Unexpected table ${table}`);
  });
  mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom } as const);
};

describe('getStudents', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockReturnValue(undefined);
    mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom });
    mockForbidden.mockImplementation(() => {
      throw new Error('forbidden');
    });
    mockNotFound.mockImplementation(() => {
      throw new Error('notFound');
    });
  });

  it('resolves role when omitted and maps admin rows with name + fallback grade', async () => {
    mockGetUserRole.mockResolvedValue('admin');

    const studentsQuery = createMockQuery({
      data: [
        {
          id: 1,
          user_id: 10,
          parent_id: 100,
          birth_date: '2010-01-01',
          grade: null,
          learning_goals: 'Math',
          users: [{ first_name: 'Jane', last_name: 'Doe', email: 'jane@x.com', phone: null }],
        },
      ],
      error: null,
    });

    setupSupabaseMock({ students: studentsQuery });

    const result = await getStudents();

    expect(result).toEqual([
      {
        id: 1,
        user_id: 10,
        name: 'Jane Doe',
        email: 'jane@x.com',
        phone: '—',
        grade: '—',
      },
    ]);
    expect(mockGetUserRole).toHaveBeenCalledTimes(1);
    expect(mockGetCurrentUserID).not.toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('students');
  });

  it('throws notFound when parent lookup fails', async () => {
    mockGetCurrentUserID.mockResolvedValue(12);
    const studentsQuery = createMockQuery({ data: [], error: null });
    const parentQuery = createMockQuery({ data: null, error: null });

    setupSupabaseMock({ students: studentsQuery, parents: parentQuery });

    await expect(getStudents('parent')).rejects.toThrow('notFound');
    expect(mockNotFound).toHaveBeenCalledTimes(1);
    expect(studentsQuery.then).not.toHaveBeenCalled();
  });

  it('throws forbidden for tutors', async () => {
    await expect(getStudents('tutor')).rejects.toThrow('forbidden');
    expect(mockForbidden).toHaveBeenCalledTimes(1);
  });

  it('throws a role-specific database message for parent role', async () => {
    mockGetCurrentUserID.mockResolvedValue(20);

    const studentsQuery = createMockQuery({ data: null, error: { message: 'db failed' } });
    const parentQuery = createMockQuery({
      data: { id: 55 },
      error: null,
    });

    setupSupabaseMock({ students: studentsQuery, parents: parentQuery });

    await expect(getStudents('parent')).rejects.toThrow(
      'Your student list is temporarily unavailable. Please try again in a moment.'
    );
  });

  it('throws a role-specific validation message for admin', async () => {
    mockGetUserRole.mockResolvedValue('admin');

    const studentsQuery = createMockQuery({
      data: [{ id: 'bad-id', user_id: 10 }],
      error: null,
    });

    setupSupabaseMock({ students: studentsQuery });

    await expect(getStudents()).rejects.toThrow('Student data format is invalid. Please try again later.');
    expect(mockFrom).toHaveBeenCalledWith('students');
  });
});
