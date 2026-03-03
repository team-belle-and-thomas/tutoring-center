import Link from 'next/link';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2Icon } from 'lucide-react';
import type { Route } from 'next';

type SuccessCardProps = {
  title: string;
  children?: ReactNode;
  buttonLabel?: string;
  href?: Route;
};

export function SuccessCard({
  title,
  children,
  buttonLabel = 'Back to Dashboard',
  href = '/dashboard',
}: SuccessCardProps) {
  return (
    <main className='mx-auto max-w-3xl p-6'>
      <Card>
        <CardHeader className='items-center space-y-2 text-center'>
          <CheckCircle2Icon className='mx-auto size-8 text-primary' />
          <CardTitle className='text-2xl font-bold'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-2 text-center'>{children}</CardContent>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href={href} draggable={false}>
              {buttonLabel}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
