import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyUserToken, extractBearerToken } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export const runtime = 'nodejs'

interface ClientCartItem {
  product_id: string
  image: string
  size: string
  color: string | null
  quantity: number
  // price/discount_price from client are intentionally ignored — fetched from DB
}

export async function POST(req: NextRequest) {
  try {
    // ── IP rate limit: 5 orders per IP per 10 minutes ─────────────────────
    const ip = getClientIp(req.headers as Headers)
    const ipLimit = checkRateLimit(`order:ip:${ip}`, 5, 10 * 60 * 1000)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Juda ko'p so'rov. Iltimos, biroz kuting." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipLimit.retryAfterMs / 1000)) } },
      )
    }

    const body = await req.json()
    const {
      customer_name,
      customer_phone,
      delivery_city,
      delivery_address,
      notes,
      items,
      delivery_lat,
      delivery_lng,
      delivery_maps_link,
    } = body

    // ── Validate required fields ───────────────────────────────────────────
    if (
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !delivery_city?.trim() ||
      !delivery_address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Barcha majburiy maydonlarni to'ldiring" },
        { status: 400 },
      )
    }

    // ── Per-phone rate limit: 3 orders per phone per 10 minutes ───────────
    const phoneDigits = String(customer_phone).replace(/\D/g, '')
    const phoneLimit = checkRateLimit(`order:phone:${phoneDigits}`, 3, 10 * 60 * 1000)
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { error: "Bu raqamdan juda ko'p buyurtma yuborildi. Iltimos, kuting." },
        { status: 429 },
      )
    }

    // ── Resolve authenticated user (optional) ─────────────────────────────
    let userId: string | null = null
    const bearerToken = extractBearerToken(req.headers.get('Authorization'))
    if (bearerToken) {
      const payload = await verifyUserToken(bearerToken)
      if (payload) userId = payload.userId
    }

    const supabase = getAdminClient()

    // ── Fetch REAL prices from DB — never trust client-provided prices ─────
    const productIds = (items as ClientCartItem[])
      .map((i) => i.product_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    if (productIds.length === 0) {
      return NextResponse.json({ error: 'Mahsulotlar topilmadi' }, { status: 400 })
    }

    const { data: dbProducts, error: priceError } = await supabase
      .from('products')
      .select('id, name, price, discount_price, is_active')
      .in('id', productIds)

    if (priceError) throw priceError

    const priceMap = new Map((dbProducts ?? []).map((p) => [p.id, p]))

    // Build validated item list with server-side prices
    const validatedItems: Array<{
      product_id: string
      name: string
      image: string
      size: string
      color: string | null
      quantity: number
      price: number
      discount_price: number | null
    }> = []

    for (const item of items as ClientCartItem[]) {
      const db = priceMap.get(item.product_id)
      if (!db) {
        return NextResponse.json(
          { error: `Mahsulot topilmadi: ${item.product_id}` },
          { status: 400 },
        )
      }
      if (!db.is_active) {
        return NextResponse.json(
          { error: `"${db.name}" mahsuloti hozirda mavjud emas` },
          { status: 400 },
        )
      }
      validatedItems.push({
        product_id: item.product_id,
        name:           db.name,
        image:          typeof item.image === 'string' ? item.image : '',
        size:           typeof item.size  === 'string' ? item.size  : '',
        color:          typeof item.color === 'string' ? item.color : null,
        quantity:       Math.max(1, Math.floor(Number(item.quantity) || 1)),
        price:          db.price,                // ← always from DB
        discount_price: db.discount_price ?? null, // ← always from DB
      })
    }

    // ── Total from verified DB prices ─────────────────────────────────────
    const totalAmount = validatedItems.reduce(
      (sum, i) => sum + (i.discount_price ?? i.price) * i.quantity,
      0,
    )

    // ── Generate order number ─────────────────────────────────────────────
    const { data: orderNumber, error: numError } = await supabase.rpc('generate_order_number')
    if (numError) throw numError

    // ── Insert order ──────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number:       orderNumber,
        customer_name:      customer_name.trim(),
        customer_phone:     customer_phone.trim(),
        delivery_city:      delivery_city.trim(),
        delivery_address:   delivery_address.trim(),
        delivery_lat:       delivery_lat   ?? null,
        delivery_lng:       delivery_lng   ?? null,
        delivery_maps_link: delivery_maps_link ?? null,
        notes:              notes?.trim() || null,
        total_amount:       totalAmount,
        status:             'pending',
        user_id:            userId,
      })
      .select('id, order_number')
      .single()

    if (orderError) throw orderError

    // ── Insert order items ────────────────────────────────────────────────
    const { error: itemsError } = await supabase.from('order_items').insert(
      validatedItems.map((i) => ({
        order_id:      order.id,
        product_id:    i.product_id,
        product_name:  i.name,
        product_image: i.image,
        size:          i.size,
        color:         i.color,
        quantity:      i.quantity,
        price_at_order: i.discount_price ?? i.price,
      })),
    )
    if (itemsError) throw itemsError

    // ── Batch stock decrement — single atomic RPC, no N+1, no race condition
    const { error: stockError } = await supabase.rpc('decrement_stock_batch', {
      product_ids: validatedItems.map((i) => i.product_id),
      quantities:  validatedItems.map((i) => i.quantity),
    })
    if (stockError) {
      // Non-fatal: order already committed, log but do not fail the response
      console.error('[orders] stock decrement failed:', stockError)
    }

    return NextResponse.json({ order_number: order.order_number }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/orders]', error)
    return NextResponse.json({ error: 'Buyurtma yaratishda xatolik' }, { status: 500 })
  }
}
