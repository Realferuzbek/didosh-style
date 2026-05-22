import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}