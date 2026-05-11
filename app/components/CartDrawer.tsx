"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/currency";
import Image from "next/image";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getSubtotal,
    getSurpriseDiscount,
    stockWarnings,
    addToCart,
  } = useCart();
  const { t } = useLocale();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Fetch suggestions when cart has 1 item
  useEffect(() => {
    async function fetchSuggestions() {
      if (items.length === 1 && isOpen) {
        setIsFetchingSuggestions(true);
        try {
          const res = await fetch('/api/products-enhanced');
          if (res.ok) {
            const data = await res.json();
            // Filter out the item already in cart and take 3 random
            const currentSku = items[0].sku;
            const filtered = data
              .filter((p: any) => p.variants[0].sku !== currentSku)
              .sort(() => 0.5 - Math.random())
              .slice(0, 3);
            setSuggestions(filtered);
          }
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        } finally {
          setIsFetchingSuggestions(false);
        }
      }
    }
    fetchSuggestions();
  }, [items.length, isOpen]);

  // Explicit device background locking for Safari resolving phantom click re-rendering
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    };
  }, [isOpen]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold">{t("cart.yourCart")}</h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close bag"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Discount Alert - Only if 1 item & Flag Enabled */}
            {process.env.NEXT_PUBLIC_ENABLE_SURPRISE_DISCOUNT === 'true' && totalQuantity === 1 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-6 mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xl">🎉</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Unlock Surprise Discount!</p>
                  <p className="text-xs text-amber-700">Add 1 more product to get <span className="font-bold">₹25 off</span> on each product.</p>
                </div>
              </motion.div>
            )}

            {/* Stock Warnings */}
            {stockWarnings && stockWarnings.length > 0 && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-sm">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800 mb-1">
                      Stock Alert
                    </p>
                    {stockWarnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-amber-700">
                        <strong>{warning.productName}:</strong>{" "}
                        {warning.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="text-6xl mb-4">🛍️</div>
                  <p className="text-gray-600 text-lg">{t("cart.emptyCart")}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {t("cart.addProducts")}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.sku}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {/* Product Image */}
                        <Link 
                          href={`/product/${item.slug}`} 
                          onClick={closeCart}
                          className="w-20 h-20 relative flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
                        >
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <Link 
                              href={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("cart.sku")}: {item.sku}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-red-700">
                                50% OFF
                              </span>
                              <p className="text-sm text-gray-600 line-through">
                                ₹{formatPrice(item.price * 2)}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-red-700">
                                ₹{formatPrice(item.price)}
                              </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 w-fit">
                            <motion.button
                              disabled={item.quantity <= 1}
                              whileHover={item.quantity > 1 ? { scale: 1.05 } : {}}
                              whileTap={item.quantity > 1 ? { scale: 0.95 } : {}}
                              onClick={() =>
                                item.quantity > 1 && updateQuantity(item.sku, item.quantity - 1)
                              }
                              className={`p-3 hover:bg-gray-100 transition-colors ${
                                item.quantity <= 1 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
                              }`}
                              aria-label={`Decrease quantity of ${item.productName}`}
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="px-3 font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              disabled={item.quantity >= 10}
                              whileHover={item.quantity < 10 ? { scale: 1.05 } : {}}
                              whileTap={item.quantity < 10 ? { scale: 0.95 } : {}}
                              onClick={() =>
                                updateQuantity(item.sku, item.quantity + 1)
                              }
                              className={`p-3 hover:bg-gray-100 transition-colors ${
                                item.quantity >= 10 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
                              }`}
                              aria-label={`Increase quantity of ${item.productName}`}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.sku)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Remove ${item.productName} from bag`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Suggestions Section - Show if 1 item & Flag Enabled */}
                  {process.env.NEXT_PUBLIC_ENABLE_SURPRISE_DISCOUNT === 'true' && totalQuantity === 1 && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8 border-t border-gray-100 pt-6"
                    >
                      <h3 className="text-sm font-black tracking-widest uppercase text-gray-400 mb-4 px-2">You May Also Like</h3>
                      <div className="space-y-3">
                        {suggestions.map((p, pIdx) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 hover:border-amber-300 transition-colors group">
                            <div className="w-16 h-16 relative bg-gray-50 rounded-lg overflow-hidden shrink-0">
                              <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-gray-900 line-clamp-1">{p.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-bold text-red-600">₹{formatPrice(p.variants[0].price * 0.5)}</p>
                                <p className="text-[10px] text-gray-400 line-through">₹{formatPrice(p.variants[0].price)}</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                const variant = p.variants[0];
                                await addToCart({
                                  sku: variant.sku,
                                  productId: p.id,
                                  variantId: variant.id,
                                  productName: p.name,
                                  size: variant.size,
                                  price: variant.price * 0.5,
                                  quantity: 1,
                                  image: p.images[0],
                                  slug: p.slug,
                                });
                              }}
                              className="px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-lg shadow-sm hover:bg-black transition-colors"
                            >
                              ADD
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 p-6 space-y-4"
              >
                {/* Order Summary Breakdown */}
                <div className="space-y-2 mb-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Price</span>
                    <span>₹{formatPrice(getSubtotal())}</span>
                  </div>
                  {getSurpriseDiscount() > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 p-2 rounded-lg -mx-2">
                      <span>
                        🎉 Surprise Discount (
                        {totalQuantity} x
                        ₹25)
                      </span>
                      <span>-₹{formatPrice(getSurpriseDiscount())}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-lg font-bold text-gray-900">
                    {t("cart.total")}:
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-red-600">
                      ₹{formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full py-3 bg-gray-900 text-white text-center rounded-lg font-semibold hover:bg-gray-800 transition-all active:scale-[0.98]"
                >
                  {t("cart.checkout")}
                </Link>

                <button
                  onClick={closeCart}
                  className="block w-full py-3 border-2 border-gray-200 text-gray-900 text-center rounded-lg font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  {t("cart.continueShopping")}
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
