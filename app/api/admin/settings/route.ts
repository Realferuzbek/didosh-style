import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')?.trim()

  if (!key) {
    return NextResponse.json({ error: 'Key kerak' }, { status: 400 })
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('key,value')
      .eq('key', key)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/admin/settings]', error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key, value } = await req.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Key kerak' }, { status: 400 })
    }

    if (typeof value !== 'string') {
      return NextResponse.json({ error: 'Value kerak' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/admin/settings]', error)
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 })
  }
}
