import { DataTable } from '@/components/data-table';
import type { SessionRow } from '@/lib/data/sessions';
import { adminSessionColumns, adminSessionColumnsWithContact } from './admin-session-columns';

export function SessionsView({
  title,
  sessions,
  withContact = false,
}: {
  title: string;
  sessions: SessionRow[];
  withContact?: boolean;
}) {
  const columns = withContact ? adminSessionColumnsWithContact : adminSessionColumns;
  return (
    <>
      <h2 className='text-xl font-semibold mb-4'>{title}</h2>
      <DataTable columns={columns} data={sessions} searchColumns={['tutor_name', 'student_name', 'subject_name']} />
    </>
  );
}
