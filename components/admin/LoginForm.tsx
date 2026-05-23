

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEVICE_TOKEN_KEY = 'ds_admin_device'

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  let result = '+998 '
  if (local.length > 0) result += local.slice(0, 2)
  if (local.length >= 3) result += ' ' + local.slice(2, 5)
  if (local.length >= 6) result += ' ' + local.slice(5, 7)
  if (local.length >= 8) result += ' ' + local.slice(7, 9)
  return result.trim()
}

type Step = 'password' | 'phone' | 'otp'

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  // PASSWORD STEP
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShake(false)
    let deviceToken: string | null = null
    try {
      try {
        deviceToken = localStorage.getItem(DEVICE_TOKEN_KEY)
      } catch {}
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, deviceToken }),
      })
      if (res.status === 401) {
  setError("Noto&#39;g&#39;ri parol")
        setShake(true)
        return
      }
      if (res.ok) {
        const data = await res.json()
        if (!data.needsOtp) {
          sessionStorage.setItem('admin_auth', 'true')
          onSuccess()
          return
        } else {
          setStep('phone')
        }
      } else {
        setError('Xatolik yuz berdi')
      }
    } catch {
      setError('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  // PHONE STEP
  async function handleSendAdminOtp() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput })
      })
      if (res.status === 403) {
        setError("Bu raqamga ruxsat yo&#39;q")
        return
      }
      if (res.status === 429) {
  setError('1 daqiqa kuting')
        return
      }
      if (res.ok) {
        setStep('otp')
      } else {
        setError('Xatolik yuz berdi')
      }
    } catch {
      setError('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  // OTP STEP
  async function handleVerifyAdminOtp() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, code: otpDigits.join('') })
      })
      if (res.status === 401) {
  setError("Kod noto&#39;g&#39;ri")
        return
      }
      if (res.ok) {
        const data = await res.json()
        try { localStorage.setItem(DEVICE_TOKEN_KEY, data.deviceToken) } catch {}
        sessionStorage.setItem('admin_auth', 'true')
        onSuccess()
      } else {
        setError('Xatolik yuz berdi')
      }
    } catch {
      setError('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  // OTP input keyboard logic
  function handleOtpChange(idx: number, val: string) {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...otpDigits]
    next[idx] = val
    setOtpDigits(next)
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
    if (val && idx === 5 && next.every(d => d)) {
      handleVerifyAdminOtp()
    }
  }
  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (otpDigits[idx]) {
        setOtpDigits(d => {
          const arr = [...d]
          arr[idx] = ''
          return arr
        })
      } else if (idx > 0) {
        otpRefs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 5) {
      otpRefs.current[idx + 1]?.focus()
    }
  }
  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const val = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (val.length === 6) {
      setOtpDigits(val.split(''))
      setTimeout(() => handleVerifyAdminOtp(), 10)
    }
  }

  // Reset shake on input
  useEffect(() => { if (shake) setTimeout(() => setShake(false), 500) }, [shake])

  // UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1218]">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[400px] bg-[#2C1F28] rounded-2xl p-8 shadow-2xl border border-[#3D2A36]"
          >
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-deeprose/20 rounded-2xl mb-2">
                <Lock size={28} className="text-brand-deeprose" />
              </div>
              <div className="font-serif text-2xl text-white">Didosh Style</div>
              <div className="text-[13px] text-[#9B7B85] font-sans">Admin Panel</div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <label className="text-[13px] text-[#9B7B85] mb-1" htmlFor="admin-password">Parol</label>
              <motion.div
                animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className={cn(
                      'bg-[#1A1218] border border-[#3D2A36] rounded-xl px-4 py-3.5 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]',
                      error && 'border-red-500'
                    )}
                    placeholder="Parol"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B7B85] hover:text-brand-deeprose transition"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Yashirish' : 'Ko‘rsatish'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="submit"
                className={cn(
                  'w-full bg-brand-deeprose hover:bg-[#C05A7A] text-white font-medium rounded-xl py-3.5 transition-colors flex items-center justify-center',
                  isLoading && 'opacity-80 cursor-not-allowed'
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Tekshirilmoqda...
                  </span>
                ) : (
                  'Kirish'
                )}
              </button>
            </form>
          </motion.div>
        )}
        {step === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[400px] bg-[#2C1F28] rounded-2xl p-8 shadow-2xl border border-[#3D2A36]"
          >
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-deeprose/20 rounded-2xl mb-2">
                <Smartphone size={28} className="text-brand-deeprose" />
              </div>
              <div className="font-serif text-2xl text-white">Telefon tasdiqlash</div>
              <div className="text-[13px] text-[#9B7B85] font-sans">Admin raqamingizni kiriting</div>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="tel"
                inputMode="tel"
                className="bg-[#1A1218] border border-[#3D2A36] rounded-xl px-4 py-3.5 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
                placeholder="+998 93 101 95 21"
                value={formatPhone(phoneInput)}
                onChange={e => setPhoneInput(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              <button
                className={cn(
                  'w-full bg-brand-deeprose hover:bg-[#C05A7A] text-white font-medium rounded-xl py-3.5 transition-colors flex items-center justify-center',
                  isLoading && 'opacity-80 cursor-not-allowed'
                )}
                disabled={isLoading}
                onClick={handleSendAdminOtp}
              >
                {isLoading ? 'Yuborilmoqda...' : 'Kodni yuborish →'}
              </button>
            </div>
          </motion.div>
        )}
        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-[400px] bg-[#2C1F28] rounded-2xl p-8 shadow-2xl border border-[#3D2A36]"
          >
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 flex items-center justify-center bg-brand-deeprose/20 rounded-2xl mb-2">
                <Lock size={28} className="text-brand-deeprose" />
              </div>
              <div className="font-serif text-2xl text-white">SMS kodni kiriting</div>
              <div className="text-[13px] text-[#9B7B85] font-sans">{formatPhone(phoneInput).replace(/.(?=.{4,}$)/g, '*')}</div>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={cn(
                    'bg-[#1A1218] border-2 border-[#3D2A36] rounded-xl text-white w-10 h-12 text-center text-lg font-bold focus:border-brand-deeprose',
                    error && 'border-red-500'
                  )}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={isLoading}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <div className="text-red-400 text-sm text-center mb-2">{error}</div>}
            <button
              className={cn(
                'w-full bg-brand-deeprose hover:bg-[#C05A7A] text-white font-medium rounded-xl py-3.5 transition-colors flex items-center justify-center',
                isLoading && 'opacity-80 cursor-not-allowed'
              )}
              disabled={isLoading || otpDigits.some(d => !d)}
              onClick={handleVerifyAdminOtp}
            >
              {isLoading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
            <button
              type="button"
              className="text-[#9B7B85] text-sm underline mt-3"
              onClick={() => { setStep('phone'); setOtpDigits(['','','','','','']); setError(null) }}
              disabled={isLoading}
            >
              ← Raqamni o&#39;zgartirish
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
