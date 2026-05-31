"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
// Old slider — uncomment to switch back:
import { HeroSection } from "./components/HeroSection";
import { HeroSliderModern } from "./components/HeroSliderModern";
import { ProductGrid } from "./components/ProductGrid";


interface HomeClientProps {
  initialProducts: any[];
}

export function HomeClient({ initialProducts }: HomeClientProps) {
  const [loading, setLoading] = useState(false);

  // Pick all available products (up to 8) for the hero slider to populate all dynamic categories
  const heroProducts = initialProducts.slice(0, 8);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen onLoadingComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>
      <Header />
      <main>
        <h1 className="sr-only">Hickoku Perfumes - Affordable Premium Perfumes</h1>
        {/* Product showcase slider */}
        <HeroSliderModern products={heroProducts} />
        {/* <HeroSection /> */}
        <ProductGrid initialProducts={initialProducts} />
      </main>
      <Footer />
    </>
  );
}
