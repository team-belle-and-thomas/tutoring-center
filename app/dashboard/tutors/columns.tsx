'use client';

import { Tutor } from '@/lib/mock-data';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Tutor>[] = [
  {
    id: 'name',
    accessorFn: row => `${row.first_name} ${row.last_name}`,
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
    accessorKey: 'education',
    header: () => <div className='text-left'>Education</div>,
  },
  {
    accessorKey: 'yoe',
    header: () => <div className='text-left'>Years of Experience</div>,
  },
  {
    accessorKey: 'verified',
    header: () => <div className='text-left'>Verified</div>,
  },
];
