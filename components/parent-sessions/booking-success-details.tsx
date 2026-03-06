import type { Reservation } from '@/components/parent-sessions/booking-flow';
import { Separator } from '@/components/ui/separator';
import { formatSessionDateTime } from '@/lib/date-utils';

type BookingSuccessDetailsProps = {
  reservation: Reservation;
  confirmationCode: string;
  purchasedCredits?: number;
};

export function BookingSuccessDetails({ reservation, confirmationCode, purchasedCredits }: BookingSuccessDetailsProps) {
  const wasPurchased = typeof purchasedCredits === 'number';

  return (
    <>
      <Separator className='my-1 w-full' />
      <ul className='w-full space-y-1 text-sm text-muted-foreground text-left list-disc list-inside'>
        <li>
          <span className='font-semibold text-foreground'>Student:</span> {reservation.student.name}
        </li>
        <li>
          <span className='font-semibold text-foreground'>When:</span>{' '}
          {formatSessionDateTime(new Date(reservation.session.scheduled_at))}
        </li>
        <li>
          <span className='font-semibold text-foreground'>Subject:</span> {reservation.subject.category}
        </li>
        <li>
          <span className='font-semibold text-foreground'>Tutor:</span> {reservation.tutor.name}
        </li>
        {wasPurchased ? (
          <li>
            <span className='font-semibold text-foreground'>Purchased credits:</span> {purchasedCredits}
          </li>
        ) : null}
      </ul>
      <Separator className='my-1 w-full' />
      <p className='text-xs text-muted-foreground'>
        Confirmation code:{' '}
        <span className='font-mono font-semibold tracking-widest text-foreground'>{confirmationCode}</span>
      </p>
    </>
  );
}
