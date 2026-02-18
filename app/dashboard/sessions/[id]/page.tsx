import { getUserRole } from '@/lib/mock-api';

export default async function ParentsSingleSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  return (
    <main>
      <h1>Parent&apos;s Session {id} Page </h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
