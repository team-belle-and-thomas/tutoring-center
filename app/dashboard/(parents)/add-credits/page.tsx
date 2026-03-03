import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/mock-api';

export default async function AddCreditsPage() {
  const role = await getUserRole();

  if (role !== 'parent') {
    forbidden();
  }

  return <></>;
}
