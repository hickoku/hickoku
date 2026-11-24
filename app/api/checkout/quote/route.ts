import { NextRequest, NextResponse } from "next/server";
import { priceOrder, PriceError } from "@/lib/offers/pricing";

export const dynamic = "force-dynamic";

// The checkout's price: the same calculation as order creation, with the shopper's
// discount codes and (once entered) email/phone for first-order and once-per-customer offers.
// Returns totals and a message per code; never the list of codes that exist.
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const items = Array.isArray(body?.items) ? body.items.slice(0, 50) : [];
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  try {
    const p = await priceOrder(items, body.codes, { email: body.email, phone: body.phone }, { fresh: false });
    return NextResponse.json(
      {
        subtotal: p.subtotal,
        discount: p.cartDiscount,
        total: p.total,
        tax: p.tax,
        offers: p.appliedOffers.filter((a) => a.level !== "product"), // product offers are already in item prices
        gifts: p.gifts.map((g) => ({ offerId: g.offerId, productId: g.productId, productName: g.productName, size: g.size, image: g.image })),
        freeShipping: p.freeShipping,
        codes: p.codes,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    if (e instanceof PriceError) return NextResponse.json({ error: e.message, code: "ITEM_UNAVAILABLE" }, { status: 409 });
    console.error("POST /api/checkout/quote failed:", e);
    return NextResponse.json({ error: "Could not price the cart" }, { status: 500 });
  }
}
