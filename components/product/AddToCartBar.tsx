'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Check, Minus, Plus, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface AddToCartBarProps {
  price: number
  discountPrice: number | null
  onAddToCart: () => void
  addedToCart: boolean
  disabled?: boolean
  cartQuantity?: number       // how many of THIS item+size are in cart
  onIncrement?: () => void    // +1 in cart
  onDecrement?: () => void    // -1 in cart
}

export default function AddToCartBar({
  price,
  discountPrice,
  onAddToCart,
  addedToCart,
  disabled,
  cartQuantity = 0,
  onIncrement,
  onDecrement,
}: AddToCartBarProps) {
  const router = useRouter()
  const activePrice = discountPrice ?? price
  const inCart = cartQuantity > 0

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-brand-border/50 px-4 py-3 flex items-center gap-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', willChange: 'transform' }}
    >
      {/* Price */}
      <div className="flex flex-col min-w-[80px]">
        <span className="text-[11px] text-brand-muted font-body">Jami:</span>
        <span className="text-[18px] font-bold text-brand-deeprose font-body leading-tight">
          {formatPrice(activePrice * Math.max(cartQuantity, 1))}
        </span>
      </div>

      {/* Button area */}
      <div className="flex-1 flex items-center gap-2">
        <AnimatePresence mode="wait">
          {addedToCart ? (
            /* ── Just-added flash (green, 2.5s) ── */
            <motion.div
              key="added"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-body font-semibold rounded-btn px-4 py-3.5 text-[15px]"
            >
              <Check size={18} />
              Savatga qo&apos;shildi ✓
            </motion.div>
          ) : inCart ? (
            /* ── Already in cart: quantity controls + Go to cart ── */
            <motion.div
              key="incart"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex items-center gap-2"
            >
              {/* Quantity control */}
              <div className="flex items-center bg-brand-blush rounded-btn overflow-hidden border border-brand-border">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={onDecrement}
                  className="w-10 h-11 flex items-center justify-center text-brand-deeprose hover:bg-brand-rose/30 transition-colors"
                  aria-label="Kamroq"
                >
                  <Minus size={16} />
                </motion.button>
                <span className="w-8 text-center font-body font-bold text-brand-dark text-[16px]">
                  {cartQuantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={onIncrement}
                  className="w-10 h-11 flex items-center justify-center text-brand-deeprose hover:bg-brand-rose/30 transition-colors"
                  aria-label="Ko'proq"
                >
                  <Plus size={16} />
                </motion.button>
              </div>

              {/* Go to cart */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/cart')}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-deeprose text-white font-body font-semibold rounded-btn px-4 py-3.5 text-[15px] hover:bg-[#C05A7A] transition-colors"
              >
                Savatga o&apos;tish
                <ArrowRight size={17} />
              </motion.button>
            </motion.div>
          ) : (
            /* ── Not in cart: add to cart ── */
            <motion.button
              key="add"
              type="button"
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              onClick={onAddToCart}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-deeprose hover:bg-[#C05A7A] text-white font-body font-semibold rounded-btn px-4 py-3.5 text-[15px] transition-colors disabled:opacity-50"
            >
              <ShoppingBag size={18} />
              Savatchaga qo&apos;shish
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}