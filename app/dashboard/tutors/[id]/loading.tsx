import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function TutorDetailLoading() {
  return (
    <Card className='w-full md:w-1/2 overflow-hidden'>
      <CardHeader className='bg-muted/10 pb-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <Skeleton className='h-8 w-[250px] mb-2' />
            <Skeleton className='h-4 w-[180px]' />
          </div>
          <Skeleton className='h-6 w-[80px]' />
        </div>
      </CardHeader>
      <CardContent className='grid grid-cols-1 gap-4 text-sm md:text-md px-6'>
        <div>
          <Skeleton className='h-6 w-[150px] mb-4' />
          <div className='space-y-4 grid grid-cols-2 gap-4'>
            <div>
              <Skeleton className='h-4 w-[40px] mb-2' />
              <Skeleton className='h-4 w-[120px]' />
            </div>
            <div>
              <Skeleton className='h-4 w-[40px] mb-2' />
              <Skeleton className='h-4 w-[100px]' />
            </div>
          </div>
        </div>
        <div>
          <Skeleton className='h-6 w-[150px] mb-4' />
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Skeleton className='h-4 w-[60px] mb-2' />
              <Skeleton className='h-4 w-[180px]' />
            </div>
            <div>
              <Skeleton className='h-4 w-[60px] mb-2' />
              <Skeleton className='h-4 w-[60px]' />
            </div>
          </div>
        </div>
        <div>
          <Skeleton className='h-6 w-[120px] mb-4' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
