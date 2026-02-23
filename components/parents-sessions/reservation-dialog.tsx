import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatSessionDateTime } from '@/lib/date-utils';
import type { AvailableSession } from '@/lib/mock-available-sessions';
import { CalendarIcon, UserRoundIcon } from 'lucide-react';

type ReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: string;
  tutor: string;
  session: AvailableSession | null;
  onConfirm: () => void;
};

export function ReservationDialog({ open, onOpenChange, subject, tutor, session, onConfirm }: ReservationDialogProps) {
  const timeLabel = session ? formatSessionDateTime(new Date(session.scheduled_at)) : '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='sm:max-w-md'>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Your Reservation</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className='space-y-1 pt-1'>
              <p className='text-base font-semibold text-foreground'>{subject}</p>
              <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                <CalendarIcon className='size-4 shrink-0' />
                {timeLabel} · 60 min
              </p>
              <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                <UserRoundIcon className='size-4 shrink-0' />
                {tutor}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='space-y-4 rounded-lg border text-sm text-muted-foreground'>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-foreground'>Cancellation policy</p>
            <p>You won&apos;t be charged if you need to cancel, we ask that you do so at least 24 hours in advance.</p>
          </div>
          <div>
            <p className='mb-1 text-xs font-semibold uppercase tracking-wide text-foreground'>About</p>
            <p>
              We meet one-on-one in a distraction-free setting. Bring any materials that relate to what we will cover.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Reserve Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
