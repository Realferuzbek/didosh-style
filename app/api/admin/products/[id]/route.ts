import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

// GET single product by id
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('id', params.id)
    .single()
  if (error) return NextResponse.json({ error }, { status: 404 })
  return NextResponse.json(data)
}

// PUT — full update of existing product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  } catch (error) {
    return NextResponse.json({ error: 'Yangilashda xatolik' }, { status: 500 })
  }
}
