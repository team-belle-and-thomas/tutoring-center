import { DM_Sans } from 'next/font/google';
import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getTutors, getUserRole } from '@/lib/data/tutors';
import { columns } from './columns';
import { TutorListSkeleton } from './loading';

const dm_sans = DM_Sans({ subsets: ['latin'] });

export default async function TutorsPage() {
  const role = await getUserRole();
  const description = role === 'admin' ? 'All tutors' : 'Your assigned tutors';
  const data = await getTutors(role);

  return (
    <main className={dm_sans.className}>
      <div className='mb-6 flex items-center justify-between'>
        <div className='p-2 md:p-8'>
          <div className='flex items-center gap-2'>
            <h1 className='font-serif text-3xl text-primary'>Tutors</h1>
            <Badge variant='secondary'>{data.length}</Badge>
          </div>
          <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
        </div>
      </div>

      <Suspense fallback={<TutorListSkeleton />}>
        <TutorsDataTable />
      </Suspense>
    </main>
  );
}

async function TutorsDataTable() {
  const tutors = await getTutors('admin');

  if (!tutors.length) {
    return (
      <div className='p-4 border rounded-md text-center'>
        <p className='text-xl font-semibold'>No tutors found</p>
        <p className='text-gray-600'>There are no tutors available in the system.</p>
      </div>
    );
  }

  return (
    <div className='p-2 md:p-8'>
      <DataTable columns={columns} data={tutors} />
    </div>
  );
}
