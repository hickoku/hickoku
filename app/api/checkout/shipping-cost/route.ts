import { NextRequest, NextResponse } from "next/server";
import { deliveryFeeFor, GRAMS_PER_BOTTLE } from "@/lib/shipping";

export async function POST(request: NextRequest) {
  try {
    const { pincode, weight = 500 } = await request.json();

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
    }

    console.log(`[Shipping Cost API] Request: pincode=${pincode}, weight=${weight}`);
    // Same fee the order will be charged (Delhivery rate, else ₹50)
    const { fee: shippingCost, charged } = await deliveryFeeFor(pincode, Math.round(Number(weight) / GRAMS_PER_BOTTLE) || 1);
    console.log(`[Shipping Cost API] Result for ${pincode}: ${shippingCost}`);

    return NextResponse.json({ 
      success: true, 
      shippingCost,
      charged,
      mode: "Surface"
    });
  } catch (error: any) {
    console.error("[Shipping Cost API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
