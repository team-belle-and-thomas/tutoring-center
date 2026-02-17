import "dotenv/config"
import { describe, it, expect } from "vitest"
import { createSupabaseTestClient } from "../helpers/supabaseTestClient"

describe("supabase db connection test", () => {
  it("can query sessions table", async () => {
    const supabase = createSupabaseTestClient()

    const { data, error } = await supabase
      .from("sessions")
      .select("id,scheduled_at,status")
      .order("scheduled_at", { ascending: false })
      .limit(1)

    // If this fails with "permission denied", your connection is fine and something is blocking it. 
    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })
})

