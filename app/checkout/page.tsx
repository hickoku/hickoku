"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CheckoutProvider } from "../context/CheckoutContext";
import { CheckoutFlow } from "../components/checkout/CheckoutFlow";
import { Header } from "../components/Header";
import { useCart } from "../hooks/useCart";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { formatPrice, getDeliveryCharge } from "../utils/currency";

function CartSummary({ defaultExpanded = true }: { defaultExpanded?: boolean }) {
  const { items, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  const subtotal = getTotalPrice(); 
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const deliveryCharge = getDeliveryCharge();
  const total = subtotal + tax + deliveryCharge;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 h-fit"
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
            </div>
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {items.length} items
            </span>
          </div>
        </div>

        {/* Items List */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-3 border-b border-gray-200 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <motion.div
                key={item.sku}
                layout
                className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-red-600">₹{formatPrice(item.price)}</p>
                    <p className="text-xs text-gray-400 line-through">₹{formatPrice(item.price * 2)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2 w-fit bg-white rounded border border-gray-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity - 1)
                      }
                      className="p-1 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </motion.button>
                    <span className="px-2 text-xs font-medium">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        updateQuantity(item.sku, item.quantity + 1)
                      }
                      className="p-1 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Remove Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.sku)}
                  className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <div className="p-4 space-y-3 bg-white">
          <div className="space-y-2 pb-3 border-b border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium">₹{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Charges</span>
              <span className="font-medium">₹{formatPrice(deliveryCharge)}</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-600">₹{formatPrice(total)}</span>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-200 transition-colors"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>
    </motion.div>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auth check removed for simplified checkout flow
    setIsReady(true);
  }, [router]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="pt-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile Cart Summary - Show at top */}
          <div className="lg:hidden mb-8">
            <CartSummary defaultExpanded={false} />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Checkout Flow */}
            <div className="lg:col-span-2">
              <CheckoutFlow />
            </div>

            {/* Cart Summary Sidebar */}
            <div className="hidden lg:block">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <CheckoutProvider>
      <CheckoutPageContent />
    </CheckoutProvider>
  );
}
