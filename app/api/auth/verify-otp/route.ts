import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { signUserToken } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Normalize Uzbek phone to E.164 — matches send-otp exactly (min 9 digits) */
function normalizeUzbekPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 12) return null   // was < 10, now < 9
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0')   && digits.length === 10) return `+998${digits.slice(1)}`
  if (digits.length === 9) return `+998${digits}`
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    const normalizedPhone = normalizeUzbekPhone(phone)
    const normalizedCode  = typeof code === 'string' ? code.trim() : ''

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
      return NextResponse.json(
        { error: "Kod noto'g'ri yoki muddati o'tgan" },
        { status: 401 },
      )
    }

    const { error: markUsedError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRow.id)

    if (markUsedError) throw markUsedError

    // Fire-and-forget: clean up expired/used OTP codes — does not block response
    supabase
      .from('otp_codes')
      .delete()
      .or(`used.eq.true,expires_at.lt.${new Date(Date.now() - 3_600_000).toISOString()}`)
      .then(({ error }) => { if (error) console.warn('[otp cleanup]', error.message) })

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

    // Update last login (non-fatal)
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('phone', normalizedPhone)
      .then(({ error }) => { if (error) console.warn('[verify-otp] last_login:', error.message) })

    const token = await signUserToken(user.id, normalizedPhone)
    return NextResponse.json({ success: true, token, isNewUser })
  } catch (error) {
    console.error('[POST /api/auth/verify-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
