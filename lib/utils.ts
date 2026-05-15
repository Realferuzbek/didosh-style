import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  // Regex-based: server and client produce identical output, no locale dependency
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return formatted + " so'm"
}

/** Calculate discount percentage */
export function discountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100)
}

/** Get first image from product images array */
export function getMainImage(images: string[]): string {
  return images[0] ?? '/placeholder.jpg'
}

/** Truncate text */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}
