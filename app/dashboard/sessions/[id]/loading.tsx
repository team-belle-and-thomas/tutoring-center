'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function SessionDetailLoading() {
  return (
    <main className='container mx-auto py-8'>
      <div className='space-y-3'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-6 w-20' />

        <Skeleton className='h-6 w-32 mt-6' />
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>

        <Skeleton className='h-6 w-24 mt-6' />
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>

        <Skeleton className='h-6 w-24 mt-6' />
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      </div>
    </main>
  );
}
