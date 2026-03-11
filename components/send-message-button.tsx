'use client';

import { Button } from '@/components/ui/button';

export function SendMessageButton({ email, label = 'Send Message' }: { email: string; label?: string }) {
  return (
    <Button asChild size='sm' variant='outline'>
      <a href={`mailto:${email}`}>{label}</a>
    </Button>
  );
}
