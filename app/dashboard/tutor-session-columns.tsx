'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TutorAssignedSession } from '@/lib/data/sessions';
import { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

export const tutorSessionColumns: ColumnDef<TutorAssignedSession>[] = [
  {
    accessorKey: 'student_name',
    header: () => <div>Student</div>,
  },
  {
    id: 'timing',
    accessorFn: row => {
      const start = parseISO(row.scheduled_at);
      const end = parseISO(row.ends_at);
      return `${format(start, 'MMM d, yyyy h:mm a')} - ${format(end, 'h:mm a')}`;
    },
    header: () => <div>Date/Time</div>,
  },
  {
    accessorKey: 'subject_name',
    header: () => <div>Subject</div>,
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => {
      const { id, needsProgressReport, needsMetrics } = row.original;
      const buttons: React.ReactNode[] = [];

      if (needsProgressReport) {
        buttons.push(
          <Button asChild key='progress' variant='default' size='sm'>
            <Link href={`/dashboard/sessions/${id}/progress`}>Progress Report</Link>
          </Button>
        );
      }

      if (needsMetrics) {
        buttons.push(
          <Button asChild key='metrics' variant='default' size='sm'>
            <Link href={`/dashboard/sessions/${id}/metrics`}>Session Metrics</Link>
          </Button>
        );
      }

      if (buttons.length === 0) {
        return <span className='text-sm text-green-600'>Complete</span>;
      }

      return <div className='flex gap-2'>{buttons}</div>;
    },
  },
];
