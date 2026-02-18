import { getUserRole } from '@/lib/mock-api';

export default async function CreditTransactionsPage() {
  const role = await getUserRole();
  // based on user role we will either filter or display all credit transactions
  return (
    <main>
      <h1>Credit Transactions Page</h1>
      <p>You are logged in as {role}</p>
    </main>
  );
}
