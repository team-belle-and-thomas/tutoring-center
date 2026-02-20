import { getUserRole } from '@/lib/mock-api';

export default async function SessionsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all progress reports
  return (
    <main>
      <h1>Sessions Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
