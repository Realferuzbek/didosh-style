import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public endpoint — fetches a specific set of products by ID array.
// Used by the Favorites page to avoid loading the entire catalog.
export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json()
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([], { status: 200 })
    }
    // Hard cap to prevent abuse
    const safeIds = ids.slice(0, 100).filter((id: unknown) => typeof id === 'string')
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .in('id', safeIds)
      .eq('is_active', true)
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
