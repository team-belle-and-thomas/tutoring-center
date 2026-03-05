import Link from 'next/link';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { getUserRole } from '@/lib/auth';
import { getSessions } from '@/lib/data/sessions';
import { columns } from './columns';

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const role = await getUserRole();
  const params = await searchParams;
  const kind = params.kind as 'all' | 'upcoming' | 'past' | undefined;
  const sessions = await getSessions(kind);

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
          <DataTable columns={columns} data={sessions} />
        </div>
      </div>
    </main>
  );
}
