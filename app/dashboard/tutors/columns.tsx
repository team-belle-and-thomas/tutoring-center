'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TutorRow } from '@/lib/data/tutors';
import { ColumnDef } from '@tanstack/react-table';
import { CircleCheck, CircleX } from 'lucide-react';

export const columns: ColumnDef<TutorRow>[] = [
  {
    accessorKey: 'name',
    header: () => <div className='bg-muted/50 p-2 rounded'>Name</div>,
  },
  {
    accessorKey: 'email',
    header: () => <div className='bg-muted/50 p-2 rounded'>Email</div>,
    cell: ({ row }) => <div className='w-fit'>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'phone',
    header: () => <div className='bg-muted/50 p-2 rounded'>Phone</div>,
  },
  {
    accessorKey: 'education',
    header: () => <div className='bg-muted/50 p-2 rounded'>Education</div>,
  },
  {
    accessorKey: 'years_experience',
    header: () => <div className='bg-muted/50 p-2 rounded'>Years of Exp.</div>,
    cell: ({ row }) => <div>{row.getValue('years_experience')}</div>,
  },
  {
    accessorKey: 'verified',
    header: () => <div className='bg-muted/50 p-2 rounded'>Verified</div>,
    cell: ({ row }) => (
      <div>
        {row.getValue('verified') ? <CircleCheck className='text-green-600' /> : <CircleX className='text-red-600' />}
      </div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className='bg-muted/50 p-2 rounded'>Actions</div>,
    cell: ({ row }) => (
      <Button asChild variant='default' size='sm'>
        <Link href={`/dashboard/tutors/${row.original.id}`}>View</Link>
      </Button>
    ),
  },
];
