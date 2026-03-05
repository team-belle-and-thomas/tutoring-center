'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateLabel, formatIsoDate, formatWeekRange, getNextWeekStart, getWeekStart } from '@/lib/date-utils';
import type { AvailableSession } from '@/lib/validators/sessions';
import { addDays, startOfDay } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { AvailableSessions } from './available-sessions';
import { CalendarDialog } from './calendar-dialog';
import { ChooseDateButtons, type ViewMode } from './choose-date-buttons';
import { ReservationDialog } from './reservation-dialog';
import { SelectionBadges } from './selection-badges';

export type PickDateProps = {
  subject: { id: number; category: string };
  tutor: { id: number; name: string };
  todayStartMs: number;
  onBackAction?: () => void;
  onConfirmAction?: (session: AvailableSession) => void;
};

export function PickDate({ subject, tutor, todayStartMs, onBackAction, onConfirmAction }: PickDateProps) {
  const today = new Date(todayStartMs);
  const thisWeekStart = getWeekStart(today);
  const nextWeekStart = getNextWeekStart(today);

  const [viewMode, setViewMode] = useState<ViewMode>('this-week');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AvailableSession | null>(null);
  const [sessions, setSessions] = useState<AvailableSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  if (loadError) throw loadError;

  function handleConfirm() {
    if (!selectedSession) return;
    onConfirmAction?.(selectedSession);
    setSelectedSession(null);
  }

  const loadSessions = useCallback(
    async (from: Date, to: Date) => {
      setLoadError(null);
      setIsLoading(true);

      const fromDate = formatIsoDate(from);
      const toDate = formatIsoDate(to);
      const search = new URLSearchParams({
        subject_id: String(subject.id),
        from: fromDate,
        to: toDate,
      });

      try {
        const response = await fetch(`/api/tutors/${tutor.id}/available-sessions?${search.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const body = (await response.json().catch(() => null)) as { data?: AvailableSession[]; error?: string } | null;

        if (!response.ok) {
          throw new Error(body?.error ?? 'Failed to load available sessions');
        }

        setSessions(Array.isArray(body?.data) ? body.data : []);
      } catch (error) {
        setLoadError(error instanceof Error ? error : new Error('Failed to load available sessions'));
      } finally {
        setIsLoading(false);
      }
    },
    [subject.id, tutor.id]
  );

  useEffect(() => {
    const start = startOfDay(new Date(todayStartMs));
    const weekStart = getWeekStart(start);
    void loadSessions(start, addDays(weekStart, 7));
  }, [loadSessions, todayStartMs]);

  function handleSelectDate(date: Date) {
    const d = startOfDay(date);
    setCustomDate(d);
    setViewMode('custom');
    setCalendarOpen(false);
    void loadSessions(d, addDays(d, 1));
  }

  const customDateLabel = customDate ? formatDateLabel(customDate) : null;

  return (
    <>
      <Card>
        <CardHeader>
          {onBackAction ? (
            <Button
              className='mb-2 w-fit rounded-2xl gap-1'
              size='sm'
              variant='ghost'
              onClick={onBackAction}
              type='button'
            >
              <ChevronLeft className='size-4' />
              Back
            </Button>
          ) : null}
          <CardTitle className='text-2xl font-bold'>When works best?</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <SelectionBadges subject={subject.category} tutor={tutor.name} />
          <div className='space-y-4'>
            <p className='font-semibold'>Choose week:</p>
            <ChooseDateButtons
              activeMode={viewMode}
              thisWeekLabel={formatWeekRange(thisWeekStart)}
              nextWeekLabel={formatWeekRange(nextWeekStart)}
              customDateLabel={customDateLabel}
              onSelectThisWeek={() => {
                setViewMode('this-week');
                void loadSessions(today, addDays(thisWeekStart, 7));
              }}
              onSelectNextWeek={() => {
                setViewMode('next-week');
                void loadSessions(nextWeekStart, addDays(nextWeekStart, 7));
              }}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='font-semibold'>Available times:</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailableSessions sessions={sessions} isLoading={isLoading} onSelectSession={setSelectedSession} />
        </CardContent>
      </Card>

      <CalendarDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        selectedDate={customDate}
        onSelectDate={handleSelectDate}
      />

      <ReservationDialog
        open={selectedSession !== null}
        onOpenChange={open => {
          if (!open) setSelectedSession(null);
        }}
        subject={subject.category}
        tutor={tutor.name}
        session={selectedSession}
        onConfirm={handleConfirm}
      />
    </>
  );
}
