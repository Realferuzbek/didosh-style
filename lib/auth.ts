import { SignJWT, jwtVerify } from 'jose'

const getSecret = () => new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret_change_in_prod'
)

// OTP Generation
export function generateOTP(): string {
  // 6-digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// User JWT (30 days)
export async function signUserToken(userId: string, phone: string): Promise<string> {
  return new SignJWT({ userId, phone, type: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyUserToken(token: string): Promise<{ userId: string; phone: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.type !== 'user') return null
    return { userId: payload.userId as string, phone: payload.phone as string }
  } catch {
    return null
  }
}

// Admin device token (7 days)
export async function signAdminDeviceToken(): Promise<string> {
  return new SignJWT({ type: 'admin_device' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyAdminDeviceToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload.type === 'admin_device'
  } catch {
    return false
  }
}

// Helper: extract bearer token from Authorization header
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
