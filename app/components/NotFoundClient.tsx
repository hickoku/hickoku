"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowRight, Search, ShoppingBag } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";

interface NotFoundClientProps {
  suggestedProducts: any[];
}

export function NotFoundClient({ suggestedProducts }: NotFoundClientProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-rose-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-amber-50 rounded-full blur-3xl opacity-50" />
          
          {/* Subtle Perfume Doodle Background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url('/hickoku-assets/slider/Slider1.webp')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Column: 404 Visual */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-sm tracking-[0.3em] uppercase font-bold text-amber-800 mb-4 block">
                  Error 404
                </span>
                <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-6 leading-tight">
                  Lost your way? <br/>
                  <span className="italic text-amber-700">Don't worry.</span>
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed font-medium">
                  It seems the fragrance you were looking for has vanished into thin air. While we find it, why not check out our <span className="text-amber-800 font-bold">best-selling perfumes</span> and <span className="text-amber-800 font-bold">luxury attars</span>?
                </p>

                <p className="text-sm text-gray-500 mb-10 max-w-lg italic italic">
                  Explore our collection of long-lasting, alcohol-free fragrances crafted for every occasion in India.
                </p>

                {/* Thematic Scent Profile */}
                <div className="mb-10 p-6 bg-white/60 backdrop-blur-sm border border-amber-100 rounded-2xl inline-block text-left shadow-sm">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-amber-900 mb-4 italic">Error Profile</h3>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-400 font-bold tracking-tighter">Mistake</span>
                      <span className="text-sm font-semibold text-gray-800 tracking-tight">404 Error</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-400 font-bold tracking-tighter">Next Step</span>
                      <span className="text-sm font-semibold text-gray-800 tracking-tight">Back to Shop</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-400 font-bold tracking-tighter">Mood</span>
                      <span className="text-sm font-semibold text-gray-800 tracking-tight">Finding Scent</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
                  >
                    <Home className="w-5 h-5" />
                    Go to Homepage
                  </Link>
                  <Link
                    href="/collection"
                    className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 border border-gray-900 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    View All Perfumes
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right Column: SEO Friendly Links / Categories */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex-1 hidden lg:block"
            >
              <div className="bg-amber-50/50 rounded-[40px] p-10 border border-amber-100 shadow-sm">
                <h3 className="text-2xl font-serif text-gray-900 mb-8 border-b border-amber-200 pb-4">
                  Quick Scent Discovery
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: "Best Selling Perfumes", href: "/collection", desc: "Our most loved fragrances across India" },
                    { label: "Premium Original Attars", href: "/collection", desc: "Traditional, alcohol-free concentrated oils" },
                    { label: "Perfumes for Men", href: "/collection", desc: "Bold, masculine and long-lasting scents" },
                    { label: "Fragrances for Women", href: "/collection", desc: "Elegant, floral and sophisticated notes" },
                    { label: "Luxury Gift Sets", href: "/collection", desc: "Perfect for gifting your loved ones" }
                  ].map((cat, i) => (
                    <Link key={i} href={cat.href} className="group flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-amber-200">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors">{cat.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-800" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-20"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Suggested for You
                </h2>
                <Link 
                  href="/collection" 
                  className="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-1 group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {suggestedProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
