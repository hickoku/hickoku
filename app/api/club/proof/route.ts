import { NextRequest, NextResponse } from "next/server";
import { ClubError } from "@/lib/club/applications";
import { submitProof } from "@/lib/club/status";

// The applicant's Reel link + Story screenshot, sent from their status page.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await submitProof(String(body?.token || ""), body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e instanceof ClubError) return NextResponse.json({ success: false, error: e.message, field: e.field }, { status: e.status });
    console.error("Club proof error:", e);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
