import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SessionDetailLoading() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <Skeleton className='h-8 w-[300px] mb-2' />
        <Skeleton className='h-4 w-[200px]' />
      </CardHeader>
      <CardContent className='space-y-6'>
        <section>
          <Skeleton className='h-6 w-32 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
        <section>
          <Skeleton className='h-6 w-20 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
        <section>
          <Skeleton className='h-6 w-24 mb-3' />
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
