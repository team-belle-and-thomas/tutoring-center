import { getParents } from '@/lib/mock-api';
import { columns } from './columns';
import { DataTable } from './data-table';

export default async function ParentsPage() {
  const data = await getParents();
  return (
    <div className='p-8'>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
