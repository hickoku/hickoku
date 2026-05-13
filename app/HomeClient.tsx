"use client";

import { HomeClientV2 } from "./HomeClientV2";

// ── Legacy Homepage (Inactive — uncomment to restore) ──────────────────────
// import { useState } from "react";
// import { AnimatePresence } from "motion/react";
// import { LoadingScreen } from "./components/LoadingScreen";
// import { Header } from "./components/Header";
// import { Footer } from "./components/Footer";
// import { HeroSection } from "./components/HeroSection";
// import { ProductGrid } from "./components/ProductGrid";
//
// export function HomeClientLegacy({ initialProducts }: { initialProducts: any[] }) {
//   const [loading, setLoading] = useState(false);
//   return (
//     <>
//       <AnimatePresence>
//         {loading && <LoadingScreen onLoadingComplete={() => setLoading(false)} />}
//       </AnimatePresence>
//       <Header />
//       <main>
//         <h1 className="sr-only">Hickoku Perfumes - Affordable Premium Perfumes</h1>
//         <HeroSection />
//         <ProductGrid initialProducts={initialProducts} />
//       </main>
//       <Footer />
//     </>
//   );
// }

// ── Active Homepage V2: Parallax Storytelling ──────────────────────────────
interface HomeClientProps {
  initialProducts: any[];
}

export function HomeClient({ initialProducts }: HomeClientProps) {
  return <HomeClientV2 initialProducts={initialProducts} />;
}
