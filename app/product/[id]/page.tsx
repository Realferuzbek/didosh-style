'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Heart, Share2 } from 'lucide-react'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import ImageGallery from '@/components/product/ImageGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ColorSelector from '@/components/product/ColorSelector'
import SizeSelector from '@/components/product/SizeSelector'
import DescriptionAccordion from '@/components/product/DescriptionAccordion'
import SimilarProducts from '@/components/product/SimilarProducts'
import AddToCartBar from '@/components/product/AddToCartBar'
import toast from 'react-hot-toast'
import type { Product } from '@/lib/types'

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
  const [allProducts,   setAllProducts]   = useState<Product[]>([])
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
    Promise.all([
      fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/products').then(r => r.json()).catch(() => []),
    ]).then(([prod, all]) => {
      if (cancelled) return
      if (!prod) { router.replace('/catalog'); return }
      setProduct(prod)
      setSelectedColor(prod.colors?.[0] ?? null)
      setAllProducts(Array.isArray(all) ? all : [])
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

  const similarProducts = allProducts.filter(p => p.id !== product.id).slice(0, 6)

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