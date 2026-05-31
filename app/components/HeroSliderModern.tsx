"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ShoppingBag, Truck, RotateCcw, Clock,
 ArrowRight, ShieldCheck, ChevronDown
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/currency";
import * as fpixel from "@/lib/fpixel";

export interface SlideProduct {
  id: string;
  name: string;
  description: string;
  highlight: string;
  price: string;
  image: string;
  badge?: string;
  slug: string;
  defaultVariantId?: string;
  defaultSku?: string;
  category?: string;
}

interface HeroSliderModernProps {
  products?: SlideProduct[];
}

interface EnhancedProduct {
  id: string;
  name: string;
  description: string;
  highlight: string;
  price: string;
  salePrice: number;
  image: string;
  badge: string;
  tags: string[];
  longevityLabel: string;
  longevityHours: number;
  longevityType: string;
  similarTo: string[];
  occasions: string[];
  vibe: string;
  slug: string;
  defaultVariantId?: string;
  defaultSku?: string;
  category?: string;
}

const STATIC_EIGHT_COLLECTION: EnhancedProduct[] = [
  {
    id: "hick-01",
    name: "Roselia",
    description: "An elegant, velvet rose fragrance blended with warm woods and soft spice.",
    highlight: "Step into a blooming rose garden at dawn, kissed by morning dew.",
    price: "₹499.00",
    salePrice: 249.50,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    badge: "Trending in Mumbai — 1,200+ Sold This Week",
    tags: ["Red Rose", "Sandalwood", "Saffron"],
    longevityLabel: "10-12 HR Longevity (Extremely Long Lasting)",
    longevityHours: 11,
    longevityType: "Extremely Long Lasting",
    similarTo: ["Warm spiced rose garden", "Incense & evening embers"],
    occasions: ["Date Night", "Wedding", "Romance"],
    vibe: "Romance",
    slug: "roselia"
  },
  {
    id: "hick-02",
    name: "Velvira",
    description: "Command the room with bold amber wood and rich smokey vetiver.",
    highlight: "A commanding shield of precious wood, spices, and bold confidence.",
    price: "₹550.00",
    salePrice: 275.00,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600",
    badge: "98% Report Increased Compliments",
    tags: ["Amber Wood", "Vetiver", "Bergamot"],
    longevityLabel: "10-12 HR Longevity (Extremely Long Lasting)",
    longevityHours: 11,
    longevityType: "Extremely Long Lasting",
    similarTo: ["Rich smokey leather bonfire", "Sun-warmed spiced cardamom"],
    occasions: ["Office", "Meeting", "Confidence"],
    vibe: "Confidence",
    slug: "velvira"
  },
  {
    id: "hick-03",
    name: "Aveline",
    description: "Find your quiet sanctuary in soft lavender field, sea salt and vanilla.",
    highlight: "Soothe your senses in quiet ocean salt and powdery fields of lavender.",
    price: "₹360.00",
    salePrice: 180.00,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Top Rated for Daily Office Wear",
    tags: ["Lavender", "Sea Salt", "Vanilla"],
    longevityLabel: "8-10 HR Longevity (Long Lasting)",
    longevityHours: 9,
    longevityType: "Long Lasting",
    similarTo: ["Breezy oceanic salted air", "Warm creamy vanilla custard"],
    occasions: ["Daily Wear", "Relaxing", "Serenity"],
    vibe: "Serenity",
    slug: "aveline"
  },
  {
    id: "hick-04",
    name: "Oud Noir",
    description: "Embrace the dark, intoxicating depths of agarwood and smoky leather.",
    highlight: "An intense, mysterious veil of pure dark agarwood and clean leather.",
    price: "₹650.00",
    salePrice: 325.00,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600",
    badge: "Collector's Limited Edition",
    tags: ["Agarwood", "Smokey Leather", "Cardamom"],
    longevityLabel: "12+ HR Longevity (Intense Longevity)",
    longevityHours: 12,
    longevityType: "Intense Longevity",
    similarTo: ["Warm exotic incense resin", "Rich balsamic wood & amber"],
    occasions: ["Late Night", "Party", "Mystery"],
    vibe: "Mystery",
    slug: "oud-noir"
  },
  {
    id: "hick-05",
    name: "Solis",
    description: "Exude warmth and festive joy with roasted tonka bean and spiced citrus.",
    highlight: "A glowing explosion of sweet tonka bean and bright holiday spices.",
    price: "₹599.00",
    salePrice: 299.50,
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600",
    badge: "Sold Out 3 Times This Season",
    tags: ["Tonka Bean", "Spiced Orange", "Nutmeg"],
    longevityLabel: "10-12 HR Longevity (Extremely Long Lasting)",
    longevityHours: 11,
    longevityType: "Extremely Long Lasting",
    similarTo: ["Hot spiced cinnamon apple cider", "Toasted vanilla bean dessert"],
    occasions: ["Festive", "Party", "Clubbing"],
    vibe: "Festive/Party",
    slug: "solis"
  },
  {
    id: "hick-06",
    name: "Neroli Sun",
    description: "Bask in the eternal warmth of Italian neroli, orange blossom, and musk.",
    highlight: "A golden sunbeam of warm Italian citrus groves and soft clean linen.",
    price: "₹420.00",
    salePrice: 210.00,
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=600",
    badge: "Summer Essential Pick",
    tags: ["Neroli", "Orange Blossom", "White Musk"],
    longevityLabel: "8-10 HR Longevity (Long Lasting)",
    longevityHours: 8.5,
    longevityType: "Long Lasting",
    similarTo: ["Freshly squeezed bitter orange", "Crisp morning sea breeze"],
    occasions: ["Brunch", "Beach", "Shopping"],
    vibe: "Freshness",
    slug: "neroli-sun"
  },
  {
    id: "hick-07",
    name: "Musc Rose",
    description: "An intimate skin-scent of soft powdery musk and velvety damask rose.",
    highlight: "A soft, skin-hugging whisper of velvet rose petal and clean white musk.",
    price: "₹520.00",
    salePrice: 260.00,
    image: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?auto=format&fit=crop&q=80&w=600",
    badge: "Intimate Signature Choice",
    tags: ["White Musk", "Damask Rose", "Amberwood"],
    longevityLabel: "8-10 HR Longevity (Long Lasting)",
    longevityHours: 9,
    longevityType: "Long Lasting",
    similarTo: ["Soft cashmere wool sweaters", "Delicate powdery pink roses"],
    occasions: ["Intimate Wear", "Casual", "Date Night"],
    vibe: "Allure",
    slug: "musc-rose"
  },
  {
    id: "hick-08",
    name: "Vetiver Woods",
    description: "Step into a lush forest right after rain, rich in earth and green moss.",
    highlight: "Step into a quiet, evergreen forest path immediately after heavy summer rainfall.",
    price: "₹480.00",
    salePrice: 240.00,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600",
    badge: "Editor's Pick — GQ India",
    tags: ["Vetiver", "Cedarwood", "Oakmoss"],
    longevityLabel: "10-12 HR Longevity (Extremely Long Lasting)",
    longevityHours: 10.5,
    longevityType: "Extremely Long Lasting",
    similarTo: ["Damp forest floor & oak leaves", "Fresh cut pine logs"],
    occasions: ["Daily Wear", "Outdoor", "Office"],
    vibe: "Vigor",
    slug: "vetiver-woods"
  }
];

