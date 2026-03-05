import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { getStudentsForGradeForm, getSubjectsForGradeForm } from '@/lib/data/grades';
import { GradeForm } from './grade-form';

export default async function GradesPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    forbidden();
  }

  const [students, subjects] = await Promise.all([getStudentsForGradeForm(role), getSubjectsForGradeForm()]);

  return (
    <main>
      <div className='p-2 md:p-8'>
        <div className='mb-6'>
          <h1 className='font-serif text-3xl text-primary'>Add Grade</h1>
          <p className='text-muted-foreground mt-1 text-sm'>Record a grade for your child</p>
        </div>

        <GradeForm students={students} subjects={subjects} />
      </div>
    </main>
  );
}
