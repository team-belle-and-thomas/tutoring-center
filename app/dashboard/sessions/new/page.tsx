import { notFound } from 'next/navigation';
import { BookingScreen } from '@/components/parent-sessions/booking-screen';
import { getUserRole } from '@/lib/auth';
import { getCurrentParentCredits } from '@/lib/data/parent-credits';
import { getStudents } from '@/lib/data/students';
import { getSubjects } from '@/lib/data/subjects';
import { getTutorOptionsByIds } from '@/lib/data/tutor-options';
import { startOfDay } from 'date-fns';

export default async function NewSessionPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    notFound();
  }

  const [students, subjects, parentCredits] = await Promise.all([
    getStudents(role),
    getSubjects(role),
    getCurrentParentCredits(),
  ]);
  const tutorIds = subjects.flatMap(subject => subject.assignments.map(assignment => assignment.tutorId));
  const tutors = await getTutorOptionsByIds(role, tutorIds);

  const today = startOfDay(new Date());

  return (
    <BookingScreen
      parentId={parentCredits.parentId}
      initialBalance={parentCredits.balance}
      students={students.map(student => ({
        id: student.id,
        name: student.name || 'N/A',
        grade: student.grade,
      }))}
      subjects={subjects}
      tutors={tutors}
      todayStartMs={today.getTime()}
    />
  );
}
