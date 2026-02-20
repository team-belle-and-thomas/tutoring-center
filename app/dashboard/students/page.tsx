import { getUserRole } from '@/lib/mock-api';

export default async function StudentsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all students
  return (
    <main>
      <h1>Students Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
