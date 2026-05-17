
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        sessionStorage.setItem('admin_auth', 'true')
        onSuccess()
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1218]">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] bg-[#2C1F28] rounded-2xl p-8 shadow-2xl border border-[#3D2A36]"
      >
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 flex items-center justify-center bg-brand-deeprose/20 rounded-2xl mb-2">
            <Lock size={28} className="text-brand-deeprose" />
          </div>
          <div className="font-serif text-2xl text-white">Didosh Style</div>
          <div className="text-[13px] text-[#9B7B85] font-sans">Admin Panel</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="text-[13px] text-[#9B7B85] mb-1" htmlFor="admin-password">Parol</label>
          <motion.div
            animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
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
                Noto&#39;g&#39;ri parol. Qayta urinib ko&#39;ring.
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
    </div>
  )
}
