"use client";

import { TRACKING_ENABLED } from "@/lib/tracking/config";
import {
  normalizeCustomer,
  VISITOR_COOKIE,
  MATCHING_STORAGE_KEY,
  type CustomerFields,
} from "@/lib/tracking/normalize";

/**
 * Browser-side customer matching for the Meta Pixel (raises Event Match Quality).
 *
 * - Visitor ID: first-party cookie used as external_id on browser events and on
 *   the server Purchase, so Meta can link them to the same person.
 * - Customer details: SHA-256 hashed in the browser and kept in localStorage
 *   (hashes only, never plain text), so returning customers are matched from
 *   their first page view. The pixel snippet in FacebookPixel.tsx reads them.
 */

const TWO_YEARS = 60 * 60 * 24 * 730;

export function getVisitorId(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${VISITOR_COOKIE}=([^;]+)`));
  if (match) return decodeURIComponent(match[1]);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(id)}; Max-Age=${TWO_YEARS}; Path=/; SameSite=Lax${secure}`;
  return id;
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash the customer's details, remember them, and hand them to the pixel.
 * The pixel only accepts user data once per page load (when it started without
 * any), so later calls on the same page just refresh the stored hashes.
 */
export async function identifyCustomer(customer: CustomerFields): Promise<void> {
  if (!TRACKING_ENABLED || typeof window === "undefined" || !crypto?.subtle) return;

  try {
    const normalized = normalizeCustomer(customer);
    const hashed: Record<string, string> = {};
    await Promise.all(
      Object.entries(normalized).map(async ([key, value]) => {
        hashed[key] = await sha256Hex(value);
      })
    );
    if (!hashed.em && !hashed.ph) return; // nothing useful to match on

    try {
      window.localStorage.setItem(MATCHING_STORAGE_KEY, JSON.stringify(hashed));
    } catch {
      // storage blocked: still pass to the pixel for this page
    }

    const fbq = (window as any).fbq;
    const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    if (fbq && pixelId) {
      const visitorId = getVisitorId();
      fbq("init", pixelId, { ...hashed, ...(visitorId && { external_id: visitorId }) });
    }
  } catch (error) {
    console.warn("[Tracking] identifyCustomer failed", error);
  }
}
