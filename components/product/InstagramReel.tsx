'use client'

import { useEffect, useRef, useState } from 'react'

interface InstagramReelProps {
  shortcode: string
}

/**
 * Lazy-loads the Instagram reel iframe only when scrolled into view.
 * Prevents Instagram scripts from loading on page render —
 * saves ~500KB+ of third-party code on initial load.
 */
export default function InstagramReel({ shortcode }: InstagramReelProps) {
  const ref     = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="relative mx-auto overflow-hidden rounded-3xl border border-brand-border shadow-sm"
      style={{ maxWidth: '320px' }}
    >
      <div style={{ paddingBottom: '177.77%', position: 'relative' }}>
        {show ? (
          <iframe
            src={`https://www.instagram.com/reel/${shortcode}/embed/`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            scrolling="no"
            allowTransparency={true}
            allowFullScreen={true}
            loading="lazy"
            title="Instagram Reel"
          />
        ) : (
          /* Placeholder shown until user scrolls to the iframe */
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            className="skeleton flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="#D4698A" width="40" height="40" className="opacity-30">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
