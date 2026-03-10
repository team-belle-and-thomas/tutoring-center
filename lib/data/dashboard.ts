import 'server-only';
import { getCurrentUserID, getUserRole } from '@/lib/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { pickFirstEmbedded } from '@/lib/utils/normalize';

export type DateRange = {
  from: string | undefined;
  to: string | undefined;
};

export type PerformanceDataPoint = {
  date: string;
  score: number;
  sessionId: number;
  subject: string;
};

export type ConfidenceDataPoint = {
  date: string;
  score: number;
  sessionId: number;
  subject: string;
};

export type HomeworkDataPoint = {
  date: string;
  completed: boolean;
  sessionId: number;
  subject: string;
};

export type StudentProgressData = {
  studentId: number;
  studentName: string;
  performance: PerformanceDataPoint[];
  confidence: ConfidenceDataPoint[];
  homework: HomeworkDataPoint[];
};

type SessionMetricsDB = {
  session_performance: number | null;
  confidence_score: number | null;
  homework_completed: boolean | null;
};

type SubjectDB = {
  category: string;
};

type UserDB = {
  first_name: string | null;
  last_name: string | null;
};

type SessionWithMetricsDB = {
  id: number;
  scheduled_at: string;
  student_id: number;
  session_metrics: SessionMetricsDB | SessionMetricsDB[] | null;
  subjects: SubjectDB | SubjectDB[] | null;
};

type StudentWithUserDB = {
  id: number;
  users: UserDB[] | UserDB;
};

export async function getStudentProgressData(
  studentId: number,
  studentName: string,
  dateRange?: DateRange
): Promise<StudentProgressData> {
  const supabase = createSupabaseServiceClient();

  let query = supabase
    .from('sessions')
    .select(
      `
      id,
      scheduled_at,
      student_id,
      session_metrics (
        session_performance,
        confidence_score,
        homework_completed
      ),
      subjects:subject_id (
        category
      )
    `
    )
    .eq('student_id', studentId)
    .eq('status', 'Completed')
    .not('session_metrics', 'is', null)
    .order('scheduled_at', { ascending: true });

  if (dateRange?.from) {
    query = query.gte('scheduled_at', dateRange.from);
  }
  if (dateRange?.to) {
    query = query.lte('scheduled_at', dateRange.to);
  }

  const { data, error } = await query;

  if (error) {
    return {
      studentId,
      studentName,
      performance: [],
      confidence: [],
      homework: [],
    };
  }

  if (!data || data.length === 0) {
    return {
      studentId,
      studentName,
      performance: [],
      confidence: [],
      homework: [],
    };
  }

  const sessions = data as unknown as SessionWithMetricsDB[];
  const performance: PerformanceDataPoint[] = [];
  const confidence: ConfidenceDataPoint[] = [];
  const homework: HomeworkDataPoint[] = [];

  for (const session of sessions) {
    const metrics = Array.isArray(session.session_metrics) ? session.session_metrics[0] : session.session_metrics;
    const subject = Array.isArray(session.subjects)
      ? session.subjects[0]?.category
      : session.subjects?.category || 'Unknown';

    if (metrics?.session_performance !== null && metrics?.session_performance !== undefined) {
      performance.push({
        date: session.scheduled_at,
        score: metrics.session_performance,
        sessionId: session.id,
        subject,
      });
    }

    if (metrics?.confidence_score !== null && metrics?.confidence_score !== undefined) {
      confidence.push({
        date: session.scheduled_at,
        score: metrics.confidence_score,
        sessionId: session.id,
        subject,
      });
    }

    if (metrics?.homework_completed !== null && metrics?.homework_completed !== undefined) {
      homework.push({
        date: session.scheduled_at,
        completed: metrics.homework_completed,
        sessionId: session.id,
        subject,
      });
    }
  }

  return {
    studentId,
    studentName,
    performance,
    confidence,
    homework,
  };
}

