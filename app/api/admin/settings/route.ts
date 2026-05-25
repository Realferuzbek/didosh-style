import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// Only these keys can be read or written — prevents arbitrary data storage
const ALLOWED_KEYS = new Set(['biz_raqamlarda', 'announcement_bar', 'hero_content'])

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()

  const key = req.nextUrl.searchParams.get('key')?.trim()
  if (!key || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: "Noto'g'ri key" }, { status: 400 })
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', key)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()

  try {
    const { key, value } = await req.json()

    if (!key || typeof key !== 'string' || !ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: "Noto'g'ri key" }, { status: 400 })
    }
    if (typeof value !== 'string') {
      return NextResponse.json({ error: 'Value kerak' }, { status: 400 })
    }
    if (value.length > 65_536) {
      return NextResponse.json({ error: 'Value juda katta (max 64KB)' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 })
  }
}
