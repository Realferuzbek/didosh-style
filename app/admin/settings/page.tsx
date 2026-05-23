'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import AdminNav from '@/components/admin/AdminNav'

// Simple unique id generator for new items
function genId() {
  return 'id-' + Math.random().toString(36).slice(2, 10)
}


type BizRaqamlardaHeader = {
  pill: string
  title: string
  subtitle: string
  footer: string
}

type BizRaqamlardaItem = {
  id: string
  icon: string
  value: number
  suffix: string
  label: string
}

const DEFAULT_BIZRAQAMLARDA = {
  header: {
    pill: '🏆 Bizning yutuqlarimiz',
    title: 'Biz raqamlarda',
    subtitle: 'Yillar davomida qurilgan ishonch',
    footer: 'Toshkent · Bishkek · Xitoy — eng yaxshi manbalardan',
  },
  items: [
    { id: 'years',     icon: '⭐', value: 15,    suffix: '+',  label: 'Yillik tajriba' },
    { id: 'customers', icon: '💝', value: 10000, suffix: '+',  label: 'Mamnun mijozlar' },
    { id: 'return',    icon: '🔄', value: 90,    suffix: '%',  label: 'Qaytib kelish darajasi' },
    { id: 'quality',   icon: '✨', value: 95,    suffix: '%',  label: 'Sifat reytingi' },
    { id: 'products',  icon: '👗', value: 500,   suffix: '+',  label: 'Mahsulot turlari' },
    { id: 'cities',    icon: '🌍', value: 3,     suffix: '',   label: 'Manba shaharlari' },
  ],
}


export default function AdminSettingsPage() {
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bizData, setBizData] = useState<typeof DEFAULT_BIZRAQAMLARDA>(DEFAULT_BIZRAQAMLARDA)


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
          if (parsed?.header && Array.isArray(parsed.items)) {
            setBizData(parsed)
          } else {
            setBizData(DEFAULT_BIZRAQAMLARDA)
          }
        } else {
          setBizData(DEFAULT_BIZRAQAMLARDA)
        }
      } catch {
        setBizData(DEFAULT_BIZRAQAMLARDA)
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


  // Biz raqamlarda handlers
  function handleHeaderChange(field: keyof BizRaqamlardaHeader, value: string) {
    setBizData(prev => ({ ...prev, header: { ...prev.header, [field]: value } }))
  }

  function handleItemChange(id: string, field: keyof BizRaqamlardaItem, value: string | number) {
    setBizData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: field === 'value' ? Number(value) : value } : item
      ),
    }))
  }

  function handleDeleteItem(id: string) {
    setBizData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }))
  }

  function handleAddItem() {
    setBizData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: genId(),
          icon: '',
          value: 0,
          suffix: '',
          label: '',
        },
      ],
    }))
  }


  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'biz_raqamlarda',
          value: JSON.stringify(bizData),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Saqlandi ✓')
    } catch {
      toast.error('Xatolik')
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
        {/* --- Biz raqamlarda Section --- */}
        <section>
          <div className="mb-5">
            <h1 className="font-display text-xl text-white">
              Biz raqamlarda — Raqamlarni o&apos;zgartirish
            </h1>
            <p className="mt-1 text-sm text-[#9B7B85]">
              Bosh sahifadagi yutuqlar raqamlarini boshqaring.
            </p>
          </div>

          {/* SECTION A — Header texts editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block mb-1 text-xs text-[#9B7B85]">Pill matni</label>
              <input
                type="text"
                value={bizData.header.pill}
                onChange={e => handleHeaderChange('pill', e.target.value)}
                className="w-full rounded-xl border border-[#3D2A36] bg-[#2C1F28] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-[#9B7B85]">Sarlavha</label>
              <input
                type="text"
                value={bizData.header.title}
                onChange={e => handleHeaderChange('title', e.target.value)}
                className="w-full rounded-xl border border-[#3D2A36] bg-[#2C1F28] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-[#9B7B85]">Subtitr</label>
              <input
                type="text"
                value={bizData.header.subtitle}
                onChange={e => handleHeaderChange('subtitle', e.target.value)}
                className="w-full rounded-xl border border-[#3D2A36] bg-[#2C1F28] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-[#9B7B85]">Footer matni</label>
              <input
                type="text"
                value={bizData.header.footer}
                onChange={e => handleHeaderChange('footer', e.target.value)}
                className="w-full rounded-xl border border-[#3D2A36] bg-[#2C1F28] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
              />
            </div>
          </div>

          {/* SECTION B — Stats items editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {bizData.items.map(item => (
              <div
                key={item.id}
                className="relative rounded-2xl border border-[#3D2A36] bg-[#2C1F28] p-4 flex flex-col gap-3"
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="O'chirish"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div>
                  <label className="block mb-1 text-xs text-[#9B7B85]">Emoji</label>
                  <input
                    type="text"
                    value={item.icon}
                    maxLength={2}
                    onChange={e => handleItemChange(item.id, 'icon', e.target.value)}
                    className="w-full rounded-xl border border-[#3D2A36] bg-[#1A1218] px-3 py-2 text-xl text-white outline-none focus:border-brand-deeprose"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-[#9B7B85]">Qiymat</label>
                  <input
                    type="number"
                    value={item.value}
                    min={0}
                    onChange={e => handleItemChange(item.id, 'value', e.target.value)}
                    className="w-full rounded-xl border border-[#3D2A36] bg-[#1A1218] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-[#9B7B85]">Sufiks</label>
                  <select
                    value={item.suffix}
                    onChange={e => handleItemChange(item.id, 'suffix', e.target.value)}
                    className="w-full rounded-xl border border-[#3D2A36] bg-[#1A1218] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
                  >
                    <option value="+">+</option>
                    <option value="%">%</option>
                    <option value="">(yo&apos;q)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs text-[#9B7B85]">Yorliq</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={e => handleItemChange(item.id, 'label', e.target.value)}
                    className="w-full rounded-xl border border-[#3D2A36] bg-[#1A1218] px-3 py-2 text-white outline-none focus:border-brand-deeprose"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-brand-deeprose text-white rounded-xl w-full py-2 font-semibold mb-6 hover:bg-opacity-90 transition"
          >
            Yangi qo&apos;shish +
          </button>

          {isLoading && (
            <p className="mt-3 text-center text-sm text-[#9B7B85]">
              Ma&apos;lumotlar yuklanmoqda...
            </p>
          )}

          {/* SECTION C — Global save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary mt-2 w-full disabled:opacity-60"
          >
            {isSaving ? 'Saqlanmoqda...' : 'Saqlash 💾'}
          </button>
        </section>
      </main>
    </div>
  )
}
