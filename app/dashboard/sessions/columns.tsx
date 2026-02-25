'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/mock-data';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

export const columns: ColumnDef<Session>[] = [
  {
    id: 'name',
    accessorKey: 'student_name',
    header: () => <div>Student</div>,
  },
  {
    id: 'tutor_name',
    header: () => <div>Tutor</div>,
    cell: ({ row }) => (
      <Link className='text-blue-800 underline' href={`/dashboard/tutors/${row.original.tutor_id}`}>
        {row.original.tutor_name}{' '}
      </Link>
    ),
  },
  {
    id: 'subject_name',
    accessorKey: 'subject_name',
    header: () => <div>Subject</div>,
  },
  {
    id: 'session_timing',
    accessorFn: row => {
      const start = parseISO(row.scheduled_at);
      const end = parseISO(row.ends_at);

      // Formats to: "Feb 23, 2026 2:00 PM - 3:00 PM"
      return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'h:mm a')}`;
    },
    header: () => <div>Session Timing</div>,
  },
  {
    id: 'session_status',
    accessorKey: 'status',
    header: () => <div>Session Status</div>,
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/sessions/${row.original.id}`}>View Progress</Link>
      </Button>
    ),
  },
];
