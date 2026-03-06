import { GET } from '@/app/api/tutors/[id]/available-sessions/route';
import { USER_ROLE_COOKIE_NAME } from '@/lib/auth';
import { AVAILABLE_SLOTS_ERROR_MESSAGES } from '@/lib/data/available-sessions';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetAvailableSlots, mockCookies } = vi.hoisted(() => ({
  mockGetAvailableSlots: vi.fn(),
  mockCookies: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

vi.mock('@/lib/data/available-sessions', async () => {
  const actual = await vi.importActual<typeof import('@/lib/data/available-sessions')>('@/lib/data/available-sessions');
  return {
    ...actual,
    getAvailableSlots: mockGetAvailableSlots,
  };
});

function makeRequest(url: string) {
  return new Request(url, { method: 'GET' });
}

function makeContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function setRoleCookie(role?: string) {
  mockCookies.mockResolvedValue({
    get: vi.fn((name: string) => {
      if (name !== USER_ROLE_COOKIE_NAME || !role) return undefined;
      return { value: role };
    }),
  });
}

describe('GET /api/tutors/:id/available-sessions', () => {
  beforeEach(() => {
    setRoleCookie('parent');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 when role cookie is missing', async () => {
    setRoleCookie(undefined);

    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-02&to=2026-03-03'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
    expect(mockGetAvailableSlots).not.toHaveBeenCalled();
  });

  it('returns 403 when role is not parent', async () => {
    setRoleCookie('admin');

    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-02&to=2026-03-03'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Forbidden');
    expect(mockGetAvailableSlots).not.toHaveBeenCalled();
  });

  it('returns 400 when tutor id param is invalid', async () => {
    const response = await GET(
      makeRequest(
        'https://example.test/api/tutors/not-a-number/available-sessions?subject_id=1&from=2026-03-02&to=2026-03-03'
      ),
      makeContext('not-a-number')
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bad request');
    expect(mockGetAvailableSlots).not.toHaveBeenCalled();
  });

  it('returns 400 when query params are invalid', async () => {
    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-03&to=2026-03-02'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Bad request');
    expect(mockGetAvailableSlots).not.toHaveBeenCalled();
  });

  it('returns available sessions for valid request', async () => {
    mockGetAvailableSlots.mockResolvedValueOnce([
      { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z' },
    ]);

    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-02&to=2026-03-03'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockGetAvailableSlots).toHaveBeenCalledWith(7, 3, '2026-03-02', '2026-03-03');
    expect(body.data).toEqual([{ scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z' }]);
  });

  it('returns 404 when tutor does not teach subject', async () => {
    mockGetAvailableSlots.mockRejectedValueOnce(new Error(AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject));

    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-02&to=2026-03-03'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe(AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject);
  });

  it('returns 500 when data layer throws unexpected error', async () => {
    mockGetAvailableSlots.mockRejectedValueOnce(new Error('network timeout'));

    const response = await GET(
      makeRequest('https://example.test/api/tutors/7/available-sessions?subject_id=3&from=2026-03-02&to=2026-03-03'),
      makeContext('7')
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe(AVAILABLE_SLOTS_ERROR_MESSAGES.database);
  });
});
