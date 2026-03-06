import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { startOfDay } from 'date-fns';

type CalendarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export function CalendarDialog({ open, onOpenChange, selectedDate, onSelectDate }: CalendarDialogProps) {
  const today = startOfDay(new Date());

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='top-2 left-1/2 w-[calc(100%-1rem)] -translate-x-1/2 translate-y-0 sm:top-[50%] sm:w-fit sm:translate-y-[-50%]'>
        <AlertDialogHeader>
          <AlertDialogTitle className='font-semibold'>Choose custom date</AlertDialogTitle>
          <AlertDialogDescription>Pick a date to view available sessions.</AlertDialogDescription>
        </AlertDialogHeader>
        <Calendar
          mode='single'
          selected={selectedDate ?? undefined}
          onSelect={date => {
            if (!date) return;
            onSelectDate(date);
          }}
          disabled={date => date < today}
        />
        <AlertDialogFooter>
          <AlertDialogCancel className='bg-primary text-white'>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
