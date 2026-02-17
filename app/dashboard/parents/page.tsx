import { getUserRole } from '../mock-api';

export default async function ParentsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all parents
  return (
    <main>
      <h1>Parents Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
