"use client"

import { useState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { X, Plus } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import type { Product, Category } from "@/lib/types"

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46']

export interface ProductPayload {
  name: string
  description: string | null
  price: number
  discount_price: number | null
  category_id: string | null
  images: string[]
  sizes: string[]
  colors: string[]
  stock: number
  is_featured: boolean
  is_active: boolean
}

interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: ProductPayload) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export default function ProductForm({ initialData, onSubmit, isSubmitting, submitLabel }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "")
  const [discountPrice, setDiscountPrice] = useState(initialData?.discount_price?.toString() ?? "")
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "")
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes ?? [])
  const [colors, setColors] = useState<string[]>(initialData?.colors ?? [])
  const [colorInput, setColorInput] = useState("")
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? "0")
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => toast.error("Kategoriyalar yuklanmadi"))
  }, [])

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new window.Image()
      img.onload = () => {
        // Max dimension 1200px
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = (height / width) * MAX; width = MAX }
          else { width = (width / height) * MAX; height = MAX }
        }
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return }
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          0.85
        )
      }
      img.src = URL.createObjectURL(file)
    })
  }

  async function handleImageUpload(file: File, slotIndex: number) {
    setUploadingIndex(slotIndex)
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Yuklashda xatolik')
        return
      }
      setImages(prev => {
        const updated = [...prev]
        updated[slotIndex] = data.url
        return updated
      })
      toast.success('Rasm yuklandi ✓')
    } catch {
      toast.error('Internet aloqasini tekshiring')
    } finally {
      setUploadingIndex(null)
    }
  }

  function handleRemoveImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  function handleAddColor() {
    const color = colorInput.trim()
    if (!color || colors.includes(color)) return
    setColors(prev => [...prev, color])
    setColorInput("")
  }

  function handleRemoveColor(color: string) {
    setColors(prev => prev.filter(c => c !== color))
  }

  function handleToggleSize(size: string) {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  function validate(): string | null {
    if (!name.trim()) return "Mahsulot nomini kiriting"
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return "Narxni kiriting"
    if (images.length === 0) return "Kamida 1 ta rasm qo'shing"
    if (sizes.length === 0) return "Kamida 1 ta o'lcham tanlang"
    if (Number(stock) < 0) return "Noto'g'ri miqdor"
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const error = validate()
    if (error) { toast.error(error); return }
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      category_id: categoryId || null,
      images,
      sizes,
      colors,
      stock: Number(stock),
      is_featured: isFeatured,
      is_active: isActive,
    })
  }

  // Discount preview
  let discountPreview = null
  if (price && discountPrice && Number(discountPrice) < Number(price)) {
    const diff = Number(price) - Number(discountPrice)
    const percent = Math.round((diff / Number(price)) * 100)
    discountPreview = `💡 Chegirma: ${percent}% (${formatPrice(diff)} so'm tejaysiz)`
  }

  return (
    <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Images */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">📸 Rasmlar</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center bg-[#2C1F28] border-2 border-dashed border-[#3D2A36]">
              {images[i] ? (
                <>
                  <img src={images[i]} alt="Rasm" className="object-cover w-full h-full" />
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-[10px] rounded px-1 py-0.5 text-center">Asosiy</div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center z-10"
                    tabIndex={-1}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : uploadingIndex === i ? (
                <div className="flex items-center justify-center w-full h-full">
                  <svg className="animate-spin h-7 w-7 text-[#9B7B85]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <Plus size={28} className="text-[#3D2A36]" />
                  <span className="text-[#5A4050] text-xs mt-1">Rasm qo'shish</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, i)
                    }}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Basic Info */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">📝 Asosiy ma'lumot</h3>
        <div className="space-y-2">
          <label className="text-[13px] text-[#9B7B85]">Mahsulot nomi *</label>
          <input
            type="text"
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
            placeholder="Gul naqshli yozgi ko'ylak"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] text-[#9B7B85]">Tavsif (ixtiyoriy)</label>
          <textarea
            rows={4}
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px] resize-none"
            placeholder="Mahsulot haqida qisqacha..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[13px] text-[#9B7B85]">Kategoriya *</label>
          <select
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>Kategoriya tanlang</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Pricing */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">💰 Narx</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] text-[#9B7B85]">Asosiy narx (so'm) *</label>
            <input
              type="number"
              min={0}
              className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
              placeholder="189000"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] text-[#9B7B85]">Chegirma narxi (so'm)</label>
            <input
              type="number"
              min={0}
              className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
              placeholder="149000"
              value={discountPrice}
              onChange={e => setDiscountPrice(e.target.value)}
            />
          </div>
        </div>
        {discountPreview && (
          <div className="text-[13px] text-brand-deeprose mt-2">{discountPreview}</div>
        )}
      </div>

      {/* 4. Sizes */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">📏 O'lchamlar *</h3>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(size => (
            <button
              type="button"
              key={size}
              onClick={() => handleToggleSize(size)}
              className={cn(
                'border rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-colors',
                sizes.includes(size)
                  ? 'bg-brand-deeprose text-white border-brand-deeprose'
                  : 'bg-[#2C1F28] text-[#9B7B85] border-[#3D2A36]'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Colors */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">🎨 Ranglar</h3>
        <div className="flex gap-2">
          <input
            type="text"
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
            placeholder="Rang nomi: Qizil, Ko'k, Oq..."
            value={colorInput}
            onChange={e => setColorInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor() } }}
          />
          <button
            type="button"
            onClick={handleAddColor}
            className="bg-brand-deeprose text-white rounded-xl px-4 py-2 flex items-center gap-1 hover:bg-[#C05A7A] transition-colors"
          >
            <Plus size={18} /> Qo'shish
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map(color => (
            <span key={color} className="bg-[#2C1F28] border border-[#3D2A36] rounded-full px-3 py-1 text-sm text-white flex items-center gap-1">
              {color}
              <button type="button" onClick={() => handleRemoveColor(color)} className="ml-1 text-[#9B7B85] hover:text-red-400">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Stock & Toggles */}
      <div className="bg-[#2C1F28] rounded-2xl p-4 border border-[#3D2A36] space-y-4">
        <h3 className="text-white font-semibold text-[15px]">📦 Ombor</h3>
        <div className="space-y-2">
          <label className="text-[13px] text-[#9B7B85]">Ombordagi miqdor *</label>
          <input
            type="number"
            min={0}
            className="bg-[#2C1F28] border border-[#3D2A36] rounded-xl px-4 py-3 text-white placeholder:text-[#5A4050] focus:border-brand-deeprose focus:outline-none w-full text-[15px]"
            placeholder="10"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[13px] text-[#9B7B85]">Faol</span>
            <button
              type="button"
              onClick={() => setIsActive(v => !v)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                isActive ? "bg-brand-deeprose" : "bg-[#3D2A36]"
              )}
              aria-label="Faollikni o'zgartirish"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                animate={{ x: isActive ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[13px] text-[#9B7B85]">Featured</span>
            <button
              type="button"
              onClick={() => setIsFeatured(v => !v)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                isFeatured ? "bg-brand-deeprose" : "bg-[#3D2A36]"
              )}
              aria-label="Featuredni o'zgartirish"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                animate={{ x: isFeatured ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </label>
        </div>
      </div>
    </form>
  )
}
