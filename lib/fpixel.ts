import { TRACKING_ENABLED } from "@/lib/tracking/config";

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

const getFbq = () =>
  TRACKING_ENABLED && typeof window !== "undefined" ? (window as any).fbq : undefined;

export const pageview = () => {
  getFbq()?.("track", "PageView");
};

// https://developers.facebook.com/docs/meta-pixel/reference
// Pass eventId when the same event is also sent server-side, so Meta deduplicates them.
export const event = (name: string, options = {}, eventId?: string) => {
  const fbq = getFbq();
  if (!fbq) return;
  if (eventId) {
    fbq("track", name, options, { eventID: eventId });
  } else {
    fbq("track", name, options);
  }
};
