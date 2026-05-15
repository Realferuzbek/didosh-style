import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from './types'

// ── CART STORE ────────────────────────────────────────────────
interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id && i.size === item.size
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.size === size)
          ),
        }))
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.discount_price ?? i.price) * i.quantity,
          0
        ),
    }),
    {
      name: 'didosh-cart',
    }
  )
)

// ── FAVORITES STORE ───────────────────────────────────────────
interface FavoritesStore {
  ids: string[]
  toggle: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        }))
      },
      isFavorite: (productId) => get().ids.includes(productId),
    }),
    { name: 'didosh-favorites' }
  )
)
