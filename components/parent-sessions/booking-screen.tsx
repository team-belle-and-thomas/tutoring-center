'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddCredits, generateConfirmationCode, type CreditsPurchase } from '@/components/add-credits';
import { useCredits } from '@/components/add-credits/credits-context';
import {
  selectTutorsForSubject,
  shouldBlockForCredits,
  shouldStartAtSubjectStep,
  type Reservation,
} from '@/components/parent-sessions/booking-flow';
import { BookingSuccessDetails } from '@/components/parent-sessions/booking-success-details';
import { LowCreditsToast } from '@/components/parent-sessions/low-credits-toast';
import { PickDate } from '@/components/parent-sessions/pick-date';
import { PickStudent, type StudentOption } from '@/components/parent-sessions/pick-student';
import { PickSubject } from '@/components/parent-sessions/pick-subjects';
import { PickTutor, type TutorOption } from '@/components/parent-sessions/pick-tutors';
import { SuccessCard } from '@/components/success-card';
import { Card, CardContent } from '@/components/ui/card';
import type { SubjectOption, SubjectSelection } from '@/lib/data/subjects';
import { formatSessionDateTime } from '@/lib/date-utils';

type BookingState =
  | { step: 'student' }
  | { step: 'subject'; student: StudentOption }
  | { step: 'tutor'; student: StudentOption; selection: SubjectSelection }
  | { step: 'date'; student: StudentOption; selection: SubjectSelection; tutor: TutorOption; subjectId: number }
  | { step: 'credits'; reservation: Reservation; selection: SubjectSelection }
  | { step: 'success'; reservation: Reservation; purchase?: CreditsPurchase; confirmationCode: string };

type BookingScreenProps = {
  students: StudentOption[];
  subjects: SubjectOption[];
  tutors: TutorOption[];
  todayStartMs: number;
};

const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || '';

