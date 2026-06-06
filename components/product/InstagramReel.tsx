'use client'

import { useEffect, useRef, useState } from 'react'

interface InstagramReelProps {
  shortcode: string
}

export default function InstagramReel({ shortcode }: InstagramReelProps) {
  const ref           = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If element is already visible on mount (no scroll needed), show immediately
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShow(true)
      return
    }

    // Otherwise observe and load 300px before entering the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          observer.disconnect()
        }
      },
      {
        threshold:  0,
        rootMargin: '300px 0px',
      },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="mx-auto rounded-2xl border border-brand-border shadow-sm overflow-hidden"
      style={{ maxWidth: '340px', height: '600px' }}
    >
      {show ? (
        <iframe
          src={`https://www.instagram.com/reel/${shortcode}/embed/`}
          width="340"
          height="600"
          style={{ display: 'block', border: 'none' }}
          scrolling="no"
          allowFullScreen
          loading="eager"
          title="Instagram Reel"
        />
      ) : (
        <div
          className="w-full h-full skeleton flex flex-col items-center justify-center gap-3"
        >
          <svg
            viewBox="0 0 24 24"
            fill="#D4698A"
            width="48"
            height="48"
            className="opacity-40"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 
            1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 
            3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058
            -1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771
            -1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013
            -3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 
            1.645-.069 4.849-.069z" />
          </svg>
          <span className="text-brand-muted text-xs font-body">
            Instagram yuklanmoqda...
          </span>
        </div>
      )}
    </div>
  )
}
