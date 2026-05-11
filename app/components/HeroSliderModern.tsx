"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Modern Hero Slider — v2
 * 
 * IMAGE SIZE GUIDE:
 * ─────────────────────────────────────────────
 * Desktop:  1920 × 720px  (aspect 8:3, ~2.67:1)
 * Mobile:   750 × 1000px  (aspect 3:4)
 * ─────────────────────────────────────────────
 * Format: WebP recommended for best compression
 * Max file size: <150KB per image for performance
 * 
 * Place images in:
 *   /public/hickoku-assets/slider/       (desktop)
 *   /public/hickoku-assets/slider/mobile/ (mobile)
 */

const SLIDES = [
  {
    id: 1,
    desktopImage: "/hickoku-assets/slider/Slider1.webp",
    mobileImage: "/hickoku-assets/slider/mobile/Slider1.webp",
    alt: "Hickoku Premium Attar Collection — Alcohol-free luxury fragrances",
    cta: { text: "Shop Now", href: "/collection" },
  },
  {
    id: 2,
    desktopImage: "/hickoku-assets/slider/Slider2.webp",
    mobileImage: "/hickoku-assets/slider/mobile/Slider2.webp",
    alt: "Hickoku Exclusive Perfumes — Affordable luxury for everyone",
    cta: { text: "Explore", href: "/collection" },
  },
  {
    id: 3,
    desktopImage: "/hickoku-assets/slider/Slider3.webp",
    mobileImage: "/hickoku-assets/slider/mobile/Slider5.webp",
    alt: "Hickoku Long-Lasting Fragrances — Imported oils, crafted in India",
    cta: { text: "Discover", href: "/collection" },
  },
];

const AUTO_PLAY_MS = 6000;

export function HeroSliderModern() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const total = SLIDES.length;

  // ── Auto-play ──────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % total);
    }, AUTO_PLAY_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // ── Navigation ─────────────────────────────────────────────
  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > current ? 1 : -1);
      setCurrent(idx);
      resetTimer();
    },
    [current, resetTimer],
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % total);
    resetTimer();
  }, [total, resetTimer]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + total) % total);
    resetTimer();
  }, [total, resetTimer]);

  // ── Touch / swipe ──────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  const slide = SLIDES[current];

  // Animation variants for the crossfade + subtle zoom
  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.08,
      x: dir > 0 ? 60 : -60,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.95,
      x: dir > 0 ? -60 : 60,
    }),
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Hero banner carousel"
    >
      {/* ── Slide container ─────────────────────────────────── */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[8/3]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Desktop image */}
            <div className="hidden sm:block relative w-full h-full">
              <Image
                src={slide.desktopImage}
                alt={slide.alt}
                fill
                priority={current === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* Mobile image */}
            <div className="block sm:hidden relative w-full h-full">
              <Image
                src={slide.mobileImage}
                alt={slide.alt}
                fill
                priority={current === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>

            {/* Subtle gradient overlay on bottom for indicators */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation arrows ─────────────────────────────── */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* ── Progress indicators ───────────────────────────── */}
      <div className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="relative p-1.5 -m-1.5"
            aria-label={`Go to slide ${idx + 1}`}
          >
            <div
              className={`h-[3px] rounded-full transition-all duration-500 ${
                idx === current
                  ? "w-8 sm:w-10 bg-white"
                  : "w-3 sm:w-4 bg-white/40 hover:bg-white/60"
              }`}
            />
            {/* Animated fill bar for current slide */}
            {idx === current && (
              <motion.div
                key={`progress-${current}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTO_PLAY_MS / 1000, ease: "linear" }}
                className="absolute bottom-1.5 left-1.5 h-[3px] rounded-full bg-white/60 origin-left"
                style={{ width: "calc(100% - 12px)" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
