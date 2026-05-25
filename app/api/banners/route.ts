import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Public endpoint — returns active banners for the FeaturedBanner component.
// If no active banners exist, the component falls back to hardcoded content.
export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('banners')
      .select('id, image_url, title, subtitle')
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(1)
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
