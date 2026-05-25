import type { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://didoshstyle.netlify.app'

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  try {
    const supabase = getAdminClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, description, images, price, discount_price')
      .eq('id', params.id)
      .single()

    if (!product) {
      return { title: "Mahsulot topilmadi | Didosh Style" }
    }

    const price    = product.discount_price ?? product.price
    const priceStr = Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    const desc     = product.description
      ?? `${product.name} — Didosh Style do'konida. Narxi: ${priceStr} so'm`
    const image    = product.images?.[0]

    return {
      title:       `${product.name} | Didosh Style`,
      description: desc,
      openGraph: {
        title:       product.name,
        description: desc,
        url:         `${SITE_URL}/product/${params.id}`,
        siteName:    "Didosh Style",
        images:      image ? [{ url: image, width: 800, height: 1067, alt: product.name }] : [],
        type:        'website',
        locale:      'uz_UZ',
      },
      twitter: {
        card:        'summary_large_image',
        title:       product.name,
        description: desc,
        images:      image ? [image] : [],
      },
    }
  } catch {
    return { title: "Didosh Style" }
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
