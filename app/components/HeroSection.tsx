"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "../context/LocaleContext";
import sliderImage from "../../public/hickoku-assets/HICKOKU-slider_Image.jpeg";

const getHeroSlides = (t: any) => [
  // {
  //   id: 1,
  //   title: t("hero.silkMusk.title"),
  //   subtitle: t("hero.silkMusk.subtitle"),
  //   description: t("hero.silkMusk.description"),
  //   image:
  //     "https://images.unsplash.com/photo-1619007556336-4d99b008471e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwaGVybyUyMGJhbm5lciUyMGVsZWdhbnR8ZW58MXx8fHwxNzcwNTQxNTI5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  //   bgColor: "bg-[#dfe5db]",
  // },
  {
    id: 1,
    title: t("hero.silkMusk.title"),
    subtitle: t("hero.silkMusk.subtitle"),
    description: t("hero.silkMusk.description"),
    image: { sliderImage },
    bgColor: "bg-[#dfe5db]",
  },
  {
    id: 2,
    title: t("hero.midnightAgar.title"),
    subtitle: t("hero.midnightAgar.subtitle"),
    description: t("hero.midnightAgar.description"),
    image:
      "https://images.unsplash.com/photo-1759793500110-e3cb1f0fe6ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGx1eHVyeSUyMHBlcmZ1bWUlMjBtYXNjdWxpbmV8ZW58MXx8fHwxNzcwNTQxNTI4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    bgColor: "bg-gray-900",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLocale();
  const heroSlides = getHeroSlides(t);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative h-[600px] overflow-hidden mt-16 sm:mt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 ${slide.bgColor}`}
        >
          <div className="absolute inset-0">
            <img
              src={
                typeof slide.image === "string"
                  ? slide.image
                  : slide.image.sliderImage.src
              }
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`max-w-2xl ${currentSlide === 1 ? "text-white" : "text-gray-900"}`}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm tracking-widest uppercase mb-4"
              >
                {slide.subtitle}
              </motion.p>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-6xl sm:text-7xl lg:text-8xl mb-6 tracking-tight"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg mb-8 opacity-90"
              >
                {slide.description}
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full transition-all ${
                  currentSlide === 1
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Discover Now
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
