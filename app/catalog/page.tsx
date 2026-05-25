'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import SearchBar from '@/components/catalog/SearchBar'
import FilterBar from '@/components/catalog/FilterBar'
import ProductSkeleton from '@/components/catalog/ProductSkeleton'
import EmptyState from '@/components/catalog/EmptyState'
import FilterDrawer from '@/components/catalog/FilterDrawer'
import ProductCard from '@/components/products/ProductCard'

interface Category { id: string; name: string; slug: string; sort_order: number }

const LIMIT = 24

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return scrolled
}

function buildProductsUrl(category: string, offset: number) {
  const params = new URLSearchParams({
    limit:  String(LIMIT),
    offset: String(offset),
  })
  if (category !== 'barchasi') params.set('category', category)
  return `/api/products?${params}`
}

export default function CatalogPage() {
  const [search,          setSearch]          = useState('')
  const [activeCategory,  setActiveCategory]  = useState('barchasi')
  const [sortBy,          setSortBy]          = useState('newest')
  const [selectedSizes,   setSelectedSizes]   = useState<string[]>([])
  const [priceMin,        setPriceMin]        = useState<number | null>(null)
  const [priceMax,        setPriceMax]        = useState<number | null>(null)
  const [isFilterOpen,    setIsFilterOpen]    = useState(false)
  const [isLoading,       setIsLoading]       = useState(true)
  const [isFetchingMore,  setIsFetchingMore]  = useState(false)
  const [products,        setProducts]        = useState<Product[]>([])
  const [categories,      setCategories]      = useState<Category[]>([])
  const [offset,          setOffset]          = useState(0)
  const [hasMore,         setHasMore]         = useState(true)

  // Fetch categories once on mount
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
  }, [])

  // Fetch first page whenever active category changes
  useEffect(() => {
    setIsLoading(true)
    setProducts([])
    setOffset(0)
    setHasMore(true)
    fetch(buildProductsUrl(activeCategory, 0))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data)
          setHasMore(data.length === LIMIT)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [activeCategory])

  const loadMore = useCallback(() => {
    const nextOffset = offset + LIMIT
    setIsFetchingMore(true)
    fetch(buildProductsUrl(activeCategory, nextOffset))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(prev => [...prev, ...data])
          setOffset(nextOffset)
          setHasMore(data.length === LIMIT)
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingMore(false))
  }, [activeCategory, offset])

  // Client-side filters work on ALL loaded products
  // (Category filtering is done server-side via the API)
  const filteredProducts = useMemo(() => {
    let result = [...products]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    if (selectedSizes.length > 0) {
      result = result.filter(p => selectedSizes.some(s => p.sizes.includes(s)))
    }
    if (priceMin !== null) result = result.filter(p => (p.discount_price ?? p.price) >= priceMin)
    if (priceMax !== null) result = result.filter(p => (p.discount_price ?? p.price) <= priceMax)
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price))
        break
      case 'price-desc':
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price))
        break
      case 'discount':
        result.sort((a, b) => (b.discount_price !== null ? 1 : 0) - (a.discount_price !== null ? 1 : 0))
        break
    }
    return result
  }, [search, sortBy, selectedSizes, priceMin, priceMax, products])

  const hasActiveFilters =
    activeCategory !== 'barchasi' ||
    selectedSizes.length > 0 ||
    priceMin !== null ||
    priceMax !== null

  const scrolled = useScrolled()

  return (
    <>
      <div className={cn(
        'sticky top-0 z-30 bg-brand-cream/90 backdrop-blur-xl transition-all',
        scrolled && 'border-b border-brand-border/60',
      )}>
        <div className="flex items-center justify-between h-[52px] px-4">
          <Link href="/" className="flex items-center p-1 -ml-2 rounded-full hover:bg-brand-blush active:scale-95">
            <ChevronLeft size={22} className="text-brand-dark" />
          </Link>
          <div className="font-display text-[22px] font-semibold text-brand-dark">Katalog</div>
          <button
            type="button"
            className="relative p-1 rounded-full hover:bg-brand-blush active:scale-95"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filtrlash"
          >
            <SlidersHorizontal size={22} className="text-brand-dark" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-deeprose rounded-full shadow" />
            )}
          </button>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <FilterBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultCount={filteredProducts.length}
        categories={categories}
      />

      <main className="page-container page-with-nav pb-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            searchQuery={search}
            hasFilters={hasActiveFilters}
            onReset={() => {
              setSearch('')
              setActiveCategory('barchasi')
              setSelectedSizes([])
              setPriceMin(null)
              setPriceMax(null)
            }}
          />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden:   { opacity: 0, y: 20 },
                      visible:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
                    }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load More button */}
            {hasMore && !search && selectedSizes.length === 0 && priceMin === null && priceMax === null && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className={cn(
                    'btn-outline px-8 py-3 rounded-full font-body text-sm font-medium transition-all',
                    isFetchingMore && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {isFetchingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Yuklanmoqda...
                    </span>
                  ) : (
                    "Ko'proq ko'rish"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedSizes={selectedSizes}
        onSizesChange={setSelectedSizes}
        priceMin={priceMin}
        priceMax={priceMax}
        onPriceChange={(min, max) => { setPriceMin(min); setPriceMax(max) }}
        productCount={filteredProducts.length}
      />
    </>
  )
}
