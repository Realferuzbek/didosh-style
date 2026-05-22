import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Derive a session token from the admin password — stateless, no storage needed
function makeSessionToken(password: string): string {
  return createHash('sha256').update(`didosh-admin:${password}`).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const correct = process.env.ADMIN_PASSWORD
    if (!correct || password !== correct) {
      // Constant-time-ish response to resist timing attacks
      await new Promise(r => setTimeout(r, 300))
      return NextResponse.json({ ok: false }, { status: 401 })
    }
    const token = makeSessionToken(correct)
    const res = NextResponse.json({ ok: true })
    // Set httpOnly cookie — JS can't read it, prevents XSS token theft
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      // secure: true in production (Netlify sets this automatically via HTTPS)
    })
    return res
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