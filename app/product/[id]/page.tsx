'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Heart, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import ImageGallery from '@/components/product/ImageGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ColorSelector from '@/components/product/ColorSelector'
import SizeSelector from '@/components/product/SizeSelector'
import DescriptionAccordion from '@/components/product/DescriptionAccordion'
import SimilarProducts from '@/components/product/SimilarProducts'
import InstagramReel from '@/components/product/InstagramReel'
import AddToCartBar from '@/components/product/AddToCartBar'
import toast from 'react-hot-toast'
import type { Product } from '@/lib/types'

function extractReelShortcode(url: string): string | null {
  if (!url) return null
  const match = url.match(/\/(?:reel|p)\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : null
}

function ProductSkeleton() {
  return (
    <div className="pt-[52px] pb-[88px] animate-pulse">
      <div className="aspect-[3/4] w-full skeleton" />
      <div className="page-container py-5 space-y-4">
        <div className="h-6 skeleton rounded-xl w-3/4" />
        <div className="h-8 skeleton rounded-xl w-1/2" />
        <div className="h-4 skeleton rounded-xl w-full" />
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [product,       setProduct]       = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [isLoading,     setIsLoading]     = useState(true)
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [sizeError,     setSizeError]     = useState(false)
  const [addedToCart,   setAddedToCart]   = useState(false)

  const addItem        = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem     = useCartStore((s) => s.removeItem)
  const cartItems      = useCartStore((s) => s.items)
  const isFavorite     = useFavoritesStore((s) => s.isFavorite(id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    // Fetch product detail and same-category similar products in parallel
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/products/${id}/similar`).then(r => r.json()).catch(() => []),
    ]).then(([prod, similar]) => {
      if (cancelled) return
      if (!prod) { router.replace('/catalog'); return }
      setProduct(prod)
      setSelectedColor(prod.colors?.[0] ?? null)
      setSimilarProducts(Array.isArray(similar) ? similar : [])
    }).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id, router])

  const handleAddToCart = useCallback(() => {
    if (!product) return
    if (!selectedSize) {
      setSizeError(true)
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    addItem({
      product_id:    product.id,
      name:          product.name,
      image:         product.images[0] ?? '',
      price:         product.price,
      discount_price: product.discount_price,
      size:          selectedSize,
      color:         selectedColor,
      quantity:      1,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }, [product, selectedSize, selectedColor, addItem])

  const handleShare = useCallback(() => {
    if (!product) return
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Didosh Style: ${product.name} — ${formatPrice(product.discount_price ?? product.price)}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Havola nusxalandi! 🔗')
    }
  }, [product])

  if (isLoading) return <ProductSkeleton />
  if (!product)  return null


  // How many of this product+size are already in cart
  const cartItem = selectedSize && product
    ? cartItems.find(i => i.product_id === product.id && i.size === selectedSize)
    : null
  const cartQuantity = cartItem?.quantity ?? 0

  function handleIncrement() {
    if (!cartItem || !selectedSize) return
    if (!product) return
    updateQuantity(product.id, selectedSize, cartItem.quantity + 1)
  }
  function handleDecrement() {
    if (!cartItem || !selectedSize) return
    if (!product) return
    if (cartItem.quantity <= 1) {
      removeItem(product.id, selectedSize)
    } else {
      updateQuantity(product.id, selectedSize, cartItem.quantity - 1)
    }
  }

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-30 h-[52px] flex items-center justify-between px-4',
        'bg-brand-cream/90 backdrop-blur-xl border-b border-brand-border/40'
      )}>
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-brand-blush active:scale-95"
        >
          <ChevronLeft size={22} className="text-brand-dark" />
        </button>
        <span className="font-display text-[18px] font-semibold text-brand-dark line-clamp-1 flex-1 text-center px-2">
          {product.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-brand-blush/80 backdrop-blur flex items-center justify-center active:scale-90"
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-brand-deeprose text-brand-deeprose' : 'text-brand-muted'}
            />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-brand-blush/80 flex items-center justify-center ml-1 active:scale-90"
            onClick={handleShare}
          >
            <Share2 size={18} className="text-brand-dark" />
          </button>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <main className="pt-[52px] pb-[88px] lg:pb-0">

        {/* Desktop: two-column. Mobile: single column. */}
        <div className="lg:grid lg:grid-cols-[minmax(340px,1fr)_1fr] lg:max-w-6xl lg:mx-auto">

          {/* Left — image gallery (sticky on desktop) */}
          <div className="lg:sticky lg:top-[52px] lg:self-start">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Right — product details */}
          <div className="page-container py-5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-52px)] lg:pb-32">
            <ProductInfo product={product} />

            {product.colors && product.colors.length > 0 && (
              <ColorSelector
                colors={product.colors}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />
            )}

            <SizeSelector
              id="size-selector"
              sizes={product.sizes}
              selected={selectedSize}
              onSelect={(size: string) => { setSelectedSize(size); setSizeError(false) }}
              hasError={sizeError}
            />

            <DescriptionAccordion description={product.description} />

            {(() => {
              const shortcode = product.instagram_reel_url
                ? extractReelShortcode(product.instagram_reel_url)
                : null
              if (!shortcode) return null
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-3"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                      }}
                    >
                      {/* Instagram icon inline SVG */}
                      <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-body font-semibold text-[14px] text-brand-dark leading-none">
                        Instagram da ko&apos;ring
                      </p>
                      <p className="font-body text-[11px] text-brand-muted mt-0.5">
                        @didosh_style
                      </p>
                    </div>
                  </div>

                  {/* Reel iframe — lazy loaded when scrolled into view */}
                  <InstagramReel shortcode={shortcode} />

                  {/* Bottom CTA buttons */}
                  <div className="flex gap-2 max-w-[320px] mx-auto">
                    <a
                      href={`https://www.instagram.com/reel/${shortcode}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-2.5 font-body text-[12px] font-medium transition-colors"
                      style={{
                        background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)',
                        color: 'white',
                      }}
                    >
                      Reelni ko&apos;rish ↗
                    </a>
                    <a
                      href="https://www.instagram.com/didosh_style/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-blush hover:bg-brand-border border border-brand-border rounded-2xl py-2.5 font-body text-[12px] font-medium text-brand-dark transition-colors"
                    >
                      @didosh_style
                    </a>
                  </div>
                </motion.div>
              )
            })()}

            {/* Desktop: inline add-to-cart (replaces sticky bar) */}
            <div className="hidden lg:flex items-center gap-4 pt-2">
              <div className="flex flex-col">
                <span className="text-[12px] text-brand-muted font-body">Jami:</span>
                <span className="text-[22px] font-bold text-brand-deeprose font-body">
                  {formatPrice(product.discount_price ?? product.price)}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1"
              >
                {addedToCart ? '✓ Savatchaga qo\'shildi' : 'Savatchaga qo\'shish'}
              </button>
            </div>
          </div>

        </div>

        {/* Similar products — full width below the grid */}
        {similarProducts.length > 0 && (
          <SimilarProducts products={similarProducts} />
        )}
      </main>

      {/* Mobile sticky bar */}
      <div className="lg:hidden">
        <AddToCartBar
          price={product.price}
          discountPrice={product.discount_price}
          onAddToCart={handleAddToCart}
          addedToCart={addedToCart}
          disabled={false}
          cartQuantity={cartQuantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </div>
    </>
  )
}
