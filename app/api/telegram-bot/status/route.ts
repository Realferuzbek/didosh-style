import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, unauthorized } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) return unauthorized()

  const botToken    = process.env.TELEGRAM_BOT_TOKEN
  const botUsername = process.env.TELEGRAM_BOT_USERNAME
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL
  const secret      = process.env.TELEGRAM_WEBHOOK_SECRET

  // Check Telegram webhook registration
  let webhookInfo = null
  let webhookError = null
  if (botToken) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/getWebhookInfo`
      )
      webhookInfo = await res.json()
    } catch (e) {
      webhookError = String(e)
    }
  }

  return NextResponse.json({
    env: {
      TELEGRAM_BOT_TOKEN:    botToken    ? '✓ set' : '✗ MISSING',
      TELEGRAM_BOT_USERNAME: botUsername ? '✓ set' : '✗ MISSING',
      NEXT_PUBLIC_SITE_URL:  siteUrl     ? '✓ set' : '✗ MISSING',
      TELEGRAM_WEBHOOK_SECRET: secret   ? '✓ set' : '✗ MISSING — webhook is OPEN',
    },
    expectedWebhookUrl: siteUrl
      ? `${siteUrl}/api/telegram-bot`
      : 'NEXT_PUBLIC_SITE_URL not set',
    telegramWebhookInfo: webhookInfo ?? { error: webhookError ?? 'BOT_TOKEN not set' },
  })
}
