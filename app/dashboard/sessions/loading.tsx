'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function SessionListSkeleton() {
  return (
    <div className='space-y-4'>
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className='flex flex-col space-y-2 p-4 border rounded-md'>
            <Skeleton className='h-6 w-1/4' />
            <div className='flex space-x-8'>
              <Skeleton className='h-4 w-1/4' />
              <Skeleton className='h-4 w-1/4' />
              <Skeleton className='h-4 w-1/4' />
            </div>
            <Skeleton className='h-4 w-1/2' />
            <div className='flex justify-end'>
              <Skeleton className='h-8 w-20' />
            </div>
          </div>
        ))}
    </div>
  );
}

export default function SessionsLoading() {
  return (
    <main>
      <div className='flex flex-col p-6 gap-4'>
        <div className='flex items-center justify-between'>
          <div>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-32 mt-2' />
          </div>
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-24' />
        </div>
        <SessionListSkeleton />
      </div>
    </main>
  );
}
