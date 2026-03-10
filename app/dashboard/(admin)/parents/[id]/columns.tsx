'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ParentStudentRow } from '@/lib/data/parents';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<ParentStudentRow>[] = [
  {
    accessorKey: 'name',
    header: () => <div className='text-left'>Name</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div className='text-left'>Email</div>,
  },
  {
    accessorKey: 'phone',
    header: () => <div className='text-left'>Phone</div>,
  },
  {
    accessorKey: 'grade',
    header: () => <div className='text-left'>Grade</div>,
  },
  {
    id: 'actions',
    header: () => <div className='text-left'>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/students/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];
