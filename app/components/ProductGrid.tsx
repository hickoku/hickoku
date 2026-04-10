"use client";

import { ProductCard, ProductSkeleton } from "./ProductCard";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "../context/LocaleContext";
import { useProducts } from "../context/ProductContext";

interface ProductGridProps {
  initialProducts?: any[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const { products: contextProducts, isLoading: contextLoading } = useProducts();
  const [products, setProducts] = useState(initialProducts || contextProducts);
  const [isLoading, setIsLoading] = useState(!initialProducts && contextLoading);

  useEffect(() => {
    if (!initialProducts && contextProducts.length > 0) {
      setProducts(contextProducts);
      setIsLoading(contextLoading);
    }
  }, [contextProducts, contextLoading, initialProducts]);

  const [filter, setFilter] = useState<"All" | "For Her" | "For Him">("All");
  const { t } = useLocale();
  
  const displayProducts = initialProducts || products;
  const filteredProducts =
    filter === "All" ? displayProducts : displayProducts.filter((p: any) => p.category === filter);
  
  const showLoading = !initialProducts && isLoading;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl mb-4">Our Collection</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our curated selection of luxury fragrances, each crafted to
          tell a unique story
        </p>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
        {showLoading ? (
          [...Array(6)].map((_, i) => (
            <ProductSkeleton key={`skeleton-${i}`} />
          ))
        ) : (
          filteredProducts.map((product, index) => (
            <div key={product.id}>
              <Link href={`/product/${product.slug}`}>
                <ProductCard {...product} priority={index < 3} />
              </Link>
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center mt-12"
      >
        <Link href="/collection">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            {t("products.viewAll")}
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
