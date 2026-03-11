import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function NewSessionButton() {
  return (
    <div className='px-2 pt-1'>
      <Button asChild className='w-full'>
        <Link href='/dashboard/sessions/new'>+ New Session</Link>
      </Button>
    </div>
  );
}
