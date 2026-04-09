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
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Header } from "../../components/Header";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/currency";

interface Product {
  id: string; // Changed from productId
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

const productImages = [
  "/hickoku-assets/slider/Slider1.png",
  "/hickoku-assets/slider/Slider2.jpeg",
  "/hickoku-assets/slider/Slider3.jpeg",
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useCart();
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // Auto-slide main image every 5 seconds
  useEffect(() => {
    const imageCount = product?.images?.length || 0;
    if (imageCount <= 1) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % imageCount);
    }, 5000);

    return () => clearInterval(timer);
  }, [product, currentImage]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products-enhanced/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const nextImage = () => {
    const imageCount = product?.images?.length || 0;
    if (imageCount === 0) return;
    setCurrentImage((prev) => (prev + 1) % imageCount);
  };

  const prevImage = () => {
    const imageCount = product?.images?.length || 0;
    if (imageCount === 0) return;
    setCurrentImage((prev) =>
      prev - 1 < 0 ? imageCount - 1 : prev - 1,
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-26 sm:pt-30">
        {/* Back button */}
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
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-md">
                {product && product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[currentImage] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    No Image Available
                  </div>
                )}

                {/* Navigation Arrows */}
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

              {/* Thumbnail Gallery */}
              <div className="relative group">
                <div 
                  ref={thumbnailScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                {product && product.images && product.images.length > 1 && (
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
                </div>
                
                {/* Thumbnail Arrows */}
                {((product?.images?.length || 0) > 4) && (
                  <>
                    <button
                      onClick={() => {
                        if (thumbnailScrollRef.current) thumbnailScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      className="absolute left-1 top-[48px] -translate-y-1/2 p-1.5 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 cursor-pointer" />
                    </button>
                    <button
                      onClick={() => {
                        if (thumbnailScrollRef.current) thumbnailScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      className="absolute right-1 top-[48px] -translate-y-1/2 p-1.5 bg-white/90 shadow-md border border-gray-100 text-gray-800 rounded-full z-10 hover:bg-white cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5 cursor-pointer" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right - Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {loading && <p className="text-gray-600">Loading...</p>}
              {error && <p className="text-red-600">Error: {error}</p>}
              {product && (
                <>
                  {/* Title & Price */}
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

              {/* Size Selection */}
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

              {/* Product Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>100% Authentic Products</p>
              </div>

              {/* Variant Description */}
              {product.variants[0].desc && (
                <div className="pt-4 pb-2">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <div className="text-sm text-gray-900 font-medium whitespace-pre-line leading-relaxed capitalize">
                    {product.variants[0].desc}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
