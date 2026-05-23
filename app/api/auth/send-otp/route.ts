import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateOTP } from '@/lib/auth'
import { sendOTPSms } from '@/lib/eskiz'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeUzbekPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 12) return null
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `+998${digits.slice(1)}`
  if (digits.length === 9) return `+998${digits}`
  return null
}

const isDevMode = process.env.NODE_ENV === 'development'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // via: 'telegram' | 'sms'
    // returnPath: 'profile' | 'checkout' etc. (used in Telegram deep link)
    const { phone, via, returnPath = 'profile' } = body
    const useTelegram = via === 'telegram'

    const normalizedPhone = normalizeUzbekPhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ error: "To'g'ri telefon raqam kiriting" }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Rate limit: 1 OTP per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const { data: recentOtp } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('phone', normalizedPhone)
      .gte('created_at', oneMinuteAgo)
      .limit(1)
      .maybeSingle()

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

    // Telegram flow: bot delivers the OTP via deep link
    if (useTelegram) {
      const digits = normalizedPhone.replace(/\D/g, '') // 998XXXXXXXXX
      const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'DidoshStyleBot'
      // Encode: PHONE_RETURNPATH (e.g. "998931019521_checkout")
      const startParam = `${digits}_${returnPath}`
      return NextResponse.json({
        success: true,
        telegram: true,
        botLink: `https://t.me/${botUsername}?start=${startParam}`,
      })
    }

    // SMS flow
    const sent = await sendOTPSms(normalizedPhone, otp)
    if (!sent) {
      if (isDevMode) {
        console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`)
        return NextResponse.json({ success: true, dev_code: otp })
      }
      return NextResponse.json(
        { error: "SMS yuborishda xatolik. Telegram orqali olishni sinab ko'ring." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/send-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}