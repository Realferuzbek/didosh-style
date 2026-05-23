'use client'

import { useEffect, useState } from 'react'

const TOKEN_KEY = 'ds_user_token'
const PHONE_KEY = 'ds_user_phone'

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      const storedPhone = localStorage.getItem(PHONE_KEY)
      setToken(storedToken)
      setPhone(storedPhone)
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, userPhone: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(PHONE_KEY, userPhone)
    } catch {
      // ignore
    }
    setToken(newToken)
    setPhone(userPhone)
  }

  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PHONE_KEY)
    } catch {
      // ignore
    }
    setToken(null)
    setPhone(null)
  }

  return {
    token,
    phone,
    isLoading,
    login,
    logout,
    isAuthenticated: !!token,
  }
}
