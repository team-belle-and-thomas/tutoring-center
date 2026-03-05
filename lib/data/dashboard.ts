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
      subjects (
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
    console.error('[getStudentProgressData] Database error:', {
      studentId,
      error: error.message,
      code: error.code,
    });
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

export async function getStudentsWithProgress(dateRange?: DateRange): Promise<StudentProgressData[]> {
  const role = await getUserRole();
  if (role !== 'parent') {
    console.warn('[getStudentsWithProgress] Non-parent user attempted access');
    return [];
  }

  const userID = await getCurrentUserID();
  if (!userID) {
    console.error('[getStudentsWithProgress] No user ID found');
    return [];
  }

  const supabase = createSupabaseServiceClient();

  const { data: parentData, error: parentError } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userID)
    .single();

  if (parentError || !parentData) {
    console.error('[getStudentsWithProgress] Parent not found:', {
      userID,
      error: parentError?.message,
    });
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
    console.error('[getStudentsWithProgress] Error fetching students:', {
      parentId,
      error: studentsError.message,
    });
    return [];
  }

  if (!studentsData || studentsData.length === 0) {
    console.log('[getStudentsWithProgress] No students found for parent:', parentId);
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
      subjects (
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

  const { data: sessionsData, error: sessionsError } = await sessionsQuery;

  if (sessionsError) {
    console.error('[getStudentsWithProgress] Error fetching sessions:', {
      studentIds,
      error: sessionsError.message,
    });
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

export async function getParentDashboardData(dateRange?: DateRange) {
  const studentsWithProgress = await getStudentsWithProgress(dateRange);

  return {
    students: studentsWithProgress,
    defaultStudentId: studentsWithProgress[0]?.studentId ?? null,
  };
}
