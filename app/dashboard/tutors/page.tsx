import { getUserRole } from '@/lib/mock-api';

export default async function TutorsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all tutors
  return (
    <main>
      <h1>Tutors Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
