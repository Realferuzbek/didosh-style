'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavoritesStore } from '@/lib/store'
import { cn, discountPercent, formatPrice, getMainImage } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    discount_price: number | null
    images: string[]
    sizes: string[]
    is_featured: boolean
  }
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id))
  const activePrice = product.discount_price ?? product.price
  const visibleSizes = product.sizes.slice(0, 3)
  const remainingSizes = product.sizes.length - visibleSizes.length

  function handleFavoriteClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(44,24,16,0.18)' }}
      className="product-card group cursor-pointer"
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={getMainImage(product.images)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-[600ms] group-hover:scale-110"
            priority={index < 4}
          />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[rgba(44,24,16,0.12)] to-transparent" />

          <div className="absolute left-2 top-2 z-10">
            {product.discount_price ? (
              <span className="badge-sale">
                -{discountPercent(product.price, product.discount_price)}%
              </span>
            ) : product.is_featured ? (
              <span className="badge-new">YANGI</span>
            ) : null}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.75 }}
            animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3, ease: 'backOut' }}
            onClick={handleFavoriteClick}
            aria-label="Sevimlilarga qo'shish"
            className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-brand-muted shadow-sm backdrop-blur transition-colors [will-change:transform]"
          >
            <Heart
              size={19}
              strokeWidth={2}
              className={cn(
                'transition-colors',
                isFavorite
                  ? 'fill-brand-deeprose text-brand-deeprose'
                  : 'text-brand-muted'
              )}
            />
          </motion.button>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 min-h-[40px] font-body text-sm font-medium leading-5 text-brand-dark">
            {product.name}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-body text-base font-semibold text-brand-deeprose">
              {formatPrice(activePrice)}
            </span>
            {product.discount_price && (
              <span className="font-body text-sm text-brand-muted line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {visibleSizes.map((size) => (
              <span
                key={size}
                className="flex h-6 min-w-7 items-center justify-center rounded-md bg-brand-blush px-1.5 font-body text-[11px] font-medium text-brand-dark transition-colors duration-150 hover:bg-brand-rose hover:text-white"
              >
                {size}
              </span>
            ))}
            {remainingSizes > 0 && (
              <span className="flex h-6 min-w-7 items-center justify-center rounded-md bg-brand-border px-1.5 font-body text-[11px] font-medium text-brand-muted">
                +{remainingSizes}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
