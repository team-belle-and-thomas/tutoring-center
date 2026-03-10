import type { UserRole } from '@/lib/auth';
import { getParent, getParents } from '@/lib/data/parents';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockForbidden, mockNotFound, mockFrom, mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockForbidden: vi.fn(),
  mockNotFound: vi.fn(),
  mockFrom: vi.fn(),
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  forbidden: mockForbidden,
  notFound: mockNotFound,
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

const createListQuery = (result: { data: unknown; error: unknown }) =>
  ({
    select: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (value: { data: unknown; error: unknown }) => void, reject?: (reason?: unknown) => void) =>
      Promise.resolve(result).then(resolve, reject)
    ),
  }) as const;

const createDetailQuery = (result: { data: unknown; error: unknown }) =>
  ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }) as const;

describe('getParents', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockReturnValue(undefined);
    mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom } as const);
    mockForbidden.mockImplementation(() => {
      throw new Error('forbidden');
    });
    mockNotFound.mockImplementation(() => {
      throw new Error('notFound');
    });
  });

  it('maps joined parent rows with student counts, credits, and fallbacks', async () => {
    const parentsQuery = createListQuery({
      data: [
        {
          id: 2,
          user_id: 22,
          billing_address: null,
          notification_preferences: null,
          users: [{ first_name: 'Alex', last_name: 'Brown', email: 'alex@example.com', phone: null }],
          credit_balances: [{ amount_available: 6 }],
          students: [{ id: 8 }, { id: 9 }],
        },
        {
          id: 1,
          user_id: 11,
          billing_address: '123 Main St',
          notification_preferences: 'email',
          users: { first_name: 'Jamie', last_name: 'Adams', email: 'jamie@example.com', phone: '555-0100' },
          credit_balances: null,
          students: [],
        },
      ],
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'parents') return parentsQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const result = await getParents('admin');

    expect(result).toEqual([
      {
        id: 2,
        user_id: 22,
        name: 'Alex Brown',
        email: 'alex@example.com',
        phone: '\u2014',
        student_count: 2,
        credit_balance_info: 6,
      },
      {
        id: 1,
        user_id: 11,
        name: 'Jamie Adams',
        email: 'jamie@example.com',
        phone: '555-0100',
        student_count: 0,
        credit_balance_info: 0,
      },
    ]);
    expect(mockFrom).toHaveBeenCalledWith('parents');
    expect(parentsQuery.select).toHaveBeenCalledTimes(1);
  });

  it('rejects missing roles before querying', async () => {
    await expect(getParents(undefined as unknown as UserRole)).rejects.toThrow('Role is required to fetch parents.');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('blocks non-admin roles', async () => {
    await expect(getParents('parent')).rejects.toThrow('forbidden');
    await expect(getParents('tutor')).rejects.toThrow('forbidden');
    expect(mockForbidden).toHaveBeenCalledTimes(2);
  });

  it('throws a database error when parent list query fails', async () => {
    const parentsQuery = createListQuery({
      data: null,
      error: { message: 'db failed' },
    });

    mockFrom.mockImplementation(() => parentsQuery);

    await expect(getParents('admin')).rejects.toThrow(
      'Parent data is temporarily unavailable. Please retry in a moment.'
    );
  });

  it('throws a validation error when parent list rows are malformed', async () => {
    const parentsQuery = createListQuery({
      data: [{ id: 'bad-id', user_id: 11 }],
      error: null,
    });

    mockFrom.mockImplementation(() => parentsQuery);

    await expect(getParents('admin')).rejects.toThrow('Parent data format is invalid. Please try again later.');
  });
});

describe('getParent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFrom.mockReturnValue(undefined);
    mockCreateSupabaseServiceClient.mockReturnValue({ from: mockFrom } as const);
    mockForbidden.mockImplementation(() => {
      throw new Error('forbidden');
    });
    mockNotFound.mockImplementation(() => {
      throw new Error('notFound');
    });
  });

  it('maps a joined parent profile using user_id route params', async () => {
    const parentQuery = createDetailQuery({
      data: {
        id: 7,
        user_id: 77,
        billing_address: null,
        notification_preferences: 'sms',
        users: { first_name: 'Morgan', last_name: 'Lee', email: 'morgan@example.com', phone: null },
        credit_balances: { amount_available: 4 },
        students: [
          {
            id: 4,
            user_id: 404,
            grade: null,
            users: { first_name: 'Zoe', last_name: 'Lee', email: 'zoe@example.com', phone: null },
          },
          {
            id: 3,
            user_id: 303,
            grade: '6',
            users: [{ first_name: 'Ava', last_name: 'Lee', email: 'ava@example.com', phone: '555-2222' }],
          },
        ],
      },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'parents') return parentQuery;
      throw new Error(`Unexpected table ${table}`);
    });

    const result = await getParent(77, 'admin');

    expect(result).toEqual({
      id: 7,
      user_id: 77,
      name: 'Morgan Lee',
      email: 'morgan@example.com',
      phone: '\u2014',
      student_count: 2,
      credit_balance_info: 4,
      billing_address: '\u2014',
      notification_preferences: 'sms',
      students: [
        {
          id: 3,
          user_id: 303,
          name: 'Ava Lee',
          email: 'ava@example.com',
          phone: '555-2222',
          grade: '6',
        },
        {
          id: 4,
          user_id: 404,
          name: 'Zoe Lee',
          email: 'zoe@example.com',
          phone: '\u2014',
          grade: '\u2014',
        },
      ],
    });
    expect(parentQuery.eq).toHaveBeenCalledWith('user_id', 77);
    expect(parentQuery.maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('throws notFound when the parent is missing', async () => {
    const parentQuery = createDetailQuery({ data: null, error: null });
    mockFrom.mockImplementation(() => parentQuery);

    await expect(getParent(999, 'admin')).rejects.toThrow('notFound');
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it('throws a validation error when the parent detail shape is invalid', async () => {
    const parentQuery = createDetailQuery({
      data: {
        id: 7,
        user_id: 77,
        billing_address: null,
        notification_preferences: null,
        users: { first_name: 'Morgan', last_name: 'Lee', email: 'morgan@example.com', phone: null },
        credit_balances: { amount_available: 4 },
        students: [{ id: 'bad-id' }],
      },
      error: null,
    });
    mockFrom.mockImplementation(() => parentQuery);

    await expect(getParent(77, 'admin')).rejects.toThrow('Parent data format is invalid. Please try again later.');
  });
});
