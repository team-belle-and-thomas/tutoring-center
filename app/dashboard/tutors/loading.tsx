'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function TutorListSkeleton() {
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

export default function LoadingTutorsPage() {
  return (
    <main className='p-2 md:p-8'>
      <h1 className='text-2xl font-bold mb-4'>Tutors Page</h1>
      <p className='mb-4'>Loading tutors data...</p>
      <TutorListSkeleton />
    </main>
  );
}
