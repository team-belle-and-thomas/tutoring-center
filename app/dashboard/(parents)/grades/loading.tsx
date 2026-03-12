import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className='p-2 md:p-8'>
      <div className='max-w-md mx-auto'>
        <div className='mb-6'>
          <Skeleton className='h-9 w-48' />
          <Skeleton className='mt-2 h-4 w-64' />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grade Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>

            <Skeleton className='h-10 w-full' />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
