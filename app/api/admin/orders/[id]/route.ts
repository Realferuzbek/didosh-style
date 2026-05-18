import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', params.id)
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/admin/orders/:id]', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}