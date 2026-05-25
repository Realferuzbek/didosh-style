import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://didoshstyle.netlify.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        disallow: ['/admin', '/admin/', '/api/', '/checkout', '/order-success', '/verify'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
