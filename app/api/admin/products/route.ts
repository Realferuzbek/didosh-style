import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

// GET — fetch ALL products (including inactive ones, for admin)
export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/admin/products]', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

// POST — create a new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Server-side validation — never trust client alone
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Mahsulot nomi majburiy" }, { status: 400 })
    }
    if (!body.price || Number(body.price) <= 0) {
      return NextResponse.json({ error: "Narx majburiy" }, { status: 400 })
    }
    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ error: "Kamida 1 ta rasm majburiy" }, { status: 400 })
    }
    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      return NextResponse.json({ error: "Kamida 1 ta o'lcham majburiy" }, { status: 400 })
    }

    // Only allow known fields — never spread raw body into DB
    const payload = {
      name:           body.name.trim(),
      description:    body.description?.trim() || null,
      price:          Number(body.price),
      discount_price: body.discount_price ? Number(body.discount_price) : null,
      category_id:    body.category_id || null,
      images:         body.images,
      sizes:          body.sizes,
      colors:         Array.isArray(body.colors) ? body.colors : [],
      stock:          Number(body.stock) ?? 0,
      is_featured:    Boolean(body.is_featured),
      is_active:      body.is_active !== false, // default true
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/products]', error)
    return NextResponse.json({ error: "Qo'shishda xatolik" }, { status: 500 })
  }
}

// PATCH — partial update (toggle is_active, update stock)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
    }

    // Only allow safe fields to be patched this way
    const allowedPatchFields = ['is_active', 'is_featured', 'stock']
    const safeUpdates: Record<string, unknown> = {}
    for (const key of allowedPatchFields) {
      if (key in updates) safeUpdates[key] = updates[key]
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "Yangilanadigan maydon yo'q" }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PATCH /api/admin/products]', error)
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}

// DELETE — remove a product by id
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/admin/products]', error)
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 })
  }
}