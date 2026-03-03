import { DM_Sans } from 'next/font/google';
import Link from 'next/link';
import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getSessions } from '@/lib/data/sessions';
import { getUserRole } from '@/lib/mock-api';
import { columns } from './columns';

const dm_sans = DM_Sans({ subsets: ['latin'] });

function TableSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-24 w-full' />
      <Skeleton className='h-24 w-full' />
    </div>
  );
}

export default async function SessionsPage({ searchParams }: { searchParams: { kind?: string } }) {
  const role = await getUserRole();
  const kind = searchParams.kind as 'all' | 'upcoming' | 'past' | undefined;
  const sessions = await getSessions(kind);

  return (
    <main className={dm_sans.className}>
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
            <DataTable columns={columns} data={sessions} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
