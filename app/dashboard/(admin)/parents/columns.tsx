'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Parent } from '@/lib/mock-data';
import type { ColumnDef } from '@tanstack/react-table';
import { Route } from 'next';

export const columns: ColumnDef<Parent>[] = [
  {
    accessorKey: 'id',
    header: () => <div className='text-left'>Parent ID</div>,
  },
  {
    accessorKey: 'user_id',
    header: () => <div className='text-left'>User ID</div>,
  },
  {
    accessorKey: 'name',
    header: () => <div className='text-left'>Name</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div className='text-left'>Email</div>,
  },
  {
    accessorKey: 'student_count',
    header: () => <div className='text-left'>Student Count</div>,
  },
  {
    accessorKey: 'credit_balance_info',
    header: () => <div className='text-left'>Credit Balance</div>,
  },
  {
    id: 'actions',
    header: () => <div className='text-left'>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/parents/${row.original.id}` as Route}>View</Link>
      </Button>
    ),
  },
];
