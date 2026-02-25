import Link from 'next/link';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { getSessions, getUserRole } from '@/lib/mock-api';
import { columns } from './columns';
import { DM_Sans } from 'next/font/google';

const dm_sans = DM_Sans({ subsets: ['latin'] });
export default async function SessionsPage() {
  const role = await getUserRole();
  const sessions = await getSessions();

  return (
    <main className={dm_sans.className}>

      <h1>Sessions</h1>
      <p>You are logged in as {role}</p>
      {role == 'parent' && (
        <Button asChild>
          <Link href='/dashboard/sessions/new'>New Session</Link>
        </Button>
      )}
      <div className='p-2 md:p-8'>
        <DataTable columns={columns} data={sessions} />
      </div>
    </main>
  );
}
