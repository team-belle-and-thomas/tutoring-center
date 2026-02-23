import { notFound } from 'next/navigation';
import { BookingScreen } from '@/components/parents-sessions/booking-screen';
import { getWeekStart } from '@/lib/date-utils';
import { getUserRole } from '@/lib/mock-api';
import { mockAvailableSessions } from '@/lib/mock-available-sessions';
import { addDays, startOfDay } from 'date-fns';

export default async function NewSessionPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    notFound();
  }

  const today = startOfDay(new Date());
  const thisWeekStart = getWeekStart(today);
  const initialSessions = mockAvailableSessions.filter(s => {
    const d = new Date(s.scheduled_at);
    return d >= today && d < addDays(thisWeekStart, 7);
  });

  return (
    <BookingScreen
      subject={{ id: 1, category: 'Math' }}
      tutor={{ id: 1, name: 'Obi-Wan Kenobi' }}
      todayStartMs={today.getTime()}
      initialSessions={initialSessions}
    />
  );
}
