export default async function SingleProgressReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className='p-2 md:p-8'>
      <div className='mb-6'>
        <h1 className='font-serif text-3xl text-primary'>Progress Report {id}</h1>
      </div>
    </main>
  );
}
