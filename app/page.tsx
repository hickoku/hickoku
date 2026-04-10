"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { ProductGrid } from "./components/ProductGrid";
import "./styles/tailwind.css";
import "./styles/fonts.css";
import "./styles/theme.css";

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <LoadingScreen onLoadingComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>
      <>
        <Header />
        <main>
          <HeroSection />
          <ProductGrid />
        </main>
        <Footer />
      </>
    </>
  );
}
