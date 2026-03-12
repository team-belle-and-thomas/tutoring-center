import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserRole } from '@/lib/auth';

export default async function DashboardLoadingSkeleton() {
  const role = await getUserRole();

  return (
    <main className='p-2 md:p-8'>
      <DashboardHeaderSkeleton />

      {role === 'admin' && <AdminDashboardSkeleton />}
      {role === 'tutor' && <TutorDashboardSkeleton />}
      {role === 'parent' && <ParentDashboardSkeleton />}
    </main>
  );
}

function DashboardHeaderSkeleton() {
  return (
    <>
      <div className='mb-1 flex items-center gap-2'>
        <Skeleton className='h-10 w-44' />
      </div>
      <Skeleton className='mb-6 h-7 w-56' />
    </>
  );
}

function ParentDashboardSkeleton() {
  return (
    <section>
      <Skeleton className='mb-4 h-9 w-64' />

      <div className='space-y-6'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex flex-1 flex-col gap-2 sm:max-w-50'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full rounded-full' />
            </div>
            <div className='flex flex-1 flex-col gap-2 sm:max-w-[280px]'>
              <Skeleton className='h-4 w-16' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-10 w-full rounded-full sm:w-[180px]' />
                <Skeleton className='h-4 w-24' />
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-20' />
            <div className='flex flex-wrap gap-1'>
              <Skeleton className='h-8 w-18 rounded-full' />
              <Skeleton className='h-8 w-24 rounded-full' />
              <Skeleton className='h-8 w-28 rounded-full' />
              <Skeleton className='h-8 w-28 rounded-full' />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <ChartCardSkeleton />
          <ChartCardSkeleton />
          <ChartCardSkeleton />
          <ChartCardSkeleton />
        </div>
      </div>
    </section>
  );
}

function TutorDashboardSkeleton() {
  return (
    <section>
      <Skeleton className='mb-4 h-8 w-52' />
      <Card className='overflow-hidden border border-zinc-300'>
        <CardHeader className='border-b bg-stone-200/70 px-4 py-3'>
          <div className='grid grid-cols-[1.2fr_1.6fr_1fr_1fr] gap-4'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-16' />
          </div>
        </CardHeader>
        <CardContent className='space-y-0 p-0'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='grid grid-cols-[1.2fr_1.6fr_1fr_1fr] gap-4 border-b px-4 py-4 last:border-b-0'>
              <Skeleton className='h-5 w-28' />
              <Skeleton className='h-5 w-44' />
              <Skeleton className='h-5 w-24' />
              <Skeleton className='h-9 w-28 rounded-full' />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className='space-y-8'>
      <section>
        <Skeleton className='mb-3 h-3 w-10' />
        <div className='grid grid-cols-2 gap-4'>
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </section>

      <section>
        <Skeleton className='mb-3 h-3 w-14' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </section>

      <section className='space-y-4'>
        <Skeleton className='h-7 w-48' />
        <Card className='overflow-hidden border border-zinc-300'>
          <CardHeader className='border-b bg-stone-200/70 px-4 py-3'>
            <div className='grid grid-cols-4 gap-4'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-16' />
            </div>
          </CardHeader>
          <CardContent className='space-y-0 p-0'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='grid grid-cols-4 gap-4 border-b px-4 py-4 last:border-b-0'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-5 w-36' />
                <Skeleton className='h-5 w-20' />
                <Skeleton className='h-8 w-24 rounded-full' />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className='rounded-3xl border border-zinc-300 bg-sidebar/60'>
      <CardContent className='space-y-3 p-5'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-16' />
        <Skeleton className='h-4 w-28' />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card className='overflow-hidden rounded-[1.75rem] border border-zinc-300'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-28' />
          <Skeleton className='h-4 w-4 rounded-full' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-10' />
          <Skeleton className='h-4 w-4 rounded-full' />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className='h-[200px] w-full rounded-[1.5rem]' />
      </CardContent>
    </Card>
  );
}
