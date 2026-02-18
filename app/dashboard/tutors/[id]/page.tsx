import { getUserRole } from '@/lib/mock-api';

export default async function SingleTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  return (
    <main>
      <h1>Tutor {id} Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
