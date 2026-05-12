import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/currency";

interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  slug: string;
  images: string[];
  basePrice: number;
  variants: { price: number, sku?: string, id?: string, size?: string }[];
  badge?: string;
  highlight?: string;
}

export default function RelatedProductsCarousel({ products }: { products: RelatedProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / offsetWidth);
      setActiveIndex(index);
    };

    const currentScrollRef = scrollRef.current;
    if (currentScrollRef) {
      currentScrollRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentScrollRef) {
        currentScrollRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (!products || products.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const { offsetWidth } = scrollRef.current;
    scrollRef.current.scrollBy({ left: dir === "left" ? -offsetWidth : offsetWidth, behavior: "smooth" });
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const { offsetWidth } = scrollRef.current;
    scrollRef.current.scrollTo({ left: index * offsetWidth, behavior: "smooth" });
  };

  return (
    <section className="mt-12 border-t border-gray-100 pt-10 px-4 sm:px-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-serif text-gray-900 flex items-center gap-3">
          <span className="text-2xl">✨</span> You May Also Like
        </h2>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:shadow-md transition-all active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2.5 rounded-full border border-gray-200 hover:bg-white hover:shadow-md transition-all active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex flex-col sm:flex-row gap-6 sm:gap-4 sm:overflow-x-auto pb-6 sm:scroll-smooth sm:snap-x sm:snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {products.map((product) => {
            const price = product.variants?.[0]?.price || product.basePrice || 0;
            const discounted = price * 0.5;
            const image = product.images?.[0] || "";

            return (
              <motion.div
                key={product.id}
                className="flex-shrink-0 w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] sm:snap-center bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group"
              >
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                    )}
                    {product.badge && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
                      <p className="text-white text-[11px] font-medium text-center leading-relaxed line-clamp-2 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {product.highlight || product.description}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 hover:text-amber-600 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-red-600 font-extrabold bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">50% OFF</span>
                    <span className="text-xs text-gray-400 line-through">₹{formatPrice(price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900">₹{formatPrice(discounted)}</span>
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#000" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const firstVariant = product.variants?.[0];
                        const sku = firstVariant?.sku || `HICK-${product.id}`;
                        const variantId = firstVariant?.id || `${product.id}01`;
                        const size = firstVariant?.size || "Standard";
                        addToCart({
                          productId: product.id,
                          variantId,
                          productName: product.name,
                          price: discounted,
                          image,
                          sku,
                          size,
                          quantity: 1,
                          slug: product.slug,
                        });
                      }}
                      className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black tracking-widest rounded-xl transition-all shadow-md shadow-gray-200"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      ADD TO CART
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
