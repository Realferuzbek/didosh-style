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
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}