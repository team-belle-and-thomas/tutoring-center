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
    accessorKey: 'education',
    header: 'Education',
    cell: ({ row }) => (
      <div className='w-40' title={row.getValue('education')}>
        {row.getValue('education')}
      </div>
    ),
  },
  {
    accessorKey: 'yoe',
    header: () => <div className='text-left'>Years of Exp.</div>,
    cell: ({ row }) => <div>{row.getValue('yoe')}</div>,
  },
  {
    accessorKey: 'verified',
    header: () => <div>Verified</div>,
    cell: ({ row }) => <div>{row.getValue('verified') ? <CircleCheck /> : <CircleX />}</div>,
  },
  {
    id: 'actions',
    header: () => <div>Actions</div>,
    cell: ({}) => (
      <Button asChild variant='default' size='sm'>
        {/* TODO: add the correct route once it is made */}
        <Link href='/'>View</Link>
      </Button>
    ),
  },
];
