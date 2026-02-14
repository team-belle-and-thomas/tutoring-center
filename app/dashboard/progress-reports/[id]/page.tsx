export default async function SingleProgressReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Progress Report {id} Page </h1>
    </main>
  );
}
