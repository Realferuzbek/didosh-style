'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid2X2, ShoppingBag, Heart, User } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',          icon: Home,        label: 'Bosh sahifa' },
  { href: '/catalog',   icon: Grid2X2,     label: 'Katalog'     },
  { href: '/cart',      icon: ShoppingBag, label: 'Savatcha'    },
  { href: '/favorites', icon: Heart,       label: 'Sevimli'     },
  { href: '/profile',   icon: User,        label: 'Profil'      },
]

export default function BottomNav() {
  const pathname   = usePathname()
  const totalItems = useCartStore((s) => s.totalItems())
  // mounted prevents Zustand localStorage hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order-success') ||
    pathname.startsWith('/product') ||
    (pathname.startsWith('/cart') && mounted && totalItems > 0)
  ) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border/50 bg-white/85 shadow-nav backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5',
                'min-w-[56px] rounded-xl transition-all duration-200',
                isActive ? 'bg-brand-blush px-2 py-1 text-brand-deeprose' : 'text-brand-muted'
              )}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn('transition-all duration-200', isActive && 'scale-110')}
                />
                {/* Only render badge after client mount to prevent hydration mismatch */}
                {mounted && href === '/cart' && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-deeprose text-white text-[10px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-body font-medium transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-deeprose" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}