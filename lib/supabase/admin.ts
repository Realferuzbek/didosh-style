import { createClient } from '@supabase/supabase-js'

// IMPORTANT: Only import this in server components or API routes.
// NEVER expose service role key to the browser.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
