'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const message = error.message || 'Unable to load this section. Please try again';
  return (
    <main className='min-h-full w-full p-6 md:p-8'>
      <h1 className='text-2xl font-semibold text-primary'>Something went wrong</h1>
      <p className='mt-3 text-sm text-muted-foreground'>{message}</p>
      <div className='mt-4 flex items-center gap-3'>
        <Button variant='default' size='sm' onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
