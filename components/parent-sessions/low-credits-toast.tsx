import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

type LowCreditsToastProps = {
  credits: number;
  onAddCredits: () => void;
  onDismiss: () => void;
};

export function LowCreditsToast({ credits, onAddCredits, onDismiss }: LowCreditsToastProps) {
  return (
    <div className='fixed right-4 top-4 z-50 w-[calc(100%-2rem)] max-w-sm'>
      <div className='rounded-2xl border border-red-500 bg-muted p-3 shadow-lg'>
        <div className='flex items-start gap-2'>
          <AlertCircle className='mt-0.5 size-4 shrink-0 text-red-500' />
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-red-600'>Low credits warning</p>
            <p className='text-xs text-red-600'>
              You have {credits} {credits === 1 ? 'credit' : 'credits'} left.
            </p>
            <p className='text-xs text-red-600'>Please adding before proceeding with booking.</p>
            <Button className='mt-2 h-7 rounded-lg px-2 text-xs' onClick={onAddCredits} size='sm' type='button'>
              Add credits
            </Button>
          </div>
          <Button
            aria-label='Dismiss low credits warning'
            className='h-6 w-6 rounded-md p-0 text-red-600 hover:bg-red-100'
            onClick={onDismiss}
            size='icon'
            type='button'
            variant='ghost'
          >
            <X className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
