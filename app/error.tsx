'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream px-4">
      <div className="text-center max-w-[300px]">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-display text-2xl text-brand-dark mb-2">
          Xatolik yuz berdi
        </h2>
        <p className="text-brand-muted text-sm mb-6">
          Sahifani yangilang yoki bosh sahifaga qayting.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex-1">
            Qayta urinish
          </button>
          <Link href="/" className="btn-secondary flex-1">
            Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  )
}
