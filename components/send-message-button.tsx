'use client';

import { Button } from '@/components/ui/button';

interface SendMessageButtonProps {
  email: string;
  label?: string;
}

export function SendMessageButton({ email, label = 'Send Message' }: SendMessageButtonProps) {
  return (
    <Button asChild size='sm' variant='outline'>
      <a href={`mailto:${email}`}>{label}</a>
    </Button>
  );
}
