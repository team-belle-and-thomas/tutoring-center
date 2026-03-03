'use client';

import { useState } from 'react';
import { useCredits } from '@/components/add-credits/credits-context';
import { PackageOptions, type Package } from '@/components/add-credits/package-options';
import { PaymentForm } from '@/components/add-credits/payment-form';
import { SuccessCard } from '@/components/success-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const PACKAGES: Package[] = [
  { id: 1, label: 'Starter', credits: 5, price: 60, perHr: 12 },
  { id: 2, label: 'Standard', credits: 10, price: 110, perHr: 11, popular: true, savings: 10 },
  { id: 3, label: 'Pro', credits: 20, price: 200, perHr: 10, savings: 40 },
];

export function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function AddCreditsPageClient() {
  const { addCredits } = useCredits();
  const [purchasedPkg, setPurchasedPkg] = useState<{ pkg: Package; confirmationCode: string } | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package['id']>(2);

  const pkg = PACKAGES.find(p => p.id === selectedPkg)!;

  async function handlePurchase() {
    // TODO(backend): implement credit purchase
    addCredits(pkg.credits);
    setPurchasedPkg({ pkg, confirmationCode: generateConfirmationCode() });
  }

  if (purchasedPkg) {
    const { pkg: p, confirmationCode } = purchasedPkg;
    return (
      <SuccessCard title='Credits purchased!' buttonLabel='View Dashboard'>
        <p className='text-muted-foreground'>
          <span className='font-semibold text-foreground'>{p.credits} credits</span> have been added to your available
          balance and are ready to use for tutoring sessions.
        </p>
        <Separator className='my-1 w-full' />
        <ul className='w-full space-y-1 text-sm text-muted-foreground text-left list-disc list-inside'>
          <li>Each credit covers one hour of tutoring.</li>
          <li>Credits are automatically deducted when a session is completed.</li>
          <li>Unused credits never expire and carry over month to month.</li>
          <li>Refunds and adjustments are reflected in your credit history.</li>
        </ul>
        <Separator className='my-1 w-full' />
        <p className='text-xs text-muted-foreground'>
          Confirmation code:{' '}
          <span className='font-mono font-semibold tracking-widest text-foreground'>{confirmationCode}</span>
        </p>
      </SuccessCard>
    );
  }

  return (
    <div className='mx-auto w-full max-w-3xl p-8'>
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-semibold'>Add tutoring credits</CardTitle>
        </CardHeader>
        <CardContent className='space-y-12'>
          <PackageOptions packages={PACKAGES} selectedPkg={selectedPkg} onSelect={setSelectedPkg} />
          <PaymentForm pkg={pkg} onPurchase={handlePurchase} />
        </CardContent>
      </Card>
    </div>
  );
}
