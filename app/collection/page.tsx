"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { useLocale } from "../context/LocaleContext";

export default function CollectionPage() {
  const { products, isLoading, error } = useProducts();
  const { t } = useLocale();

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gray-50 pt-30">
        <main className="flex-grow">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <Link href="/">
                  <motion.button
                    whileHover={{ x: -5 }}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm cursor-pointer">Back</span>
                  </motion.button>
                </Link>
              </div>

              <div className="flex items-center justify-center">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl mb-2"
                  >
                    COLLECTIONS
                  </motion.h1>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading products...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
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
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/product/${product.id}`}>
                      <ProductCard {...product} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