export async function getStudentsWithProgress(dateRange?: DateRange, subject?: string): Promise<StudentProgressData[]> {
  const role = await getUserRole();
  if (role !== 'parent') {
    return [];
  }

  const userID = await getCurrentUserID();
  if (!userID) {
    return [];
  }

  const supabase = createSupabaseServiceClient();

  const { data: parentData, error: parentError } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userID)
    .single();

  if (parentError || !parentData) {
    return [];
  }

  const parentId = parentData.id;

  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select(
      `
      id,
      users:user_id (
        first_name,
        last_name
      )
    `
    )
    .eq('parent_id', parentId);

  if (studentsError) {
    return [];
  }

  if (!studentsData || studentsData.length === 0) {
    return [];
  }

  const studentMap = new Map<number, string>();
  for (const student of studentsData as StudentWithUserDB[]) {
    const user = pickFirstEmbedded(student.users);
    const studentName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Student';
    studentMap.set(student.id, studentName);
  }

  const studentIds = Array.from(studentMap.keys());

  let sessionsQuery = supabase
    .from('sessions')
    .select(
      `
      id,
      scheduled_at,
      student_id,
      session_metrics (
        session_performance,
        confidence_score,
        homework_completed
      ),
      subjects:subject_id (
        category
      )
    `
    )
    .in('student_id', studentIds)
    .eq('status', 'Completed')
    .not('session_metrics', 'is', null)
    .order('scheduled_at', { ascending: true });

  if (dateRange?.from) {
    sessionsQuery = sessionsQuery.gte('scheduled_at', dateRange.from);
  }
  if (dateRange?.to) {
    sessionsQuery = sessionsQuery.lte('scheduled_at', dateRange.to);
  }
  if (subject) {
    sessionsQuery = sessionsQuery.eq('subjects.category', subject);
  }

  const { data: sessionsData, error: sessionsError } = await sessionsQuery;

  if (sessionsError) {
    return studentIds.map(id => ({
      studentId: id,
      studentName: studentMap.get(id) || 'Student',
      performance: [],
      confidence: [],
      homework: [],
    }));
  }

  const sessionsByStudent = new Map<number, SessionWithMetricsDB[]>();
  for (const session of (sessionsData || []) as unknown as SessionWithMetricsDB[]) {
    const existing = sessionsByStudent.get(session.student_id) || [];
    existing.push(session);
    sessionsByStudent.set(session.student_id, existing);
  }

  const studentsWithProgress: StudentProgressData[] = [];

  for (const [studentId, studentName] of studentMap) {
    const sessions = sessionsByStudent.get(studentId) || [];
    const performance: PerformanceDataPoint[] = [];
    const confidence: ConfidenceDataPoint[] = [];
    const homework: HomeworkDataPoint[] = [];

    for (const session of sessions) {
      const metrics = Array.isArray(session.session_metrics) ? session.session_metrics[0] : session.session_metrics;
      const subject = Array.isArray(session.subjects)
        ? session.subjects[0]?.category
        : session.subjects?.category || 'Unknown';

      if (metrics?.session_performance !== null && metrics?.session_performance !== undefined) {
        performance.push({
          date: session.scheduled_at,
          score: metrics.session_performance,
          sessionId: session.id,
          subject,
        });
      }

      if (metrics?.confidence_score !== null && metrics?.confidence_score !== undefined) {
        confidence.push({
          date: session.scheduled_at,
          score: metrics.confidence_score,
          sessionId: session.id,
          subject,
        });
      }

      if (metrics?.homework_completed !== null && metrics?.homework_completed !== undefined) {
        homework.push({
          date: session.scheduled_at,
          completed: metrics.homework_completed,
          sessionId: session.id,
          subject,
        });
      }
    }

    studentsWithProgress.push({
      studentId,
      studentName,
      performance,
      confidence,
      homework,
    });
  }

  return studentsWithProgress;
}

export async function getParentDashboardData(dateRange?: DateRange, subject?: string) {
  const studentsWithProgress = await getStudentsWithProgress(dateRange, subject);

  return {
    students: studentsWithProgress,
    defaultStudentId: studentsWithProgress[0]?.studentId ?? null,
  };
}

export type GradeDataPoint = {
  id: number;
  subject: string;
  grade: string;
  createdAt: string;
};

export async function getStudentGrades(studentId: number): Promise<GradeDataPoint[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('student_grades')
    .select('id, subject, grade, created_at')
    .eq('student_id', studentId)
    .order('created_at', { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map(row => ({
    id: row.id,
    subject: row.subject,
    grade: row.grade,
    createdAt: row.created_at,
  }));
}

export async function getAllSubjects(): Promise<string[]> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.from('subjects').select('category').order('category', { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map(row => row.category).filter(Boolean);
}

export type SubjectWithData = {
  subject: string;
  hasData: boolean;
};

export function getUniqueSubjectsFromStudentData(data: StudentProgressData): string[] {
  const subjects = new Set<string>();

  for (const p of data.performance) {
    if (p.subject && p.subject !== 'Unknown') {
      subjects.add(p.subject);
    }
  }
  for (const c of data.confidence) {
    if (c.subject && c.subject !== 'Unknown') {
      subjects.add(c.subject);
    }
  }
  for (const h of data.homework) {
    if (h.subject && h.subject !== 'Unknown') {
      subjects.add(h.subject);
    }
  }

  return Array.from(subjects).sort();
}

export function averagePerformanceByDate(items: PerformanceDataPoint[]): PerformanceDataPoint[] {
  const byDate = new Map<string, { scores: number[]; original: PerformanceDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { scores: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.scores.push(item.score);
    entry.original.push(item);
  }

  const result: PerformanceDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;
    result.push({ date: entry.original[0].date, score: avg, sessionId: 0, subject: '' });
  }

  return result;
}

export function averageConfidenceByDate(items: ConfidenceDataPoint[]): ConfidenceDataPoint[] {
  const byDate = new Map<string, { scores: number[]; original: ConfidenceDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { scores: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.scores.push(item.score);
    entry.original.push(item);
  }

  const result: ConfidenceDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;
    result.push({ date: entry.original[0].date, score: avg, sessionId: 0, subject: '' });
  }

  return result;
}

export function averageHomeworkByDate(items: HomeworkDataPoint[]): HomeworkDataPoint[] {
  const byDate = new Map<string, { completed: number[]; original: HomeworkDataPoint[] }>();

  for (const item of items) {
    const dateKey = item.date.split('T')[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { completed: [], original: [] });
    }
    const entry = byDate.get(dateKey)!;
    entry.completed.push(item.completed ? 1 : 0);
    entry.original.push(item);
  }

  const result: HomeworkDataPoint[] = [];
  const sortedDates = Array.from(byDate.keys()).sort();

  for (const dateKey of sortedDates) {
    const entry = byDate.get(dateKey)!;
    const avg = entry.completed.reduce((a, b) => a + b, 0) / entry.completed.length;
    result.push({ date: entry.original[0].date, completed: avg >= 0.5, sessionId: 0, subject: '' });
  }

  return result;
}
