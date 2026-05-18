import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(count)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('[GET /api/admin/orders]', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID kerak' }, { status: 400 })
    }
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 })
    }
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PATCH /api/admin/orders]', error)
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}