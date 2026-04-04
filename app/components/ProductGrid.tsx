"use client";

import { ProductCard } from "./ProductCard";
import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "../context/LocaleContext";
import { useProducts } from "../context/ProductContext";

export function ProductGrid() {
  const { products } = useProducts();
  console.log("products", products);
  // if (isLoading) return <p>Loading products...</p>;
  // if (error) return <p>Error: {error}</p>;

  const [filter, setFilter] = useState<"All" | "For Her" | "For Him">("All");
  const { t } = useLocale();
  const filteredProducts =
    filter === "All" ? products : products.filter((p) => p.category === filter);

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

        {/* Filter Tabs */}
        {/* <div className="flex justify-center gap-4 mt-8">
          {(["All", "For Her", "For Him"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setFilter(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-full text-sm tracking-wider uppercase transition-all ${
                filter === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "All"
                ? "All"
                : tab === "For Her"
                  ? t("navigation.forHer")
                  : t("navigation.forHim")}
            </motion.button>
          ))}
        </div> */}
      </motion.div>

      {/* Products Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/product/${product.id}`}>
              <ProductCard {...product} />
            </Link>
          </motion.div>
        ))}
      </motion.div>

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
