"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  CheckCircle,
  Package,
  MapPin,
  Mail,
  Phone,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/repositories/orderRepository";
import { formatPrice } from "@/app/utils/currency";
import { Header } from "@/app/components/Header";
import Image from "next/image";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation State
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // Fetch order details
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setOrder(data.order);
        } else {
          setError("Order not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12 mt-22">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {order.status === "cancelled" ? "Order Cancelled" : "Order Confirmed!"}
            </h1>
            <p className="text-gray-600">
              {order.status === "cancelled" 
                ? "This order has been cancelled and a refund has been initiated."
                : "Thank you for your purchase. Your order has been confirmed."}
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            {/* Order Number & AWB */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {order.orderNumber}
                  </p>
                  {order.awb && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      AWB: {order.awb}
                    </p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation Option (Improved UX) */}
            {(() => {
              const createdAt = new Date(order.createdAt);
              const now = new Date();

              // Cancellation Window Logic:
              // If ordered BEFORE 2PM: active till 2PM same day.
              // If ordered AFTER 2PM: active till 1PM next day.
              let expiry = new Date(createdAt);
              if (createdAt.getHours() < 14) {
                expiry.setHours(14, 0, 0, 0);
              } else {
                expiry.setDate(expiry.getDate() + 1);
                expiry.setHours(13, 0, 0, 0);
              }

              const canCancel = now < expiry && (order.status === "pending" || order.status === "confirmed") && cancelStatus === 'idle';

              if (order.status === "cancelled") {
                return (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-semibold text-red-800">This order has been cancelled.</p>
                    <p className="text-xs text-red-700 mt-1">If you have any questions regarding your refund, please contact support.</p>
                  </div>
                );
              }

              const handleCancel = async () => {
                if (!confirm("Are you sure you want to cancel this order? A full refund will be initiated.")) return;
                
                setIsCancelling(true);
                setErrorMessage(null);
                try {
                  const res = await fetch(`/api/orders/user-cancel`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId: order.orderId }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setCancelStatus('success');
                    // Refresh order data after success to show cancelled status
                    setTimeout(() => window.location.reload(), 3000);
                  } else {
                    setCancelStatus('error');
                    setErrorMessage(data.error);
                  }
                } catch (e) {
                  setCancelStatus('error');
                  setErrorMessage("An unexpected error occurred.");
                } finally {
                  setIsCancelling(false);
                }
              };

              if (cancelStatus === 'success') {
                return (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-800">Order successfully cancelled!</p>
                    <p className="text-xs text-green-700 mt-1">A full refund has been initiated. This page will refresh shortly.</p>
                  </div>
                );
              }

              if (cancelStatus === 'error') {
                return (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-semibold text-red-800">Cancellation Failed</p>
                    <p className="text-xs text-red-700 mt-1">
                      {errorMessage || "We couldn't cancel your order automatically."}
                    </p>
                    <p className="text-xs text-red-700 mt-2 font-bold">
                      Please call or WhatsApp us at support for immediate assistance.
                    </p>
                    <button 
                      onClick={() => setCancelStatus('idle')}
                      className="text-xs text-blue-600 underline mt-2"
                    >
                      Try again
                    </button>
                  </div>
                );
              }

              if (canCancel) {
                return (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                         <p className="text-xs text-gray-500">
                          Changed your mind? Cancel until{" "}
                           {expiry.toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors underline disabled:opacity-50"
                      >
                        {isCancelling ? (
                          <>
                            <Loader className="w-3 h-3 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Order"
                        )}
                      </button>
                    </div>
                  </div>
                );
              } else if (order.status === "pending" && cancelStatus === 'idle') {
                return (
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs text-orange-700">
                      The cancellation window for this order has closed. If you
                      need assistance, please contact us at support@hickoku.com.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Order Items */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {order.customerFirstName} {order.customerLastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.customerEmail}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    {order.customerPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Price</span>
                  <span>₹{formatPrice(order.subtotal)}</span>
                </div>
                {order.surpriseDiscount ? (
                  <div className="flex justify-between text-sm font-semibold text-green-600 bg-green-50 p-2 rounded-lg -mx-2">
                    <span>🎉 Surprise Discount</span>
                    <span>-₹{formatPrice(order.surpriseDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-gray-600">
                  <span>Actual Cost</span>
                  <span>
                    ₹
                    {formatPrice(
                      Number(
                        (
                          (order.subtotal - (order.surpriseDiscount || 0)) /
                          1.18
                        ).toFixed(2),
                      ),
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>
                    ₹
                    {formatPrice(
                      Number(
                        (
                          order.subtotal -
                          (order.surpriseDiscount || 0) -
                          (order.subtotal - (order.surpriseDiscount || 0)) /
                            1.18
                        ).toFixed(2),
                      ),
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Handling Fee</span>
                  <span className="text-green-600 font-medium">
                    <span
                      style={{ textDecoration: "line-through" }}
                      className="text-gray-400 mr-1"
                    >
                      ₹20
                    </span>{" "}
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">
                    <span
                      style={{ textDecoration: "line-through" }}
                      className="text-gray-400 mr-1"
                    >
                      ₹
                      {formatPrice(
                        order.shippingCost > 0 ? order.shippingCost : 50,
                      )}
                    </span>
                    FREE
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
            <Link
              href={`/order-tracking/${order.orderId}`}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Track Order
            </Link>
          </motion.div>

          {/* Email Confirmation Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-sm text-gray-600"
          >
            <p>
              A confirmation email will be sent to{" "}
              <span className="font-medium">{order.customerEmail}</span>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
