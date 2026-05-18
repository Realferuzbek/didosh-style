import Link from 'next/link'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import CategoryPills from '@/components/home/CategoryPills'
import FeaturedBanner from '@/components/home/FeaturedBanner'
import HeroSection from '@/components/home/HeroSection'
import ProductGrid from '@/components/products/ProductGrid'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { getAdminClient } from '@/lib/supabase/admin'
import type { Product } from '@/lib/types'

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(12)
    if (error || !data) return []
    return data as Product[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <>
      <AnnouncementBar />
      <main className="page-with-nav bg-brand-cream">
        <HeroSection />
        <CategoryPills />
        <section className="page-container py-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Yangi Kelganlar</h2>
              <p className="mt-1 font-body text-[13px] text-brand-muted">
                Bugungi eng chiroyli kiyimlar
              </p>
            </div>
            <Link
              href="/catalog"
              className="shrink-0 font-body text-sm font-medium text-brand-deeprose"
            >
              Hammasini ko&apos;ring →
            </Link>
          </div>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-12 text-brand-muted font-body text-sm">
              Tez kunda yangi mahsulotlar qo&apos;shiladi ✨
            </div>
          )}
        </section>
        <FeaturedBanner />
      </main>
      <WhatsAppButton />
    </>
  )
}