'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminNav from '@/components/admin/AdminNav'

type StatItem = {
  id: string
  value: number
  suffix: string
  label: string
  icon: string
}

const DEFAULT_STATS: StatItem[] = [
  { id: 'years', value: 15, suffix: '+', label: 'Yillik tajriba', icon: '⭐' },
  { id: 'customers', value: 10000, suffix: '+', label: 'Mamnun mijozlar', icon: '💝' },
  { id: 'return', value: 90, suffix: '%', label: 'Qaytib kelish darajasi', icon: '🔄' },
  { id: 'quality', value: 95, suffix: '%', label: 'Sifat reytingi', icon: '✨' },
  { id: 'products', value: 500, suffix: '+', label: 'Mahsulot turlari', icon: '👗' },
  { id: 'cities', value: 3, suffix: '', label: 'Manba shaharlari', icon: '🌍' },
]

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statsData, setStatsData] = useState<StatItem[]>(DEFAULT_STATS)

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      router.replace('/admin')
      return
    }

    setIsAuthed(true)
  }, [router])

  useEffect(() => {
    if (!isAuthed) return

    async function loadSettings() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/settings?key=biz_raqamlarda')
        if (!res.ok) throw new Error()

        const data = await res.json()
        if (data?.value) {
          const parsed = JSON.parse(data.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStatsData(parsed)
          }
        }
      } catch {
        setStatsData(DEFAULT_STATS)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [isAuthed])

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    router.replace('/admin')
  }

  function updateStatValue(id: string, value: string) {
    const nextValue = Math.max(0, Number(value) || 0)
    setStatsData(prev =>
      prev.map(stat => (stat.id === id ? { ...stat, value: nextValue } : stat))
    )
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'biz_raqamlarda',
          value: JSON.stringify(statsData),
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Saqlandi ✓')
    } catch {
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthed) {
    return <div className="min-h-screen bg-[#1A1218]" />
  }

  return (
    <div className="min-h-screen bg-[#1A1218] pb-20 sm:pb-6">
      <AdminNav onLogout={handleLogout} />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <section>
          <div className="mb-5">
            <h1 className="font-display text-xl text-white">
              Biz raqamlarda — Raqamlarni o&apos;zgartirish
            </h1>
            <p className="mt-1 text-sm text-[#9B7B85]">
              Bosh sahifadagi yutuqlar raqamlarini boshqaring.
            </p>
          </div>

          <div className="space-y-3">
            {statsData.map(stat => (
              <div
                key={stat.id}
                className="flex items-center gap-4 rounded-2xl border border-[#3D2A36] bg-[#2C1F28] px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-[#9B7B85]">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <input
                    type="number"
                    value={stat.value}
                    onChange={e => updateStatValue(stat.id, e.target.value)}
                    className="w-24 rounded-xl border border-[#3D2A36] bg-[#1A1218] px-3 py-2 text-center text-white outline-none focus:border-brand-deeprose"
                  />
                  <span className="w-5 text-sm text-[#9B7B85]">{stat.suffix}</span>
                </div>
              </div>
            ))}
          </div>

          {isLoading && (
            <p className="mt-3 text-center text-sm text-[#9B7B85]">
              Ma&apos;lumotlar yuklanmoqda...
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary mt-4 w-full disabled:opacity-60"
          >
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash 💾'}
          </button>
        </section>
      </main>
    </div>
  )
}
