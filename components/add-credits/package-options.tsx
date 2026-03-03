import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CircleCheck, Clock } from 'lucide-react';

export type Package = {
  id: number;
  label: string;
  credits: number;
  price: number;
  perHr: number;
  popular?: boolean;
  savings?: number;
};

type PackageOptionsProps = {
  packages: Package[];
  selectedPkg: Package['id'];
  onSelect: (id: Package['id']) => void;
};

export function PackageOptions({ packages, selectedPkg, onSelect }: PackageOptionsProps) {
  return (
    <div className='flex flex-col gap-8 sm:grid sm:grid-cols-3 sm:gap-6'>
      {packages.map(p => (
        <button
          key={p.id}
          type='button'
          onClick={() => onSelect(p.id)}
          className={cn(
            'relative flex items-center justify-between rounded-lg border-2 px-4 py-3 sm:py-6 transition-colors sm:flex-col sm:gap-2',
            selectedPkg === p.id ? 'border-primary' : 'border-border hover:border-primary/50'
          )}
        >
          {p.popular && (
            <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
              <Badge>Most Popular</Badge>
            </div>
          )}

          {p.savings && (
            <div className='absolute -bottom-3 left-1/2 -translate-x-1/2'>
              <Badge className='bg-green-100 text-green-700'>Save ${p.savings}</Badge>
            </div>
          )}

          <div className='flex min-w-20 items-center gap-1.5 sm:mb-2'>
            <span className='text-2xl font-bold sm:text-3xl'>{p.credits}</span>
            <span className='text-sm font-semibold text-muted-foreground'>credits</span>
          </div>

          <div className='hidden sm:flex sm:items-center sm:gap-1.5 sm:mb-3'>
            <Clock className='w-3.5 h-3.5' />
            <span className='text-sm text-muted-foreground'>{p.credits} hours of tutoring</span>
          </div>

          <div className='sm:flex sm:w-full sm:items-center sm:justify-between sm:border-t-2 sm:border-border sm:pt-3'>
            <span className='text-md sm:text-lg font-semibold'>${p.price}</span>
            <span className='hidden sm:inline text-sm text-muted-foreground'>${p.perHr}/hr</span>
          </div>

          {selectedPkg === p.id && (
            <CircleCheck className='hidden text-primary sm:absolute sm:right-3 sm:top-3 sm:block' />
          )}
        </button>
      ))}
    </div>
  );
}
