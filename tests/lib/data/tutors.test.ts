import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockForbidden, mockFrom, mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockForbidden: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  forbidden: mockForbidden,
  redirect: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

vi.mock('@/lib/validators/tutors', () => ({
  TutorWithJoinsListSchema: {
    safeParse: vi.fn().mockReturnValue({
      success: true,
      data: [
        {
          id: 1,
          user_id: 101,
          verified: true,
          education: 'M.S. in Mathematics, NYU',
          years_experience: 8,
          users: {
            first_name: 'Sarah',
            last_name: 'Jennings',
            email: 'sarah.j@tutor.mail',
            phone: '(212) 555-0101',
          },
        },
      ],
    }),
  },
}));

const createMockQuery = (result: { data: unknown; error: unknown }) => {
  return {
    select: vi.fn().mockResolvedValue(result),
  } as const;
};

describe('getTutors', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockReturnValue(undefined);
    mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom } as const);
    mockForbidden.mockImplementation(() => {
      throw new Error('forbidden');
    });
  });

  it('returns tutors data when role is admin', async () => {
    const mockQuery = createMockQuery({
      data: [
        {
          id: 1,
          user_id: 101,
          verified: true,
          education: 'M.S. in Mathematics, NYU',
          years_experience: 8,
          users: {
            first_name: 'Sarah',
            last_name: 'Jennings',
            email: 'sarah.j@tutor.mail',
            phone: '(212) 555-0101',
          },
        },
      ],
      error: null,
    });
    mockFrom.mockImplementation(() => mockQuery);

    const { getTutors } = await import('@/lib/data/tutors');
    const tutors = await getTutors('admin');

    expect(tutors).toHaveLength(1);
    expect(tutors[0]).toEqual({
      id: 1,
      user_id: 101,
      name: 'Sarah Jennings',
      email: 'sarah.j@tutor.mail',
      phone: '(212) 555-0101',
      education: 'M.S. in Mathematics, NYU',
      verified: true,
      years_experience: 8,
    });
  });

  it('throws forbidden error when role is not admin', async () => {
    const { getTutors } = await import('@/lib/data/tutors');
    await expect(getTutors('parent')).rejects.toThrow('forbidden');
    await expect(getTutors('tutor')).rejects.toThrow('forbidden');
  });

  it('throws error when role is invalid', async () => {
    const { getTutors } = await import('@/lib/data/tutors');
    await expect(getTutors('invalid' as 'admin')).rejects.toThrow('Role is required to fetch tutors.');
  });

  it('throws error when database query fails', async () => {
    const mockQuery = createMockQuery({
      data: null,
      error: { message: 'Database error' },
    });
    mockFrom.mockImplementation(() => mockQuery);

    const { getTutors } = await import('@/lib/data/tutors');
    await expect(getTutors('admin')).rejects.toThrow(
      'Tutor data is temporarily unavailable. Please retry in a moment.'
    );
  });
});