export function BookingScreen({ students, subjects, tutors, todayStartMs }: BookingScreenProps) {
  const router = useRouter();
  const { balance, deductCredits } = useCredits();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isLowCreditsToastDismissed, setIsLowCreditsToastDismissed] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>(() => {
    if (shouldStartAtSubjectStep(students)) {
      return { step: 'subject', student: students[0] };
    }
    return { step: 'student' };
  });

  useEffect(() => {
    if (balance.amount_available > 0) {
      setIsLowCreditsToastDismissed(false);
    }
  }, [balance.amount_available]);

  if (students.length === 0) {
    return <main className='mx-auto max-w-3xl p-6'>No students found.</main>;
  }

  const lowCreditsToast =
    balance.amount_available === 0 && !isLowCreditsToastDismissed ? (
      <LowCreditsToast
        credits={balance.amount_available}
        onAddCredits={() => router.push('/dashboard/add-credits')}
        onDismiss={() => setIsLowCreditsToastDismissed(true)}
      />
    ) : null;

  async function createSession(reservation: Reservation) {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutor_id: reservation.tutor.id,
        student_id: reservation.student.id,
        subject_id: reservation.subject.id,
        slot_units: 1,
        scheduled_at: reservation.session.scheduled_at,
        ends_at: reservation.session.ends_at,
      }),
    });

    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      throw new Error(body?.error ?? 'Could not complete booking right now. Please try again.');
    }
  }

  async function completeBooking(reservation: Reservation, purchase?: CreditsPurchase) {
    setCheckoutError(null);

    try {
      await createSession(reservation);
      deductCredits(1);
      // TODO(backend): write credit_transactions and credit_balances updates in the same server transaction.
      setBookingState({
        step: 'success',
        reservation,
        purchase,
        confirmationCode: generateConfirmationCode(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not complete booking right now. Please try again.';
      setCheckoutError(message);
      throw error instanceof Error ? error : new Error(message);
    }
  }

  switch (bookingState.step) {
    case 'student':
      return (
        <>
          {lowCreditsToast}
          <PickStudent
            students={students}
            onSelect={student => setBookingState({ step: 'subject', student })}
            onBack={() => router.back()}
          />
        </>
      );
    case 'subject':
      return (
        <>
          {lowCreditsToast}
          <PickSubject
            subjects={subjects}
            studentFirstName={getFirstName(bookingState.student.name)}
            onSelectAction={selection => setBookingState({ step: 'tutor', student: bookingState.student, selection })}
            onBackAction={() => {
              if (students.length === 1) {
                router.back();
              } else {
                setBookingState({ step: 'student' });
              }
            }}
          />
        </>
      );
    case 'tutor': {
      const tutorOptions = selectTutorsForSubject(tutors, bookingState.selection);

      return (
        <>
          {lowCreditsToast}
          <PickTutor
            subject={bookingState.selection.subject}
            assignments={bookingState.selection.assignments}
            tutors={tutorOptions}
            onSelect={({ tutor, subjectId }) =>
              setBookingState({
                step: 'date',
                student: bookingState.student,
                selection: bookingState.selection,
                tutor,
                subjectId,
              })
            }
            onBack={() => setBookingState({ step: 'subject', student: bookingState.student })}
          />
        </>
      );
    }
    case 'date':
      return (
        <>
          {lowCreditsToast}
          {checkoutError ? (
            <p className='mx-auto mb-2 w-full max-w-3xl rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
              {checkoutError}
            </p>
          ) : null}
          <main className='mx-auto max-w-3xl space-y-6 p-6'>
            <PickDate
              subject={{ id: bookingState.subjectId, category: bookingState.selection.subject.category }}
              tutor={{ id: bookingState.tutor.id, name: bookingState.tutor.name }}
              todayStartMs={todayStartMs}
              onBackAction={() =>
                setBookingState({ step: 'tutor', student: bookingState.student, selection: bookingState.selection })
              }
              onConfirmAction={session => {
                const reservation: Reservation = {
                  student: bookingState.student,
                  subject: { id: bookingState.subjectId, category: bookingState.selection.subject.category },
                  tutor: bookingState.tutor,
                  session,
                };

                if (shouldBlockForCredits(balance.amount_available)) {
                  setBookingState({ step: 'credits', reservation, selection: bookingState.selection });
                  return;
                }

                void completeBooking(reservation).catch(() => undefined);
              }}
            />
          </main>
        </>
      );
    case 'credits':
      return (
        <>
          {lowCreditsToast}
          {checkoutError ? (
            <p className='mx-auto mb-2 w-full max-w-3xl rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
              {checkoutError}
            </p>
          ) : null}
          <AddCredits
            submitButtonText='Buy credits and book session'
            showSuccessCard={false}
            onBackAction={() =>
              setBookingState({
                step: 'date',
                student: bookingState.reservation.student,
                selection: bookingState.selection,
                tutor: bookingState.reservation.tutor,
                subjectId: bookingState.reservation.subject.id,
              })
            }
            onPurchaseCompleteAction={async purchase => {
              try {
                await completeBooking(bookingState.reservation, purchase);
              } catch {
                setBookingState({
                  step: 'date',
                  student: bookingState.reservation.student,
                  selection: bookingState.selection,
                  tutor: bookingState.reservation.tutor,
                  subjectId: bookingState.reservation.subject.id,
                });
              }
            }}
          >
            <Card>
              <CardContent className='pt-6 text-sm text-muted-foreground space-y-1'>
                <p className='font-semibold text-foreground'>Pending reservation</p>
                <p>Student: {bookingState.reservation.student.name}</p>
                <p>When: {formatSessionDateTime(new Date(bookingState.reservation.session.scheduled_at))}</p>
                <p>Subject: {bookingState.reservation.subject.category}</p>
                <p>Tutor: {bookingState.reservation.tutor.name}</p>
              </CardContent>
            </Card>
          </AddCredits>
        </>
      );
    case 'success': {
      const wasPurchased = Boolean(bookingState.purchase);
      return (
        <>
          {lowCreditsToast}
          <SuccessCard
            title={wasPurchased ? 'Purchase and reservation complete' : 'Reservation complete'}
            buttonLabel='View Sessions'
            href='/dashboard/sessions'
          >
            <p className='text-muted-foreground'>
              {wasPurchased
                ? 'Your credits purchase and session reservation both succeeded. We deducted 1 credit for this booking.'
                : 'Your session reservation succeeded and your booking is now confirmed.'}
            </p>
            <BookingSuccessDetails
              reservation={bookingState.reservation}
              confirmationCode={bookingState.confirmationCode}
              purchasedCredits={bookingState.purchase?.pkg.credits}
            />
          </SuccessCard>
        </>
      );
    }
  }
}
