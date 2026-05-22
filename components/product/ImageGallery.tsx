'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ── Fullscreen Zoom Viewer ─────────────────────────────────────────────────
// Opens on tap. Supports: pinch-to-zoom, double-tap zoom, drag-to-pan,
// swipe-to-change-image (when not zoomed), mouse-wheel zoom (desktop).

interface ZoomViewerProps {
  images: string[]
  name: string
  startIndex: number
  onClose: () => void
}

function ZoomViewer({ images, name, startIndex, onClose }: ZoomViewerProps) {
  const [idx,    setIdx]    = useState(startIndex)
  const [scale,  setScale]  = useState(1)
  const [pan,    setPan]    = useState({ x: 0, y: 0 })

  const isZoomed      = scale > 1.05
  const lastTap       = useRef(0)
  const pinchStart    = useRef({ dist: 0, scale: 1 })
  const dragStart     = useRef({ cx: 0, cy: 0, px: 0, py: 0 })
  const swipeStartX   = useRef(0)
  const didPinch      = useRef(false)

  // Reset zoom when image changes
  useEffect(() => { setScale(1); setPan({ x: 0, y: 0 }) }, [idx])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function pinchDist(t: React.TouchList) {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function handleTouchStart(e: React.TouchEvent) {
    didPinch.current = false
    if (e.touches.length === 2) {
      pinchStart.current = { dist: pinchDist(e.touches), scale }
      didPinch.current = true
    } else {
      swipeStartX.current = e.touches[0].clientX
      dragStart.current = { cx: e.touches[0].clientX, cy: e.touches[0].clientY, px: pan.x, py: pan.y }
      // Double-tap
      const now = Date.now()
      if (now - lastTap.current < 280) {
        setScale(s => (s > 1.05 ? 1 : 2.5))
        setPan({ x: 0, y: 0 })
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      didPinch.current = true
      const newScale = Math.min(5, Math.max(1, pinchStart.current.scale * (pinchDist(e.touches) / pinchStart.current.dist)))
      setScale(newScale)
    } else if (e.touches.length === 1 && isZoomed) {
      setPan({
        x: dragStart.current.px + (e.touches[0].clientX - dragStart.current.cx),
        y: dragStart.current.py + (e.touches[0].clientY - dragStart.current.cy),
      })
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isZoomed && !didPinch.current && e.changedTouches.length === 1) {
      const diff = swipeStartX.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 55) {
        if (diff > 0 && idx < images.length - 1) setIdx(i => i + 1)
        if (diff < 0 && idx > 0) setIdx(i => i - 1)
      }
    }
    if (scale < 1.05) { setScale(1); setPan({ x: 0, y: 0 }) }
  }

  // Mouse-wheel zoom for desktop
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    setScale(s => Math.min(5, Math.max(1, s * (e.deltaY > 0 ? 0.9 : 1.1))))
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe-top py-3 shrink-0 select-none">
        <span className="text-white/50 text-sm font-body">
          {images.length > 1 ? `${idx + 1} / ${images.length}` : name}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          aria-label="Yopish"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Image area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
            style={{
              transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
              transition: scale === 1 ? 'transform 0.25s ease' : 'none',
              willChange: 'transform',
            }}
          >
            <Image
              src={images[idx]}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
              quality={95}
              priority
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>


      </div>

      {/* Thumbnail row */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cn(
                'w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                i === idx ? 'border-brand-deeprose' : 'border-transparent opacity-50'
              )}
            >
              <Image src={img} alt="" width={48} height={48} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Main Gallery Component ─────────────────────────────────────────────────
interface ImageGalleryProps {
  images: string[]
  name: string
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [current,  setCurrent]  = useState(0)
  const [direction, setDirection] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const touchStartX = useRef(0)
  const touchEndX   = useRef(0)
  const didMove     = useRef(false)

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  const goNext = useCallback(() => {
    if (current < images.length - 1) { setDirection(1); setCurrent(c => c + 1) }
  }, [current, images.length])

  const goPrev = useCallback(() => {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1) }
  }, [current])

  // Keyboard navigation (desktop)
  useEffect(() => {
    if (zoomOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext, zoomOpen])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    didMove.current = false
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
    if (Math.abs(touchStartX.current - e.touches[0].clientX) > 8) didMove.current = true
  }
  function onTouchEnd() {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) { goNext() } else { goPrev() }
    } else if (!didMove.current) {
      // Pure tap (no swipe) → open zoom
      setZoomOpen(true)
    }
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] lg:aspect-auto lg:h-full bg-brand-blush flex items-center justify-center">
        <span className="text-7xl opacity-20 select-none">👗</span>
      </div>
    )
  }

  return (
    <>
      {/* ── Gallery strip ───────────────────────────────────────────────── */}
      <div
        className={cn(
          // Mobile: portrait 3:4 ratio
          // Desktop (lg): fill the sticky column height
          'relative w-full overflow-hidden select-none bg-brand-cream',
          'aspect-[3/4]',
          'lg:aspect-auto lg:h-[calc(100vh-80px)] lg:sticky lg:top-[56px]'
        )}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={{
              enter:  (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:   (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* object-contain → NEVER crops — you always see the full product */}
            <Image
              src={images[current]}
              alt={name}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={95}
              priority={current === 0}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>



        {/* Dot pagination */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <motion.button
                key={i}
                layout
                onClick={() => goTo(i)}
                aria-label={`${i + 1}-rasm`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  current === i ? 'w-5 bg-brand-deeprose' : 'w-1.5 bg-brand-border'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip (shown below gallery on mobile if 3+ images) */}
      {images.length >= 2 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto hide-scrollbar bg-brand-cream lg:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all',
                current === i ? 'border-brand-deeprose' : 'border-transparent opacity-55'
              )}
            >
              <Image src={img} alt={name} width={56} height={56} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen zoom viewer */}
      <AnimatePresence>
        {zoomOpen && (
          <ZoomViewer
            images={images}
            name={name}
            startIndex={current}
            onClose={() => setZoomOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}