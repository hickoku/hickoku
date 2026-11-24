// Counts a paid order's offers: usedCount on each offer (for usage limits) and the
// customer's history (for "first order only" / "once per customer"). Server-only.
// Called from both payment paths (verify-payment and the Razorpay webhook); the claim on
// the order makes sure it runs once per order.
import { orderRepository } from "@/lib/repositories/orderRepository";
import { countOfferUse } from "./repository";
import { recordPaidOrder } from "./customers";

export async function recordOfferUsage(orderId: string): Promise<void> {
  try {
    const order = await orderRepository.getOrder(orderId);
    if (!order || order.paymentStatus !== "paid") return;
    if (!(await orderRepository.claimOfferUsage(orderId))) return; // already counted
    const ids = [...new Set((order.appliedOffers || []).map((a) => a.id).filter(Boolean))];
    await Promise.all([
      ids.length ? countOfferUse(ids) : Promise.resolve(),
      recordPaidOrder(order.customerEmail || order.shippingAddress?.email, order.customerPhone || order.shippingAddress?.phone, ids, orderId),
    ]);
  } catch (e) {
    console.error(`Failed to record offer usage for order ${orderId}:`, e);
  }
}
