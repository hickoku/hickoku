/**
 * Single switch for all marketing tracking (Meta Pixel, GTM/GA4, server-side events).
 *
 * - Prod: always on (APP_ENV=prod).
 * - Stage (stage.hickoku.com): set NEXT_PUBLIC_TRACKING_ENABLED=true in the stage env.
 * - Local dev: off, even though APP_ENV defaults to "stage" there.
 *
 * Works in both browser and server code: APP_ENV is exposed via next.config.ts `env`,
 * and NEXT_PUBLIC_* vars are inlined at build time.
 */
export const TRACKING_ENABLED =
  process.env.APP_ENV === "prod" ||
  process.env.NEXT_PUBLIC_TRACKING_ENABLED === "true";

/** Shared Meta event_id so the browser Purchase and the server Purchase are deduplicated. */
export const purchaseEventId = (orderId: string) => `purchase_${orderId}`;

/**
 * Fresh Meta event_id for a browser event that has no natural key (InitiateCheckout, AddToCart).
 * The Conversions API Gateway mirrors each pixel event server-side and reuses this ID as
 * event_id, so Meta deduplicates the browser and gateway copies instead of counting both.
 */
export const newEventId = (prefix: string) => {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}_${rand}`;
};
