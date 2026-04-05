"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
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
              {products.map((product, index) => {
                const variant =
                  product.variants && product.variants.length > 0
                    ? product.variants[0]
                    : null;
                const price = variant ? String(variant.price) : "0";
                const image = product.images?.[0] || "";

                return (
                  <motion.div
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link href={`/product/${product.id}`}>
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        description={product.description}
                        highlight={product.highlight}
                        price={price}
                        image={image}
                        category={product.category as "For Her" | "For Him"}
                        defaultVariantId={variant?.id}
                        defaultSku={variant?.sku}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
        </main>
      </div>
    </>
  );
}
