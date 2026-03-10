import { DM_Sans } from 'next/font/google';
import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { getTutors, getUserRole } from '@/lib/data/tutors';
import { columns } from './columns';
import { TutorListSkeleton } from './loading';

const dm_sans = DM_Sans({ subsets: ['latin'] });

export default async function TutorsPage() {
  await getUserRole();

  return (
    <main className={`${dm_sans.className} p-2 md:p-8`}>
      <div className='mb-6'>
        <h1 className='font-serif text-3xl text-primary'>Tutors</h1>
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
