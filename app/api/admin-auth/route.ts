
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { verifyAdminDeviceToken } from '@/lib/auth'

export const runtime = 'nodejs'

// Derive a session token from the admin password — stateless, no storage needed
function makeSessionToken(password: string): string {
  return createHash('sha256').update(`didosh-admin:${password}`).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, deviceToken } = body
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const correct = process.env.ADMIN_PASSWORD
    if (!correct || password !== correct) {
      // Constant-time-ish response to resist timing attacks
      await new Promise(r => setTimeout(r, 300))
      return NextResponse.json({ ok: false }, { status: 401 })
    }
    // Check device token
    let needsOtp = true
    if (deviceToken) {
      const deviceValid = await verifyAdminDeviceToken(deviceToken)
      if (deviceValid) needsOtp = false
    }
    return NextResponse.json({ success: true, needsOtp }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('admin_session')
  return res
}