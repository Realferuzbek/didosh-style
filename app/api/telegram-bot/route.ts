import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN ?? ''
if (!BOT_TOKEN) {
  console.error('[telegram-bot] TELEGRAM_BOT_TOKEN is not set')
}
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://didoshstyle.netlify.app'
// Set this in Netlify env vars + when registering the webhook via setWebhook API
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? ''
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

// ── Telegram API helpers ──────────────────────────────────────────────────────
async function sendMessage(chatId: number, text: string, inlineKeyboard?: object[][]) {
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: 'HTML' }
  if (inlineKeyboard) body.reply_markup = { inline_keyboard: inlineKeyboard }
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

// answerCallbackQuery removed — callback_query handling deprecated

// ── Phone normalization ───────────────────────────────────────────────────────
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.length === 9) return `+998${digits}`
  return `+${digits}`
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // In production: always verify the webhook secret.
  // In development: warn but allow (for local ngrok testing).
  if (process.env.NODE_ENV === 'production') {
    if (!WEBHOOK_SECRET) {
      console.error('[telegram-bot] CRITICAL: TELEGRAM_WEBHOOK_SECRET is not set')
      return NextResponse.json({ ok: false }, { status: 500 })
    }
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token')
    if (incomingSecret !== WEBHOOK_SECRET) {
      console.warn('[telegram-bot] Rejected: invalid webhook secret header')
      return NextResponse.json({ ok: false }, { status: 403 })
    }
  } else {
    if (!WEBHOOK_SECRET) {
      console.warn('[telegram-bot] DEV: TELEGRAM_WEBHOOK_SECRET not set, skipping verification')
    }
  }

  try {
    const body = await req.json()

  // NOTE: callback_query handling removed — buttons that copied the code are deprecated.

    const message = body?.message
    if (!message) return NextResponse.json({ ok: true })

    const chatId: number    = message.chat?.id
    const text: string      = message.text ?? ''
    const firstName: string = message.from?.first_name ?? 'Aziz foydalanuvchi'

    if (!text.startsWith('/start')) return NextResponse.json({ ok: true })

    const startParam = text.split(' ')[1] ?? ''

    if (!startParam) {
      await sendMessage(
        chatId,
        `🌸 Assalomu alaykum, <b>${firstName}</b>!\n\nSiz <b>Didosh Style</b> do'konining tasdiqlash botisiz.\n\nBuyurtma berish yoki profilingizga kirish uchun saytga o'ting:`,
        [[{ text: "🛍 Saytga o'tish", url: SITE_URL }]],
      )
      return NextResponse.json({ ok: true })
    }

    const underscoreIdx = startParam.indexOf('_')
    const rawPhone      = underscoreIdx > 0 ? startParam.slice(0, underscoreIdx) : startParam
    const returnPath    = underscoreIdx > 0 ? startParam.slice(underscoreIdx + 1) : 'profile'
    const phone         = normalizePhone(rawPhone)

    const supabase = getAdminClient()

    console.log('[telegram-bot] Looking up OTP for phone:', phone)
    const { data: otpRecord } = await supabase
      .from('otp_codes')
      .select('code, expires_at, id')
      .eq('phone', phone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!otpRecord) {
      console.log('[telegram-bot] No valid OTP found for phone:', phone)
      await sendMessage(
        chatId,
        `⏰ <b>Kod topilmadi yoki muddati tugagan.</b>\n\nYangi kod olish uchun saytga qayting va telefon raqamingizni qayta kiriting.`,
        [[{ text: '🔄 Yangi kod olish', url: `${SITE_URL}/profile` }]],
      )
      return NextResponse.json({ ok: true })
    } else {
      console.log('[telegram-bot] OTP found, sending to chatId:', chatId)
    }

    const code        = otpRecord.code
    const phoneDigits = phone.replace(/\D/g, '')
    const verifyUrl   = `${SITE_URL}/verify?p=${phoneDigits}&c=${code}&r=${returnPath}`
  // minsLeft removed (no longer displayed in Telegram message)

    await sendMessage(
      chatId,
      `🌸 Didosh Style — tasdiqlash.\n\nTasdiqlash uchun quyidagi tugmani bosing 👇`,
      [
        [{ text: `✅ Saytda avtomatik tasdiqlash`, url: verifyUrl }],
      ],
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Telegram Bot]', err)
    return NextResponse.json({ ok: true })
  }
}
