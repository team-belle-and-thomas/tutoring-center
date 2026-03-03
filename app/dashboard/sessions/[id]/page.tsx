import { DM_Sans } from 'next/font/google';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/data/sessions';
import { getUserRole } from '@/lib/mock-api';
import { format, parseISO } from 'date-fns';
import { CircleCheck, CircleX, Star } from 'lucide-react';

const dm_sans = DM_Sans({ subsets: ['latin'] });

function SessionDetailSkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <Skeleton className='h-8 w-[300px] mb-2' />
          <Skeleton className='h-4 w-[200px]' />
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <Skeleton className='h-20 w-full' />
            <Skeleton className='h-20 w-full' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionInfo({ session }: { session: Awaited<ReturnType<typeof getSession>> }) {
  const start = parseISO(session.scheduled_at);
  const end = parseISO(session.ends_at);

  let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  if (session.status === 'Completed') statusVariant = 'default';
  else if (session.status === 'Scheduled' || session.status === 'Rescheduled') statusVariant = 'secondary';
  else if (session.status === 'Canceled' || session.status === 'No-show') statusVariant = 'destructive';
  else statusVariant = 'outline';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Session Details</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-muted-foreground uppercase'>Date</p>
            <p className='font-medium'>{format(start, 'MMMM d, yyyy')}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground uppercase'>Time</p>
            <p className='font-medium'>
              {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground uppercase'>Duration</p>
            <p className='font-medium'>{session.slot_units} units</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground uppercase'>Subject</p>
            <p className='font-medium'>{session.subject_name}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground uppercase'>Status</p>
            <Badge variant={statusVariant}>{session.status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TutorInfo({ tutor }: { tutor: Awaited<ReturnType<typeof getSession>>['tutor'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Tutor</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Name</p>
          <p className='font-medium'>{tutor.name}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Email</p>
          <p className='font-medium'>{tutor.email}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Phone</p>
          <p className='font-medium'>{tutor.phone}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentInfo({ student }: { student: Awaited<ReturnType<typeof getSession>>['student'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Student</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Name</p>
          <p className='font-medium'>{student.name}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Parent Name</p>
          <p className='font-medium'>{student.parent_name}</p>
        </div>
        <div>
          <p className='text-sm text-muted-foreground uppercase'>Parent Email</p>
          <p className='font-medium'>{student.parent_email}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressReport({ progress }: { progress: Awaited<ReturnType<typeof getSession>>['progress'] }) {
  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>Progress Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>Progress report not yet submitted</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Progress Report</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {progress.topics && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Topics Covered</p>
            <p className='font-medium'>{progress.topics}</p>
          </div>
        )}
        {progress.homework_assigned && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Homework Assigned</p>
            <p className='font-medium'>{progress.homework_assigned}</p>
          </div>
        )}
        {progress.public_notes && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Tutor Notes</p>
            <p className='font-medium'>{progress.public_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricsDisplay({ metrics }: { metrics: Awaited<ReturnType<typeof getSession>>['metrics'] }) {
  if (!metrics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {metrics.confidence_score !== null && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Confidence Score</p>
            <div className='flex items-center gap-2'>
              <div className='flex'>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= metrics.confidence_score! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className='font-medium'>{metrics.confidence_score}/5</span>
            </div>
          </div>
        )}
        {metrics.session_performance !== null && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Performance</p>
            <p className='font-medium'>{metrics.session_performance}/5</p>
          </div>
        )}
        <div>
          <p className='text-sm text-muted-foreground uppercase mb-1'>Homework Completion</p>
          <div className='flex items-center gap-2'>
            {metrics.homework_completed ? (
              <CircleCheck className='text-green-600' />
            ) : (
              <CircleX className='text-red-600' />
            )}
            <span className='font-medium'>{metrics.homework_completed ? 'Completed' : 'Not Completed'}</span>
          </div>
        </div>
        {metrics.tutor_comments && (
          <div>
            <p className='text-sm text-muted-foreground uppercase mb-1'>Tutor Comments</p>
            <p className='font-medium'>{metrics.tutor_comments}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function SessionDetail({ id }: { id: number }) {
  const session = await getSession(id);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Session #{session.id}</h1>
          <p className='text-muted-foreground'>
            {session.subject_name} with {session.tutor.name}
          </p>
        </div>
        <div className='flex gap-2'>
          <Badge variant={session.status === 'Completed' ? 'default' : 'secondary'}>{session.status}</Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <SessionInfo session={session} />
        <TutorInfo tutor={session.tutor} />
        <StudentInfo student={session.student} />
        <ProgressReport progress={session.progress} />
        {session.metrics && <MetricsDisplay metrics={session.metrics} />}
      </div>
    </div>
  );
}

export default async function SingleSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  const sessionId = Number(id);

  if (Number.isNaN(sessionId)) {
    notFound();
  }

  return (
    <main className={dm_sans.className}>
      <p className='mb-4'>You are logged in as {role}</p>
      <Suspense fallback={<SessionDetailSkeleton />}>
        <SessionDetail id={sessionId} />
      </Suspense>
    </main>
  );
}
