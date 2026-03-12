'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ParentRow } from '@/lib/data/parents';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<ParentRow>[] = [
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
    accessorKey: 'student_count',
    header: () => <div className='text-left'>Students</div>,
  },
  {
    accessorKey: 'credit_balance_info',
    header: () => <div className='text-left'>Credits</div>,
  },
  {
    id: 'actions',
    header: () => <div className='text-left'>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/parents/${row.original.user_id}`}>View</Link>
      </Button>
    ),
  },
];
