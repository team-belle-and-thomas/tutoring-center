import { getUserRole } from '../../../mock-api';

export default async function SingleParentPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  return (
    <main>
      <h1>Parent {id} Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
