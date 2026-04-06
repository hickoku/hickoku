"use client";

import { motion } from "motion/react";
import { Header } from "../../components/Header";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Package,
  Truck,
  MessageSquare,
  Phone,
  Clock,
  ArrowLeft,
  Loader,
} from "lucide-react";
import { Order } from "@/lib/repositories/orderRepository";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    // NEW: Direct redirect if the ID itself looks like an AWB
    if (/^\d+$/.test(orderId) && orderId.length >= 10) {
      window.location.replace(`https://www.delhivery.com/track-v2/package/${orderId}`);
      return;
    }

    // Fetch order details from API
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const fetchedOrder = data.order;
          setOrder(fetchedOrder);
          
          // NEW: If order has an AWB, redirect to Delhivery
          const awb = fetchedOrder.awb || (fetchedOrder.shipmentData?.packages?.[0]?.waybill);
          if (awb) {
            window.location.replace(`https://www.delhivery.com/track-v2/package/${awb}`);
          }
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

  // Generate tracking timeline based on order status
  const getTrackingTimeline = (order: Order) => {
    const timeline = [
      {
        step: "Order Confirmed",
        timestamp: order.confirmedAt || order.createdAt,
        completed: ["confirmed", "processing", "shipped", "delivered"].includes(order.status),
        description: "Your order has been confirmed",
      },
      {
        step: "Processing",
        timestamp: order.updatedAt,
        completed: ["processing", "shipped", "delivered"].includes(order.status),
        description: "We are preparing your order",
      },
      {
        step: "Shipped",
        timestamp: order.updatedAt,
        completed: ["shipped", "delivered"].includes(order.status),
        description: "Your order is on the way",
      },
      {
        step: "Delivered",
        timestamp: order.updatedAt,
        completed: order.status === "delivered",
        description: "Your order has been delivered",
      },
    ];
    return timeline;
  };

  // Calculate estimated delivery (2 days from order creation)
  const getEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 2);
    return deliveryDate.toISOString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "processing":
      case "confirmed":
        return "bg-blue-50 border-blue-200";
      case "shipped":
        return "bg-purple-50 border-purple-200";
      case "delivered":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Pending";
      case "confirmed":
      case "processing":
        return "Processing Your Order";
      case "shipped":
        return "Order Shipped";
      case "delivered":
        return "Order Delivered";
      default:
        return "Order Status Unknown";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="pt-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Order not found"}</p>
            <button
              onClick={() => router.push("/")}
              className="text-blue-600 hover:underline"
            >
              Return to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const trackingTimeline = getTrackingTimeline(order);
  const estimatedDelivery = getEstimatedDelivery(order.createdAt);

  return (
    <>
      <Header />
      <div className="pt-20 bg-gray-50 min-h-screen pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Track Your Order
                </h1>
                <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
              </div>
            </div>
          </motion.div>

          {/* Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-8 rounded-xl border-2 mb-8 ${getStatusColor(order.status)}`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0"
              >
                {order.status === "delivered" ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : order.status === "shipped" ? (
                  <Truck className="w-10 h-10 text-purple-600" />
                ) : (
                  <Package className="w-10 h-10 text-blue-600" />
                )}
              </motion.div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getStatusMessage(order.status)}
                </h2>
                <p className="text-gray-600 mt-2">
                  {order.status === "delivered"
                    ? "Your order has been successfully delivered"
                    : `Estimated delivery: ${new Date(
                        estimatedDelivery,
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tracking Timeline - Horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-12">
              Tracking Timeline
            </h3>

            {/* Horizontal Timeline */}
            <div
              className="relative"
              style={{ paddingTop: "5px", paddingBottom: "5px" }}
            >
              {/* Timeline Connection Line */}
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-blue-400 to-gray-300"
                style={{ top: "32px" }}
              />

              {/* Timeline Items */}
              <div className="grid grid-cols-4 gap-6 relative">
                {trackingTimeline.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Timeline Dot */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`w-14 h-14 rounded-full border-4 flex items-center justify-center flex-shrink-0 mb-6 relative z-10 ${
                        event.completed
                          ? "bg-green-600 border-green-600 shadow-lg shadow-green-200"
                          : "bg-white border-gray-400"
                      }`}
                    >
                      {event.completed && (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      )}
                    </motion.div>

                    {/* Event Details */}
                    <div className="text-center w-full">
                      <p
                        className={`font-bold text-sm leading-tight ${
                          event.completed ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {event.step}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 min-h-8">
                        {event.description}
                      </p>
                      <p
                        className={`text-xs font-semibold mt-2 ${
                          event.completed ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {event.timestamp && new Date(event.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid md:grid-cols-2 gap-6"
          >
            {/* Delivery Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Expected Delivery
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(estimatedDelivery).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  },
                )}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Your order should arrive by this date
              </p>
            </div>

            {/* Support Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Need Help?
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Contact our support team
              </p>
              <div className="space-y-2 text-sm">
                <a
                  href="mailto:support@perfume.com"
                  className="text-blue-600 hover:text-blue-700 font-semibold block"
                >
                  support@perfume.com
                </a>
                <a
                  href="tel:+919876543210"
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Continue Shopping
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
