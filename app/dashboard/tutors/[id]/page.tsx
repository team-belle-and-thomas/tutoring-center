import { DM_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTutor, getUserRole } from '@/lib/mock-api';
import { CircleCheck, CircleX } from 'lucide-react';

const dm_sans = DM_Sans({ subsets: ['latin'] });
export default async function SingleTutorPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  if (Number.isNaN(Number(id))) {
    notFound();
  }
  const tutor = await getTutor(Number(id));
  return (
    <main className={dm_sans.className}>
      <p className='mb-4'>You are logged in as {role}</p>
      <Card className='w-full md:w-1/2 overflow-hidden'>
        <CardHeader className='bg-muted/10 pb-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <CardTitle className='text-2xl font-bold flex items-center gap-x-2'>
                <span>
                  {tutor.first_name} {tutor.last_name}
                </span>
                <span className='inline-flex items-center mt-0.5 text-green-600'>
                  {tutor.verified ? <CircleCheck size={22} /> : <CircleX size={22} className='text-red-600' />}
                </span>
                <span className='text-muted-foreground mt-1 text-sm'>{tutor.verified ? 'Verified' : 'Pending'}</span>
              </CardTitle>
              <p className='text-muted-foreground mt-1 text-md'>{tutor.tagline}</p>
            </div>
            {role === 'admin' && (
              <div>
                <p className='text-xs font-bold uppercase text-muted-foreground'>Tutor ID</p>
                <p className='text-md'>{id}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-4 text-sm md:text-md px-6'>
          <div>
            <h4 className='font-bold text-primary text-lg mb-4'>Contact Information</h4>
            <div className='space-y-4 grid grid-cols-2 gap-4'>
              <div>
                <p className='uppercase text-muted-foreground'>Email</p>
                <p className='font-medium'>{tutor.email}</p>
              </div>
              <div>
                <p className='uppercase text-muted-foreground'>Phone</p>
                <p className='font-medium'>{tutor.phone}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-bold text-primary mb-4 text-lg'>Credentials</h4>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='uppercase text-muted-foreground'>Education</p>
                <p className='font-medium'>{tutor.education}</p>
              </div>
              <div>
                <p className='uppercase text-muted-foreground'>Experience</p>
                <p className='font-medium'>{tutor.yoe} Years</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-bold text-primary mb-2'>Professional Bio</h4>
            <p className='leading-relaxed text-muted-foreground'>{tutor.bio}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
