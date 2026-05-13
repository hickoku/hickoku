"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Timer, Plane, Heart, Truck } from "lucide-react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

// ── Featured Product Data ──────────────────────────────────────────────────
const FEATURED_PRODUCTS = [
  {
    slug: "roselia",
    name: "Roselia",
    tagline: "A Love Letter in Every Drop",
    description: "Inspired by the first bloom of spring — a delicate fusion of Bulgarian rose, dewy petals, and warm amber. Roselia captures the intoxicating beauty of a rose garden at dawn.",
    image: "/hickoku-assets/roselia/Roselia1.JPG",
    accent: "from-rose-900/40",
  },
  {
    slug: "velvira",
    name: "Velvira",
    tagline: "Elegance Wrapped in Velvet",
    description: "A sophisticated blend of velvety oud, smoky vanilla, and dark musk. Velvira is the fragrance of quiet confidence — bold yet refined, mysterious yet inviting.",
    image: "/hickoku-assets/velvira/Velvira3.JPG",
    accent: "from-violet-900/40",
  },
  {
    slug: "lumiflora",
    name: "Lumiflora",
    tagline: "Where Light Meets Flora",
    description: "A radiant bouquet of white jasmine, luminous neroli, and sun-kissed citrus. Lumiflora is the fragrance of golden mornings and effortless grace.",
    image: "/hickoku-assets/lumiflora/Lumiflora2.jpeg",
    accent: "from-amber-900/40",
  },
  {
    slug: "raafa",
    name: "Raafa",
    tagline: "The Essence of Purity",
    description: "Crafted from the rarest Arabian ouds and saffron — Raafa is a tribute to timeless tradition. Deep, warm, and utterly captivating with every breath.",
    image: "/hickoku-assets/raafa/Raafa3.JPG",
    accent: "from-emerald-900/40",
  },
];

