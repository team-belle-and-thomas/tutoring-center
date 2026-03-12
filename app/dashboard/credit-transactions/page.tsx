import { forbidden } from 'next/navigation';
import { getUserRole } from '@/lib/auth';
import { getCreditTransactions } from '@/lib/data/credit-transactions';
import { CreditTransactionsTable } from './columns';

export default async function CreditTransactionsPage() {
  const role = await getUserRole();

  if (role === 'tutor') forbidden();

  const result = await getCreditTransactions(role);

  const description = role === 'admin' ? 'All credit transactions' : 'Your transaction history';

  return (
    <main className='p-2 md:p-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='font-serif text-3xl text-primary'>Credit Transactions</h1>
          <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
        </div>
      </div>

      <CreditTransactionsTable role={role} data={result} />
    </main>
  );
}
