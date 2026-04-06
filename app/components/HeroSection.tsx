"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "../context/LocaleContext";

const getHeroSlides = (t: any) => [
  {
    id: 1,
    title: "",
    subtitle: "",
    description: "",
    desktopImage: "/hickoku-assets/slider/Slider1.png",
    mobileImage: "/hickoku-assets/slider/mobile/Slider1.png",
    bgColor: "none",
  },
  {
    id: 2,
    title: "",
    subtitle: "",
    description: "",
    desktopImage: "/hickoku-assets/slider/Slider2.png",
    mobileImage: "/hickoku-assets/slider/mobile/Slider2.png",
    bgColor: "none",
  },
  {
    id: 3,
    title: "",
    subtitle: "",
    description: "",
    desktopImage: "/hickoku-assets/slider/Slider3.png",
    mobileImage: "/hickoku-assets/slider/mobile/Slider5.png",
    bgColor: "none",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLocale();
  const heroSlides = getHeroSlides(t);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);
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
    <motion.section
      layout
      transition={{ duration: 0.6, type: "spring", bounce: 0.15 }}
      style={{
        marginTop: isScrolled
          ? typeof window !== "undefined" && window.innerWidth >= 640
            ? "118px"
            : "102px"
          : "0px",
      }}
      className="relative w-full aspect-[4/5] sm:aspect-auto overflow-hidden block bg-white"
    >
      {/* Invisible placeholder dynamically tracks the specific image's native aspect ratio only on Desktop! */}
      <img
        src={slide.desktopImage}
        className="w-full h-auto invisible pointer-events-none hidden sm:block -mb-[180px]"
        alt=""
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.6 }}
          className={`absolute inset-0 ${slide?.bgColor}`}
        >
          <div className="absolute inset-0">
            {/* Mobile Image */}
            <img
              src={slide.mobileImage}
              alt={slide.title || "Hero banner"}
              className={`w-full h-full object-cover sm:hidden ${
                slide.title || slide.subtitle || slide.description
                  ? "mix-blend-overlay opacity-40"
                  : "opacity-100"
              }`}
            />
            {/* Desktop Image */}
            <img
              src={slide.desktopImage}
              alt={slide.title || "Hero banner"}
              className={`w-full h-full object-cover hidden sm:block ${
                slide.title || slide.subtitle || slide.description
                  ? "mix-blend-overlay opacity-40"
                  : "opacity-100"
              }`}
            />
          </div>

          {(slide.title || slide.subtitle || slide.description) && (
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className={`max-w-2xl ${
                  currentSlide === 1 ? "text-white" : "text-gray-900"
                }`}
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
          )}
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
    </motion.section>
  );
}
