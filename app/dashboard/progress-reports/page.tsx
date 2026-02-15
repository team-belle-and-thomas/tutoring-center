import { getUserRole } from '../mock-api';

export default async function ProgressReportsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all progress reports
  return (
    <main>
      <h1>Progress Reports Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
