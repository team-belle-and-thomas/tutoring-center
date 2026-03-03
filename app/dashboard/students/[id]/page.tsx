import Link from 'next/link';
import { forbidden, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStudent } from '@/lib/data/students';
import { formatSessionDay, formatSessionTime } from '@/lib/date-utils';
import { getUserRole } from '@/lib/mock-api';
import type { SessionStatus } from '@/lib/validators/sessions';
import { format, parseISO } from 'date-fns';
import { CreditCard, TrendingUp } from 'lucide-react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
const MISSING_VALUE = '\u2014';

type StudentSession = Awaited<ReturnType<typeof getStudent>>['sessions'][number];

const STATUS_VARIANTS: Record<SessionStatus, BadgeVariant> = {
  Scheduled: 'outline',
  Completed: 'default',
  Canceled: 'destructive',
  'Pending-Notes': 'secondary',
  'No-show': 'destructive',
  Rescheduled: 'secondary',
};

const getStatusVariant = (status: SessionStatus): BadgeVariant => STATUS_VARIANTS[status];

function RecentSessionsTable({ sessions }: { sessions: StudentSession[] }) {
  if (sessions.length === 0) {
    return <p className='text-center text-muted-foreground py-8 text-sm'>No sessions yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Tutor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map(session => {
          const start = new Date(session.scheduled_at);
          const end = new Date(session.ends_at);
          return (
            <TableRow key={session.id}>
              <TableCell>{formatSessionDay(start)}</TableCell>
              <TableCell className='whitespace-nowrap'>
                {formatSessionTime(start)} - {formatSessionTime(end)}
              </TableCell>
              <TableCell>{session.subject_category}</TableCell>
              <TableCell>{session.tutor_name}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>
              </TableCell>
              <TableCell>
                <Button size='sm' asChild className='text-xs'>
                  <Link href={`/dashboard/sessions/${session.id}`}>Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function SingleStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (Number.isNaN(Number(id))) notFound();

  const role = await getUserRole();
  if (role === 'tutor') forbidden();

  const student = await getStudent(Number(id), role);

  return (
    <main>
      <div className='p-2 md:p-8 space-y-6'>
        {/* Profile */}
        <Card className='w-full'>
          <CardHeader className='bg-muted/10 pb-6'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
              <div>
                <div className='flex items-center gap-2 flex-wrap'>
                  <CardTitle className='text-2xl font-bold'>{student.name}</CardTitle>
                  {student.grade !== MISSING_VALUE && <Badge variant='secondary'>Grade {student.grade}</Badge>}
                </div>
                <p className='text-muted-foreground mt-1 text-sm'>Student Profile</p>
              </div>
              {role === 'admin' && (
                <div>
                  <p className='text-xs font-bold uppercase text-muted-foreground'>Student ID</p>
                  <p className='text-md'>{id}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className='px-6 pt-6 space-y-6 text-sm'>
            <div>
              <h4 className='font-bold text-primary text-lg mb-4'>Contact Information</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='uppercase text-muted-foreground'>Email</p>
                  <p className='font-medium'>{student.email}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Phone</p>
                  <p className='font-medium'>{student.phone}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className='font-bold text-primary text-lg mb-4'>Academic Information</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='uppercase text-muted-foreground'>Grade</p>
                  <p className='font-medium'>{student.grade}</p>
                </div>
                <div>
                  <p className='uppercase text-muted-foreground'>Date of Birth</p>
                  <p className='font-medium'>
                    {student.birth_date ? format(parseISO(student.birth_date), 'MMMM d, yyyy') : MISSING_VALUE}
                  </p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className='font-bold text-primary text-lg mb-2'>Learning Goals</h4>
              <p className='leading-relaxed text-muted-foreground'>
                {student.learning_goals ?? 'No learning goals have been set.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card className='w-full'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-lg font-bold'>Recent Sessions</CardTitle>
              <Badge variant='secondary'>{student.sessions.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <RecentSessionsTable sessions={student.sessions} />
          </CardContent>
        </Card>

        {/* Placeholders */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-bold text-muted-foreground'>Credit History</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <CreditCard size={36} className='mb-3 opacity-20' />
              <p className='text-sm font-medium'>Coming soon</p>
              <p className='text-xs mt-1'>Credit transactions will appear here</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-bold text-muted-foreground'>Progress Reports</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <TrendingUp size={36} className='mb-3 opacity-20' />
              <p className='text-sm font-medium'>Coming soon</p>
              <p className='text-xs mt-1'>Session progress and metrics will appear here</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
