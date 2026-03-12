'use client';

import { DashboardTablePageSkeleton } from '@/components/dashboard-table-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionsLoading() {
  return (
    <DashboardTablePageSkeleton
      titleWidth='w-36'
      descriptionWidth='w-40'
      toolbar={
        <div className='mr-auto flex gap-2'>
          <Skeleton className='h-9 w-24 rounded-full' />
          <Skeleton className='h-9 w-24 rounded-full' />
          <Skeleton className='h-9 w-24 rounded-full' />
        </div>
      }
      columnCount={5}
    />
  );
}
