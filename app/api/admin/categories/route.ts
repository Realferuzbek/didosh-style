import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
