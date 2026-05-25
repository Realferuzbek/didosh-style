import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public endpoint — categories ordered for FilterBar pills.
export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
