'use client';

import { useState } from 'react';
import { AvailableSessions } from '@/components/parents-sessions/available-sessions';
import { CalendarDialog } from '@/components/parents-sessions/calendar-dialog';
import { ReservationDialog } from '@/components/parents-sessions/reservation-dialog';
import { SelectionBadges } from '@/components/parents-sessions/selection-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateLabel, formatWeekRange, getNextWeekStart, getWeekStart } from '@/lib/date-utils';
import { mockAvailableSessions, type AvailableSession } from '@/lib/mock-available-sessions';
import { addDays, startOfDay } from 'date-fns';
import { ChooseDateButtons, type ViewMode } from './choose-date-buttons';

type BookingScreenProps = {
  subject: { id: number; category: string };
  tutor: { id: number; name: string };
  todayStartMs: number;
  initialSessions: AvailableSession[];
};

export function BookingScreen({ subject, tutor, todayStartMs, initialSessions }: BookingScreenProps) {
  const today = new Date(todayStartMs);
  const thisWeekStart = getWeekStart(today);
  const nextWeekStart = getNextWeekStart(today);

  const [viewMode, setViewMode] = useState<ViewMode>('this-week');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AvailableSession | null>(null);
  const [sessions, setSessions] = useState<AvailableSession[]>(initialSessions);

  function handleConfirm() {
    // TODO: POST
    // body: {
    //   tutor_id:     tutor.id,
    //   subject_id:   subject.id,
    //   student_id:   student.id,
    //   parent_id:    parent.id,
    //   scheduled_at: selectedSession.scheduled_at,
    //   ends_at:      selectedSession.ends_at,
    // }
  }

  function loadSessions(from: Date, to: Date) {
    // TODO: GET
    setSessions(
      mockAvailableSessions.filter(s => {
        const d = new Date(s.scheduled_at);
        return d >= from && d < to;
      })
    );
  }

  function handleSelectDate(date: Date) {
    const d = startOfDay(date);
    setCustomDate(d);
    setViewMode('custom');
    setCalendarOpen(false);
    loadSessions(d, addDays(d, 1));
  }

  const customDateLabel = customDate ? formatDateLabel(customDate) : null;

  return (
    <main className='mx-auto max-w-3xl space-y-6 p-6'>
      <Card>
        <CardHeader>
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
                loadSessions(today, addDays(thisWeekStart, 7));
              }}
              onSelectNextWeek={() => {
                setViewMode('next-week');
                loadSessions(nextWeekStart, addDays(nextWeekStart, 7));
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
          <AvailableSessions sessions={sessions} onSelectSession={setSelectedSession} />
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
    </main>
  );
}
