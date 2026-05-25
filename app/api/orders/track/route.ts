import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // ── Rate limit: 20 tracking lookups per IP per minute ────────────────────
  const ip = getClientIp(req.headers as Headers)
  const limit = checkRateLimit(`track:${ip}`, 20, 60_000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Juda ko'p so'rov. Iltimos, kuting." },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } },
    )
  }

  const number = req.nextUrl.searchParams.get('number')?.trim().toUpperCase()
  if (!number) {
    return NextResponse.json({ error: 'Buyurtma raqami kerak' }, { status: 400 })
  }

  // Validate format — prevents probing with arbitrary strings
  if (!/^[A-Z]{2}-\d{4,8}$/.test(number)) {
    return NextResponse.json({ error: "Noto'g'ri format" }, { status: 400 })
  }

  try {
    const supabase = getAdminClient()

    // Return only essential status fields — delivery_address intentionally excluded
    // to prevent customer address enumeration attacks
    const { data, error } = await supabase
      .from('orders')
      .select('order_number, status, total_amount, delivery_city, created_at')
      .eq('order_number', number)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
