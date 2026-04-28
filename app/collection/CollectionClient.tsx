"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Header } from "../components/Header";
import { ProductCard, ProductSkeleton } from "../components/ProductCard";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface CollectionClientProps {
  initialProducts: any[];
}

export function CollectionClient({ initialProducts }: CollectionClientProps) {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gray-50 pt-30">
        <main className="flex-grow">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <Breadcrumbs items={[{ label: "Collection" }]} />
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
