import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/mock-api';
import { AddCreditsPageClient } from './add-credits-page-client';

export default async function AddCreditsPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    forbidden();
  }

  return <AddCreditsPageClient />;
}
