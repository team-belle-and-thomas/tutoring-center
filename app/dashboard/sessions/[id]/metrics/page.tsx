import { notFound, redirect } from 'next/navigation';
import { SessionMetricsForm } from '@/components/tutor-session/session-metrics-form';
import { getUserRole } from '@/lib/auth';
import { getSession } from '@/lib/data/sessions';

export default async function SessionMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();

  if (role !== 'tutor') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const sessionId = Number(id);

  if (Number.isNaN(sessionId)) {
    notFound();
  }

  const session = await getSession(sessionId);

  if (!session) {
    notFound();
  }

  return (
    <main className='container mx-auto py-8'>
      <SessionMetricsForm
        sessionId={session.id}
        studentName={session.student.name}
        subjectName={session.subject_name}
        scheduledAt={session.scheduled_at}
      />
    </main>
  );
}
