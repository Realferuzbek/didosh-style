import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorized()
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSession(req)) return unauthorized()
  try {
  const body = await req.json()
  const bodyObj = body as Record<string, unknown>

    // ── Allowlist: only these columns can be updated via PUT ──────────────
    // Prevents mass-assignment attacks against internal DB columns.
    const ALLOWED: string[] = [
      'name', 'description', 'price', 'discount_price',
      'category_id', 'images', 'sizes', 'colors',
      'stock', 'is_featured', 'is_active', 'instagram_reel_url',
    ]
    const safeBody: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(bodyObj, key)) {
        safeBody[key] = bodyObj[key]
      }
    }
    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json(
        { error: 'Yangilanadigan maydon topilmadi' },
        { status: 400 }
      )
    }

    // Validate Instagram URL if provided
    if (safeBody.instagram_reel_url) {
      try {
        const parsed = new URL(safeBody.instagram_reel_url as string)
        if (!['www.instagram.com', 'instagram.com'].includes(parsed.hostname)) {
          return NextResponse.json({ error: "Instagram URL noto'g'ri" }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Instagram URL noto'g'ri" }, { status: 400 })
      }
    }

    // Validate numeric fields
    if ('price' in safeBody && (Number(safeBody.price) <= 0 || isNaN(Number(safeBody.price)))) {
      return NextResponse.json({ error: 'Narx noto\'g\'ri' }, { status: 400 })
    }
    if ('discount_price' in safeBody && safeBody.discount_price !== null) {
      const dp = Number(safeBody.discount_price)
      if (isNaN(dp) || dp <= 0) {
        return NextResponse.json({ error: 'Chegirma narxi noto\'g\'ri' }, { status: 400 })
      }
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .update(safeBody)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}
