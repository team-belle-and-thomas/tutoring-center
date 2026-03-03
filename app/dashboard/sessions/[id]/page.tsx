import { DM_Sans } from 'next/font/google';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/data/sessions';
import { getUserRole } from '@/lib/mock-api';
import { format, parseISO } from 'date-fns';
import { CircleCheck, CircleX, Star } from 'lucide-react';

const dm_sans = DM_Sans({ subsets: ['latin'] });

function SessionDetailSkeleton() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <Skeleton className='h-8 w-[300px] mb-2' />
        <Skeleton className='h-4 w-[200px]' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <section>
          <Skeleton className='h-6 w-32 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
        <section>
          <Skeleton className='h-6 w-20 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
        <section>
          <Skeleton className='h-6 w-24 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

async function SessionDetail({ id, role }: { id: number; role: string }) {
  const session = await getSession(id);
  const showParentInfo = role === 'admin';
  const metrics = session.metrics;

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-2xl'>Session Details</CardTitle>
            <p className='text-muted-foreground mt-1'>
              {session.subject_name} with {session.tutor.name}
            </p>
          </div>
          <Badge
            variant={
              session.status === 'Completed'
                ? 'default'
                : session.status === 'Canceled' || session.status === 'No-show'
                  ? 'destructive'
                  : 'secondary'
            }
          >
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <section>
          <h3 className='text-lg font-semibold mb-3'>Session Info</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>Date</p>
              <p className='font-medium'>{format(parseISO(session.scheduled_at), 'MMMM d, yyyy')}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Time</p>
              <p className='font-medium'>
                {format(parseISO(session.scheduled_at), 'h:mm a')} - {format(parseISO(session.ends_at), 'h:mm a')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground'>Subject</p>
              <p className='font-medium'>{session.subject_name}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className='text-lg font-semibold mb-3'>Tutor</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <p className='text-muted-foreground'>Name</p>
              <Link className='font-medium text-blue-800 underline' href={`/dashboard/tutors/${session.tutor.id}`}>
                {session.tutor.name}
              </Link>
            </div>
            <div>
              <p className='text-muted-foreground'>Email</p>
              <p className='font-medium'>{session.tutor.email}</p>
            </div>
            <div>
              <p className='text-muted-foreground'>Phone</p>
              <p className='font-medium'>{session.tutor.phone}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className='text-lg font-semibold mb-3'>Student</h3>
          <div
            className={`grid gap-4 text-sm ${showParentInfo ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}
          >
            <div>
              <p className='text-muted-foreground'>Name</p>
              <Link className='font-medium text-blue-800 underline' href={`/dashboard/students/${session.student.id}`}>
                {session.student.name}
              </Link>
            </div>
            {showParentInfo && (
              <>
                <div>
                  <p className='text-muted-foreground'>Parent Name</p>
                  <Link
                    className='font-medium text-blue-800 underline'
                    href={`/dashboard/parents/${session.student.parent_id}`}
                  >
                    {session.student.parent_name}
                  </Link>
                </div>
                <div>
                  <p className='text-muted-foreground'>Parent Email</p>
                  <p className='font-medium'>{session.student.parent_email}</p>
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <h3 className='text-lg font-semibold mb-3'>Progress Report</h3>
          {session.progress ? (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              {session.progress.topics && (
                <div>
                  <p className='text-muted-foreground'>Topics Covered</p>
                  <p className='font-medium'>{session.progress.topics}</p>
                </div>
              )}
              {session.progress.homework_assigned && (
                <div>
                  <p className='text-muted-foreground'>Homework Assigned</p>
                  <p className='font-medium'>{session.progress.homework_assigned}</p>
                </div>
              )}
              {session.progress.public_notes && (
                <div>
                  <p className='text-muted-foreground'>Tutor Notes</p>
                  <p className='font-medium'>{session.progress.public_notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>Progress report not yet submitted</p>
          )}
        </section>

        {metrics?.confidence_score !== null && (
          <section>
            <h3 className='text-lg font-semibold mb-3'>Performance</h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              {metrics?.confidence_score !== null && (
                <div>
                  <p className='text-muted-foreground'>Confidence</p>
                  <div className='flex items-center gap-1'>
                    <div className='flex'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= (metrics?.confidence_score ?? 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {metrics?.session_performance !== null && (
                <div>
                  <p className='text-muted-foreground'>Performance</p>
                  <div className='flex items-center gap-1'>
                    <div className='flex'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= (metrics?.session_performance ?? 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <p className='text-muted-foreground'>Homework</p>
                <div className='flex items-center gap-1'>
                  {metrics?.homework_completed ? (
                    <CircleCheck className='text-green-600' size={16} />
                  ) : (
                    <CircleX className='text-red-600' size={16} />
                  )}
                  <span className='font-medium'>{metrics?.homework_completed ? 'Done' : 'Not Done'}</span>
                </div>
              </div>
              {metrics?.tutor_comments && (
                <div>
                  <p className='text-muted-foreground'>Comments</p>
                  <p className='font-medium'>{metrics?.tutor_comments}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
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
        <SessionDetail id={sessionId} role={role} />
      </Suspense>
    </main>
  );
}
