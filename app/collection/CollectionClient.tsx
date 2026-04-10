"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { useLocale } from "../context/LocaleContext";

interface CollectionClientProps {
  initialProducts: any[];
}

export function CollectionClient({ initialProducts }: CollectionClientProps) {
  const { t } = useLocale();

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gray-50 pt-30">
        <main className="flex-grow">
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
              {initialProducts.map((product, index) => (
                <div key={product.id}>
                  <Link href={`/product/${product.slug}`}>
                    <ProductCard {...product} priority={index < 3} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
