import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { makeSessionToken } from '@/lib/admin-auth'

export const runtime = 'nodejs'

const IS_PROD   = process.env.NODE_ENV === 'production'
const MAX_AGE   = 60 * 60 * 24 * 7  // 7 days

/** Constant-time string comparison — prevents timing attacks on password length */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    // Pad shorter buffer to prevent length-based timing leak
    const maxLen = Math.max(bufA.length, bufB.length)
    const padA = Buffer.concat([bufA, Buffer.alloc(maxLen - bufA.length)])
    const padB = Buffer.concat([bufB, Buffer.alloc(maxLen - bufB.length)])
    const equal = timingSafeEqual(padA, padB)
    // Still return false if lengths differ, after constant-time compare
    return equal && bufA.length === bufB.length
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password, action } = body

    // ── Logout ────────────────────────────────────────────────────────────
    if (action === 'logout') {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('admin_session', '', {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      })
      return res
    }

    // ── Login ─────────────────────────────────────────────────────────────
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const correct = process.env.ADMIN_PASSWORD
    if (!correct) {
      console.error('[admin-auth] ADMIN_PASSWORD env var is not set')
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    // Fixed delay makes response time constant — prevents timing attacks
    await new Promise((r) => setTimeout(r, 300))

    if (!safeCompare(password, correct)) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    // Set HttpOnly cookie — this is the real server-side auth token
    const token = makeSessionToken(correct)
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'strict',
      path: '/',
      maxAge: MAX_AGE,
    })
    return res
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
