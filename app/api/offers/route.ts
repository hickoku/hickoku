import { NextResponse } from "next/server";
import { getOffers, publicOffers } from "@/lib/offers/repository";

export const dynamic = "force-dynamic";

// Public list of enabled offers, without code-only offers (so codes never leak). The browser decides which
// are live right now with isLive(); the server re-checks everything when an order is created.
export async function GET() {
  try {
    const offers = publicOffers(await getOffers());
    return NextResponse.json({ offers }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("GET /api/offers failed:", e);
    return NextResponse.json({ offers: null, error: "Failed to load offers" }, { status: 500 });
  }
}
