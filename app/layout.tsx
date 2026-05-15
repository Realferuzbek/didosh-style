import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'Didosh Style',
    template: '%s | Didosh Style',
  },
  description: "Siz uchun — elegantlik va zamonaviylik. Ayollar kiyimlari onlayn do'koni.",
  keywords: ['ayollar kiyimi', 'online kiyim', 'Didosh Style', 'Toshkent'],
  openGraph: {
    title: 'Didosh Style',
    description: "Siz uchun — elegantlik va zamonaviylik.",
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFF8F5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body className="bg-brand-cream antialiased">
        {children}
        <BottomNav />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2C1810',
              color: '#FFF8F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#C9A84C',
                secondary: '#FFF8F5',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
