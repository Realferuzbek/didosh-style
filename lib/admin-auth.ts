import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function makeSessionToken(password: string): string {
  return createHash('sha256').update(`didosh-admin:${password}`).digest('hex')
}

/** Call inside API route handlers to verify admin session */
export function verifyAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get('admin_session')?.value
  const correct = process.env.ADMIN_PASSWORD
  if (!token || !correct) return false
  return token === makeSessionToken(correct)
}

/** Returns a 401 response for unauthorized requests */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
}