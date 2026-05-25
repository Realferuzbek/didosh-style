import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      '[auth] JWT_SECRET is not set. Add it to .env.local and Netlify environment variables.',
    )
  }
  return new TextEncoder().encode(secret)
}

// ── OTP ──────────────────────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── User JWT (30 days) ────────────────────────────────────────────────────────
export async function signUserToken(userId: string, phone: string): Promise<string> {
  return new SignJWT({ userId, phone, type: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyUserToken(
  token: string,
): Promise<{ userId: string; phone: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'user') return null
    return { userId: payload.userId as string, phone: payload.phone as string }
  } catch {
    return null
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
