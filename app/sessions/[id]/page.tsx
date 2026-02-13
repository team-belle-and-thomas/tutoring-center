export default async function ParentsSingleSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Parent&apos;s Session {id} Page </h1>
    </main>
  );
}
