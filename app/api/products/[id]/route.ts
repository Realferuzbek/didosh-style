import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', params.id)
      .eq('is_active', true)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}