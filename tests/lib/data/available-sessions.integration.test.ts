import 'dotenv/config';
import { AVAILABLE_SLOTS_ERROR_MESSAGES, getAvailableSlots } from '@/lib/data/available-sessions';
import { CANCELED_SESSION_STATUS, type Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

type SessionStatus = Database['public']['Enums']['session_status'];

type Fixture = {
  tutorId: number;
  subjectId: number;
  parentId: number;
  studentId: number;
  tutorUserId: number;
  parentUserId: number;
  studentUserId: number;
  availabilityIds: number[];
  sessionIds: number[];
};

const RANGE_FROM = '2026-03-02';
const RANGE_TO = '2026-03-03';
const RANGE_START_UTC = '2026-03-02T05:00:00.000Z';
const RANGE_END_UTC = '2026-03-03T05:00:00.000Z';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function createSupabaseServiceTestClient() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SECRET_KEY');
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function insertUser(
  supabase: ReturnType<typeof createSupabaseServiceTestClient>,
  args: { email: string; firstName: string; lastName: string }
): Promise<number> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: args.email,
      first_name: args.firstName,
      last_name: args.lastName,
      timezone: 'UTC',
    })
    .select('id')
    .single();

  expect(error).toBeNull();
  expect(data).not.toBeNull();
  if (!data) throw new Error('Failed to insert user');
  return data.id;
}

async function createFixture({
  supabase,
  unique,
  withAvailability,
}: {
  supabase: ReturnType<typeof createSupabaseServiceTestClient>;
  unique: string;
  withAvailability: boolean;
}): Promise<Fixture> {
  const tutorUserId = await insertUser(supabase, {
    email: `available-slots-tutor-${unique}@example.com`,
    firstName: 'Available',
    lastName: 'Tutor',
  });
  const parentUserId = await insertUser(supabase, {
    email: `available-slots-parent-${unique}@example.com`,
    firstName: 'Available',
    lastName: 'Parent',
  });
  const studentUserId = await insertUser(supabase, {
    email: `available-slots-student-${unique}@example.com`,
    firstName: 'Available',
    lastName: 'Student',
  });

  const { data: tutor, error: tutorErr } = await supabase
    .from('tutors')
    .insert({ user_id: tutorUserId })
    .select('id')
    .single();
  expect(tutorErr).toBeNull();
  expect(tutor).not.toBeNull();
  if (!tutor) throw new Error('Failed to insert tutor');

  const { data: parent, error: parentErr } = await supabase
    .from('parents')
    .insert({ user_id: parentUserId })
    .select('id')
    .single();
  expect(parentErr).toBeNull();
  expect(parent).not.toBeNull();
  if (!parent) throw new Error('Failed to insert parent');

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .insert({ user_id: studentUserId, parent_id: parent.id, grade: '9' })
    .select('id')
    .single();
  expect(studentErr).toBeNull();
  expect(student).not.toBeNull();
  if (!student) throw new Error('Failed to insert student');

  const { data: subject, error: subjectErr } = await supabase
    .from('subjects')
    .insert({ tutor_id: tutor.id, category: 'Math' })
    .select('id')
    .single();
  expect(subjectErr).toBeNull();
  expect(subject).not.toBeNull();
  if (!subject) throw new Error('Failed to insert subject');

  const fixture: Fixture = {
    tutorId: tutor.id,
    subjectId: subject.id,
    parentId: parent.id,
    studentId: student.id,
    tutorUserId,
    parentUserId,
    studentUserId,
    availabilityIds: [],
    sessionIds: [],
  };

  if (withAvailability) {
    const { data: availabilityRows, error: availabilityErr } = await supabase
      .from('availability')
      .insert([{ tutor_id: tutor.id, week_day: 'Monday', start_time: '15:00:00', end_time: '18:00:00' }])
      .select('id');

    expect(availabilityErr).toBeNull();
    fixture.availabilityIds = (availabilityRows ?? []).map(row => row.id);
  }

  return fixture;
}

