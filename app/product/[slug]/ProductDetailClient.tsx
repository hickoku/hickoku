"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { Header } from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { formatPrice } from "../../utils/currency";

interface Product {
  id: string;
  name: string;
  description: string;
  highlight: string;
  category: string;
  badge: string | null;
  images: string[];
  slug: string;
  basePrice: number;
  variants: {
    id: string;
    sku: string;
    size: string;
    price: number;
    stock: number;
    inventoryStatus: string;
    shortDesc?: string;
    desc?: string;
    characterstics?: string[];
  }[];
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const { addToCart } = useCart();
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  
  const leftSentinelRef = useRef<HTMLDivElement>(null);
  const rightSentinelRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === leftSentinelRef.current) {
            setCanScrollLeft(!entry.isIntersecting);
          }
          if (entry.target === rightSentinelRef.current) {
            setCanScrollRight(!entry.isIntersecting);
          }
        });
      },
      { root: thumbnailScrollRef.current, threshold: 0.9 }
    );

    if (leftSentinelRef.current) observer.observe(leftSentinelRef.current);
    if (rightSentinelRef.current) observer.observe(rightSentinelRef.current);

    return () => observer.disconnect();
  }, [product.images]);

  // Auto-slide main image
  useEffect(() => {
    const imageCount = product.images?.length || 0;
    if (imageCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % imageCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [product.images]);

  const nextImage = () => {
    const imageCount = product.images?.length || 0;
    if (imageCount === 0) return;
    setCurrentImage((prev) => (prev + 1) % imageCount);
  };

  const prevImage = () => {
    const imageCount = product.images?.length || 0;
    if (imageCount === 0) return;
    setCurrentImage((prev) =>
      prev - 1 < 0 ? imageCount - 1 : prev - 1,
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-26 sm:pt-30">
        <div className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs 
              items={[
                { label: "Collection", href: "/collection" },
                { label: product.name }
              ]} 
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left - Image Gallery */}
            <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
              <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-md">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[currentImage] || product.images[0]}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    No Image Available
                  </div>
                )}

                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="relative group">
                <div 
                  ref={thumbnailScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {/* Left Sentinel */}
                  <div ref={leftSentinelRef} className="w-1 h-px shrink-0 opacity-0 pointer-events-none" />
                {product.images && product.images.length > 1 && (
                  product.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setCurrentImage(index)}
                      className={`flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === index
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover cursor-pointer"
                      />
                    </motion.button>
                  ))
                )}
                  {/* Right Sentinel */}
                  <div ref={rightSentinelRef} className="w-1 h-px shrink-0 opacity-0 pointer-events-none" />
                </div>
                
                {((product?.images?.length || 0) > 4) && (
                  <>
                    {canScrollLeft && (
                      <button
                        onClick={() => {
                          if (thumbnailScrollRef.current) thumbnailScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                        }}
                        className="absolute left-1 top-[48px] -translate-y-1/2 p-3 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
                        aria-label="Scroll thumbnails left"
                      >
                        <ChevronLeft className="w-5 h-5 cursor-pointer" />
                      </button>
                    )}
                    {canScrollRight && (
                      <button
                        onClick={() => {
                          if (thumbnailScrollRef.current) thumbnailScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                        }}
                        className="absolute right-1 top-[48px] -translate-y-1/2 p-3 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
                        aria-label="Scroll thumbnails right"
                      >
                        <ChevronRight className="w-5 h-5 cursor-pointer" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right - Product Details */}
            <div
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl mb-2">{product.name}</h1>
                <p className="text-sm text-gray-900 font-medium mb-2 whitespace-pre-line capitalize">
                  {product.variants[0].shortDesc || product.highlight}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-orange-700">
                    ₹ {formatPrice(product.variants[0].price * 0.5)}
                  </p>
                  <p className="text-xl text-gray-600 line-through">
                    ₹ {formatPrice(product.variants[0].price)}
                  </p>
                  <span className="px-3 py-1 text-sm font-bold text-red-700 bg-red-100 rounded-full shadow-sm">
                    50% OFF
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Size</h3>
                <div className="grid grid-cols-4 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-3 rounded-lg border-2 border-gray-900 bg-gray-900 text-white transition-all text-sm font-medium"
                  >
                    {product.variants[0].size}
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>100% Authentic Products</p>
              </div>

              {product.variants[0].characterstics && product.variants[0].characterstics.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)]"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-amber-300">
                            <path d="M12 3c-1.5 2-4 4-4 7a4 4 0 0 0 8 0c0-3-2.5-5-4-7Z" />
                            <path d="M12 10v8" />
                            <path d="M8 18h8" />
                          </svg>
                        </div>
                        <h3 className="text-[13px] font-bold tracking-wider text-white uppercase">Fragrance Notes</h3>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-amber-400/60"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes Body */}
                  <div className="bg-gradient-to-b from-gray-50 to-white">
                    {product.variants[0].characterstics.map((char: string, idx: number) => {
                      const isTop = char.toLowerCase().includes('top');
                      const isHeart = char.toLowerCase().includes('heart') || char.toLowerCase().includes('middle');
                      const isBase = char.toLowerCase().includes('base');
                      
                      const labelPart = char.split(':')[0]?.trim() || '';
                      const notesPart = char.split(':').slice(1).join(':')?.trim() || char;
                      const noteItems = notesPart.split(',').map((n: string) => n.trim().replace(/\.$/, ''));
                      
                      const config = isTop 
                        ? { icon: '🌿', gradient: 'from-emerald-50 to-teal-50/50', border: 'border-emerald-200/60', dot: 'bg-emerald-500', label: 'text-emerald-700', tag: 'bg-emerald-100 text-emerald-800' }
                        : isHeart 
                        ? { icon: '🌸', gradient: 'from-pink-50 to-rose-50/50', border: 'border-pink-200/60', dot: 'bg-pink-500', label: 'text-pink-700', tag: 'bg-pink-100 text-pink-800' }
                        : isBase 
                        ? { icon: '🪵', gradient: 'from-amber-50 to-orange-50/50', border: 'border-amber-200/60', dot: 'bg-amber-600', label: 'text-amber-800', tag: 'bg-amber-100 text-amber-900' }
                        : { icon: '✨', gradient: 'from-violet-50 to-indigo-50/50', border: 'border-violet-200/60', dot: 'bg-violet-500', label: 'text-violet-700', tag: 'bg-violet-100 text-violet-800' };
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + idx * 0.12 }}
                          className={`px-5 py-4 bg-gradient-to-r ${config.gradient} ${idx !== product.variants[0].characterstics!.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="text-xl mt-0.5 shrink-0">{config.icon}</div>
                            <div className="flex-1 min-w-0">
                              {labelPart && (
                                <p className={`text-xs font-extrabold tracking-[0.15em] uppercase mb-2.5 ${config.label}`}>
                                  {labelPart}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1.5">
                                {noteItems.map((note: string, nIdx: number) => (
                                  <motion.span 
                                    key={nIdx}
                                    whileHover={{ scale: 1.05 }}
                                    className={`inline-block px-3.5 py-1.5 text-xs font-semibold rounded-full ${config.tag} cursor-default`}
                                  >
                                    {note}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {product.variants[0].desc && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="mt-5 rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)]"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-amber-300">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                        </svg>
                      </div>
                      <h3 className="text-[13px] font-bold tracking-wider text-white uppercase">About This Perfume</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="bg-gradient-to-b from-gray-50 to-white px-6 py-5">
                    <div className="relative">
                      <span className="absolute -top-2 -left-1 text-4xl text-gray-200 font-serif leading-none select-none">"</span>
                      <p className="text-[13px] text-gray-700 font-medium whitespace-pre-line leading-[1.8] capitalize pl-4">
                        {product.variants[0].desc}
                      </p>
                      <span className="text-4xl text-gray-200 font-serif leading-none select-none float-right -mt-3">"</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    const variant = product.variants[0];
                    if (variant.inventoryStatus !== 'IN_STOCK') {
                      toast.error('Out of stock');
                      return;
                    }

                    try {
                      const discountedPrice = variant.price * 0.5;
                      await addToCart({
                        sku: variant.sku,
                        productId: product.id,
                        variantId: variant.id, 
                        productName: product.name,
                        size: variant.size,
                        price: discountedPrice,
                        quantity: 1,
                        image: product.images[0],
                        slug: product.slug,
                      });

                      toast.success("Added to cart!", {
                        description: `${variant.size} - ₹ ${formatPrice(discountedPrice)}`,
                      });
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to add to cart');
                    }
                  }}
                  disabled={product.variants[0].inventoryStatus !== 'IN_STOCK'}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {product.variants[0].inventoryStatus === 'IN_STOCK' ? 'ADD TO CART' : 'OUT OF STOCK'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const phoneNumber = "9360922878"; 
                    let imageUrl = product.images?.[0] || "";
                    if (imageUrl && imageUrl.startsWith('/')) {
                      imageUrl = `${window.location.origin}${imageUrl}`;
                    }
                    const discountedPrice = product.variants[0].price * 0.5;
                    const message = `Hi, I'm interested in the following product:\n\n*${product.name}*\nPrice: ₹ ${discountedPrice} (50% OFF)\nSize: ${product.variants[0].size}\n\nImage: ${imageUrl}\nLink: ${window.location.href}`;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    
                    toast.success("Opening WhatsApp...", {
                      description: "Redirecting to WhatsApp with product details",
                    });
                    
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  CONNECT TO WHATSAPP
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
