import { DataTable } from '@/components/data-table';
import { ParentProgressDashboard } from '@/components/parent-progress-dashboard';
import { getCurrentUserName, getUserRole } from '@/lib/auth';
import { getParentDashboardData, getStudentGrades, type GradeDataPoint } from '@/lib/data/dashboard';
import { getTutorAssignedSessions } from '@/lib/data/sessions';
import type { TutorAssignedSession } from '@/lib/data/sessions';
import { subDays, subMonths } from 'date-fns';
import { tutorSessionColumns } from './tutor-session-columns';

type SearchParams = Promise<{ student?: string; subject?: string; range?: string }>;

export default async function DashboardPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const role = await getUserRole();
  const userName = await getCurrentUserName();

  const studentId = searchParams.student ? parseInt(searchParams.student, 10) : undefined;
  const subject = searchParams.subject || undefined;
  const dateRange = searchParams.range || 'all';

  return (
    <main className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
      {userName && <p className='text-lg mb-2'>Welcome, {userName}!</p>}
      <p className='text-lg mb-8'>You are logged in as {role}</p>

      {role === 'tutor' && <TutorDashboardContent />}
      {role === 'parent' && (
        <ParentDashboardContent initialStudentId={studentId} initialSubject={subject} initialDateRange={dateRange} />
      )}
    </main>
  );
}

async function TutorDashboardContent() {
  const sessions: TutorAssignedSession[] = await getTutorAssignedSessions();

  return (
    <section>
      <h2 className='text-2xl font-semibold mb-4'>Pending Sessions</h2>

      {sessions.length === 0 ? (
        <p className='text-muted-foreground'>No sessions currently need progress reports.</p>
      ) : (
        <DataTable columns={tutorSessionColumns} data={sessions} />
      )}
    </section>
  );
}

interface ParentDashboardContentProps {
  initialStudentId?: number;
  initialSubject?: string;
  initialDateRange?: string;
}

async function ParentDashboardContent({
  initialStudentId,
  initialSubject,
  initialDateRange,
}: ParentDashboardContentProps) {
  const dateRange = parseDateRange(initialDateRange || 'all');

  const { students, defaultStudentId } = await getParentDashboardData(dateRange, initialSubject);

  const selectedStudentId = initialStudentId || defaultStudentId;
  let grades: GradeDataPoint[] = [];

  if (selectedStudentId) {
    grades = await getStudentGrades(selectedStudentId);
  }

  return (
    <section>
      <h2 className='text-2xl font-semibold mb-4'>Progress Overview</h2>
      <ParentProgressDashboard
        students={students}
        defaultStudentId={defaultStudentId}
        selectedStudentId={selectedStudentId}
        selectedSubject={initialSubject}
        selectedDateRange={initialDateRange || 'all'}
        grades={grades}
      />
    </section>
  );
}

function parseDateRange(range: string): { from: string | undefined; to: string | undefined } {
  const now = new Date();

  switch (range) {
    case '30d':
      return {
        from: subDays(now, 30).toISOString(),
        to: undefined,
      };
    case '3m':
      return {
        from: subMonths(now, 3).toISOString(),
        to: undefined,
      };
    case '6m':
      return {
        from: subMonths(now, 6).toISOString(),
        to: undefined,
      };
    default:
      return { from: undefined, to: undefined };
  }
}
