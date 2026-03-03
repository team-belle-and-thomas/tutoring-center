import { getSubjects, groupSubjectsByCategory } from '@/lib/data/subjects';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockIsUserRole, mockForbidden, mockFrom, mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockIsUserRole: vi.fn(),
  mockForbidden: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  forbidden: mockForbidden,
}));

vi.mock('@/lib/mock-api', () => ({
  isUserRole: mockIsUserRole,
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

const createMockQuery = (result: { data: unknown; error: unknown }) => {
  return {
    select: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(result),
  } as const;
};

const setupSupabaseMock = (subjects: ReturnType<typeof createMockQuery>) => {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'subjects') return subjects;
    throw new Error(`Unexpected table ${table}`);
  });
  mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom } as const);
};

describe('getSubjects', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockReturnValue(undefined);
    mockIsUserRole.mockImplementation(value => value === 'admin' || value === 'parent' || value === 'tutor');
    mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom });
    mockForbidden.mockImplementation(() => {
      throw new Error('forbidden');
    });
  });

  it('applies expected query filters before loading subjects', async () => {
    const subjectsQuery = createMockQuery({
      data: [
        { id: 1, category: 'Math', tutor_id: 10 },
        { id: 2, category: ' math ', tutor_id: 20 },
      ],
      error: null,
    });
    setupSupabaseMock(subjectsQuery);

    await getSubjects('admin');

    expect(mockFrom).toHaveBeenCalledWith('subjects');
    expect(subjectsQuery.not).toHaveBeenNthCalledWith(1, 'category', 'is', null);
    expect(subjectsQuery.not).toHaveBeenNthCalledWith(2, 'tutor_id', 'is', null);
  });

  it('throws when role is invalid', async () => {
    mockIsUserRole.mockReturnValue(false);

    await expect(getSubjects('admin')).rejects.toThrow('Role is required to fetch students.');
  });

  it('throws forbidden for tutors', async () => {
    await expect(getSubjects('tutor')).rejects.toThrow('forbidden');
    expect(mockForbidden).toHaveBeenCalledTimes(1);
  });

  it('throws when the database query fails', async () => {
    const subjectsQuery = createMockQuery({
      data: null,
      error: { message: 'db failed' },
    });
    setupSupabaseMock(subjectsQuery);

    await expect(getSubjects('admin')).rejects.toThrow();
  });

  it('throws when subject rows fail validation', async () => {
    const subjectsQuery = createMockQuery({
      data: [{ id: 'bad-id', category: 'Math', tutor_id: 11 }],
      error: null,
    });
    setupSupabaseMock(subjectsQuery);

    await expect(getSubjects('admin')).rejects.toThrow();
  });

  it('returns an empty array when there are no subjects', async () => {
    const subjectsQuery = createMockQuery({ data: [], error: null });
    setupSupabaseMock(subjectsQuery);

    const result = await getSubjects('admin');

    expect(result).toEqual([]);
    expect(subjectsQuery.order).toHaveBeenCalledTimes(1);
  });
});

describe('groupSubjectsByCategory', () => {
  it('normalizes categories and keeps the smallest subject id per tutor', () => {
    const result = groupSubjectsByCategory([
      { id: 5, category: '  Math ', tutor_id: 10 },
      { id: 2, category: 'math', tutor_id: 10 },
      { id: 3, category: 'MATH', tutor_id: 20 },
    ]);

    expect(result).toEqual([
      {
        key: 'math',
        category: 'Math',
        tutorCount: 2,
        assignments: [
          { tutorId: 10, subjectId: 2 },
          { tutorId: 20, subjectId: 3 },
        ],
      },
    ]);
  });

  it('skips categories that normalize to empty strings', () => {
    const result = groupSubjectsByCategory([
      { id: 1, category: '   ', tutor_id: 10 },
      { id: 2, category: '\t', tutor_id: 20 },
      { id: 3, category: 'Science', tutor_id: 30 },
    ]);

    expect(result).toEqual([
      {
        key: 'science',
        category: 'Science',
        tutorCount: 1,
        assignments: [{ tutorId: 30, subjectId: 3 }],
      },
    ]);
  });

  it('returns deterministic category and tutor assignment sorting', () => {
    const result = groupSubjectsByCategory([
      { id: 9, category: 'Science', tutor_id: 20 },
      { id: 4, category: 'Math', tutor_id: 30 },
      { id: 7, category: 'Math', tutor_id: 10 },
      { id: 2, category: 'History', tutor_id: 40 },
    ]);

    expect(result).toEqual([
      {
        key: 'history',
        category: 'History',
        tutorCount: 1,
        assignments: [{ tutorId: 40, subjectId: 2 }],
      },
      {
        key: 'math',
        category: 'Math',
        tutorCount: 2,
        assignments: [
          { tutorId: 10, subjectId: 7 },
          { tutorId: 30, subjectId: 4 },
        ],
      },
      {
        key: 'science',
        category: 'Science',
        tutorCount: 1,
        assignments: [{ tutorId: 20, subjectId: 9 }],
      },
    ]);
  });
});