// ── Parallax Hero Section ──────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-black">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="/hickoku-assets/hero-cinematic.png"
          alt="Hickoku Perfumes — The Fragrance of Timeless Elegance"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-amber-400/80 text-xs sm:text-sm tracking-[0.35em] uppercase mb-6"
        >
          The Art of Fragrance
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-light text-white tracking-tight mb-6"
        >
          HICKOKU
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed font-light"
        >
          Every scent tells a story. Every bottle holds a memory.
          <br className="hidden sm:block" />
          Discover fragrances crafted for those who dare to be unforgettable.
        </motion.p>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-amber-400/60 text-[10px] tracking-[0.3em] uppercase">
            Scroll to Explore
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-amber-400/60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Product Story Section ──────────────────────────────────────────────────
function ProductStory({
  product,
  index,
}: {
  product: (typeof FEATURED_PRODUCTS)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const isReversed = index % 2 !== 0;

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-[#0a0a0a] flex items-center overflow-hidden"
    >
      {/* Subtle section divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-20 lg:py-0">
        <div
          className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20`}
        >
          {/* Product Image with Parallax */}
          <motion.div
            className="w-full lg:w-1/2 relative"
            initial={{ opacity: 0, x: isReversed ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <motion.div
                style={{ y: imageY }}
                className="absolute inset-0 scale-110"
              >
                <Image
                  src={product.image}
                  alt={`${product.name} — Premium Perfume by Hickoku`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${product.accent} to-transparent`}
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-amber-400/70 text-[10px] sm:text-xs tracking-[0.4em] uppercase"
            >
              Chapter {index + 1}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight"
            >
              {product.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-amber-300/80 text-lg sm:text-xl font-light italic"
            >
              "{product.tagline}"
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-16 h-[1px] bg-amber-400/40 origin-left"
            />

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-gray-400 text-base sm:text-lg leading-relaxed font-light"
            >
              {product.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link href={`/product/${product.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(251, 191, 36, 0.15)" }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 px-8 py-3 border border-amber-400/30 text-amber-400 rounded-full text-sm tracking-[0.2em] uppercase transition-all hover:border-amber-400/60"
                >
                  Discover {product.name}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Brand Philosophy / SEO Content Section ─────────────────────────────────
function BrandStorySection() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 sm:py-32 overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-amber-400/60 text-[10px] tracking-[0.4em] uppercase block mb-6"
        >
          Our Philosophy
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight mb-8"
        >
          Crafted with Passion. Worn with Pride.
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-20 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto mb-10"
        />

        {/* SEO-rich content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-6 text-gray-400 text-base sm:text-lg leading-relaxed font-light max-w-3xl mx-auto"
        >
          <p>
            At <strong className="text-white font-normal">Hickoku</strong>, we believe that the{" "}
            <strong className="text-gray-300 font-normal">best perfume for men and women</strong>{" "}
            doesn't have to cost a fortune. Born from a passion for{" "}
            <strong className="text-gray-300 font-normal">luxury scents</strong>, our collection
            brings you{" "}
            <strong className="text-gray-300 font-normal">
              premium, alcohol-free perfumes and original attars
            </strong>{" "}
            crafted with imported oils from around the world.
          </p>
          <p>
            Every Hickoku fragrance is a{" "}
            <strong className="text-gray-300 font-normal">long-lasting attar</strong> designed to
            linger for 6–10 hours, ensuring you carry your signature scent from morning to night.
            Whether you're searching for the{" "}
            <strong className="text-gray-300 font-normal">best affordable perfume online in India</strong>{" "}
            or a{" "}
            <strong className="text-gray-300 font-normal">perfume gift set</strong> for someone
            special, our curated collection has something for every occasion.
          </p>
          <p>
            From the romantic notes of <em className="text-gray-300">Roselia</em> to the bold
            sophistication of <em className="text-gray-300">Velvira</em>, each bottle is a
            masterpiece — skin-friendly, cruelty-free, and made to be unforgettable.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16"
        >
          {[
            { icon: Timer, label: "Long Lasting", sub: "6–10 Hours" },
            { icon: Plane, label: "Imported Oils", sub: "Premium Quality" },
            { icon: Heart, label: "Skin Friendly", sub: "Alcohol Free" },
            { icon: Truck, label: "Free Shipping", sub: "All Across India" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-3 p-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/10">
                <Icon className="w-6 h-6 text-amber-400/70" />
              </div>
              <span className="text-white text-xs font-semibold tracking-wider uppercase">
                {label}
              </span>
              <span className="text-gray-500 text-[10px] tracking-wider uppercase">{sub}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Collection CTA Section ─────────────────────────────────────────────────
function CollectionCTA() {
  return (
    <section className="relative bg-[#0a0a0a] py-24 sm:py-32 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-amber-400/5 blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-amber-400/60 text-[10px] tracking-[0.4em] uppercase block mb-6"
        >
          The Full Story
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-6"
        >
          Explore Our Complete Collection
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-base sm:text-lg leading-relaxed font-light mb-10"
        >
          From everyday elegance to rare luxury — discover the full range of
          Hickoku fragrances, each waiting to become a part of your story.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/collection">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(251, 191, 36, 0.15)" }}
              whileTap={{ scale: 0.97 }}
              className="px-12 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm tracking-[0.15em] uppercase rounded-full transition-all shadow-lg shadow-amber-400/20"
            >
              View All Perfumes
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
interface HomeClientV2Props {
  initialProducts: any[];
}

export function HomeClientV2({ initialProducts }: HomeClientV2Props) {
  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a]">
        <h1 className="sr-only">
          Hickoku Perfumes — Best Affordable Premium Perfumes & Attars Online India
        </h1>

        {/* Chapter 0: Hero */}
        <HeroSection />

        {/* Chapters 1–4: Product Stories */}
        {FEATURED_PRODUCTS.map((product, index) => (
          <ProductStory key={product.slug} product={product} index={index} />
        ))}

        {/* Brand Philosophy & SEO Content */}
        <BrandStorySection />

        {/* Final CTA */}
        <CollectionCTA />
      </main>
      <Footer />
    </>
  );
}
