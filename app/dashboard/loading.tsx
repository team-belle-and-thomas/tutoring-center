import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoadingSkeleton() {
  return (
    <div className='space-y-6 px-6 py-2'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-10 w-[200px]' />
        </div>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-5 w-20' />
          <div className='flex gap-1'>
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20' />
            <Skeleton className='h-9 w-20' />
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px] w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-28' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px] w-full' />
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px] w-full' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-28' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-[200px] w-full' />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
