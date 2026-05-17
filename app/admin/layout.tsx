import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'Admin | Didosh Style',
    template: '%s | Admin',
  },
  robots: 'noindex, nofollow', // Don't let Google index admin pages
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1A1218]">
      {children}
      <Toaster position="top-right" />
    </div>
  )
}
