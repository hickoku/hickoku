import { NextRequest, NextResponse } from "next/server";
import { ClubError, submitApplication } from "@/lib/club/applications";

// Hickoku Club application (form + delivery address). Saves the application only: no
// order, no payment, no stock change. The admin reviews it and the ₹0 gift order is
// created on approval.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const app = await submitApplication(body, { ip, userAgent: request.headers.get("user-agent")?.slice(0, 300) || undefined });
    return NextResponse.json({ success: true, id: app.id, statusToken: app.statusToken, instagram: app.instagram });
  } catch (e: any) {
    if (e instanceof ClubError) return NextResponse.json({ success: false, error: e.message, field: e.field }, { status: e.status });
    console.error("Club application error:", e);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
