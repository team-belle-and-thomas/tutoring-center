import { getStudent, getStudents } from '@/lib/data/students';
import type { UserRole } from '@/lib/mock-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetCurrentUserID, mockForbidden, mockNotFound, mockFrom, mockCreateSupabaseServiceClient } = vi.hoisted(
  () => ({
    mockGetCurrentUserID: vi.fn(),
    mockForbidden: vi.fn(),
    mockNotFound: vi.fn(),
    mockFrom: vi.fn(),
    mockCreateSupabaseServiceClient: vi.fn(),
  })
);

vi.mock('next/navigation', () => ({
  forbidden: mockForbidden,
  notFound: mockNotFound,
}));

vi.mock('@/lib/mock-api', () => ({
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

const createStudentDetailsMockQuery = (result: { data: unknown; error: unknown }) => {
  return {
    ...createMockQuery(result),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  } as const;
};

const setupSupabaseMock = ({
  students,
  parents,
}: {
  students: ReturnType<typeof createMockQuery> | ReturnType<typeof createStudentDetailsMockQuery>;
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

  it('maps admin rows with name + fallback grade', async () => {
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

    const result = await getStudents('admin');

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
    expect(mockGetCurrentUserID).not.toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('students');
  });

  it('throws a clear error when role is missing at runtime', async () => {
    await expect(getStudents(undefined as unknown as UserRole)).rejects.toThrow('Role is required to fetch students.');
    expect(mockFrom).not.toHaveBeenCalled();
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
    const studentsQuery = createMockQuery({
      data: [{ id: 'bad-id', user_id: 10 }],
      error: null,
    });
    setupSupabaseMock({ students: studentsQuery });

    await expect(getStudents('admin')).rejects.toThrow('Student data format is invalid. Please try again later.');
    expect(mockFrom).toHaveBeenCalledWith('students');
  });

  it('returns an empty array when there are no students', async () => {
    const studentsQuery = createMockQuery({ data: [], error: null });
    setupSupabaseMock({ students: studentsQuery });

    const result = await getStudents('admin');

    expect(result).toEqual([]);
    expect(studentsQuery.then).toHaveBeenCalledTimes(1);
  });

  it('throws when role is invalid at runtime', async () => {
    await expect(getStudents('owner' as unknown as never)).rejects.toThrow('Role is required to fetch students.');
  });
});

describe('getStudent', () => {
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

  it('uses one joined students query and maps profile + recent sessions', async () => {
    const studentsQuery = createStudentDetailsMockQuery({
      data: {
        id: 1,
        user_id: 10,
        parent_id: 100,
        birth_date: '2010-01-01',
        grade: '8',
        learning_goals: 'Math mastery',
        users: [{ first_name: 'Jane', last_name: 'Doe', email: 'jane@x.com', phone: null }],
        sessions: [
          {
            id: 50,
            scheduled_at: '2026-03-01T15:00:00.000Z',
            ends_at: '2026-03-01T16:00:00.000Z',
            status: 'Completed',
            slot_units: 1,
            subject: [{ category: 'Algebra' }],
            tutor: [{ users: [{ first_name: 'Alan', last_name: 'Turing' }] }],
          },
        ],
      },
      error: null,
    });
    setupSupabaseMock({ students: studentsQuery });

    const result = await getStudent(1, 'admin');

    expect(result).toEqual({
      id: 1,
      user_id: 10,
      parent_id: 100,
      name: 'Jane Doe',
      email: 'jane@x.com',
      phone: '—',
      grade: '8',
      birth_date: '2010-01-01',
      learning_goals: 'Math mastery',
      sessions: [
        {
          id: 50,
          scheduled_at: '2026-03-01T15:00:00.000Z',
          ends_at: '2026-03-01T16:00:00.000Z',
          status: 'Completed',
          slot_units: 1,
          subject_category: 'Algebra',
          tutor_name: 'Alan Turing',
        },
      ],
    });
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('students');
    expect(studentsQuery.order).toHaveBeenCalledWith('scheduled_at', { ascending: false, referencedTable: 'sessions' });
    expect(studentsQuery.limit).toHaveBeenCalledWith(5, { referencedTable: 'sessions' });
    expect(studentsQuery.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('scopes parent role by parent_id in the same query', async () => {
    mockGetCurrentUserID.mockResolvedValue(99);
    const parentQuery = createMockQuery({ data: { id: 55 }, error: null });
    const studentsQuery = createStudentDetailsMockQuery({
      data: {
        id: 1,
        user_id: 10,
        parent_id: 55,
        birth_date: null,
        grade: null,
        learning_goals: null,
        users: [{ first_name: 'Parent', last_name: 'Child', email: 'pc@example.com', phone: null }],
        sessions: [],
      },
      error: null,
    });
    setupSupabaseMock({ students: studentsQuery, parents: parentQuery });

    await getStudent(1, 'parent');

    expect(studentsQuery.eq).toHaveBeenCalledWith('id', 1);
    expect(studentsQuery.eq).toHaveBeenCalledWith('parent_id', 55);
    expect(mockFrom).toHaveBeenCalledWith('parents');
  });

  it('throws notFound when joined student query returns null', async () => {
    const studentsQuery = createStudentDetailsMockQuery({ data: null, error: null });
    setupSupabaseMock({ students: studentsQuery });

    await expect(getStudent(999, 'admin')).rejects.toThrow('notFound');
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it('throws role-specific db message when joined student query errors', async () => {
    const studentsQuery = createStudentDetailsMockQuery({ data: null, error: { message: 'db failed' } });
    setupSupabaseMock({ students: studentsQuery });

    await expect(getStudent(1, 'admin')).rejects.toThrow(
      'Student data is temporarily unavailable. Please retry in a moment.'
    );
  });

  it('throws forbidden for tutor role', async () => {
    await expect(getStudent(1, 'tutor')).rejects.toThrow('forbidden');
    expect(mockForbidden).toHaveBeenCalledTimes(1);
  });
});
