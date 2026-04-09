"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/currency";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  highlight: string;
  price: string;
  image: string;
  badge?: string;
  category: "For Her" | "For Him";
  defaultVariantId?: string;
  defaultSku?: string;
  priority?: boolean; // Added for LCP optimization
}

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-full animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export function ProductCard({
  name,
  description,
  highlight,
  price,
  image,
  badge,
  category,
  id,
  defaultVariantId,
  defaultSku,
  priority = false, // Added
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { addToCart } = useCart();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <motion.div
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full"
        >
          <Image
            src={image}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-4 left-4 z-10">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs tracking-wider uppercase font-semibold"
            >
              {badge}
            </motion.span>
          </div>
        )}

        {/* Category Badge */}
        {/* <div className="absolute top-4 right-4 z-10">
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`px-3 py-1 rounded-full text-xs tracking-wider uppercase font-semibold ${
              category === "For Her"
                ? "bg-pink-100 text-pink-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {category}
          </motion.span>
        </div> */}

        {/* Highlight - Overlay on Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-8 z-20 flex flex-col items-center justify-center"
        >
          <span className="text-4xl mb-2">✨</span>
          <p className="text-white font-bold text-base text-center leading-relaxed">
            {highlight}
          </p>
        </motion.div>

        {/* Hover Actions */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/10 flex items-center justify-center gap-3 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-900"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-900"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              addToCart({
                productId: id,
                variantId: defaultVariantId || `${id}01`,
                productName: name,
                price: Number(price.replace(/[^0-9.]/g, "")) * 0.5,
                image,
                sku: defaultSku || `HICK-${id}`,
                size: "Standard",
                quantity: 1,
              })
            }
            className="p-3 bg-gray-900 backdrop-blur-sm rounded-full text-white"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.button>
        </motion.div> */}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-sm text-gray-900 font-medium mb-4 line-clamp-2 capitalize">{description}</p>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">50% OFF</span>
              <p className="text-sm text-gray-400 line-through">₹{formatPrice(price)}</p>
            </div>
            <p className="text-xl font-bold text-red-600">
              ₹{formatPrice(Number(price.replace(/[^0-9.]/g, "")) * 0.5)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              addToCart({
                productId: id,
                variantId: defaultVariantId || `${id}01`,
                productName: name,
                price: Number(price.replace(/[^0-9.]/g, "")) * 0.5,
                image,
                sku: defaultSku || `HICK-${id}`,
                size: "Standard",
                quantity: 1,
              });
            }}
            className="py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors cursor-pointer text-center flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </div>
  );
}
