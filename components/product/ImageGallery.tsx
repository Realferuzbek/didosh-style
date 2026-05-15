"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const goNext = useCallback(() => {
    if (current < images.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    }
  }, [current, images.length]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setDirection(-1);
      setCurrent(current - 1);
    }
  }, [current]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  }


  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goPrev, goNext]);

  // If only 1 image, show gradient + emoji
  if (images.length === 0) {
    return (
      <div className="aspect-square md:aspect-[4/3] w-full bg-brand-blush flex items-center justify-center relative">
        <span className="text-[64px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 select-none pointer-events-none">👗</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-full aspect-square md:aspect-[4/3] relative overflow-hidden select-none">
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full relative"
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={images[current]}
                alt={name}
                fill
                className="object-cover object-center"
                priority={current === 0}
                sizes="(max-width: 640px) 100vw, 800px"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Dot pagination */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <motion.div
              key={i}
              layout
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                current === i ? "w-5 bg-brand-deeprose" : "w-1.5 bg-brand-border"
              )}
            />
          ))}
        </div>
      </div>
      {/* Thumbnails if 3+ images */}
      {images.length >= 3 && (
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2">
          {images.map((img, i) => (
            <button
              key={i}
              className={cn(
                "w-14 h-14 rounded-xl overflow-hidden border-2",
                current === i ? "border-brand-deeprose" : "border-transparent opacity-60"
              )}
              onClick={() => goTo(i)}
              tabIndex={0}
            >
              <Image src={img} alt={name} width={56} height={56} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
