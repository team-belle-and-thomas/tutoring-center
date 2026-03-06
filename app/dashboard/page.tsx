import { DataTable } from '@/components/data-table';
import { ParentProgressDashboard } from '@/components/parent-progress-dashboard';
import { getCurrentUserName, getUserRole } from '@/lib/auth';
import { getParentDashboardData, getStudentGrades, type GradeDataPoint } from '@/lib/data/dashboard';
import { getTutorAssignedSessions } from '@/lib/data/sessions';
import type { TutorAssignedSession } from '@/lib/data/sessions';
import { tutorSessionColumns } from './tutor-session-columns';

export default async function DashboardPage() {
  const role = await getUserRole();
  const userName = await getCurrentUserName();

  return (
    <main className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
      {userName && <p className='text-lg mb-2'>Welcome, {userName}!</p>}
      <p className='text-lg mb-8'>You are logged in as {role}</p>

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
      <h2 className='text-2xl font-semibold mb-4'>Progress Overview</h2>
      <ParentProgressDashboard students={students} defaultStudentId={defaultStudentId} grades={grades} />
    </section>
  );
}
