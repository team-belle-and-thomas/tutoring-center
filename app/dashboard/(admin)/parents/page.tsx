import { DataTable } from '@/components/data-table';
import { getParents } from '@/lib/mock-api';
import { columns } from './columns';

export default async function ParentsPage() {
  const data = await getParents();
  return (
    <div className='p-2 md:p-8'>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
