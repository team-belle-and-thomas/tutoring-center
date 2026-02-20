import { getUserRole } from '@/lib/mock-api';

export default async function DashboardPage() {
  const role = await getUserRole();
  return (
    <main>
      <h1>Dashboard Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
