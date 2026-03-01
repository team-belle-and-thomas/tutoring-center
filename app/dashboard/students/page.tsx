import { forbidden } from 'next/navigation';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getStudents } from '@/lib/data/students';
import { getUserRole } from '@/lib/mock-api';
import { columns } from './columns';

export default async function StudentsPage() {
  const role = await getUserRole();

  if (role === 'tutor') forbidden();
  const data = await getStudents(role);

  const description = role === 'admin' ? 'All enrolled students' : 'Your enrolled children';

  return (
    <main>
      <div className='p-2 md:p-8'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='font-serif text-3xl text-primary'>Students</h1>
              <Badge variant='secondary'>{data.length}</Badge>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
          </div>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </main>
  );
}
