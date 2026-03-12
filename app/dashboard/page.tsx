import { AdminDashboardContent } from '@/components/admin-dashboard/admin-dashboard-content';
import { DataTable } from '@/components/data-table';
import { ParentProgressDashboard } from '@/components/parent-progress-dashboard';
import { parseViewKey } from '@/lib/admin-dashboard-views';
import { getCurrentUserName, getUserRole } from '@/lib/auth';
import { getParentDashboardData, getStudentGrades, type GradeDataPoint } from '@/lib/data/dashboard';
import { getTutorAssignedSessions } from '@/lib/data/sessions';
import type { TutorAssignedSession } from '@/lib/data/sessions';
import { tutorSessionColumns } from './tutor-session-columns';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const role = await getUserRole();
  const userName = await getCurrentUserName();
  const params = await searchParams;
  const view = parseViewKey(params.view);

  return (
    <main className='p-2 md:p-8'>
      <div className='flex items-center gap-2 mb-1'>
        <h1 className='font-serif text-3xl text-primary'>Dashboard</h1>
      </div>
      {userName && <p className='text-lg mb-6'>Welcome, {userName}!</p>}

      {role === 'admin' && <AdminDashboardContent view={view} />}
      {role === 'tutor' && <TutorDashboardContent />}
      {role === 'parent' && <ParentDashboardContent />}
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

async function ParentDashboardContent() {
  const { students, defaultStudentId } = await getParentDashboardData();

  let grades: GradeDataPoint[] = [];
  if (defaultStudentId) {
    grades = await getStudentGrades(defaultStudentId);
  }

  return (
    <section>
      <h2 className='font-serif text-2xl text-primary mb-4'>Progress Overview</h2>
      <ParentProgressDashboard students={students} defaultStudentId={defaultStudentId} grades={grades} />
    </section>
  );
}
