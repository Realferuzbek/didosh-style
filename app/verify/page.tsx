'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/useAuth'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { login } = useAuth()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')

  useEffect(() => {
    const phoneDigits = searchParams.get('p')  // e.g. "998931019521"
    const code = searchParams.get('c')
    const returnTo = searchParams.get('r') || 'profile'

    if (!phoneDigits || !code) { setStatus('error'); return }

    const phone = `+${phoneDigits}`

    fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) {
          login(data.token, phone)
          setStatus('success')
          // Redirect to exact page user came from
          setTimeout(() => router.replace(`/${returnTo}`), 1500)
        } else if (data.error?.includes('muddati')) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-lg border border-brand-border"
      >
        {status === 'verifying' && (
          <>
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >🔐</motion.div>
            <p className="font-display text-xl text-brand-dark">Tekshirilmoqda...</p>
            <p className="font-body text-sm text-brand-muted mt-2">Bir soniya kuting</p>
            <div className="mt-4 h-1 bg-brand-blush rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-deeprose rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl mb-4"
            >🌸</motion.div>
            <p className="font-display text-xl text-brand-dark">Kirish muvaffaqiyatli!</p>
            <p className="font-body text-sm text-brand-muted mt-2">
              Yo&#39;naltirilmoqda...
            </p>
            <motion.div
              className="mt-4 h-1 bg-brand-blush rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-green-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />
            </motion.div>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="text-5xl mb-4">⏰</div>
            <p className="font-display text-xl text-brand-dark">Kod eskirgan</p>
            <p className="font-body text-sm text-brand-muted mt-2 mb-5">
              5 daqiqa o&#39;tib ketdi. Yangi kod oling.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full btn-primary"
            >
              🔄 Yangi kod olish
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <p className="font-display text-xl text-brand-dark">Xatolik yuz berdi</p>
            <p className="font-body text-sm text-brand-muted mt-2 mb-5">
              Kod noto&#39;g&#39;ri yoki allaqachon ishlatilgan.
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="w-full btn-primary"
            >
              Qayta urinish
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-4xl animate-pulse">🔐</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}