import { DataTable } from '@/components/data-table';
import { getCurrentUserName, getUserRole } from '@/lib/auth';
import { getTutorAssignedSessions } from '@/lib/data/sessions';
import type { TutorAssignedSession } from '@/lib/data/sessions';
import { tutorSessionColumns } from './tutor-session-columns';

export default async function DashboardPage() {
  const role = await getUserRole();
  const userName = await getCurrentUserName();

  return (
    <main className='container mx-auto py-2'>
      <div className='flex items-center p-2 md:p-8 gap-2'>
        <h1 className='font-serif text-3xl text-primary'>Dashboard</h1>
      </div>
      {userName && <p className='text-lg ml-8 mb-2'>Welcome, {userName}!</p>}
      <p className='text-lg ml-8 mb-8'>You are logged in as {role}</p>

      {role === 'tutor' && <TutorDashboardContent />}
    </main>
  );
}

async function TutorDashboardContent() {
  const sessions: TutorAssignedSession[] = await getTutorAssignedSessions();

  return (
    <section className='pl-8'>
      <h2 className='text-2xl font-semibold pl-4'>Pending Sessions</h2>

      {sessions.length === 0 ? (
        <p className='text-muted-foreground'>No sessions currently need progress reports.</p>
      ) : (
        <DataTable columns={tutorSessionColumns} data={sessions} />
      )}
    </section>
  );
}
