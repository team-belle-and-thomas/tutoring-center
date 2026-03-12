import { Suspense } from 'react';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getTutors, getUserRole } from '@/lib/data/tutors';
import { columns } from './columns';
import { TutorListSkeleton } from './loading';

export default async function TutorsPage() {
  const role = await getUserRole();
  const description = role === 'admin' ? 'All tutors' : 'Your assigned tutors';
  const data = await getTutors(role);

  return (
    <main className='p-2 md:p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
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

  return <DataTable columns={columns} data={tutors} />;
}