export function HeroSliderModern({ products = [] }: HeroSliderModernProps) {
  // Senses state: "Romance" is selected as the default pre-selected sense on mount!
  const [selectedMood, setSelectedMood] = useState<string>("Romance");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { addToCart } = useCart();
  const touchStartX = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Use Intersection Observer sentinel to show/hide sticky bottom mobile CTA bar with 100% reliability
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If sentinel is NOT visible/intersecting, the user has scrolled past the hero header fold!
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-40px 0px 0px 0px" // triggers as soon as they scroll down 40px
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
    };
  }, []);

  // Map dynamic database products passed from props, and pad the remaining slots up to 8 using fallbacks to ensure all sense categories are always active and functional
  const activeProducts: EnhancedProduct[] = Array.from({ length: 8 }).map((_, idx) => {
    const fallback = STATIC_EIGHT_COLLECTION[idx];
    const product = products[idx];
    
    if (product) {
      const val = Number(product.price.replace(/[^0-9.]/g, "")) * 0.5;
      return {
        id: product.id,
        name: product.name,
        description: product.description || fallback.description,
        highlight: product.highlight || fallback.highlight,
        price: product.price,
        salePrice: isNaN(val) || val === 0 ? fallback.salePrice : val,
        image: product.image || fallback.image,
        badge: product.badge || fallback.badge,
        tags: fallback.tags,
        longevityLabel: fallback.longevityLabel,
        longevityHours: fallback.longevityHours,
        longevityType: fallback.longevityType,
        similarTo: fallback.similarTo,
        occasions: fallback.occasions,
        vibe: fallback.vibe,
        slug: product.slug,
        defaultVariantId: product.defaultVariantId,
        defaultSku: product.defaultSku,
        category: product.category
      };
    }
    
    return fallback;
  });

  // Find the exact product matching the selected mood/sense
  const activeDesktopProduct = activeProducts.find((p) => p.vibe === selectedMood) || activeProducts[0];

  // Keep mobile slider index in sync if mood is updated
  useEffect(() => {
    const matchedIdx = activeProducts.findIndex((p) => p.vibe === selectedMood);
    if (matchedIdx !== -1) {
      setCurrentIndex(matchedIdx);
    }
  }, [selectedMood]);

  const handleAddToCart = (product: EnhancedProduct) => {
    addToCart({
      productId: product.id,
      variantId: product.defaultVariantId || `${product.id}01`,
      productName: product.name,
      price: product.salePrice,
      image: product.image,
      sku: product.defaultSku || `HICK-${product.id}`,
      size: "Standard",
      quantity: 1,
      slug: product.slug,
    });

    fpixel.event("AddToCart", {
      content_name: product.name,
      content_category: product.category || "Fragrance",
      content_ids: [product.id],
      content_type: "product",
      value: product.salePrice,
      currency: "INR",
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  // Mobile Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < activeProducts.length - 1) {
        const nextProd = activeProducts[currentIndex + 1];
        setSelectedMood(nextProd.vibe);
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "select_sense",
            sense_tag: nextProd.vibe,
            device_type: "mobile_swipe_next",
            product_name: nextProd.name,
          });
        }
      } else if (diff < 0 && currentIndex > 0) {
        const prevProd = activeProducts[currentIndex - 1];
        setSelectedMood(prevProd.vibe);
        if (typeof window !== "undefined") {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: "select_sense",
            sense_tag: prevProd.vibe,
            device_type: "mobile_swipe_prev",
            product_name: prevProd.name,
          });
        }
      }
    }
  };

  const handleMoodSelect = (mood: string, device: "desktop" | "mobile") => {
    setSelectedMood(mood);
    if (typeof window !== "undefined") {
      const matchedProduct = activeProducts.find((p) => p.vibe === mood);
      const productName = matchedProduct ? matchedProduct.name : "Unknown";
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "select_sense",
        sense_tag: mood,
        device_type: device,
        product_name: productName,
      });
    }
  };

  const handleScrollToProducts = () => {
    const nextSection = document.getElementById("products-grid");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentMobileProduct = activeProducts[currentIndex];

  return (
    <div className="w-full bg-[#FFF9F5] text-gray-900 overflow-hidden font-sans relative">
      <div ref={sentinelRef} className="absolute top-0 left-0 w-full h-1 pointer-events-none" />
      
      {/* ── Desktop Adaptive Layout (>= 1024px) ─────────────────── */}
      <section className="hidden lg:block max-w-6xl mx-auto px-6 pt-4 pb-2">
        <div className="flex gap-12 items-start">
          
          {/* Left Sticky Sidebar (40% width) */}
          <div className="w-[40%] sticky top-[80px] self-start space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B33D14] bg-orange-100/40 px-3 py-1 rounded-full inline-block">
                The Senses Experience
              </span>
              <h1 className="text-4xl font-serif font-black text-gray-900 tracking-tight leading-none">
                The Hickoku Collection
              </h1>
              <p className="text-[11px] text-gray-500 max-w-xs leading-relaxed italic">
                Artisanal luxury scents crafted with premium imported oils, designed to map directly to your emotional states.
              </p>
            </div>

            {/* Vertical Mood Senses Selector */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                🔮 Select Your Desired Sense
              </p>
              <div className="flex flex-col gap-1 pr-6">
                {([
                  { label: "Confidence", tag: "Confidence", desc: "Velvira Wood & Vetiver" },
                  { label: "Romance", tag: "Romance", desc: "Roselia Deluxe Rose" },
                  { label: "Serenity", tag: "Serenity", desc: "Aveline Oceanic Lavender" },
                  { label: "Mystery", tag: "Mystery", desc: "Oud Noir Dark Agarwood" },
                  { label: "Festive / Party", tag: "Festive/Party", desc: "Solis Tonka & Citrus" },
                ] as const).map((mood) => {
                  const isActive = selectedMood === mood.tag;
                  return (
                    <button
                      key={mood.tag}
                      onClick={() => handleMoodSelect(mood.tag, "desktop")}
                      className="w-full flex items-center justify-between px-4 py-2 rounded-xl border font-bold transition-all duration-300 text-left"
                      style={{
                        minHeight: "38px",
                        background: isActive ? "white" : "transparent",
                        borderColor: isActive ? "#B33D14" : "rgba(179,61,20,0.1)",
                        color: isActive ? "#B33D14" : "#4b5563",
                        boxShadow: isActive ? "0 4px 16px rgba(179,61,20,0.06)" : "none"
                      }}
                    >
                      <div>
                        <span className="text-xs block leading-none">{mood.label}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-1 block leading-none">
                          {mood.desc}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-60 transition-transform duration-300" style={{ transform: isActive ? "translateX(4px)" : "none" }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (60% width) - Focused Luxury Showcase Card */}
          <div className="w-[60%] space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDesktopProduct.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45 }}
                className="bg-white rounded-3xl border border-orange-100/30 overflow-hidden shadow-sm md:grid md:grid-cols-2 md:items-stretch"
              >
                {/* Left Side: Product Image with 2% Hover Zoom wrapped in Link */}
                <Link
                  href={`/product/${activeDesktopProduct.slug}`}
                  className="relative overflow-hidden bg-orange-50/15 group h-full min-h-[360px] block cursor-pointer"
                >
                  <Image
                    src={activeDesktopProduct.image}
                    alt={activeDesktopProduct.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="350px"
                  />
                  {/* Sticky Social Proof Badge */}
                  <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-white shadow-md bg-[#B33D14]">
                    {activeDesktopProduct.badge}
                  </span>
                </Link>

                {/* Right Side: Product Details */}
                <div className="p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block text-[8px] font-black uppercase tracking-widest text-[#B33D14] bg-orange-50 px-2.5 py-1 rounded">
                        Active Sense: {activeDesktopProduct.vibe}
                      </span>
                      <Link href={`/product/${activeDesktopProduct.slug}`}>
                        <h2 className="font-serif font-black text-3xl text-gray-900 leading-tight mt-2 hover:text-[#B33D14] transition-colors duration-300 cursor-pointer">
                          {activeDesktopProduct.name}
                        </h2>
                      </Link>
                      <p className="text-xs text-gray-500 font-medium italic mt-1 leading-relaxed">
                        "{activeDesktopProduct.highlight}"
                      </p>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {activeDesktopProduct.description}
                    </p>

                    {/* note micro-chips */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Fragrance Profile</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDesktopProduct.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold px-2.5 py-1 rounded bg-orange-50 text-[#B33D14] border border-orange-100/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Scent Longevity thin progress bar */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">
                        Longevity: {activeDesktopProduct.longevityLabel}
                      </span>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-[#B33D14]" style={{ width: `${(activeDesktopProduct.longevityHours / 12) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Price & Primary CTA Row */}
                  <div className="space-y-3.5 pt-4 border-t border-dashed border-orange-50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-[#B33D14] leading-none">
                          ₹{formatPrice(activeDesktopProduct.salePrice)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold line-through mt-1.5 leading-none">
                          MRP: ₹{formatPrice(activeDesktopProduct.salePrice * 2)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-green-800 bg-green-100 border border-green-200 animate-pulse">
                          🔥 SAVE FLAT 50% TODAY
                        </span>
                        <span className="text-[9px] text-gray-400 font-semibold italic leading-none">
                          ⚡ Free Express Shipping Included
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(activeDesktopProduct)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all duration-300 hover:bg-[#8F2E0E] bg-[#B33D14]"
                      style={{ minHeight: "48px" }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {addedId === activeDesktopProduct.id ? "Added to Bag ✓" : "Add to Bag — Flat 50% Off"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>

        {/* High-Impact Modern Voucher Cards spanning full-width below the 2-column layout */}
        <div className="mt-6 space-y-3 pt-4 border-t border-[#B33D14]/10">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#B33D14] flex items-center gap-1.5 justify-center">
            🎁 Active Checkout Benefits (Automatically Applied For You)
          </span>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Voucher Box 1: Flat 50% Off */}
            <div className="relative rounded-2xl overflow-hidden border border-[#B33D14]/20 bg-white flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-5 flex-1">
                {/* Left Tag Chip (Solid Terracotta Accent) */}
                <div className="bg-[#B33D14] text-white px-6 py-4 flex flex-col justify-center items-center text-center shrink-0 w-24 border-r border-dashed border-[#FFF9F5]/30">
                  <span className="text-2xl font-black leading-none">50%</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest mt-1">OFF</span>
                </div>
                {/* Center Details */}
                <div className="py-2 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-[#B33D14] bg-orange-50 px-2.5 py-0.5 rounded">Launch Offer</span>
                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded">Auto-Applied</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 leading-tight">Flat 50% Limited Launch Promo</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1 leading-snug">
                    Half price automatically calculated in your shopping cart. Free express delivery included.
                  </p>
                </div>
              </div>
              {/* Right Action Badge */}
              <div className="px-6 shrink-0 hidden sm:block">
                <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  ✓ Active Deal
                </span>
              </div>
            </div>

            {/* Voucher Box 2: Extra Rs 25 Off */}
            <div className="relative rounded-2xl overflow-hidden border border-[#B33D14]/20 bg-white flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-5 flex-1">
                {/* Left Tag Chip (Amber Filled Contrast Accent) */}
                <div className="bg-orange-100 text-[#B33D14] px-6 py-4 flex flex-col justify-center items-center text-center shrink-0 w-24 border-r border-dashed border-[#B33D14]/20">
                  <span className="text-xl font-black leading-none">₹25</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest mt-1">EXTRA</span>
                </div>
                {/* Center Details */}
                <div className="py-2 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-orange-800 bg-orange-200/30 px-2.5 py-0.5 rounded">Multi-Buy Benefit</span>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded">Quantity Deal</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 leading-tight">Buy More, Save More!</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1 leading-snug">
                    Get an additional ₹25 discount per bottle automatically on purchasing 2 or more bottles.
                  </p>
                </div>
              </div>
              {/* Right Action Badge */}
              <div className="px-6 shrink-0 hidden sm:block">
                <span className="text-[10px] font-black text-[#B33D14] bg-orange-50 border border-[#B33D14]/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  ✓ Eligible
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Adaptive Layout (< 1024px) ──────────────────── */}
      <section className="block lg:hidden pt-2 pb-1 space-y-2">
        
        {/* Mobile headers */}
        <div className="px-6 text-center space-y-0.5">
          <span className="inline-block text-[8px] font-extrabold uppercase tracking-widest text-[#B33D14] bg-orange-100/30 px-2 py-0.5 rounded-full">
            The Hickoku Collection
          </span>
          <h2 className="text-lg font-serif font-black tracking-tight text-gray-900 leading-none">
            Empower Your Senses
          </h2>
        </div>

        {/* Mobile mood selection pills */}
        <div className="w-full overflow-x-auto no-scrollbar py-0.5 border-b border-orange-50/30">
          <div className="flex gap-1.5 px-6 min-w-max pb-0.5">
            {([
              { label: "Confidence", tag: "Confidence" },
              { label: "Romance", tag: "Romance" },
              { label: "Serenity", tag: "Serenity" },
              { label: "Mystery", tag: "Mystery" },
              { label: "Festive", tag: "Festive/Party" },
            ] as const).map((m) => {
              const isSelected = selectedMood === m.tag;
              return (
                <button
                  key={m.tag}
                  onClick={() => handleMoodSelect(m.tag, "mobile")}
                  className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "bg-[#B33D14] text-white border-[#B33D14] shadow-md"
                      : "bg-white text-gray-500 border-orange-100/40 hover:bg-orange-50/20"
                  }`}
                  style={{ minHeight: "28px" }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel card container with 10% next-card preview peeking */}
        <div
          className="relative w-full overflow-x-hidden py-1 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex gap-4 transition-transform duration-500 ease-out px-[8%]"
            style={{ transform: `translateX(-${currentIndex * 84}%)` }}
          >
            {activeProducts.map((prod, idx) => {
              const isCenter = idx === currentIndex;
              return (
                <div
                  key={prod.id}
                  className={`w-[80vw] shrink-0 bg-white rounded-3xl border overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-500 ${
                    isCenter
                      ? "border-[#B33D14]/20 scale-100 shadow-md"
                      : "border-orange-100/10 scale-95 opacity-55"
                  }`}
                >
                  {/* Card shot with overlay floating badge wrapped in Link */}
                  <Link
                    href={`/product/${prod.slug}`}
                    className="relative aspect-[4/5] w-full bg-orange-50/15 block cursor-pointer"
                  >
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      priority={idx === 0}
                      className="object-cover"
                      sizes="80vw"
                    />
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-md bg-[#B33D14]">
                      {prod.badge}
                    </div>
                  </Link>

                  {/* Card core description */}
                  <div className="p-2.5 space-y-2">
                    <div className="space-y-0.5">
                      <Link href={`/product/${prod.slug}`}>
                        <h3 className="font-serif font-black text-sm text-gray-900 leading-tight hover:text-[#B33D14] transition-colors duration-300 cursor-pointer">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-[10px] text-gray-500 font-semibold italic leading-normal">
                        "{prod.highlight}"
                      </p>
                    </div>

                    {/* Scent micro tags */}
                    <div className="flex flex-wrap gap-1">
                      {prod.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-orange-100/40 text-[#B33D14]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Scent longevity */}
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block leading-none">
                        Longevity: {prod.longevityLabel}
                      </span>
                      <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B33D14]" style={{ width: `${(prod.longevityHours / 12) * 100}%` }} />
                      </div>
                    </div>

                    {/* Pricing & Add to Bag inside mobile hero card */}
                    <div className="pt-2 border-t border-dashed border-orange-100 flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#B33D14] leading-none">
                          ₹{formatPrice(prod.salePrice)}
                        </span>
                        <span className="text-[8px] text-gray-400 font-semibold line-through mt-0.5 leading-none">
                          MRP: ₹{formatPrice(prod.salePrice * 2)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-white font-bold text-[10px] shadow transition-all duration-300 cursor-pointer"
                        style={{
                          background: addedId === prod.id ? "#16a34a" : "#B33D14",
                          minHeight: "30px",
                        }}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        {addedId === prod.id ? "Added ✓" : "Add to Bag"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-1.5 pt-0.5">
          {activeProducts.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => {
                const targetProd = activeProducts[dotIdx];
                setSelectedMood(targetProd.vibe);
                if (typeof window !== "undefined") {
                  (window as any).dataLayer = (window as any).dataLayer || [];
                  (window as any).dataLayer.push({
                    event: "select_sense",
                    sense_tag: targetProd.vibe,
                    device_type: "mobile_dot",
                    product_name: targetProd.name,
                  });
                }
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex ? "w-4 bg-[#B33D14]" : "w-1 bg-[#B33D14]/25"
              }`}
              style={{ minHeight: "8px", minWidth: "8px" }}
            />
          ))}
        </div>

        {/* Persistent Bottom Mobile CTA Bar */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-orange-100/50 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out ${
            showStickyBar ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Checkout {currentMobileProduct.name}
              </p>
              <div className="flex flex-col">
                <span className="text-lg font-black text-[#B33D14] leading-none">
                  ₹{formatPrice(currentMobileProduct.salePrice)}
                </span>
                <span className="text-[10px] text-gray-400 line-through mt-1 leading-none font-semibold">
                  MRP: ₹{formatPrice(currentMobileProduct.salePrice * 2)}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAddToCart(currentMobileProduct)}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-300"
              style={{
                background: addedId === currentMobileProduct.id ? "#16a34a" : "#B33D14",
                minHeight: "48px",
              }}
            >
              <ShoppingBag className="w-4 h-4 animate-bounce" />
              {addedId === currentMobileProduct.id ? "Added to Bag ✓" : "Add to Bag — 50% Off"}
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Scroll Indicator (Indicates there is content below) ──── */}
      <div className="flex flex-col items-center justify-center pt-1 pb-2">
        <button 
          onClick={handleScrollToProducts}
          className="flex flex-col items-center gap-1.5 cursor-pointer group bg-transparent border-0 outline-none"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-[#B33D14] transition-colors duration-300">
            Discover The Collection
          </span>
          <motion.div
            animate={{
              y: [0, 4, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-gray-400 group-hover:text-[#B33D14] transition-colors duration-300"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* ── Global Trust Ribbon (Bottom of the Section) ─────────── */}
      <footer className="w-full bg-[#B33D14]/5 border-t border-[#B33D14]/10 py-1 mt-1 mb-1 hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
            {[
              { icon: <Truck className="w-5 h-5" />, title: "🚚 Free Express Delivery", sub: "Delivered to your doorstep in 3-5 business days" },
              { icon: <ShieldCheck className="w-5 h-5" />, title: "🔄 100% Original From House", sub: "Authentic luxury formulas imported directly" },
              { icon: <RotateCcw className="w-5 h-5" />, title: "✨ Easy No-Questions Returns", sub: "Hassle-free pickups for absolute peace of mind" }
            ].map((ribbon, rIdx) => (
              <div key={rIdx} className="flex items-center gap-3 w-full lg:w-auto text-left py-1">
                <span className="p-2 rounded-full bg-white border border-[#B33D14]/15 text-[#B33D14]">
                  {ribbon.icon}
                </span>
                <div>
                  <h4 className="text-[11px] font-black uppercase text-gray-900 leading-tight">
                    {ribbon.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                    {ribbon.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
