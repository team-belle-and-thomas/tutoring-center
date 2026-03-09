import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProgressReportForm } from '@/components/tutor-session/progress-report-form';
import { Button } from '@/components/ui/button';
import { getSession, getUserRole } from '@/lib/data/sessions';
import { ArrowLeft } from 'lucide-react';

export default async function ProgressReportPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();

  if (role !== 'tutor') {
    redirect('/dashboard');
  }

  const { id } = await params;
  const sessionId = Number(id);

  const session = await getSession(sessionId);

  return (
    <main className='container mx-auto py-8'>
      <Button variant='ghost' asChild className='mb-4'>
        <Link href={`/dashboard/sessions/${sessionId}`}>
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Session
        </Link>
      </Button>
      <ProgressReportForm
        sessionId={session.id}
        studentName={session.student.name}
        subjectName={session.subject_name}
        scheduledAt={session.scheduled_at}
      />
    </main>
  );
}
