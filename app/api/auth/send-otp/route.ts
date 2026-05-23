import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateOTP } from '@/lib/auth'
import { sendOTPSms } from '@/lib/eskiz'

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

function isEskizPlaceholder(): boolean {
  return process.env.ESKIZ_EMAIL?.startsWith('PLACEHOLDER') ?? false
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    const normalizedPhone = normalizeUzbekPhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ error: "To'g'ri telefon raqam kiriting" }, { status: 400 })
    }

    const supabase = getAdminClient()
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { data: recentOtp, error: rateLimitError } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', normalizedPhone)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .maybeSingle()

    if (rateLimitError) throw rateLimitError
    if (recentOtp) {
      return NextResponse.json({ error: 'Iltimos, 1 daqiqa kuting' }, { status: 429 })
    }

    const otp = generateOTP()
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        phone: normalizedPhone,
        code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        used: false,
      })

    if (insertError) throw insertError

    const sent = await sendOTPSms(normalizedPhone, otp)
    if (!sent) {
      if (isEskizPlaceholder()) {
        console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`)
        return NextResponse.json({ success: true, dev_code: otp })
      }
      return NextResponse.json({ error: 'SMS yuborishda xatolik' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/send-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
