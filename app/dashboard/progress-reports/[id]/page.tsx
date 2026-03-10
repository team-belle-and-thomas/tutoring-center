import { getUserRole } from '@/lib/auth';

export default async function SingleProgressReportPage({ params }: { params: Promise<{ id: string }> }) {
  const role = await getUserRole();
  const { id } = await params;
  return (
    <main>
      <div className='p-2 md:p-8'>
        <div className='mb-6'>
          <h1 className='font-serif text-3xl text-primary'>Progress Report {id}</h1>
          <p className='text-muted-foreground mt-1 text-sm'>You are logged in as {role}</p>
        </div>
      </div>
    </main>
  );
}
