"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { formatPrice } from "../utils/currency";

interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  price: number;
  stock: number;
  inventoryStatus: string;
}

interface Product {
  id: string; // Changed from productId to id to match API
  name: string;
  description: string;
  highlight: string;
  category: string;
  badge: string | null;
  images: string[];
  variants: ProductVariant[]; // Changed to array
}

// Color schemes for products (based on category and index)
const colorSchemes = [
  { bgColor: "#f5e6e8", textColor: "#8b4f5e" }, // Pink/Rose
  { bgColor: "#1a1a1a", textColor: "#D4AF37" }, // Dark/Gold
  { bgColor: "#e8d5cf", textColor: "#6b4e42" }, // Beige/Brown
  { bgColor: "#d4752e", textColor: "#ffffff" }, // Orange/White
  { bgColor: "#5a1a1a", textColor: "#D4AF37" }, // Burgundy/Gold
  { bgColor: "#1a3a2e", textColor: "#D4AF37" }, // Dark Green/Gold
];

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products-enhanced');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <motion.button
                  whileHover={{ x: -5 }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm">Back</span>
                </motion.button>
              </Link>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl mb-2"
                >
                  COLLECTION
                </motion.h1>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {products.map((product, index) => {
                const colorScheme = colorSchemes[index % colorSchemes.length];
                const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                const originalPrice = variant ? variant.price : 0;
                const discountedPrice = originalPrice * 0.5;
                const priceInRupees = variant ? formatPrice(discountedPrice) : "N/A";
                const originalPriceStr = variant ? formatPrice(originalPrice) : "N/A";

                return (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
                    >
                      {/* Flex layout: Column on mobile, keeping image on top/left */}
                      <div className="flex flex-col h-full"> 
                        {/* Image Section */}
                        <div className="w-full h-64 sm:h-72 relative overflow-hidden">
                          <motion.img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          
                          {/* Price Tag Overlay for mobile/desktop unified look or keep separate? 
                              Let's keep the split style but vertical on mobile. 
                              Actually, user wants "alignment" fixed. 
                              The previous design was side-by-side. 
                              Let's try a standard card layout: Image top, Details bottom.
                              But the design system seems to rely on the "Color on right" background.
                              Let's adapt: Image top, Colored Details bottom.
                          */}
                        </div>

                        {/* Details Section */}
                        <div
                          className="w-full p-4 sm:p-6 flex flex-col justify-between flex-grow"
                          style={{ backgroundColor: colorScheme.bgColor }}
                        >
                          <div className="space-y-2 text-center sm:text-left">
                            <motion.h3
                              initial={{ opacity: 0, y: -10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4 }}
                              className="text-xl sm:text-2xl tracking-wide font-medium"
                              style={{ color: colorScheme.textColor }}
                            >
                              {product.name}
                            </motion.h3>

                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              className="text-sm sm:text-base font-medium line-clamp-3 leading-relaxed italic opacity-90"
                              style={{ color: colorScheme.textColor }}
                            >
                              {product.highlight}
                            </motion.p>
                          </div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="mt-4 flex justify-center sm:justify-between items-center"
                          >
                             <div className="flex flex-col items-center sm:items-start">
                               <div className="flex items-center gap-2">
                                 <p className="text-lg sm:text-xl font-bold whitespace-nowrap text-red-600">
                                    Rs. {priceInRupees}
                                 </p>
                                 <p className="text-sm line-through opacity-70" style={{ color: colorScheme.textColor }}>
                                    Rs. {originalPriceStr}
                                 </p>
                               </div>
                               <span className="text-xs font-bold mt-1 text-red-600 bg-red-50 px-2 py-0.5 rounded">50% OFF</span>
                             </div>
                             <span 
                                className="hidden sm:inline-block text-xs uppercase tracking-widest border border-current px-3 py-1 rounded-full"
                                style={{ color: colorScheme.textColor, opacity: 0.8 }}
                             >
                                Shop Now
                             </span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
