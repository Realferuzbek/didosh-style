'use client'

import { useEffect, useState, useCallback } from 'react'

const TOKEN_KEY = 'ds_user_token'
const PHONE_KEY = 'ds_user_phone'

/** Decode a JWT payload without verifying the signature (client-side only). */
function decodeJwtExpiry(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1]
    if (!payloadB64) return null
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/** Returns true if the token is expired or will expire within 60 seconds. */
function isExpired(token: string): boolean {
  const exp = decodeJwtExpiry(token)
  if (exp === null) return false          // can't decode → assume valid
  return Date.now() / 1000 > exp - 60    // 60-second buffer
}

export function useAuth() {
  const [token, setToken]       = useState<string | null>(null)
  const [phone, setPhone]       = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PHONE_KEY)
    } catch { /* ignore */ }
    setToken(null)
    setPhone(null)
  }, [])

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedPhone = localStorage.getItem(PHONE_KEY)

      // Auto-logout if the stored JWT has expired
      if (storedToken && isExpired(storedToken)) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(PHONE_KEY)
        setToken(null)
        setPhone(null)
      } else {
        setToken(storedToken)
        setPhone(storedPhone)
      }
    } catch { /* ignore */ }
    setIsLoading(false)
  }, [])

  const login = useCallback((newToken: string, userPhone: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(PHONE_KEY, userPhone)
    } catch { /* ignore */ }
    setToken(newToken)
    setPhone(userPhone)
  }, [])

  return {
    token,
    phone,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  }
}