async function insertSessions(
  supabase: ReturnType<typeof createSupabaseServiceTestClient>,
  fixture: Fixture,
  rows: Array<{ scheduled_at: string; ends_at: string; status: SessionStatus }>
) {
  if (!rows.length) return;

  const { data, error } = await supabase
    .from('sessions')
    .insert(
      rows.map(row => ({
        tutor_id: fixture.tutorId,
        subject_id: fixture.subjectId,
        parent_id: fixture.parentId,
        student_id: fixture.studentId,
        scheduled_at: row.scheduled_at,
        ends_at: row.ends_at,
        status: row.status,
        slot_units: 1,
      }))
    )
    .select('id');

  expect(error).toBeNull();
  fixture.sessionIds.push(...(data ?? []).map(row => row.id));
}

async function cleanupFixture(supabase: ReturnType<typeof createSupabaseServiceTestClient>, fixture: Fixture) {
  for (const id of fixture.sessionIds) {
    await supabase.from('sessions').delete().eq('id', id);
  }
  for (const id of fixture.availabilityIds) {
    await supabase.from('availability').delete().eq('id', id);
  }
  await supabase.from('subjects').delete().eq('id', fixture.subjectId);
  await supabase.from('students').delete().eq('id', fixture.studentId);
  await supabase.from('parents').delete().eq('id', fixture.parentId);
  await supabase.from('tutors').delete().eq('id', fixture.tutorId);
  await supabase.from('users').delete().eq('id', fixture.studentUserId);
  await supabase.from('users').delete().eq('id', fixture.parentUserId);
  await supabase.from('users').delete().eq('id', fixture.tutorUserId);
}

describe('getAvailableSlots integration', () => {
  it('returns expected slots when canceled and boundary-touching sessions exist', async () => {
    const supabase = createSupabaseServiceTestClient();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const fixture = await createFixture({ supabase, unique, withAvailability: true });

    try {
      await insertSessions(supabase, fixture, [
        // Canceled, should not block.
        {
          scheduled_at: '2026-03-02T20:00:00.000Z',
          ends_at: '2026-03-02T21:00:00.000Z',
          status: CANCELED_SESSION_STATUS,
        },
        // In-range scheduled, should block 21:00-22:00.
        { scheduled_at: '2026-03-02T21:00:00.000Z', ends_at: '2026-03-02T22:00:00.000Z', status: 'Scheduled' },
        // Ends exactly at range start, should not be considered overlap.
        { scheduled_at: '2026-03-02T04:00:00.000Z', ends_at: RANGE_START_UTC, status: 'Scheduled' },
        // Starts exactly at range end, should not be considered overlap.
        { scheduled_at: RANGE_END_UTC, ends_at: '2026-03-03T06:00:00.000Z', status: 'Scheduled' },
      ]);

      const result = await getAvailableSlots(fixture.tutorId, fixture.subjectId, RANGE_FROM, RANGE_TO);

      expect(result).toEqual([
        { scheduled_at: '2026-03-02T20:00:00.000Z', ends_at: '2026-03-02T21:00:00.000Z' },
        { scheduled_at: '2026-03-02T22:00:00.000Z', ends_at: '2026-03-02T23:00:00.000Z' },
      ]);
    } finally {
      await cleanupFixture(supabase, fixture);
    }
  });

  it('throws tutor-subject error when subject does not belong to tutor', async () => {
    const supabase = createSupabaseServiceTestClient();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const fixture = await createFixture({ supabase, unique, withAvailability: true });

    try {
      await expect(
        getAvailableSlots(fixture.tutorId, fixture.subjectId + 999_999, RANGE_FROM, RANGE_TO)
      ).rejects.toThrow(AVAILABLE_SLOTS_ERROR_MESSAGES.tutorSubject);
    } finally {
      await cleanupFixture(supabase, fixture);
    }
  });
});
