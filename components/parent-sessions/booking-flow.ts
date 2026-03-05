import type { StudentOption } from '@/components/parent-sessions/pick-student';
import type { TutorOption } from '@/components/parent-sessions/pick-tutors';
import type { AvailableSession } from '@/lib/validators/sessions';

export type Reservation = {
  student: StudentOption;
  subject: { id: number; category: string };
  tutor: TutorOption;
  session: AvailableSession;
};

export function shouldStartAtSubjectStep(students: StudentOption[]) {
  return students.length === 1;
}

type SubjectSelectionLike = {
  assignments: Array<{ tutorId: number }>;
};

export function selectTutorsForSubject(tutors: TutorOption[], selection: SubjectSelectionLike) {
  const tutorIds = new Set(selection.assignments.map(assignment => assignment.tutorId));
  return tutors.filter(tutor => tutorIds.has(tutor.id));
}

export function shouldBlockForCredits(availableCredits: number) {
  return availableCredits === 0;
}
