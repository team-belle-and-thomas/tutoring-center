'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddCredits } from '@/components/add-credits';
import { purchaseCredits, type CreditMutationResult } from '@/components/parent-sessions/booking-credits';
import type { CreditBalance } from '@/lib/credit-balances';

type AddCreditsPageClientProps = {
  parentId: number;
  initialBalance: CreditBalance;
  defaultStudentId: number | null;
};

export function AddCreditsPageClient({ parentId, initialBalance, defaultStudentId }: AddCreditsPageClientProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(initialBalance);
  const [warning, setWarning] = useState<string | null>(null);

  if (defaultStudentId === null) {
    return (
      <main className='mx-auto max-w-3xl p-8 text-sm text-muted-foreground'>
        Add a student before purchasing credits.
      </main>
    );
  }

  return (
    <AddCredits
      successNotice={warning}
      onPurchaseCompleteAction={async purchase => {
        const result: CreditMutationResult = await purchaseCredits(
          parentId,
          defaultStudentId,
          purchase.pkg.credits,
          balance
        );

        setBalance(result.balance);
        setWarning(result.warning ?? null);
        router.refresh();
      }}
    />
  );
}
