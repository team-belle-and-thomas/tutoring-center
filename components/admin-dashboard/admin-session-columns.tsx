'use client';

import Link from 'next/link';
import { SendMessageButton } from '@/components/send-message-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SessionRow } from '@/lib/data/sessions';
import type { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Pending-Notes': { label: 'Pending Notes', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  Completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
  Canceled: { label: 'Canceled', className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  'No-show': { label: 'No-show', className: 'bg-red-100 text-red-800 border-red-200' },
  Rescheduled: { label: 'Rescheduled', className: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const baseColumns: ColumnDef<SessionRow>[] = [
  {
    accessorKey: 'scheduled_at',
    header: () => <div>Date</div>,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>
        {format(parseISO(row.original.scheduled_at), 'MMM d, yyyy h:mm a')}
      </span>
    ),
  },
  {
    accessorKey: 'tutor_name',
    header: () => <div>Tutor</div>,
    cell: ({ getValue }) => <span className='text-sm'>{getValue() as string}</span>,
  },
  {
    accessorKey: 'student_name',
    header: () => <div>Student</div>,
    cell: ({ getValue }) => <span className='text-sm'>{getValue() as string}</span>,
  },
  {
    accessorKey: 'subject_name',
    header: () => <div>Subject</div>,
    cell: ({ getValue }) => <span className='text-sm'>{getValue() as string}</span>,
  },
  {
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const badge = STATUS_BADGE[status] ?? { label: status, className: '' };

      return (
        <Badge variant='outline' className={badge.className}>
          {badge.label}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => row.getValue(columnId) === filterValue,
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <Button asChild size='sm' variant='outline'>
        <Link href={`/dashboard/sessions/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];

const contactTutorColumn: ColumnDef<SessionRow> = {
  id: 'contact_tutor',
  header: () => <div>Contact</div>,
  cell: ({ row }) => <SendMessageButton email={row.original.tutor_email} label='Contact Tutor' />,
};

export const adminSessionColumns: ColumnDef<SessionRow>[] = baseColumns;
export const adminSessionColumnsWithContact: ColumnDef<SessionRow>[] = [...baseColumns, contactTutorColumn];
