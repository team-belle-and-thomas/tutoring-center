import Link from 'next/link';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserRole } from '@/lib/auth';
import { getSessions } from '@/lib/data/sessions';
import { columns } from './columns';

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const role = await getUserRole();
  const params = await searchParams;
  const kind = params.kind as 'all' | 'upcoming' | 'past' | undefined;
  const sessions = await getSessions(kind);

  const description = role === 'admin' ? 'All tutors' : 'Your assigned tutors';
  const data = await getSessions(kind);

  return (
    <main>
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='p-2 md:p-8'>
            <div className='flex items-center gap-2'>
              <h1 className='font-serif text-3xl text-primary'>Sessions</h1>
              <Badge variant='secondary'>{data.length}</Badge>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>{description}</p>

            <p className='text-muted-foreground'>You are logged in as {role}</p>
          </div>
          {role === 'parent' && (
            <Button asChild>
              <Link href='/dashboard/sessions/new'>New Session</Link>
            </Button>
          )}
        </div>

        <div className='flex px-2 md:px-8 gap-2'>
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
          <DataTable columns={columns} data={sessions} />
        </div>
      </div>
    </main>
  );
}
