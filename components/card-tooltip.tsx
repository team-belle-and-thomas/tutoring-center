'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export function CardTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info size={16} className='text-muted-foreground/60 hover:text-muted-foreground cursor-default shrink-0' />
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-56 text-center'>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
