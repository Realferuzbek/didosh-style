import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generateOTP } from '@/lib/auth'
import { sendOTPSms } from '@/lib/eskiz'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Normalize Uzbek phone numbers to E.164 format (+998XXXXXXXXX) */
function normalizeUzbekPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 12) return null
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0')   && digits.length === 10) return `+998${digits.slice(1)}`
  if (digits.length === 9) return `+998${digits}`
  return null
}

const IS_DEV = process.env.NODE_ENV === 'development'

export async function POST(req: NextRequest) {
  try {
    // ── IP rate limit: 10 OTP requests per IP per hour ────────────────────
    // Prevents attackers from cycling through phone numbers to spam Eskiz SMS
    const ip = getClientIp(req.headers as Headers)
    const ipLimit = checkRateLimit(`otp:ip:${ip}`, 10, 60 * 60 * 1000)
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Juda ko'p so'rov. Iltimos, bir soatdan so'ng urinib ko'ring." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipLimit.retryAfterMs / 1000)) } },
      )
    }

    const body = await req.json()
    const { phone, via, returnPath = 'profile' } = body
    const useTelegram = via === 'telegram'

    const normalizedPhone = normalizeUzbekPhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "To'g'ri telefon raqam kiriting" },
        { status: 400 },
      )
    }

    const supabase = getAdminClient()

    // ── Per-phone rate limit: 1 OTP per phone per minute (DB-backed) ──────
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
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
    const { error: insertError } = await supabase.from('otp_codes').insert({
      phone:      normalizedPhone,
      code:       otp,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      used:       false,
    })
    if (insertError) throw insertError

    // Fire-and-forget cleanup — does not block response
    supabase
      .from('otp_codes')
      .delete()
      .or(`used.eq.true,expires_at.lt.${new Date(Date.now() - 3_600_000).toISOString()}`)
      .then(({ error }) => { if (error) console.warn('[otp cleanup]', error.message) })

    // ── Telegram flow ─────────────────────────────────────────────────────
    if (useTelegram) {
      const digits      = normalizedPhone.replace(/\D/g, '')
      const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? 'DidoshStyleBot'
      return NextResponse.json({
        success:  true,
        telegram: true,
        botLink:  `https://t.me/${botUsername}?start=${digits}_${returnPath}`,
      })
    }

    // ── SMS flow via Eskiz ────────────────────────────────────────────────
    // Eskiz becomes active once MCHJ/YATT is registered — infrastructure ready
    const sent = await sendOTPSms(normalizedPhone, otp)
    if (!sent) {
      if (IS_DEV) {
        console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`)
        return NextResponse.json({ success: true, dev_code: otp })
      }
      return NextResponse.json(
        { error: "SMS yuborishda xatolik. Telegram orqali olishni sinab ko'ring." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/auth/send-otp]', error)
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 })
  }
}
