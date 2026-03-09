import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { getCurrentParentCredits } from '@/lib/data/parent-credits';
import { getStudents } from '@/lib/data/students';
import { AddCreditsPageClient } from './add-credits-page-client';

export default async function AddCreditsPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    forbidden();
  }

  const [parentCredits, students] = await Promise.all([getCurrentParentCredits(), getStudents(role)]);

  return (
    <AddCreditsPageClient
      parentId={parentCredits.parentId}
      initialBalance={parentCredits.balance}
      defaultStudentId={students[0]?.id ?? null}
    />
  );
}
