import { NextResponse } from "next/server";
import { getCheckoutSettings, FLAT_DELIVERY_FEE } from "@/lib/settings/checkout";

// Checkout switches for the browser. Set in the admin panel (Settings → Checkout switches).
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getCheckoutSettings();
  return NextResponse.json(
    {
      enableDelhivery: s.delhivery,
      chargeShipping: s.shipping,
      enableGeolocation: s.geolocation,
      flatDeliveryFee: FLAT_DELIVERY_FEE,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
