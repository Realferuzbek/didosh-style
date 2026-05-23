import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { extractBearerToken, verifyUserToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACTIVE_STATUSES = ['pending', 'confirmed', 'shipped']
const HISTORY_STATUSES = ['delivered', 'cancelled']

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'))
    if (!token) {
      return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 })
    }

    const payload = await verifyUserToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 })
    }

    const supabase = getAdminClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', payload.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const allOrders = orders ?? []
    const activeOrders = allOrders.filter((order) => ACTIVE_STATUSES.includes(order.status))
    const historyOrders = allOrders.filter((order) => HISTORY_STATUSES.includes(order.status))

    return NextResponse.json({
      user: { id: payload.userId, phone: payload.phone },
      activeOrders,
      historyOrders,
    })
  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
