import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()
  try {
    const body = await req.json()

    if (!body.name?.trim())
      return NextResponse.json({ error: 'Mahsulot nomi majburiy' }, { status: 400 })
    if (!body.price || Number(body.price) <= 0)
      return NextResponse.json({ error: 'Narx majburiy' }, { status: 400 })
    if (!Array.isArray(body.images) || body.images.length === 0)
      return NextResponse.json({ error: 'Kamida 1 ta rasm majburiy' }, { status: 400 })
    if (!Array.isArray(body.sizes) || body.sizes.length === 0)
      return NextResponse.json({ error: "Kamida 1 ta o'lcham majburiy" }, { status: 400 })

    // Validate Instagram URL domain if provided
    const reelUrl = body.instagram_reel_url?.trim() || null
    if (reelUrl) {
      try {
        const parsed = new URL(reelUrl)
        if (!['www.instagram.com', 'instagram.com'].includes(parsed.hostname)) {
          return NextResponse.json({ error: "Instagram URL noto'g'ri" }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Instagram URL noto'g'ri" }, { status: 400 })
      }
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        name:               body.name.trim(),
        description:        body.description?.trim() || null,
        price:              Number(body.price),
        discount_price:     body.discount_price ? Number(body.discount_price) : null,
        category_id:        body.category_id || null,
        images:             body.images,
        sizes:              body.sizes,
        colors:             Array.isArray(body.colors) ? body.colors : [],
        stock:              Number(body.stock) || 0,
        is_featured:        Boolean(body.is_featured),
        is_active:          body.is_active !== false,
        instagram_reel_url: reelUrl,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Qo'shishda xatolik" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id || typeof id !== 'string')
      return NextResponse.json({ error: 'ID kerak' }, { status: 400 })

    // Only allow safe patch fields — prevents overwriting protected columns
    const allowed = ['is_active', 'is_featured', 'stock']
    const safe: Record<string, unknown> = {}
    for (const k of allowed) { if (k in updates) safe[k] = updates[k] }
    if (Object.keys(safe).length === 0)
      return NextResponse.json({ error: "Yangilanadigan maydon yo'q" }, { status: 400 })

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products').update(safe).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()
  try {
    const { id } = await req.json()
    if (!id || typeof id !== 'string')
      return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
    const supabase = getAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 })
  }
}
