"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { ProductGrid } from "./components/ProductGrid";

interface HomeClientProps {
  initialProducts: any[];
}

export function HomeClient({ initialProducts }: HomeClientProps) {
  const [loading, setLoading] = useState(false);

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
        <HeroSection />
        <ProductGrid initialProducts={initialProducts} />
      </main>
      <Footer />
    </>
  );
}
