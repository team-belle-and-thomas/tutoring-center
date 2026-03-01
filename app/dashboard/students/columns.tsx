'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { StudentRow } from '@/lib/data/students';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<StudentRow>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <div>Name</div>,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <div>Email</div>,
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: () => <div>Phone</div>,
  },
  {
    id: 'grade',
    accessorKey: 'grade',
    header: () => <div>Grade</div>,
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/students/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];
