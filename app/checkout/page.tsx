"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { CheckoutProvider, CheckoutContext, deliveryFee, chargedDelivery } from "../context/CheckoutContext";
import { CheckoutFlow } from "../components/checkout/CheckoutFlow";
import { DiscountCodeBox } from "../components/checkout/DiscountCodeBox";
import { OfferProgressBar } from "../components/OfferProgressBar";
import { CheckoutPricingProvider, useCheckoutPricing } from "../context/CheckoutPricingContext";
import { Header } from "../components/Header";
import { useCart } from "../hooks/useCart";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { formatPrice } from "../utils/currency";
import Image from "next/image";
import * as fpixel from "@/lib/fpixel";
import { newEventId } from "@/lib/tracking/config";

function CartSummary({
  defaultExpanded = true,
}: {
  defaultExpanded?: boolean;
}) {
  const { items, removeFromCart, updateQuantity } = useCart();
  // Server-checked totals: automatic offers, discount codes, first-order offers, free gifts
  const pricing = useCheckoutPricing();
  const checkoutContext = useContext(CheckoutContext);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (items.length === 0) return null;

  const checkoutState = checkoutContext?.state;
  const shippingFee = checkoutState ? deliveryFee(checkoutState) : 50; // shown struck out when free
  // Added to the total when "Charge shipping" is on (admin Settings) and no free-delivery offer applies
  const shippingCharged = checkoutState && !pricing.freeShipping ? chargedDelivery(checkoutState) : 0;
  const originalSubtotal = pricing.subtotal; // (a)
  const surpriseDiscount = pricing.discount; // (b)
  const discountedSubtotal = pricing.total; // a - b (GST-inclusive price)

  // GST-inclusive extraction: price already includes 18% GST
  const actualCost = Number((discountedSubtotal / 1.18).toFixed(2)); // (c) base cost without GST
  const gst = Number((discountedSubtotal - actualCost).toFixed(2)); // GST component
  // Items are GST-inclusive. Delivery is added only when "Charge shipping" is on (admin Settings);
  // otherwise it is shown struck out as FREE.
  const total = Math.round((discountedSubtotal + shippingCharged) * 100) / 100;

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

        {/* Items List - Always visible */}
        <div className="p-4 space-y-3 border-b border-gray-200 max-h-80 overflow-y-auto">
          {items.map((item) => (
            <motion.div
              key={item.sku}
              layout
              className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Image */}
              <Link
                href={`/product/${item.slug}`}
                className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0 cursor-pointer"
              >
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors block cursor-pointer"
                >
                  {item.productName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-semibold text-red-700">
                    ₹{formatPrice(item.price)}
                  </p>
                  <p className="text-xs text-gray-600 line-through">
                    ₹{formatPrice(item.price * 2)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2 w-fit bg-white rounded border border-gray-300">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 transition-colors"
                    aria-label={`Decrease quantity of ${item.productName}`}
                  >
                    <Minus className="w-3 h-3 text-gray-600" />
                  </motion.button>
                  <span className="px-2 text-xs font-medium">
                    {item.quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 transition-colors"
                    aria-label={`Increase quantity of ${item.productName}`}
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
                aria-label={`Remove ${item.productName} from cart`}
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
          {/* Free gifts added by offers (the server adds them to the order) */}
          {pricing.gifts.map((g) => (
            <div key={g.offerId} className="flex gap-3 p-3 bg-orange-50 border border-dashed border-orange-300 rounded-lg">
              <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                {g.image ? <Image src={g.image} alt={g.productName} fill className="object-cover" /> : <span className="absolute inset-0 flex items-center justify-center text-2xl" aria-hidden="true">🎁</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{g.productName}</p>
                <p className="text-xs text-gray-600">{g.size} · Free gift</p>
                <p className="text-sm font-bold text-green-700 mt-1">FREE</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pt-4">
          <OfferProgressBar lines={items.map((i) => ({ productId: i.productId, price: i.price, quantity: i.quantity }))} />
        </div>
        <DiscountCodeBox />

        {/* Price Breakdown - Toggled by Show/Hide Details */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "auto" : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 space-y-3 bg-white border-b border-gray-200">
            <div className="space-y-2 pb-3 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-medium">
                  ₹{formatPrice(originalSubtotal)}
                </span>
              </div>
              {surpriseDiscount > 0 &&
                (pricing.offers.length > 0 ? pricing.offers : [{ id: "discount", name: "Surprise Discount", amount: surpriseDiscount }]).map((o) => (
                  <div key={o.id} className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 p-2 rounded-lg -mx-2">
                    <span>🎉 {o.name}</span>
                    <span>-₹{formatPrice(o.amount)}</span>
                  </div>
                ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Actual Cost</span>
                <span className="font-medium">₹{formatPrice(actualCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium">₹{formatPrice(gst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Handling Fee</span>
                <span className="font-medium text-green-600">
                  <span
                    style={{ textDecoration: "line-through" }}
                    className="text-gray-400 mr-1"
                  >
                    ₹20.00
                  </span>{" "}
                  FREE
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee{pricing.freeShipping ? ` · ${pricing.freeShipping.name}` : ""}</span>
                <span className={`font-medium ${shippingCharged > 0 ? "text-gray-900" : "text-green-600"}`}>
                  {checkoutContext?.state.shippingLoading ? (
                    <span className="text-gray-400">Calculating...</span>
                  ) : shippingCharged > 0 ? (
                    <>₹{formatPrice(shippingCharged)}</>
                  ) : (
                    <>
                      <span
                        style={{ textDecoration: "line-through" }}
                        className="text-gray-400 mr-2"
                      >
                        ₹{formatPrice(shippingFee)}
                      </span>
                      FREE
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total - Always visible */}
        <div className="p-4 bg-white">
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
  const { items, isCartLoaded, getTotalPrice } = useCart();
  const [isReady, setIsReady] = useState(false);
  const [hasTrackedCheckout, setHasTrackedCheckout] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && isCartLoaded && items.length > 0 && !hasTrackedCheckout) {
      setHasTrackedCheckout(true);

      // Meta InitiateCheckout (replaces the Event Setup Tool click rule on prod).
      // eventID lets Meta dedupe this against the Conversions API Gateway copy.
      fpixel.event("InitiateCheckout", {
        currency: "INR",
        value: getTotalPrice(),
        content_type: "product",
        content_ids: items.map((item) => item.productId),
        contents: items.map((item) => ({
          id: item.productId,
          quantity: item.quantity,
          item_price: item.price,
        })),
        num_items: items.reduce((n, item) => n + (item.quantity || 0), 0),
      }, newEventId("ic")); // one ID per checkout start; the CAPI Gateway reuses it for dedup

      if (typeof window !== "undefined") {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object
        (window as any).dataLayer.push({
          event: "begin_checkout",
          ecommerce: {
            currency: "INR",
            value: getTotalPrice(),
            items: items.map((item) => ({
              item_id: item.sku,
              item_name: item.productName,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        });
      }
    }
  }, [isReady, isCartLoaded, items, hasTrackedCheckout, getTotalPrice]);


  // Redirect if cart is empty and component is ready and cart metadata is loaded
  useEffect(() => {
    if (isReady && isCartLoaded && items.length === 0) {
      router.push("/");
    }
  }, [isReady, isCartLoaded, items.length, router]);

  if (!isReady || !isCartLoaded || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
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

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Checkout Flow */}
            <div className="lg:col-span-3">
              <CheckoutFlow />
            </div>

            {/* Cart Summary Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
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
      <CheckoutPricingProvider>
        <CheckoutPageContent />
      </CheckoutPricingProvider>
    </CheckoutProvider>
  );
}
