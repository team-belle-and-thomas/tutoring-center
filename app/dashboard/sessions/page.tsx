import Link from 'next/link';
import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSessions } from '@/lib/data/sessions';
import { getUserRole } from '@/lib/mock-api';
import { columns } from './columns';

function TableSkeleton() {
  return (
    <div className='space-y-3'>
      {/* Header row */}
      <div className='grid grid-cols-6 gap-4'>
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-6 w-full' />
      </div>
      {/* Data rows */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className='grid grid-cols-6 gap-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      ))}
    </div>
  );
}

export default async function SessionsPage({ searchParams }: { searchParams: { kind?: string } }) {
  const role = await getUserRole();
  const kind = searchParams.kind as 'all' | 'upcoming' | 'past' | undefined;

  return (
    <main>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold'>Sessions</h1>
            <p className='text-muted-foreground'>You are logged in as {role}</p>
          </div>
          {role === 'parent' && (
            <Button asChild>
              <Link href='/dashboard/sessions/new'>New Session</Link>
            </Button>
          )}
        </div>

        <div className='flex gap-2'>
          <Button variant={!kind || kind === 'all' ? 'default' : 'outline'} size='sm' asChild>
            <Link href='/dashboard/sessions?kind=all'>All Sessions</Link>
          </Button>
          <Button variant={kind === 'upcoming' ? 'default' : 'outline'} size='sm' asChild>
            <Link href='/dashboard/sessions?kind=upcoming'>Upcoming</Link>
          </Button>
          <Button variant={kind === 'past' ? 'default' : 'outline'} size='sm' asChild>
            <Link href='/dashboard/sessions?kind=past'>Past</Link>
          </Button>
        </div>

        <div className='p-2 md:p-8'>
          <Suspense fallback={<TableSkeleton />}>
            <SessionsList kind={kind} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function SessionsList({ kind }: { kind?: 'all' | 'upcoming' | 'past' }) {
  const sessions = await getSessions(kind);
  return <DataTable columns={columns} data={sessions} />;
}
