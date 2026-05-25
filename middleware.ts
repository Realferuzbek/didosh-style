import { NextRequest, NextResponse } from 'next/server'

/**
 * Compute the admin session token using the Web Crypto API.
 * Edge Runtime compatible (no Node.js crypto module needed).
 * Produces the same SHA-256 hex output as lib/admin-auth.ts makeSessionToken().
 */
async function computeSessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`didosh-admin:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard /admin sub-pages — the login page (/admin) is always accessible
  if (!pathname.startsWith('/admin') || pathname === '/admin') {
    return NextResponse.next()
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  const sessionCookie = req.cookies.get('admin_session')?.value

  // Misconfigured server — block everything
  if (!adminPassword) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // No cookie → redirect to login, preserve intended destination
  if (!sessionCookie) {
    const url = new URL('/admin', req.url)
    url.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(url)
  }

  // Verify cookie value matches the expected hash
  const expected = await computeSessionToken(adminPassword)
  if (sessionCookie !== expected) {
    const url = new URL('/admin', req.url)
    url.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Protect all /admin/* sub-routes; the login page itself (/admin) is excluded above
  matcher: ['/admin/:path+'],
}
