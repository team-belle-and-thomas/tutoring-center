import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    must('NEXT_PUBLIC_SUPABASE_URL'),
    must('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}

// call this in route handlers / server code since the above only works without RLS.
export function createSupabaseServiceClient() {
  return createClient<Database>(must('NEXT_PUBLIC_SUPABASE_URL'), must('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false },
  });
}
