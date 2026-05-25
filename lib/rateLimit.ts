/**
 * In-memory rate limiter.
 *
 * Note: State is per serverless function instance. In a distributed
 * environment with multiple concurrent Netlify instances, limits are not
 * shared across instances. For the current traffic level of Didosh Style
 * this provides meaningful protection against single-source abuse.
 * To scale: replace the Map with a Redis or Supabase-backed store.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Sweep expired entries every 60s to prevent unbounded memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

/**
 * Check whether a key is within its rate limit.
 * @param key      - Unique identifier (IP, phone number, etc.)
 * @param limit    - Max requests allowed per window
 * @param windowMs - Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 }
}

/**
 * Extract the real client IP from request headers.
 * Handles Netlify edge, standard proxies, and Nginx.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-nf-client-connection-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
