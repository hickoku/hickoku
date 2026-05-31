"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ShoppingBag, Truck, RotateCcw, Clock,
 ArrowRight, ShieldCheck
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
  const { addToCart } = useCart();
  const touchStartX = useRef(0);

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

  const currentMobileProduct = activeProducts[currentIndex];

  return (
    <div className="w-full bg-[#FFF9F5] text-gray-900 overflow-hidden font-sans">
      
      {/* ── Desktop Adaptive Layout (>= 1024px) ─────────────────── */}
      <section className="hidden lg:block max-w-6xl mx-auto px-6 py-14">
        <div className="flex gap-12 items-start">
          
          {/* Left Sticky Sidebar (40% width) */}
          <div className="w-[40%] sticky top-[100px] self-start space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#B33D14] bg-orange-100/40 px-3 py-1 rounded-full inline-block">
                The Senses Experience
              </span>
              <h1 className="text-5xl font-serif font-black text-gray-900 tracking-tight leading-none">
                The Hickoku Collection
              </h1>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed italic">
                Artisanal luxury scents crafted with premium imported oils, designed to map directly to your emotional states.
              </p>
            </div>

            {/* Vertical Mood Senses Selector */}
            <div className="space-y-2.5 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                🔮 Select Your Desired Sense
              </p>
              <div className="flex flex-col gap-1.5 pr-6">
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
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border font-bold transition-all duration-300 text-left"
                      style={{
                        minHeight: "48px",
                        background: isActive ? "white" : "transparent",
                        borderColor: isActive ? "#B33D14" : "rgba(179,61,20,0.1)",
                        color: isActive ? "#B33D14" : "#4b5563",
                        boxShadow: isActive ? "0 4px 16px rgba(179,61,20,0.06)" : "none"
                      }}
                    >
                      <div>
                        <span className="text-xs block leading-none">{mood.label}</span>
                        <span className="text-[9px] text-gray-400 font-medium mt-1 block leading-none">
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
                {/* Left Side: Product Image with 2% Hover Zoom */}
                <div className="relative overflow-hidden bg-orange-50/15 group h-full min-h-[360px]">
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
                </div>

                {/* Right Side: Product Details */}
                <div className="p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block text-[8px] font-black uppercase tracking-widest text-[#B33D14] bg-orange-50 px-2.5 py-1 rounded">
                        Active Sense: {activeDesktopProduct.vibe}
                      </span>
                      <h2 className="font-serif font-black text-3xl text-gray-900 leading-tight mt-2">
                        {activeDesktopProduct.name}
                      </h2>
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
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#B33D14]">
                          ₹{formatPrice(activeDesktopProduct.salePrice)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{formatPrice(activeDesktopProduct.salePrice * 2)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-green-700 bg-green-100">
                        Save 50% Automatically
                      </span>
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

            {/* High-Impact Modern Voucher Cards */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B33D14] block">
                🎁 Active Checkout Benefits
              </span>
              
              {/* Voucher Box 1: Flat 50% Off */}
              <div className="relative rounded-2xl overflow-hidden border border-[#B33D14]/20 bg-white flex items-stretch shadow-sm hover:shadow-md transition-all duration-300">
                {/* Left Tag Chip (Solid Terracotta Accent) */}
                <div className="bg-[#B33D14] text-white px-4 flex flex-col justify-center items-center text-center shrink-0 w-24 border-r border-dashed border-[#FFF9F5]/30">
                  <span className="text-xl font-black leading-none">50%</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest mt-1">OFF</span>
                </div>
                {/* Right Details */}
                <div className="p-4 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-[#B33D14] tracking-wider bg-orange-50 px-2 py-0.5 rounded">Launch Offer</span>
                    <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">Auto-Applied</span>
                  </div>
                  <h4 className="text-xs font-black text-gray-900">Flat 50% Limited Launch Promo</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Half price calculated automatically in your shopping cart. Free express delivery included.
                  </p>
                </div>
              </div>

              {/* Voucher Box 2: Extra Rs 25 Off */}
              <div className="relative rounded-2xl overflow-hidden border border-[#B33D14]/20 bg-white flex items-stretch shadow-sm hover:shadow-md transition-all duration-300">
                {/* Left Tag Chip (Amber Filled Contrast Accent) */}
                <div className="bg-orange-100 text-[#B33D14] px-4 flex flex-col justify-center items-center text-center shrink-0 w-24 border-r border-dashed border-[#B33D14]/20">
                  <span className="text-lg font-black leading-none">₹25</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest mt-1">EXTRA</span>
                </div>
                {/* Right Details */}
                <div className="p-4 flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase text-orange-800 tracking-wider bg-orange-200/30 px-2 py-0.5 rounded">Multi-Buy</span>
                    <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">Quantity Deal</span>
                  </div>
                  <h4 className="text-xs font-black text-gray-900">Buy More, Save More!</h4>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Get an additional ₹25 discount per bottle automatically on purchasing 2 or more bottles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Adaptive Layout (< 1024px) ──────────────────── */}
      <section className="block lg:hidden py-6 space-y-5">
        
        {/* Mobile headers */}
        <div className="px-6 text-center space-y-1">
          <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest text-[#B33D14] bg-orange-100/40 px-2.5 py-0.5 rounded-full">
            The Hickoku Collection
          </span>
          <h2 className="text-3xl font-serif font-black tracking-tight text-gray-900 leading-none">
            Empower Your Senses
          </h2>
        </div>

        {/* Mobile mood selection pills */}
        <div className="w-full overflow-x-auto no-scrollbar py-1 border-b border-orange-50/50">
          <div className="flex gap-2 px-6 min-w-max pb-1">
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
                  className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-full border transition-all duration-300 ${
                    isSelected
                      ? "bg-[#B33D14] text-white border-[#B33D14] shadow-md"
                      : "bg-white text-gray-500 border-orange-100/40 hover:bg-orange-50/20"
                  }`}
                  style={{ minHeight: "36px" }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel card container with 10% next-card preview peeking */}
        <div
          className="relative w-full overflow-x-hidden py-2 cursor-grab active:cursor-grabbing"
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
                  {/* Card shot with overlay floating badge */}
                  <div className="relative aspect-[4/5] w-full bg-orange-50/15">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      priority={idx === 0}
                      className="object-cover"
                      sizes="80vw"
                    />
                    <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full text-[8px] font-black uppercase text-white shadow-md bg-[#B33D14]">
                      {prod.badge}
                    </div>
                  </div>

                  {/* Card core description */}
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-serif font-black text-xl text-gray-900 leading-tight">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                        "{prod.highlight}"
                      </p>
                    </div>

                    {/* Scent micro tags */}
                    <div className="flex flex-wrap gap-1">
                      {prod.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100/40 text-[#B33D14]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Scent longevity */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">
                        Longevity: {prod.longevityLabel}
                      </span>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B33D14]" style={{ width: `${(prod.longevityHours / 12) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
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
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex ? "w-6 bg-[#B33D14]" : "w-1.5 bg-[#B33D14]/25"
              }`}
              style={{ minHeight: "12px", minWidth: "12px" }}
            />
          ))}
        </div>

        {/* Persistent Bottom Mobile CTA Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-orange-100/50 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="shrink-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Checkout Roselia
              </p>
              <div className="flex items-baseline gap-1 leading-none">
                <span className="text-xl font-black text-[#B33D14]">
                  ₹{formatPrice(currentMobileProduct.salePrice)}
                </span>
                <span className="text-[10px] text-gray-400 line-through">
                  ₹{formatPrice(currentMobileProduct.salePrice * 2)}
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
