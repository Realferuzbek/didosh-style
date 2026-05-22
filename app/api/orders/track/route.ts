import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const number = req.nextUrl.searchParams.get('number')?.trim().toUpperCase()
  if (!number) {
    return NextResponse.json({ error: 'Raqam kerak' }, { status: 400 })
  }

  try {
    const supabase = getAdminClient()
    // Only return safe public fields — never expose full customer data
    const { data, error } = await supabase
      .from('orders')
      .select('order_number, status, total_amount, delivery_city, delivery_address, created_at')
      .eq('order_number', number)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}