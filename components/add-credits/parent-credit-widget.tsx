// TODO: remove 'use client'
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Coins } from 'lucide-react';
import { useCredits } from './credits-context';

const LOW_THRESHOLD = 2;
const MEDIUM_THRESHOLD = 5;

function balanceColor(amount: number) {
  if (amount < LOW_THRESHOLD) return 'text-red-600';
  if (amount < MEDIUM_THRESHOLD) return 'text-amber-500';
  return '';
}

function borderColor(amount: number) {
  if (amount < LOW_THRESHOLD) return 'border-red-500';
  if (amount < MEDIUM_THRESHOLD) return 'border-amber-500';
  return 'border-border';
}

// TODO: add async
export function ParentCreditWidget() {
  // TODO: Remove and replace useCredits with actual backend call
  const { balance } = useCredits();
  const { amount_available } = balance;

  return (
    <div className='px-2 py-1'>
      <div className={`rounded-lg bg-muted/30 border border-border p-3 space-y-2 ${borderColor(amount_available)}`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <Coins size={14} className='text-muted-foreground' />
            <span className='text-xs uppercase tracking-wide text-muted-foreground font-semibold'>Tutor Credits</span>
          </div>
          {amount_available < MEDIUM_THRESHOLD && (
            <AlertCircle size={13} className={amount_available < LOW_THRESHOLD ? 'text-red-500' : 'text-amber-500'} />
          )}
        </div>
        <div>
          <p className={`text-xl font-bold ${balanceColor(amount_available)}`}>
            {amount_available} <span className='text-sm'>{amount_available > 1 ? 'hours' : 'hour'} available</span>
          </p>
          {amount_available < LOW_THRESHOLD && (
            <p className='text-xs text-red-500 mt-0.5'>Low credits - please consider topping up.</p>
          )}
        </div>
        <Button asChild size='sm' className='w-full'>
          <Link href='/dashboard/add-credits'>+ Add Credits</Link>
        </Button>
      </div>
    </div>
  );
}
