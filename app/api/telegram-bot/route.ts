import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.length === 9) return `+998${digits}`
  return `+${digits}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body?.message
    if (!message) return NextResponse.json({ ok: true })

    const chatId: number = message.chat?.id
    const text: string = message.text ?? ''
    const firstName: string = message.from?.first_name ?? 'Aziz foydalanuvchi'

    // Handle /start command with phone parameter
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const phoneParam = parts[1] // phone number passed as start parameter

      if (!phoneParam) {
        await sendTelegramMessage(
          chatId,
          `Assalomu alaykum, ${firstName}! 🌸\n\nSiz <b>Didosh Style</b> do'konining tasdiqlash botisiz.\n\nTasdiqlash kodini olish uchun saytdan telefon raqamingizni kiriting.`
        )
        return NextResponse.json({ ok: true })
      }

      const phone = normalizePhone(phoneParam)
      const supabase = getAdminClient()

      // Find the most recent valid OTP for this phone
      const { data: otpRecord } = await supabase
        .from('otp_codes')
        .select('code, expires_at')
        .eq('phone', phone)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!otpRecord) {
        await sendTelegramMessage(
          chatId,
          `❌ Kod topilmadi yoki muddati o'tgan.\n\nIltimos, saytga qayting va yangi kod so'rang.`
        )
        return NextResponse.json({ ok: true })
      }

      await sendTelegramMessage(
        chatId,
        `🌸 <b>Didosh Style</b> tasdiqlash kodi:\n\n<b>${otpRecord.code}</b>\n\n⏱ Kod 5 daqiqa ichida amal qiladi.\nKodni hech kimga bermang!`
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Telegram Bot]', err)
    return NextResponse.json({ ok: true }) // Always 200 to Telegram
  }
}