import type { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://didoshstyle.netlify.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getAdminClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url:              `${SITE_URL}/product/${p.id}`,
    lastModified:     new Date(p.updated_at ?? Date.now()),
    changeFrequency:  'weekly',
    priority:         0.8,
  }))

  return [
    { url: SITE_URL,              lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/catalog`, lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${SITE_URL}/profile`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...productUrls,
  ]
}
