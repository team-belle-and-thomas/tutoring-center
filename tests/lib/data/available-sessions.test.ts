import { AVAILABLE_SLOTS_ERROR_MESSAGES, getAvailableSlots } from '@/lib/data/available-sessions';
import { FREE_SLOT_STATUSES } from '@/lib/supabase/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCreateSupabaseServiceClient } = vi.hoisted(() => ({
  mockCreateSupabaseServiceClient: vi.fn(),
}));

vi.mock('@/lib/supabase/serverClient', () => ({
  createSupabaseServiceClient: mockCreateSupabaseServiceClient,
}));

type QueryResult<T> = { data: T; error: { message: string } | null };
type AvailabilityLike = { week_day: string; start_time: string; end_time: string };
type SessionLike = { scheduled_at: string; ends_at: string; status?: string | null };

const RANGE_FROM = '2026-03-02';
const RANGE_TO = '2026-03-03';
const MONDAY_AVAILABILITY: AvailabilityLike[] = [{ week_day: 'Monday', start_time: '15:00:00', end_time: '18:00:00' }];
const ALL_THREE_SLOTS = [
  { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z' },
  { scheduled_at: '2026-03-02T21:00:00.000Z', ends_at: '2026-03-02T22:00:00.000Z' },
  { scheduled_at: '2026-03-02T22:00:00.000Z', ends_at: '2026-03-02T23:00:00.000Z' },
];

function createMockQuery<T>(result: QueryResult<T>) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  } as const;
}

function createSingleQueryClient(
  result: QueryResult<{ availability: AvailabilityLike[] | null; sessions: SessionLike[] | null } | null>
) {
  const tutorsQuery = createMockQuery(result);
  const from = vi.fn((table: string) => {
    if (table === 'tutors') return tutorsQuery;
    throw new Error(`Unexpected table ${table}`);
  });
  return { client: { from }, from, tutorsQuery };
}

describe('getAvailableSlots', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws database error when tutor query errors', async () => {
    const singleClient = createSingleQueryClient({ data: null, error: { message: 'db down' } });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    await expect(getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO)).rejects.toThrow(
      AVAILABLE_SLOTS_ERROR_MESSAGES.database
    );
  });

  it('throws tutor-subject error when relationship is missing', async () => {
    const singleClient = createSingleQueryClient({ data: null, error: null });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    await expect(getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO)).rejects.toThrow(
      AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject
    );
  });

  it('returns empty array when availability is empty', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: [],
        sessions: null,
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual([]);
  });

  it('builds tutor query with embedded session filters and ET boundaries', async () => {
    const singleClient = createSingleQueryClient({
      data: { availability: MONDAY_AVAILABILITY, sessions: [] },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);

    expect(singleClient.tutorsQuery.eq).toHaveBeenCalledWith('id', 3);
    expect(singleClient.tutorsQuery.eq).toHaveBeenCalledWith('subjects.id', 7);
    expect(singleClient.tutorsQuery.filter).toHaveBeenCalledWith(
      'sessions.status',
      'not.in',
      `(${FREE_SLOT_STATUSES.join(',')})`
    );
    expect(singleClient.tutorsQuery.filter).toHaveBeenCalledWith(
      'sessions.scheduled_at',
      'lt',
      '2026-03-03T05:00:00.000Z'
    );
    expect(singleClient.tutorsQuery.filter).toHaveBeenCalledWith('sessions.ends_at', 'gt', '2026-03-02T05:00:00.000Z');
  });

  it('defensively ignores free-slot statuses and out-of-range embedded sessions', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: MONDAY_AVAILABILITY,
        sessions: [
          { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z', status: 'Canceled' },
          { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z', status: 'Rescheduled' },
          { scheduled_at: '2026-03-01T23:00:00.000Z', ends_at: '2026-03-02T04:59:59.000Z', status: 'Scheduled' },
          { scheduled_at: '2026-03-03T05:00:00.000Z', ends_at: '2026-03-03T06:00:00.000Z', status: 'Scheduled' },
          { scheduled_at: '2026-03-02T21:00:00.000Z', ends_at: '2026-03-02T22:00:00.000Z', status: 'Scheduled' },
        ],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual([
      { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z' },
      { scheduled_at: '2026-03-02T22:00:00.000Z', ends_at: '2026-03-02T23:00:00.000Z' },
    ]);
  });

  it('uses half-open interval semantics: boundary-touching sessions do not block slots', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: MONDAY_AVAILABILITY,
        sessions: [
          { scheduled_at: '2026-03-02T19:00:00.000Z', ends_at: '2026-03-02T20:00:00.000Z', status: 'Scheduled' },
          { scheduled_at: '2026-03-02T23:00:00.000Z', ends_at: '2026-03-03T00:00:00.000Z', status: 'Scheduled' },
        ],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual(ALL_THREE_SLOTS);
  });

  it('blocks partially overlapping sessions', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: MONDAY_AVAILABILITY,
        sessions: [
          { scheduled_at: '2026-03-02T20:30:00.000Z', ends_at: '2026-03-02T21:30:00.000Z', status: 'Scheduled' },
        ],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual([{ scheduled_at: '2026-03-02T22:00:00.000Z', ends_at: '2026-03-02T23:00:00.000Z' }]);
  });

  it('supports sessions=null and still emits slots', async () => {
    const singleClient = createSingleQueryClient({
      data: { availability: MONDAY_AVAILABILITY, sessions: null },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual(ALL_THREE_SLOTS);
  });

  it('snaps odd availability starts to the next slot boundary', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: [{ week_day: 'Monday', start_time: '15:10:00', end_time: '18:00:00' }],
        sessions: [],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual([
      { scheduled_at: '2026-03-02T21:00:00.000Z', ends_at: '2026-03-02T22:00:00.000Z' },
      { scheduled_at: '2026-03-02T22:00:00.000Z', ends_at: '2026-03-02T23:00:00.000Z' },
    ]);
  });

  it('returns no slots when availability window is shorter than slot duration', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: [{ week_day: 'Monday', start_time: '15:00:00', end_time: '15:30:00' }],
        sessions: [],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual([]);
  });

  it('deduplicates slots from overlapping availability windows', async () => {
    const singleClient = createSingleQueryClient({
      data: {
        availability: [
          { week_day: 'Monday', start_time: '15:00:00', end_time: '17:00:00' },
          { week_day: 'Monday', start_time: '16:00:00', end_time: '18:00:00' },
        ],
        sessions: [],
      },
      error: null,
    });
    mockCreateSupabaseServiceClient.mockReturnValue(singleClient.client);

    const result = await getAvailableSlots(3, 7, RANGE_FROM, RANGE_TO);
    expect(result).toEqual(ALL_THREE_SLOTS);
  });
});
