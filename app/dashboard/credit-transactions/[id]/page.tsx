import Link from 'next/link';
import { forbidden, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getUserRole } from '@/lib/auth';
import { TIMEZONE } from '@/lib/constants';
import { getCreditTransaction } from '@/lib/data/credit-transactions';
import { formatSessionDay, formatSessionTime } from '@/lib/date-utils';

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

const MISSING_VALUE = '—';

function getTypeBadgeVariant(type: string): BadgeVariant {
  switch (type) {
    case 'Purchase':
      return 'default';
    case 'Session Debit':
      return 'destructive';
    case 'Refund':
      return 'outline';
    case 'Adjustment':
      return 'secondary';
    case 'Cancellation Fee':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function formatTransactionDateTime(dateString: string) {
  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))} ET`;
}

export default async function SingleCreditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  if (role === 'tutor') forbidden();

  const { id } = await params;
  const transactionId = Number(id);

  if (Number.isNaN(transactionId)) notFound();

  const transaction = await getCreditTransaction(transactionId, role);
  const session = transaction.session;
  const linkedSessionId = transaction.session_id;

  return (
    <main className='p-2 md:p-8'>
      <div className='space-y-6'>
        <Card className='w-full'>
          <CardHeader className='bg-muted/10 pb-6'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <CardTitle className='text-2xl font-bold'>Credit Transaction #{transaction.id}</CardTitle>
                  <Badge variant={getTypeBadgeVariant(transaction.type)}>{transaction.type}</Badge>
                </div>
                <p className='mt-1 text-sm text-muted-foreground'>Transaction details shown in Eastern Time.</p>
              </div>
              <div className='text-sm'>
                <p className='text-xs font-bold uppercase text-muted-foreground'>Occurred At</p>
                <p className='font-medium'>{formatTransactionDateTime(transaction.created_at)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-6 px-6 pt-6 text-sm'>
            <div>
              <h4 className='mb-4 text-lg font-bold text-primary'>Transaction Summary</h4>
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <div>
                  <p className='uppercase text-muted-foreground'>Amount</p>
                  <p className={transaction.amount >= 0 ? 'font-medium text-green-600' : 'font-medium text-red-600'}>
                    {transaction.amount >= 0 ? `+${transaction.amount}` : transaction.amount}
                  </p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Balance After</p>
                  <p className='font-medium'>{transaction.balance_after}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Transaction Type</p>
                  <p className='font-medium'>{transaction.type}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Linked Session ID</p>
                  <p className='font-medium'>{linkedSessionId ?? MISSING_VALUE}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className={`grid gap-6 ${role === 'admin' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg font-bold'>Student</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 text-sm'>
                  <div>
                    <p className='uppercase text-muted-foreground'>Name</p>
                    <p className='font-medium'>{transaction.student.name}</p>
                  </div>
                  <div>
                    <p className='uppercase text-muted-foreground'>Email</p>
                    <p className='font-medium'>{transaction.student.email}</p>
                  </div>
                  <div>
                    <p className='uppercase text-muted-foreground'>Grade</p>
                    <p className='font-medium'>{transaction.student.grade}</p>
                  </div>
                  <Button asChild size='sm'>
                    <Link href={`/dashboard/students/${transaction.student.id}`}>View Student</Link>
                  </Button>
                </CardContent>
              </Card>

              {role === 'admin' && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg font-bold'>Parent</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    <div>
                      <p className='uppercase text-muted-foreground'>Name</p>
                      <p className='font-medium'>{transaction.parent.name}</p>
                    </div>
                    <div>
                      <p className='uppercase text-muted-foreground'>Email</p>
                      <p className='font-medium'>{transaction.parent.email}</p>
                    </div>
                    <div>
                      <p className='uppercase text-muted-foreground'>Phone</p>
                      <p className='font-medium'>{transaction.parent.phone}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='w-full'>
          <CardHeader>
            <CardTitle className='text-lg font-bold'>Linked Session</CardTitle>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className='grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-5'>
                <div>
                  <p className='uppercase text-muted-foreground'>Date</p>
                  <p className='font-medium'>{formatSessionDay(new Date(session.scheduled_at))}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Time</p>
                  <p className='font-medium'>
                    {formatSessionTime(new Date(session.scheduled_at))} - {formatSessionTime(new Date(session.ends_at))}
                  </p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Subject</p>
                  <p className='font-medium'>{session.subject_name}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Tutor</p>
                  <p className='font-medium'>{session.tutor_name}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Status</p>
                  <div className='pt-0.5'>
                    <Badge
                      variant={
                        session.status === 'Completed'
                          ? 'default'
                          : session.status === 'Canceled'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
                <div className='md:col-span-2 xl:col-span-5'>
                  <Button asChild size='sm'>
                    <Link href={`/dashboard/sessions/${session.id}`}>View Session</Link>
                  </Button>
                </div>
              </div>
            ) : linkedSessionId ? (
              <div className='space-y-3 text-sm'>
                <p className='text-muted-foreground'>
                  Session #{linkedSessionId} is linked to this transaction, but its details are unavailable.
                </p>
                <Button asChild size='sm'>
                  <Link href={`/dashboard/sessions/${linkedSessionId}`}>View Session</Link>
                </Button>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>No session is linked to this credit transaction.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
