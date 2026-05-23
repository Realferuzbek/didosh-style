'use client'

import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface OTPModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: string, phone: string) => void
  initialPhone?: string
  title?: string
  subtitle?: string
}

type Step = 'phone' | 'otp' | 'success'

type SendOTPResponse = {
  success?: boolean
  dev_code?: string
  error?: string
}

type VerifyOTPResponse = {
  success?: boolean
  token?: string
  isNewUser?: boolean
  error?: string
}

const EMPTY_OTP = ['', '', '', '', '', '']

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

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return `+998 ** *** ** ${digits.slice(-2)}`
}

function DevCodeHint({ devCode }: { devCode: string | null }) {
  if (!devCode) return null
  return (
    <p className="text-xs text-amber-500 text-center mt-2 bg-amber-50 rounded-xl p-2">
      🔧 Dev rejim: kod = <strong>{devCode}</strong>
    </p>
  )
}

export default function OTPModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone,
  title,
  subtitle,
}: OTPModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  const verifyRef = useRef<(codeOverride?: string) => Promise<void>>(async () => undefined)
  const submittedCodeRef = useRef('')
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phoneDigits = phoneInput.replace(/\D/g, '')
  const otpCode = otpDigits.join('')
  const canSend = phoneDigits.length >= 12 && !isLoading
  const canVerify = otpCode.length === 6 && !isLoading

  useEffect(() => {
    if (!isOpen) return
    setStep('phone')
    setPhoneInput(initialPhone ? formatPhone(initialPhone).slice(0, 17) : '')
    setOtpDigits([...EMPTY_OTP])
    setIsLoading(false)
    setError(null)
    setIsNewUser(false)
    setDevCode(null)
    submittedCodeRef.current = ''
  }, [initialPhone, isOpen])

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (step !== 'otp') return
    const timeout = setTimeout(() => otpRefs.current[0]?.focus(), 80)
    return () => clearTimeout(timeout)
  }, [step])

  useEffect(() => {
    if (step !== 'otp') return
    if (isLoading || otpDigits.some((digit) => digit === '') || submittedCodeRef.current === otpCode) return
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current)
    autoSubmitTimerRef.current = setTimeout(() => {
      void verifyRef.current(otpCode)
    }, 100)
  }, [isLoading, otpCode, otpDigits, step])

  function handleClose() {
    if (step !== 'success') onClose()
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhoneInput(formatPhone(event.target.value).slice(0, 17))
    setError(null)
  }

  async function handleSendOTP() {
    if (!canSend) return
    setIsLoading(true)
    setError(null)
    submittedCodeRef.current = ''

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput }),
      })
      const result = (await res.json()) as SendOTPResponse

      if (res.status === 429) {
        setError(result.error ?? 'Iltimos, 1 daqiqa kuting')
        return
      }

      if (!res.ok) {
        setError('SMS yuborishda xatolik')
        return
      }

      if (result.dev_code) setDevCode(result.dev_code)
      setOtpDigits([...EMPTY_OTP])
      setStep('otp')
    } catch {
      setError('SMS yuborishda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTelegramSend() {
    if (phoneDigits.length < 9) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, via: 'telegram' }),
      })
      const result = await res.json()
      if (res.status === 429) { setError(result.error); return }
      if (result.telegram && result.botLink) {
        window.open(result.botLink, '_blank')
        setStep('otp')
        setDevCode(null)
      }
    } catch {
      setError('Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerify(codeOverride?: string) {
    const code = codeOverride ?? otpDigits.join('')
    if (isLoading || code.length < 6 || submittedCodeRef.current === code) return
    submittedCodeRef.current = code
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneInput, code }),
      })
      const result = (await res.json()) as VerifyOTPResponse

      if (res.status === 401) {
        setError("Kod noto'g'ri. Qayta urinib ko'ring")
        return
      }

      if (!res.ok || !result.token) {
        setError(result.error ?? 'Tasdiqlashda xatolik')
        return
      }

      setIsNewUser(Boolean(result.isNewUser))
      setStep('success')
      successTimerRef.current = setTimeout(() => {
        onSuccess(result.token as string, phoneInput)
      }, 2200)
    } catch {
      setError('Internet aloqasini tekshiring')
    } finally {
      setIsLoading(false)
    }
  }

  verifyRef.current = handleVerify

  function setDigit(index: number, value: string) {
    const digits = value.replace(/\D/g, '')
    submittedCodeRef.current = ''
    if (!digits) {
      setOtpDigits((current) => {
        const next = [...current]
        next[index] = ''
        return next
      })
      setError(null)
      return
    }

    setOtpDigits((current) => {
      const next = [...current]
      digits.slice(0, 6 - index).split('').forEach((digit, offset) => {
        next[index + offset] = digit
      })
      return next
    })
    setError(null)

    const nextIndex = Math.min(index + digits.length, 5)
    otpRefs.current[nextIndex]?.focus()
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Backspace' || otpDigits[index] || index === 0) return
    event.preventDefault()
    setOtpDigits((current) => {
      const next = [...current]
      next[index - 1] = ''
      return next
    })
    otpRefs.current[index - 1]?.focus()
  }

  function handleOtpPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    submittedCodeRef.current = ''
    const next = [...EMPTY_OTP]
    pasted.split('').forEach((digit, index) => {
      next[index] = digit
    })
    setOtpDigits(next)
    setError(null)
    otpRefs.current[Math.min(pasted.length, 6) - 1]?.focus()
  }

  function handleBackToPhone() {
    submittedCodeRef.current = ''
    setStep('phone')
    setOtpDigits([...EMPTY_OTP])
    setError(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed bottom-0 left-0 right-0 md:relative md:m-auto md:max-w-md bg-white rounded-t-3xl md:rounded-3xl px-6 pt-8 pb-[88px] md:pb-10 shadow-2xl max-h-[90dvh] overflow-y-auto"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {step !== 'success' && (
              <button
                type="button"
                aria-label="Yopish"
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-brand-muted hover:bg-brand-blush transition-colors"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            )}

            {step === 'phone' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">📱</div>
                  <h2 className="font-display text-2xl text-brand-dark">{title ?? 'Kirish'}</h2>
                  <p className="font-body text-sm text-brand-muted mt-1 max-w-[260px] mx-auto">
                    {subtitle ?? 'Telefon raqamingizni kiriting — tasdiqlash kodi yuboramiz'}
                  </p>
                </div>

                <div className="mt-4">
                  <input
                    className="input-field text-center text-lg tracking-wider"
                    type="tel"
                    inputMode="tel"
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    placeholder="+998 __ ___ __ __"
                    autoFocus
                  />
                  {error && (
                    <motion.p
                      className="font-body text-xs text-red-400 mt-2 text-center"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                  <DevCodeHint devCode={devCode} />
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-body font-medium text-[15px] text-white"
                    style={{ background: 'linear-gradient(135deg, #229ED9, #1A8FC0)' }}
                    disabled={isLoading}
                    onClick={handleTelegramSend}
                  >
                    {/* Telegram SVG icon (paper plane, white, 20px) */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.824 3.368a1.25 1.25 0 0 1 .176 1.44l-5.25 10.5a1.25 1.25 0 0 1-2.176.08l-2.02-3.37-3.37-2.02a1.25 1.25 0 0 1 .08-2.176l10.5-5.25a1.25 1.25 0 0 1 1.56.796ZM8.5 11.5l2 3.333 5.25-10.5-10.5 5.25L8.5 11.5Z" fill="white"/>
                    </svg>
                    Telegram orqali kodni olish
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 font-body font-medium text-[13px] text-brand-muted bg-brand-blush border border-brand-border cursor-not-allowed opacity-60"
                    onClick={handleSendOTP}
                    disabled={true}
                  >
                    📱 SMS orqali olish (tez kunda)
                  </button>
                </div>
              </div>
            )}

            {step === 'otp' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🔐</div>
                  <h2 className="font-display text-2xl text-brand-dark">Kodni kiriting</h2>
                  <p className="font-body text-sm text-brand-muted mt-1">
                    {maskPhone(phoneInput)} raqamiga kod yuborildi
                  </p>
                  <p className="font-body text-[12px] text-[#229ED9] mt-1">
                    Telegram botidan kodni oling 💬
                  </p>
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-11 h-14 text-center text-xl font-bold border-2 border-brand-border rounded-2xl focus:border-brand-deeprose focus:outline-none text-brand-dark transition-colors bg-brand-blush"
                      value={digit}
                      onChange={(event) => setDigit(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      disabled={isLoading}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    className="font-body text-xs text-red-400 mt-2 text-center"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
                <DevCodeHint devCode={devCode} />

                <button
                  type="button"
                  className="mt-5 w-full btn-primary"
                  disabled={!canVerify}
                  onClick={() => void handleVerify()}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    'Tasdiqlash ✓'
                  )}
                </button>

                <button
                  type="button"
                  className="text-sm text-brand-muted underline mt-3 block text-center mx-auto"
                  onClick={handleBackToPhone}
                >
                  {"← Telefon raqamni o'zgartirish"}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                {isNewUser ? (
                  <>
                    <div className="flex flex-wrap justify-center gap-2 text-4xl">
                      {['🌸', '💝', '✨', '👗', '🎉'].map((emoji, index) => (
                        <motion.span
                          key={emoji}
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: 'spring',
                            damping: 12,
                            stiffness: 220,
                            delay: index * 0.08,
                          }}
                        >
                          {emoji}
                        </motion.span>
                      ))}
                    </div>
                    <h2 className="font-display text-3xl text-brand-dark mt-4">
                      Xush kelibsiz, azizim! 🌸
                    </h2>
                    <p className="font-body text-sm text-brand-muted mt-2 max-w-[240px] mx-auto">
                      {"Endi siz Didosh Style oilasining a'zosisiz! Savatcha kutmoqda... 🛍️"}
                    </p>
                    <p className="text-xs text-brand-muted mt-1 italic">
                      P.S. Chiroylisiz, bu shunchaki haqiqat.
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      className="text-6xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 220 }}
                    >
                      💝
                    </motion.div>
                    <h2 className="font-display text-2xl text-brand-dark mt-4">
                      Qaytib keldingiz! 💝
                    </h2>
                    <p className="font-body text-sm text-brand-muted mt-2">
                      {"Sog'indik sizni 🌸 Yangi kolleksiya kutmoqda!"}
                    </p>
                  </>
                )}

                <div className="mt-4 overflow-hidden rounded-full bg-brand-border h-1">
                  <motion.div
                    className="h-1 rounded-full bg-brand-deeprose"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  />
                </div>
                <p className="text-xs text-brand-muted mt-2">Yuklanmoqda...</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}