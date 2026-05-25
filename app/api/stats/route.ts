import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public endpoint — returns biz_raqamlarda stats for StatsSection.
// Replaces the direct browser Supabase client call.
export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'biz_raqamlarda')
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ value: data?.value ?? null })
  } catch {
    return NextResponse.json({ value: null }, { status: 200 })
  }
}
