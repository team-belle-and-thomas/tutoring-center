import 'dotenv/config';
import { getStudents } from '@/lib/data/students';
import type { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetCurrentUserID } = vi.hoisted(() => ({
  mockGetCurrentUserID: vi.fn(),
}));

vi.mock('@/lib/mock-api', () => ({
  getCurrentUserID: mockGetCurrentUserID,
  getUserRole: vi.fn(),
}));

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

describe('getStudents integration', () => {
  beforeEach(() => {
    mockGetCurrentUserID.mockReset();
  });

  it('returns data from the real database for a newly inserted student', async () => {
    const supabase = createSupabaseServiceTestClient();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `students-int-${unique}@example.com`;

    let userId: number | undefined;
    let studentId: number | undefined;

    try {
      const { data: insertedUser, error: userInsertError } = await supabase
        .from('users')
        .insert({
          email,
          first_name: 'Integration',
          last_name: 'Student',
          timezone: 'UTC',
        })
        .select('id')
        .single();

      expect(userInsertError).toBeNull();
      expect(insertedUser).not.toBeNull();

      if (!insertedUser) {
        throw new Error('Failed to insert test user');
      }

      userId = insertedUser.id;

      const { data: insertedStudent, error: studentInsertError } = await supabase
        .from('students')
        .insert({
          user_id: userId,
          parent_id: null,
          grade: '11',
        })
        .select('id')
        .single();

      expect(studentInsertError).toBeNull();
      expect(insertedStudent).not.toBeNull();

      if (!insertedStudent) {
        throw new Error('Failed to insert test student');
      }

      studentId = insertedStudent.id;

      const students = await getStudents('admin');
      const addedStudent = students.find(student => student.id === studentId);

      expect(addedStudent).toEqual({
        id: studentId,
        user_id: userId,
        name: 'Integration Student',
        email,
        grade: '11',
      });
    } finally {
      if (studentId) {
        await supabase.from('students').delete().eq('id', studentId);
      }
      if (userId) {
        await supabase.from('users').delete().eq('id', userId);
      }
    }
  });

  it('scopes parent role to only the current parent students', async () => {
    const supabase = createSupabaseServiceTestClient();
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

    const userIDs: number[] = [];
    const parentIDs: number[] = [];
    const studentIDs: number[] = [];

    let parentAUserID: number | undefined;
    let parentAID: number | undefined;
    let parentBID: number | undefined;
    let studentAID: number | undefined;
    let studentBID: number | undefined;
    let studentAUserID: number | undefined;

    const insertUser = async (params: { email: string; firstName: string; lastName: string }) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: params.email,
          first_name: params.firstName,
          last_name: params.lastName,
          timezone: 'UTC',
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      if (!data) throw new Error('Failed to insert user');
      userIDs.push(data.id);
      return data.id;
    };

    try {
      parentAUserID = await insertUser({
        email: `parent-a-${unique}@example.com`,
        firstName: 'Parent',
        lastName: 'A',
      });
      const parentBUserID = await insertUser({
        email: `parent-b-${unique}@example.com`,
        firstName: 'Parent',
        lastName: 'B',
      });

      const { data: parentA, error: parentAError } = await supabase
        .from('parents')
        .insert({ user_id: parentAUserID })
        .select('id')
        .single();
      expect(parentAError).toBeNull();
      expect(parentA).not.toBeNull();
      if (!parentA) throw new Error('Failed to insert parent A');
      parentAID = parentA.id;
      parentIDs.push(parentAID);

      const { data: parentB, error: parentBError } = await supabase
        .from('parents')
        .insert({ user_id: parentBUserID })
        .select('id')
        .single();
      expect(parentBError).toBeNull();
      expect(parentB).not.toBeNull();
      if (!parentB) throw new Error('Failed to insert parent B');
      parentBID = parentB.id;
      parentIDs.push(parentBID);

      studentAUserID = await insertUser({
        email: `student-a-${unique}@example.com`,
        firstName: 'Scoped',
        lastName: 'A',
      });
      const studentBUserID = await insertUser({
        email: `student-b-${unique}@example.com`,
        firstName: 'Scoped',
        lastName: 'B',
      });

      const { data: studentA, error: studentAError } = await supabase
        .from('students')
        .insert({ user_id: studentAUserID, parent_id: parentAID, grade: '7' })
        .select('id')
        .single();
      expect(studentAError).toBeNull();
      expect(studentA).not.toBeNull();
      if (!studentA) throw new Error('Failed to insert student A');
      studentAID = studentA.id;
      studentIDs.push(studentAID);

      const { data: studentB, error: studentBError } = await supabase
        .from('students')
        .insert({ user_id: studentBUserID, parent_id: parentBID, grade: '8' })
        .select('id')
        .single();
      expect(studentBError).toBeNull();
      expect(studentB).not.toBeNull();
      if (!studentB) throw new Error('Failed to insert student B');
      studentBID = studentB.id;
      studentIDs.push(studentBID);

      mockGetCurrentUserID.mockResolvedValue(parentAUserID);

      const scopedStudents = await getStudents('parent');
      const scopedIDs = scopedStudents.map(student => student.id);

      expect(scopedIDs).toContain(studentAID);
      expect(scopedIDs).not.toContain(studentBID);
      expect(scopedStudents.find(student => student.id === studentAID)).toEqual({
        id: studentAID,
        user_id: studentAUserID,
        name: 'Scoped A',
        email: `student-a-${unique}@example.com`,
        grade: '7',
      });
    } finally {
      for (const studentID of studentIDs) {
        await supabase.from('students').delete().eq('id', studentID);
      }
      for (const parentID of parentIDs) {
        await supabase.from('parents').delete().eq('id', parentID);
      }
      for (const userID of userIDs) {
        await supabase.from('users').delete().eq('id', userID);
      }
    }
  });
});
