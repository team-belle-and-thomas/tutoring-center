import { DM_Sans } from 'next/font/google';
import { DataTable } from '@/components/data-table';
import { getTutors, getUserRole } from '@/lib/mock-api';
import { Tutor } from '@/lib/mock-data';
import { columns } from './columns';

const dm_sans = DM_Sans({ subsets: ['latin'] });
export default async function TutorsPage() {
  const role = await getUserRole();
  const data = await getTutors();
  return (
    <main className={dm_sans.className}>
      <h1>Tutors Page</h1>
      {/* Currently being used for debugging, we will consider removing this later */}
      <p>You are logged in as {role}</p>
      {role === 'admin' && <AdminTutorsPage tutors={data} />}
    </main>
  );
}

interface AdminTutorsPageProps {
  tutors: Tutor[];
}
function AdminTutorsPage({ tutors }: AdminTutorsPageProps) {
  return (
    <div className='p-2 md:p-8'>
      <DataTable columns={columns} data={tutors} />
    </div>
  );
}
