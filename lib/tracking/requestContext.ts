import type { NextRequest } from "next/server";
import type { OrderTrackingContext } from "@/lib/repositories/orderRepository";
import { VISITOR_COOKIE } from "@/lib/tracking/normalize";

/** "GA1.1.1234567890.1700000000" -> "1234567890.1700000000" */
function parseGaClientId(value?: string): string | undefined {
  if (!value) return undefined;
  const parts = value.split(".");
  return parts.length >= 4 ? parts.slice(-2).join(".") : undefined;
}

/**
 * Session cookie formats:
 *   GS1.1.1700000000.3.1.1700000500.0.0.0   -> "1700000000"
 *   GS2.1.s1700000000$o3$g1$t1700000500...  -> "1700000000"
 */
function parseGaSessionId(value?: string): string | undefined {
  if (!value) return undefined;
  const third = value.split(".")[2];
  if (!third) return undefined;
  const match = third.match(/^s?(\d+)/);
  return match ? match[1] : undefined;
}

function findGaSessionCookie(request: NextRequest): string | undefined {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID;
  if (measurementId) {
    const name = `_ga_${measurementId.replace(/^G-/, "")}`;
    const exact = request.cookies.get(name)?.value;
    if (exact) return exact;
  }
  return request.cookies.getAll().find((c) => c.name.startsWith("_ga_"))?.value;
}

/**
 * Collect the browser identifiers Meta and GA4 need to attribute a server-side
 * Purchase to the right visitor/ad click. Called when the order is created,
 * while the customer is still on our site.
 */
export function getTrackingContext(request: NextRequest): OrderTrackingContext {
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || undefined;

  const context: OrderTrackingContext = {
    fbp: request.cookies.get("_fbp")?.value,
    fbc: request.cookies.get("_fbc")?.value,
    visitorId: request.cookies.get(VISITOR_COOKIE)?.value,
    gaClientId: parseGaClientId(request.cookies.get("_ga")?.value),
    gaSessionId: parseGaSessionId(findGaSessionCookie(request)),
    clientIp,
    userAgent: request.headers.get("user-agent") || undefined,
    pageUrl: request.headers.get("referer") || undefined,
  };

  // DynamoDB DocumentClient rejects undefined values unless configured otherwise
  return Object.fromEntries(
    Object.entries(context).filter(([, v]) => v !== undefined && v !== "")
  ) as OrderTrackingContext;
}
