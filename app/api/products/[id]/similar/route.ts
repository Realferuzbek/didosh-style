import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Returns up to 6 active products from the same category.
// Falls back to 6 recent products if the product has no category.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getAdminClient()

    // Get this product's category_id
    const { data: current } = await supabase
      .from('products')
      .select('category_id')
      .eq('id', params.id)
      .single()

    const base = supabase
      .from('products')
      .select('id, name, price, discount_price, images, sizes, is_featured, categories(name, slug)')
      .eq('is_active', true)
      .neq('id', params.id)
      .order('created_at', { ascending: false })
      .limit(6)

    let { data } = current?.category_id
      ? await base.eq('category_id', current.category_id)
      : await base

    // If same-category returned fewer than 2, fall back to latest products
    if (!data || data.length < 2) {
      const { data: fallback } = await supabase
        .from('products')
        .select('id, name, price, discount_price, images, sizes, is_featured, categories(name, slug)')
        .eq('is_active', true)
        .neq('id', params.id)
        .order('created_at', { ascending: false })
        .limit(6)
      data = fallback
    }

    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
