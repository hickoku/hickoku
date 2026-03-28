"use client";

import { motion } from "motion/react";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutContext } from "../../context/CheckoutContext";
import { useCart } from "../../hooks/useCart";
import { CreditCard, Loader } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, convertToPaiseForRazorpay, getDeliveryCharge } from "../../utils/currency";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPayment() {
  const context = useContext(CheckoutContext);
  const router = useRouter();
  const { items, getTotalPrice, getSubtotal, getSurpriseDiscount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!context) return null;

  const { state, dispatch } = context;

  const subtotal = getSubtotal();
  const surpriseDiscount = getSurpriseDiscount();
  const discountedSubtotal = getTotalPrice();
  const tax = Math.round(discountedSubtotal * 0.1); 
  const shippingCost = state.shippingCost || getDeliveryCharge();
  const total = discountedSubtotal + tax + shippingCost;

  const handlePayment = async () => {
    if (typeof window === "undefined") return;

    setIsProcessing(true);

    try {
      // Step 1: Create order in our database and get Razorpay order ID
      const createOrderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: state.address.email,
          customerFirstName: state.address.firstName,
          customerLastName: state.address.lastName,
          customerPhone: state.address.phone,
          shippingAddress: state.address,
          items: items.map((item) => ({
            sku: item.sku,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            total: item.price * item.quantity,
          })),
          subtotal,
          surpriseDiscount,
          tax,
          shippingCost,
          total,
        }),
      });

      if (!createOrderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await createOrderResponse.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: convertToPaiseForRazorpay(total),
        currency: "INR",
        name: "Hickoku Perfumes",
        description: `Order ${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: `${state.address.firstName} ${state.address.lastName}`,
          email: state.address.email,
          contact: state.address.phone,
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response: any) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await fetch("/api/orders/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment successful
              toast.success("Payment successful!", {
                description: "Your order has been confirmed",
              });

              // Mark payment step as completed
              dispatch({ type: "MARK_STEP_COMPLETED", payload: "payment" });

              // Clear cart
              await clearCart();

              // Redirect to confirmation page
              router.push(`/checkout/confirmation?orderId=${orderData.orderId}`);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed", {
              description: "Please contact support",
            });
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.error("Payment cancelled", {
              description: "You can try again when ready",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment", {
        description: "Please try again",
      });
      setIsProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-gray-600">
          Click below to securely complete your purchase
        </p>
      </div>

      {/* Payment Method Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full p-6 border-2 border-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all text-left mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Razorpay Secure Payment</h3>
            <p className="text-sm text-gray-600">
              Credit Card, Debit Card, UPI, Net Banking
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Click to pay</p>
            <p className="font-semibold">₹{formatPrice(total)}</p>
          </div>
        </div>
      </motion.button>

      {/* Security Notice */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm mb-6">
        <p className="text-green-800">
          ✓ Your payment is secured by Razorpay's industry-leading encryption
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: "SET_STEP", payload: "address" })}
          disabled={isProcessing}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={isProcessing}
          className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pay ₹{formatPrice(total)}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
