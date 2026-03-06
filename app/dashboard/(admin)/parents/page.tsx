import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { getUserRole } from '@/lib/auth';
import { getParents } from '@/lib/mock-api';
import { columns } from './columns';

export default async function ParentsPage() {
  const role = await getUserRole();
  const description = role === 'admin' ? 'All enrolled students' : 'Your enrolled children';
  const data = await getParents();
  return (
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
  );
}
