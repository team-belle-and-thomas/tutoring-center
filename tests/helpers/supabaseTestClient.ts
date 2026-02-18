import { createClient } from "@supabase/supabase-js"
import type { Database } from "../../lib/supabase/types"

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

/**
 * Test only Supabase client.
 * Uses the same publishable key the app uses in .env.
 */
export function createSupabaseTestClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

