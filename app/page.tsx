import { supabase } from "../lib/supabase/client";

export default async function Home() {
  // Example: fetch all rows from 'tutors' table
  const { data, error } = await supabase.from('tutors').select('*');

  console.log({ data, error });

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Supabase Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </main>
  );
}

