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
import { formatPrice } from "../../utils/currency";

interface Product {
  id: string;
  name: string;
  description: string;
  highlight: string;
  category: string;
  badge: string | null;
  images: string[];
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
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/collection">
              <motion.button
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Collection</span>
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Image Gallery */}
            <div className="space-y-4">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
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
                        className="absolute left-1 top-[48px] -translate-y-1/2 p-1.5 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5 cursor-pointer" />
                      </button>
                    )}
                    {canScrollRight && (
                      <button
                        onClick={() => {
                          if (thumbnailScrollRef.current) thumbnailScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                        }}
                        className="absolute right-1 top-[48px] -translate-y-1/2 p-1.5 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
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
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
                    ₹ {formatPrice(product.variants[0].price * 0.5)}
                  </p>
                  <p className="text-xl text-gray-400 line-through">
                    ₹ {formatPrice(product.variants[0].price)}
                  </p>
                  <span className="px-3 py-1 text-sm font-bold text-red-600 bg-red-100 rounded-full shadow-sm">
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

              {product.variants[0].desc && (
                <div className="pt-4 pb-2">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <div className="text-sm text-gray-900 font-medium whitespace-pre-line leading-relaxed capitalize">
                    {product.variants[0].desc}
                  </div>
                </div>
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
