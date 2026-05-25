import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
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

/**
 * Format an Uzbek phone number for display.
 * Single source of truth — replaces duplicate implementations in
 * CheckoutForm, OTPModal, and verify/page.tsx.
 *
 * Input:  +998901234567 | 998901234567 | 901234567
 * Output: +998 90 123 45 67
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const d = digits.startsWith('998') ? digits.slice(3) : digits
  if (d.length !== 9) return raw
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`
}

/**
 * Normalize an Uzbek phone number to E.164 format (+998XXXXXXXXX).
 * Single source of truth — replaces inconsistent implementations
 * in send-otp and verify-otp routes.
 *
 * Returns null if the input cannot be recognized as a valid UZ number.
 */
export function normalizeUzbekPhone(phone: unknown): string | null {
  if (typeof phone !== 'string') return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9 || digits.length > 12) return null
  if (digits.startsWith('998') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('0')   && digits.length === 10) return `+998${digits.slice(1)}`
  if (digits.length === 9) return `+998${digits}`
  return null
}
