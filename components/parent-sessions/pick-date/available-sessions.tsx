import { Button } from '@/components/ui/button';
import { formatSessionDay, formatSessionTime } from '@/lib/date-utils';
import type { AvailableSession } from '@/lib/validators/sessions';

type AvailableSessionsProps = {
  sessions: AvailableSession[];
  isLoading?: boolean;
  onSelectSession: (session: AvailableSession) => void;
};

export function AvailableSessions({ sessions, isLoading, onSelectSession }: AvailableSessionsProps) {
  if (isLoading) {
    return (
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
        Loading sessions...
      </div>
    );
  }

  if (sessions.length === 0) {
    return <p className='text-sm text-muted-foreground'>No sessions available.</p>;
  }

  return (
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
      {sessions.map(session => {
        const d = new Date(session.scheduled_at);
        const timeLabel = formatSessionTime(d);
        const dayLabel = formatSessionDay(d);

        return (
          <Button
            key={session.scheduled_at}
            variant='default'
            size='lg'
            className='h-auto min-h-14 flex-col items-center gap-0.5 rounded-2xl py-2.5'
            onClick={() => onSelectSession(session)}
          >
            <span className='text-sm md:text-md font-semibold md:font-bold'>{timeLabel}</span>
            <span className='text-xs md:text-sm text-primary-foreground md:opacity-75'>{dayLabel}</span>
          </Button>
        );
      })}
    </div>
  );
}
