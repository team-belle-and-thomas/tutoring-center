'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionRow } from '@/lib/data/sessions';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

export const columns: ColumnDef<SessionRow>[] = [
  {
    id: 'name',
    accessorKey: 'student_name',
    header: () => <div>Student</div>,
    cell: ({ row }) => (
      <Link className='text-blue-800 underline' href={`/dashboard/students/${row.original.student_id}`}>
        {row.original.student_name}
      </Link>
    ),
  },
  {
    id: 'tutor_name',
    header: () => <div>Tutor</div>,
    cell: ({ row }) => (
      <Link className='text-blue-800 underline' href={`/dashboard/tutors/${row.original.tutor_id}`}>
        {row.original.tutor_name}
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
    header: () => <div>Timing</div>,
  },
  {
    id: 'session_status',
    accessorKey: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';

      if (status === 'Completed') {
        variant = 'default';
      } else if (status === 'Scheduled' || status === 'Rescheduled') {
        variant = 'secondary';
      } else if (status === 'Canceled' || status === 'No-show') {
        variant = 'destructive';
      } else {
        variant = 'outline';
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/sessions/${row.original.id}`}>View Details</Link>
      </Button>
    ),
  },
];
