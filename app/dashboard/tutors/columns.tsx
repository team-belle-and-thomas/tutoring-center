'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tutor } from '@/lib/mock-data';
import { ColumnDef } from '@tanstack/react-table';
import { CircleCheck, CircleX } from 'lucide-react';

export const columns: ColumnDef<Tutor>[] = [
  {
    id: 'name',
    accessorFn: row => `${row.first_name} ${row.last_name}`,
    header: () => <div>Name</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div>Email</div>,
    cell: ({ row }) => <div className='w-fit'>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'phone',
    header: () => <div>Phone</div>,
  },
  {
    accessorKey: 'yoe',
    header: () => <div>Years of Exp.</div>,
    cell: ({ row }) => <div>{row.getValue('yoe')}</div>,
  },
  {
    accessorKey: 'verified',
    header: () => <div>Verified</div>,
    cell: ({ row }) => (
      <div>
        {row.getValue('verified') ? <CircleCheck className='text-green-600' /> : <CircleX className='text-red-600' />}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/tutors/${row.original.user_id}`}>View</Link>
      </Button>
    ),
  },
];
