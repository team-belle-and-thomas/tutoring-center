export default async function SingleCreditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main>
      <h1>Credit Transaction {id} Page </h1>
    </main>
  );
}
