'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useFavoritesStore } from '@/lib/store'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/lib/types'

function FavoriteSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-[3/4] skeleton rounded-card" />
      ))}
    </div>
  )
}

export default function FavoritesPage() {
  const ids = useFavoritesStore(s => s.ids)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setIsLoading(false); return }

    // Batch fetch — only load the specific favorited products, not the entire catalog
    fetch('/api/products/batch', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ids }),
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data) })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [ids])

  return (
    <div className="page-with-nav">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-xl border-b border-brand-border/40 px-4 h-[52px] flex items-center">
        <h1 className="font-display text-[22px] font-semibold text-brand-dark">
          Sevimlilar
          {ids.length > 0 && (
            <span className="ml-2 font-body text-sm text-brand-muted font-normal">
              ({ids.length} ta)
            </span>
          )}
        </h1>
      </div>

      <main className="page-container py-5">
        {isLoading ? (
          <FavoriteSkeleton />
        ) : ids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-blush flex items-center justify-center">
              <Heart size={36} className="text-brand-deeprose" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-brand-dark mb-2">
                Sevimlilar bo&apos;sh
              </h2>
              <p className="text-brand-muted text-[15px] max-w-[240px]">
                Yoqtirgan mahsulotlaringizni ♥ bosib saqlang
              </p>
            </div>
            <Link href="/catalog" className="btn-primary max-w-[200px]">
              Katalogni ko&apos;ring
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-brand-muted text-sm">Yuklanmoqda...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
