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
      <div className='mb-6'>
        <h1 className='font-serif text-3xl text-primary'>Dashboard</h1>
        {userName && <p className='text-muted-foreground mt-1 text-sm'>Welcome, {userName}!</p>}
        <p className='text-muted-foreground mt-1 text-sm'>You are logged in as {role}</p>
      </div>

      {role === 'tutor' && <TutorDashboardContent />}
      {role === 'parent' && <ParentDashboardContent />}
    </main>
  );
}

async function TutorDashboardContent() {
  const sessions: TutorAssignedSession[] = await getTutorAssignedSessions();

  return (
    <section>
      <h2 className='font-serif text-2xl text-primary mb-4'>Pending Sessions</h2>

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
