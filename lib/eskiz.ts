export const runtime = 'nodejs'
const ESKIZ_BASE = 'https://notify.eskiz.uz/api'

async function getEskizToken(): Promise<string | null> {
  try {
    const form = new FormData()
    form.append('email', process.env.ESKIZ_EMAIL ?? '')
    form.append('password', process.env.ESKIZ_PASSWORD ?? '')

    const res = await fetch(`${ESKIZ_BASE}/auth/login`, {
      method: 'POST',
      body: form,
      cache: 'no-store',
    })
    const data = await res.json()
    return data?.data?.token ?? null
  } catch {
    return null
  }
}

function formatUzbekPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  // Ensure starts with 998 (Uzbekistan country code)
  if (digits.startsWith('998') && digits.length === 12) return digits
  if (digits.length === 9) return `998${digits}`
  if (digits.startsWith('0') && digits.length === 10) return `998${digits.slice(1)}`
  return digits
}

export async function sendOTPSms(phone: string, code: string): Promise<boolean> {
  try {
    const token = await getEskizToken()
    if (!token) return false
    const formattedPhone = formatUzbekPhone(phone)
    const message = `Didosh Style: tasdiqlash kodi ${code}. 5 daqiqa ichida kiring.`
    const form = new FormData()
    form.append('mobile_phone', formattedPhone)
    form.append('message', message)
    form.append('from', process.env.ESKIZ_SENDER ?? '4546')
    form.append('callback_url', '')

    const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: 'no-store',
    })
    const data = await res.json()
    // eskiz returns status 'waiting' or message containing 'waiting' on success
    return data?.status === 'waiting' || data?.message?.toLowerCase().includes('wait')
  } catch {
    return false
  }
}

export async function sendOrderStatusSms(phone: string, orderNumber: string, status: string): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    confirmed: `✅ Buyurtmangiz (${orderNumber}) tasdiqlandi! Tez orada yuboramiz.`,
    shipped: `🚚 Buyurtmangiz (${orderNumber}) yo'lga chiqdi! Kutib qoling.`,
    delivered: `🎉 Buyurtmangiz (${orderNumber}) yetkazildi! Xaridingiz uchun rahmat 💝`,
    cancelled: `❌ Buyurtmangiz (${orderNumber}) bekor qilindi. Savol bo'lsa: @didosh_style`,
  }
  const message = statusMessages[status]
  if (!message) return false
  try {
    const token = await getEskizToken()
    if (!token) return false
    const formattedPhone = formatUzbekPhone(phone)
    const form = new FormData()
    form.append('mobile_phone', formattedPhone)
    form.append('message', message)
    form.append('from', process.env.ESKIZ_SENDER ?? '4546')
    form.append('callback_url', '')

    const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: 'no-store',
    })
    const data = await res.json()
    return data?.status === 'waiting' || data?.message?.toLowerCase().includes('wait')
  } catch {
    return false
  }
}
