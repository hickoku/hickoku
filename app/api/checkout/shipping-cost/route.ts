import { NextRequest, NextResponse } from "next/server";
import { getDelhiveryShippingCost } from "@/lib/services/delhiveryService";

export async function POST(request: NextRequest) {
  try {
    const { pincode, weight = 500 } = await request.json();

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ error: "Valid 6-digit pincode required" }, { status: 400 });
    }

    console.log(`[Shipping Cost API] Request: pincode=${pincode}, weight=${weight}`);
    const shippingCost = await getDelhiveryShippingCost(pincode, weight);
    console.log(`[Shipping Cost API] Result for ${pincode}: ${shippingCost}`);

    return NextResponse.json({ 
      success: true, 
      shippingCost,
      mode: "Surface"
    });
  } catch (error: any) {
    console.error("[Shipping Cost API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
