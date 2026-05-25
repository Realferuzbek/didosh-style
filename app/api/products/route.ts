import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '48'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0'),  0)
    const categorySlug = searchParams.get('category')?.trim()

    const supabase = getAdminClient()

    // Resolve category slug → id if needed (one extra query, prevents
    // sending all data just to filter client-side)
    let categoryId: string | null = null
    if (categorySlug && categorySlug !== 'barchasi') {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      categoryId = cat?.id ?? null
    }

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
