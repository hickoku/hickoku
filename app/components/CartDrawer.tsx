"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../hooks/useCart";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "../context/LocaleContext";
import { formatPrice } from "../utils/currency";

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
  } = useCart();
  const { t } = useLocale();
  const router = useRouter();

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
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

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
                items.map((item, index) => (
                  <motion.div
                    key={item.sku}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {t("cart.sku")}: {item.sku}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-lg font-bold text-red-600">
                            ₹{formatPrice(item.price)}
                          </p>
                          <p className="text-sm text-gray-400 line-through">
                            ₹{formatPrice(item.price * 2)}
                          </p>
                          <span className="text-xs font-bold text-red-600">
                            50% OFF
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 w-fit">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <span className="px-3 font-semibold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateQuantity(item.sku, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-100 transition-colors"
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
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </motion.div>
                ))
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
                        {items.reduce((sum, item) => sum + item.quantity, 0)} x
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
