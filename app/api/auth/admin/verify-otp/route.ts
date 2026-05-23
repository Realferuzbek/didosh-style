import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { signAdminDeviceToken } from '@/lib/auth'

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

function isAllowedAdminPhone(phone: string): boolean {
  const allowed = (process.env.ADMIN_PHONES ?? '').split(',').map((item) => item.trim())
  return allowed.includes(phone)
}

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    const normalizedPhone = normalizeUzbekPhone(phone)
    const normalizedCode = typeof code === 'string' ? code.trim() : ''
    if (!normalizedPhone || !isAllowedAdminPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }
    if (!normalizedCode) {
      return NextResponse.json({ error: 'Kod kerak' }, { status: 400 })
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
      return NextResponse.json({ error: "Kod noto'g'ri" }, { status: 401 })
    }

    const { error: markUsedError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRow.id)

    if (markUsedError) throw markUsedError

    const deviceToken = await signAdminDeviceToken()
    return NextResponse.json({ success: true, deviceToken })
  } catch (error) {
    console.error('[POST /api/auth/admin/verify-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
