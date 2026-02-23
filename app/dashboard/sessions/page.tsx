import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserRole } from '@/lib/mock-api';

export default async function SessionsPage() {
  const role = await getUserRole();

  if (role === 'parent') {
    return (
      <main>
        <h1>Sessions</h1>
        <Button asChild>
          <Link href='/dashboard/sessions/new'>New Session</Link>
        </Button>
        {/* TODO: list of past/upcoming sessions for parent's children */}
      </main>
    );
  }

  return (
    <main>
      <h1>Sessions</h1>
      {/* TODO: admin sessions list with search/filter/sort */}
    </main>
  );
}
