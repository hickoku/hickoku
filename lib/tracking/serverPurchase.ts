import crypto from "crypto";
import { orderRepository, type Order } from "@/lib/repositories/orderRepository";
import { TRACKING_ENABLED, purchaseEventId } from "@/lib/tracking/config";

/**
 * Server-side Purchase for Meta (Conversions API) and GA4 (Measurement Protocol).
 *
 * Why: the browser Purchase only fires if the customer lands on /checkout/confirmation.
 * With UPI the customer often pays in another app and never comes back to that page,
 * so the order is marked paid by the Razorpay webhook and the browser event is lost.
 *
 * Deduplication:
 * - Meta: same event_id as the browser Purchase (purchase_<orderId>).
 * - GA4: same transaction_id as the browser purchase (orderNumber).
 * - Ours: orderRepository.claimPurchaseTracking makes this run once per order.
 *
 * Env:
 *   NEXT_PUBLIC_FACEBOOK_PIXEL_ID, META_CAPI_ACCESS_TOKEN, META_TEST_EVENT_CODE (optional, stage)
 *   NEXT_PUBLIC_GA_ID, GA4_API_SECRET
 */

const META_API_VERSION = process.env.META_GRAPH_API_VERSION || "v23.0";
const REQUEST_TIMEOUT_MS = 5000;

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

/** Meta wants phone numbers with country code, digits only. */
function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return undefined;
  return digits.length === 10 ? `91${digits}` : digits;
}

function normalizeCountry(country?: string): string {
  if (!country) return "in";
  const c = country.trim().toLowerCase();
  return c === "india" || c === "in" || c === "ind" ? "in" : c.slice(0, 2);
}

const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ) as Partial<T>;

async function sendMetaPurchase(order: Order, eventTime: number) {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return { skipped: "meta not configured" };

  const t = order.tracking || {};
  const addr = order.shippingAddress;
  const phone = normalizePhone(order.customerPhone || addr?.phone);
  const email = order.customerEmail || addr?.email;

  const userData = compact({
    em: email ? [sha256(email)] : undefined,
    ph: phone ? [sha256(phone)] : undefined,
    fn: order.customerFirstName ? [sha256(order.customerFirstName)] : undefined,
    ln: order.customerLastName ? [sha256(order.customerLastName)] : undefined,
    ct: addr?.city ? [sha256(addr.city.replace(/\s+/g, ""))] : undefined,
    st: addr?.state ? [sha256(addr.state.replace(/\s+/g, ""))] : undefined,
    zp: addr?.zipCode ? [sha256(addr.zipCode.replace(/\s+/g, ""))] : undefined,
    country: [sha256(normalizeCountry(addr?.country))],
    external_id: email ? [sha256(email)] : undefined,
    client_ip_address: t.clientIp,
    client_user_agent: t.userAgent,
    fbp: t.fbp,
    fbc: t.fbc,
  });

  const items = order.items || [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.hickoku.com";

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        event_id: purchaseEventId(order.orderId),
        event_source_url: t.pageUrl || `${appUrl}/checkout`,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: "INR",
          value: order.total,
          order_id: order.orderNumber,
          content_type: "product",
          content_ids: items.map((i) => i.productId),
          contents: items.map((i) => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.price,
          })),
          num_items: items.reduce((n, i) => n + (i.quantity || 0), 0),
        },
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE && {
      test_event_code: process.env.META_TEST_EVENT_CODE,
    }),
  };

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Meta CAPI ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function sendGa4Purchase(order: Order, eventTimeMs: number) {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  const apiSecret = process.env.GA4_API_SECRET;
  if (!measurementId || !apiSecret) return { skipped: "ga4 not configured" };

  const t = order.tracking || {};
  // Without the visitor's _ga cookie GA4 can't tie this to their session; the
  // purchase is still recorded (as direct / unassigned traffic).
  const clientId =
    t.gaClientId || `${crypto.randomInt(1_000_000_000, 2_000_000_000)}.${Math.floor(eventTimeMs / 1000)}`;

  // GA4 only accepts timestamps up to 72 hours in the past
  const withinWindow = Date.now() - eventTimeMs < 71 * 60 * 60 * 1000;

  const payload = {
    client_id: clientId,
    ...(withinWindow && { timestamp_micros: eventTimeMs * 1000 }),
    events: [
      {
        name: "purchase",
        params: compact({
          transaction_id: order.orderNumber || order.orderId,
          value: order.total,
          currency: "INR",
          tax: order.tax || 0,
          shipping: order.shippingCost || 0,
          session_id: t.gaSessionId,
          engagement_time_msec: 1,
          items: (order.items || []).map((i) => ({
            item_id: i.sku,
            item_name: i.productName,
            item_variant: i.size,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      },
    ],
  };

  const res = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );
  // The MP endpoint returns 2xx with an empty body even for malformed events;
  // use /debug/mp/collect when diagnosing payload issues.
  if (!res.ok) throw new Error(`GA4 MP ${res.status}`);
  return { status: res.status };
}

/**
 * Send the server-side Purchase once for a paid order. Never throws: tracking
 * must not break payment confirmation. Await it (Vercel stops the function
 * once the response is returned).
 */
export async function trackServerPurchase(orderId: string): Promise<void> {
  if (!TRACKING_ENABLED) return;

  try {
    const order = await orderRepository.getOrder(orderId);
    if (!order || order.paymentStatus !== "paid") return;

    const claimed = await orderRepository.claimPurchaseTracking(orderId);
    if (!claimed) return; // already sent by verify-payment or webhook

    const eventTimeMs = order.paidAt ? Date.parse(order.paidAt) : Date.now();
    const [meta, ga4] = await Promise.allSettled([
      sendMetaPurchase(order, Math.floor(eventTimeMs / 1000)),
      sendGa4Purchase(order, eventTimeMs),
    ]);

    for (const [name, result] of [["Meta", meta], ["GA4", ga4]] as const) {
      if (result.status === "rejected") {
        console.error(`[Tracking] ${name} server Purchase failed for ${orderId}:`, result.reason);
      } else {
        console.log(`[Tracking] ${name} server Purchase for ${orderId}:`, JSON.stringify(result.value));
      }
    }
  } catch (error) {
    console.error(`[Tracking] server Purchase error for ${orderId}:`, error);
  }
}
