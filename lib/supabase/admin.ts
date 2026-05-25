import { createClient, SupabaseClient } from '@supabase/supabase-js'

// IMPORTANT: Only import this in server components or API routes.
// NEVER expose the service role key to the browser.

// Singleton: reuse the same client across requests within the same
// serverless function instance — avoids unnecessary re-instantiation.
let _client: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (_client) return _client
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  return _client
}
