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
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <LoadingScreen onLoadingComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>
      <Header />
      <main>
        <HeroSection />
        <ProductGrid initialProducts={initialProducts} />
      </main>
      <Footer />
    </>
  );
}
