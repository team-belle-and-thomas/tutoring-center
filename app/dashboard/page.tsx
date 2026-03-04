import { DataTable } from '@/components/data-table';
import { getTutorAssignedSessions } from '@/lib/data/sessions';
import type { TutorAssignedSession } from '@/lib/data/sessions';
import { getUserRole } from '@/lib/mock-api';
import { tutorSessionColumns } from './tutor-session-columns';

export default async function DashboardPage() {
  const role = await getUserRole();

  return (
    <main className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>
      <p className='text-lg mb-8'>You are logged in as {role}</p>

      {role === 'tutor' && <TutorDashboardContent />}
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
