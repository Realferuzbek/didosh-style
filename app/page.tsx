import Link from 'next/link'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import CategoryPills from '@/components/home/CategoryPills'
import FeaturedBanner from '@/components/home/FeaturedBanner'
import HeroSection from '@/components/home/HeroSection'
import ProductGrid from '@/components/products/ProductGrid'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export default function HomePage() {
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
          <ProductGrid products={MOCK_PRODUCTS} />
        </section>
        <FeaturedBanner />
      </main>
      <WhatsAppButton />
    </>
  )
}
