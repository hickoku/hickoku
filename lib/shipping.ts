// Delivery fee for an order. Server-only.
//
// Same rule the checkout has always shown:
//   - Delhivery on and it returns a rate for the PIN code → that rate
//   - otherwise → ₹50 (FLAT_DELIVERY_FEE)
// "Charge shipping" (admin Settings) decides whether the fee is added to the total.
// When it is off, the fee is only shown struck out as FREE, as before.
import { getCheckoutSettings, FLAT_DELIVERY_FEE } from "@/lib/settings/checkout";
import { getDelhiveryShippingCost } from "@/lib/services/delhiveryService";

export const GRAMS_PER_BOTTLE = 500; // same estimate as the address form

export async function deliveryFeeFor(pincode: string | undefined, quantity: number, { fresh = false } = {}) {
  const settings = await getCheckoutSettings({ fresh });
  let fee = FLAT_DELIVERY_FEE;
  if (settings.delhivery && pincode && /^\d{6}$/.test(String(pincode))) {
    const rate = await getDelhiveryShippingCost(String(pincode), Math.max(1, quantity) * GRAMS_PER_BOTTLE);
    if (rate > 0) fee = Math.round(rate * 100) / 100;
  }
  return { fee, charged: settings.shipping };
}
