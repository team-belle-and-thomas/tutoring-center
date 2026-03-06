import { Badge } from '@/components/ui/badge';

type SelectionBadgesProps = {
  subject: string;
  tutor: string;
};

export function SelectionBadges({ subject, tutor }: SelectionBadgesProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Badge variant='secondary' className='px-3 py-1 text-xs font-medium'>
        {subject}
      </Badge>
      <Badge variant='secondary' className='px-3 py-1 text-xs font-medium'>
        {tutor}
      </Badge>
      <Badge variant='secondary' className='px-3 py-1 text-xs font-medium'>
        {/* MVP default */}
        60 min
      </Badge>
    </div>
  );
}
