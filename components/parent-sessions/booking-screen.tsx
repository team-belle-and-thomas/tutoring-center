'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AddCredits, generateConfirmationCode, type CreditsPurchase } from '@/components/add-credits';
import { purchaseCredits, reserveSessionCredits } from '@/components/parent-sessions/booking-credits';
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
import type { CreditBalance } from '@/lib/credit-balances';
import type { SubjectOption, SubjectSelection } from '@/lib/data/subjects';
import { formatSessionDateTime } from '@/lib/date-utils';

type BookingState =
  | { step: 'student' }
  | { step: 'subject'; student: StudentOption }
  | { step: 'tutor'; student: StudentOption; selection: SubjectSelection }
  | { step: 'date'; student: StudentOption; selection: SubjectSelection; tutor: TutorOption; subjectId: number }
  | { step: 'credits'; reservation: Reservation; selection: SubjectSelection }
  | {
      step: 'success';
      reservation: Reservation;
      purchase?: CreditsPurchase;
      confirmationCode: string;
      warning?: string;
    };

type BookingScreenProps = {
  parentId: number;
  initialBalance: CreditBalance;
  students: StudentOption[];
  subjects: SubjectOption[];
  tutors: TutorOption[];
  todayStartMs: number;
};

const getFirstName = (fullName: string) => fullName.trim().split(/\s+/)[0] || '';
const BOOKING_CREDIT_COST = 1;

function combineMessages(...messages: Array<string | undefined>) {
  const uniqueMessages = Array.from(new Set(messages.filter(Boolean)));
  return uniqueMessages.length > 0 ? uniqueMessages.join(' ') : undefined;
}

export function BookingScreen({
  parentId,
  initialBalance,
  students,
  subjects,
  tutors,
  todayStartMs,
}: BookingScreenProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
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

    const body = (await response.json().catch(() => null)) as { data?: { id?: number }; error?: string } | null;
    if (!response.ok) {
      throw new Error(body?.error ?? 'Could not complete booking right now. Please try again.');
    }

    const sessionId = body?.data?.id;
    if (typeof sessionId !== 'number') {
      throw new Error('Session was created without an id.');
    }

    return sessionId;
  }

  async function completeBooking(
    reservation: Reservation,
    currentBalance: CreditBalance,
    purchase?: CreditsPurchase,
    warning?: string
  ) {
    setCheckoutError(null);

    await createSession(reservation);
    let successWarning = warning;

    try {
      const reservationResult = await reserveSessionCredits(parentId, BOOKING_CREDIT_COST, currentBalance);
      setBalance(reservationResult.balance);
      successWarning = combineMessages(successWarning, reservationResult.warning);
    } catch {
      successWarning = combineMessages(
        successWarning,
        'Session booked, but credits could not be moved to pending automatically. Refresh before booking another session.'
      );
    }

    setBookingState({
      step: 'success',
      reservation,
      purchase,
      confirmationCode: generateConfirmationCode(),
      warning: successWarning,
    });
    router.refresh();
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

                void completeBooking(reservation, balance).catch(error => {
                  const message =
                    error instanceof Error ? error.message : 'Could not complete booking right now. Please try again.';
                  setCheckoutError(message);
                });
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
              let purchaseResult: {
                balance: CreditBalance;
                warning?: string;
              } | null = null;

              try {
                purchaseResult = await purchaseCredits(
                  parentId,
                  bookingState.reservation.student.id,
                  purchase.pkg.credits,
                  balance
                );
                setBalance(purchaseResult.balance);
                await completeBooking(
                  bookingState.reservation,
                  purchaseResult.balance,
                  purchase,
                  purchaseResult.warning
                );
              } catch {
                setCheckoutError(
                  purchaseResult
                    ? 'Credits were added, but the reservation could not be completed. Please choose a new time and try again.'
                    : 'Could not complete the credit purchase right now. Please try again.'
                );
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
                ? 'Your credits purchase and session reservation both succeeded. One credit is now reserved for this booking.'
                : 'Your session reservation succeeded and your booking is now confirmed.'}
            </p>
            {bookingState.warning ? (
              <p className='w-full rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800'>
                {bookingState.warning}
              </p>
            ) : null}
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
