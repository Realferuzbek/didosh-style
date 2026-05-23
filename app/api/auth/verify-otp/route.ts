import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { signUserToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeUzbekPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 12) return null
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+998${digits.slice(1)}`
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    const normalizedPhone = normalizeUzbekPhone(phone)
    const normalizedCode = typeof code === 'string' ? code.trim() : ''
    if (!normalizedPhone || !normalizedCode) {
      return NextResponse.json({ error: 'Telefon va kod kerak' }, { status: 400 })
    }

    const supabase = getAdminClient()
    const { data: otpRow, error: otpError } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', normalizedPhone)
      .eq('code', normalizedCode)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError && otpError.code !== 'PGRST116') throw otpError
    if (!otpRow) {
      return NextResponse.json({ error: "Kod noto'g'ri yoki muddati o'tgan" }, { status: 401 })
    }

    const { error: markUsedError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRow.id)

    if (markUsedError) throw markUsedError

    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (existingUserError) throw existingUserError

    const isNewUser = !existingUser
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({ phone: normalizedPhone }, { onConflict: 'phone' })
      .select('id')
      .single()

    if (userError) throw userError

    const { error: lastLoginError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('phone', normalizedPhone)

    if (lastLoginError) throw lastLoginError

    const token = await signUserToken(user.id, normalizedPhone)
    return NextResponse.json({ success: true, token, isNewUser })
  } catch (error) {
    console.error('[POST /api/auth/verify-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
