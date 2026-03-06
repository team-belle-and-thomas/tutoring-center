import { useState, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Package } from './package-options';

type PaymentForm = {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  zip: string;
};

const EMPTY_PAYMENT: PaymentForm = {
  cardHolder: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
  zip: '',
};

type Props = {
  pkg: Package;
  buttonLabel?: string;
  onPurchase: () => Promise<void> | void;
  onBackAction?: () => void;
};

export function PaymentForm({ pkg, buttonLabel = 'Add Credits', onPurchase, onBackAction }: Props) {
  const [form, setForm] = useState<PaymentForm>(EMPTY_PAYMENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field: keyof PaymentForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    // pass eslint; remove when backend implemented
    void pkg;
    try {
      setIsSubmitting(true);
      // TODO(backend):
      // one DB transaction
      // 1) POST /api/credit-transactions (type: 'Purchase')
      // 2) PUT /api/credit-balances (increment amount_available)
      await onPurchase();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
      <div className='space-y-3'>
        <Label htmlFor='cardHolder' className='font-semibold'>
          Cardholder Name
        </Label>
        <Input
          id='cardHolder'
          placeholder='Jane Smith'
          value={form.cardHolder}
          onChange={e => update('cardHolder', e.target.value)}
        />
      </div>

      <div className='space-y-3'>
        <Label htmlFor='cardNumber' className='font-semibold'>
          Card Number
        </Label>
        <Input
          id='cardNumber'
          placeholder='1234 5678 9012 3456'
          value={form.cardNumber}
          onChange={e => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
            const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
            update('cardNumber', formatted);
          }}
          inputMode='numeric'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-3'>
          <Label htmlFor='expiry' className='font-semibold'>
            Expiry
          </Label>
          <Input
            id='expiry'
            placeholder='MM / YY'
            value={form.expiry}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
              const formatted = digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
              update('expiry', formatted);
            }}
            inputMode='numeric'
          />
        </div>

        <div className='space-y-3'>
          <Label htmlFor='cvv' className='font-semibold'>
            CVV
          </Label>
          <Input
            id='cvv'
            placeholder='123'
            value={form.cvv}
            onChange={e => update('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
            inputMode='numeric'
          />
        </div>
      </div>

      <div className='max-w-40 space-y-3'>
        <Label htmlFor='zip' className='font-semibold'>
          Billing ZIP
        </Label>
        <Input
          id='zip'
          placeholder='12345'
          value={form.zip}
          onChange={e => update('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
          inputMode='numeric'
        />
      </div>

      <div className='pt-2 flex flex-col gap-2 sm:flex-row sm:items-center'>
        <Button
          type='submit'
          size='lg'
          className='w-full sm:w-fit text-md sm:text-lg sm:py-6 font-semibold'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : buttonLabel}
        </Button>
        {onBackAction ? (
          <Button
            type='button'
            variant='ghost'
            size='lg'
            className='w-full sm:w-fit text-md sm:text-lg sm:py-6'
            onClick={onBackAction}
          >
            Back
          </Button>
        ) : null}
      </div>
    </form>
  );
}
