import { NextRequest, NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/services/delhiveryService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  if (!pincode) {
    return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
  }

  try {
    const isServiceable = await checkPincodeServiceability(pincode);
    return NextResponse.json({ serviceable: isServiceable });
  } catch (error) {
    console.error("Pincode API Error:", error);
    return NextResponse.json({ serviceable: true }); // Fallback
  }
}
