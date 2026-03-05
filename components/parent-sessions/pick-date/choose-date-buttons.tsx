import { Button } from '@/components/ui/button';

export type ViewMode = 'this-week' | 'next-week' | 'custom';

type ChooseDateButtonsProps = {
  activeMode: ViewMode;
  thisWeekLabel: string;
  nextWeekLabel: string;
  customDateLabel: string | null;
  onSelectThisWeek: () => void;
  onSelectNextWeek: () => void;
  onOpenCalendar: () => void;
};

type DateButtonProps = {
  label: string;
  rangeLabel: string;
  active: boolean;
  onClick: () => void;
};

function DateButton({ label, rangeLabel, active, onClick }: DateButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      className='h-auto min-h-12 flex-col items-start gap-0.5 rounded-xl px-3 py-2 whitespace-normal md:min-h-14 md:px-4 md:py-3'
      onClick={onClick}
    >
      <span className='text-xs md:text-sm font-semibold'>{label}</span>
      <span className='text-xs opacity-75'>{rangeLabel}</span>
    </Button>
  );
}

export function ChooseDateButtons({
  activeMode,
  thisWeekLabel,
  nextWeekLabel,
  customDateLabel,
  onSelectThisWeek,
  onSelectNextWeek,
  onOpenCalendar,
}: ChooseDateButtonsProps) {
  return (
    <div className='grid grid-cols-3 gap-2'>
      <DateButton
        label='This week'
        rangeLabel={thisWeekLabel}
        active={activeMode === 'this-week'}
        onClick={onSelectThisWeek}
      />
      <DateButton
        label='Next week'
        rangeLabel={nextWeekLabel}
        active={activeMode === 'next-week'}
        onClick={onSelectNextWeek}
      />
      <DateButton
        label='Choose date'
        rangeLabel={customDateLabel ?? 'Pick a different date'}
        active={activeMode === 'custom'}
        onClick={onOpenCalendar}
      />
    </div>
  );
}
