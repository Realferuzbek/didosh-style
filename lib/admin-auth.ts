import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export function makeSessionToken(password: string): string {
  return createHash('sha256')
    .update(`didosh-admin:${password}`)
    .digest('hex')
}

/** Constant-time hex-string comparison — prevents timing attacks */
function safeHexEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex')
    const bufB = Buffer.from(b, 'hex')
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/** Call as the first line of every admin API route handler */
export function verifyAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value
  const correct = process.env.ADMIN_PASSWORD
  if (!token || !correct) return false
  return safeHexEqual(token, makeSessionToken(correct))
}

/** Standard 401 response for unauthorized admin API requests */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 })
}
