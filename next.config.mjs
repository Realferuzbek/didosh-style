/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent Didosh Style from being embedded in other sites (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers from sniffing MIME types
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer info sent to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser APIs — allow geolocation only from same origin
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          // XSS filter for legacy browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Force HTTPS for 1 year (only meaningful in production)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Content Security Policy
          // unsafe-inline + unsafe-eval are required by Next.js 14 & Framer Motion.
          // frame-src allows Instagram reel embeds on product pages.
          // connect-src allows Supabase, Nominatim geocoding, and Eskiz SMS API.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.pexels.com",
              "frame-src https://www.instagram.com",
              "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://notify.eskiz.uz",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
