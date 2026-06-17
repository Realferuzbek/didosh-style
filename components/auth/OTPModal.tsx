'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
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
  telegram?: boolean
  botLink?: string
  error?: string
}

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const phoneDigits = phoneInput.replace(/\D/g, '')
  const canSend = phoneDigits.length >= 12 && !isLoading

  useEffect(() => {
    if (!isOpen) return
    setStep('phone')
    setPhoneInput(initialPhone ? formatPhone(initialPhone).slice(0, 17) : '')
    setIsLoading(false)
    setError(null)
    setIsNewUser(false)
    setDevCode(null)
  }, [initialPhone, isOpen])

  useEffect(() => {
    const timer = successTimerRef.current
    // reference onSuccess to avoid unused-parameter lint (no-op)
    void onSuccess
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [onSuccess])

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
        body: JSON.stringify({
          phone: phoneInput,
          via: 'telegram',
          returnPath: window.location.pathname.replace(/^\//, '') || 'profile',
        }),
      })
  const result = (await res.json()) as SendOTPResponse
  if (res.status === 429) { setError(result.error ?? 'Iltimos, 1 daqiqa kuting'); return }
      if (result.telegram && result.botLink) {
        try { localStorage.setItem('ds_return_url', window.location.href) } catch {}
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

  function handleBackToPhone() {
    setStep('phone')
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
                  <div className="text-5xl mb-3">💬</div>
                  <h2 className="font-display text-2xl text-brand-dark">Telegramni tekshiring</h2>
                  <p className="font-body text-sm text-brand-muted mt-2 max-w-[260px] mx-auto">
                    Tasdiqlash uchun Telegramdagi tugmani bosing
                  </p>
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
                <button
                  type="button"
                  className="text-sm text-brand-muted underline mt-4 block text-center mx-auto"
                  onClick={handleBackToPhone}
                >
                  ← Telefon raqamni o&apos;zgartirish
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