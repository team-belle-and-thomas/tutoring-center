'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SessionRow } from '@/lib/data/sessions';
import type { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

type Status = 'Scheduled' | 'No-show' | 'Canceled';

function StatusCell({ row }: { row: { original: SessionRow } }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(row.original.status as Status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: Status) => {
    if (next === status) return;

    startTransition(async () => {
      try {
        const response = await fetch('/api/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: row.original.id, status: next }),
        });
        const body = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          toast.error(body?.error ?? 'Failed to update session status.');
          return;
        }

        setStatus(next);
        router.refresh();
      } catch {
        toast.error('Failed to update session status.');
      }
    });
  };

  if (status !== 'Scheduled') {
    const color =
      status === 'No-show' ? 'border-red-200 bg-red-50 text-red-600' : 'border-zinc-200 bg-zinc-50 text-zinc-600';
    return <span className={`rounded border px-2 py-1 text-xs font-medium ${color}`}>{status}</span>;
  }

  return (
    <Select value={status} onValueChange={value => handleChange(value as Status)} disabled={isPending}>
      <SelectTrigger className='h-7 w-32 text-xs bg-sidebar'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='Scheduled'>Scheduled</SelectItem>
        <SelectItem value='No-show'>No-show</SelectItem>
        <SelectItem value='Canceled'>Canceled</SelectItem>
      </SelectContent>
    </Select>
  );
}

const sessionsTodayColumns: ColumnDef<SessionRow>[] = [
  {
    accessorKey: 'scheduled_at',
    header: () => <div>Time</div>,
    cell: ({ getValue }) => (
      <span className='text-sm whitespace-nowrap'>{format(parseISO(getValue() as string), 'h:mm a')}</span>
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
    id: 'status',
    header: () => <div>Status</div>,
    cell: ({ row }) => <StatusCell row={row} />,
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

export function SessionsTodayTable({ sessions }: { sessions: SessionRow[] }) {
  return (
    <DataTable
      columns={sessionsTodayColumns}
      data={sessions}
      searchColumns={['tutor_name', 'student_name', 'subject_name']}
    />
  );
}
