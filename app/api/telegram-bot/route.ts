import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOT_TOKEN    = process.env.TELEGRAM_BOT_TOKEN ?? ''
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

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  })
}

// ── Phone normalization ───────────────────────────────────────────────────────
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.length === 9) return `+998${digits}`
  return `+${digits}`
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Verify Telegram webhook signature ────────────────────────────────────
  // Set TELEGRAM_WEBHOOK_SECRET in Netlify + pass it to setWebhook API:
  // https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>&secret_token=<SECRET>
  if (WEBHOOK_SECRET) {
    const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token')
    if (!incomingSecret || incomingSecret !== WEBHOOK_SECRET) {
      // Return 200 so Telegram doesn't retry — but do not process the payload
      console.warn('[telegram-bot] Rejected request with invalid webhook secret')
      return NextResponse.json({ ok: false }, { status: 403 })
    }
  }

  try {
    const body = await req.json()

    // Handle inline button presses
    if (body.callback_query) {
      const cq = body.callback_query
      await answerCallbackQuery(cq.id, '')
      if (cq.data?.startsWith('copy_')) {
        const code = cq.data.replace('copy_', '')
        await sendMessage(
          cq.message.chat.id,
          `✅ Kod: <code>${code}</code>\n\nQuyidagi kodni saytda kiriting.`,
        )
      }
      return NextResponse.json({ ok: true })
    }

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
      await sendMessage(
        chatId,
        `⏰ <b>Kod topilmadi yoki muddati tugagan.</b>\n\nYangi kod olish uchun saytga qayting va telefon raqamingizni qayta kiriting.`,
        [[{ text: '🔄 Yangi kod olish', url: `${SITE_URL}/profile` }]],
      )
      return NextResponse.json({ ok: true })
    }

    const code        = otpRecord.code
    const phoneDigits = phone.replace(/\D/g, '')
    const verifyUrl   = `${SITE_URL}/verify?p=${phoneDigits}&c=${code}&r=${returnPath}`
    const minsLeft    = Math.max(1, Math.round((new Date(otpRecord.expires_at).getTime() - Date.now()) / 60000))

    await sendMessage(
      chatId,
      `🌸 <b>Didosh Style</b> — tasdiqlash kodi\n\n` +
      `🔐 Sizning kodingiz:\n\n` +
      `<b><code>${code}</code></b>\n\n` +
      `Kodni saytda kiriting <i>YOKI</i> quyidagi tugmani bosing — avtomatik tasdiqlanadi!\n\n` +
      `⏱ Kod ${minsLeft} daqiqada amal qiladi.\n` +
      `🔒 Kodni hech kimga bermang.`,
      [
        [{ text: `✅ Saytda avtomatik tasdiqlash`, url: verifyUrl }],
        [{ text: `📋 Kodni ko'rsatish: ${code}`, callback_data: `copy_${code}` }],
        [{ text: `🛍 Saytga qaytish`, url: `${SITE_URL}/${returnPath}` }],
      ],
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Telegram Bot]', err)
    return NextResponse.json({ ok: true })
  }
}
