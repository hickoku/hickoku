import { NextRequest, NextResponse } from "next/server";
import { findByPhoneAndDate, STATUS_COOKIE } from "@/lib/club/status";

// "Check your application": WhatsApp number + occasion date → the private status link.
// Remembered in a cookie so the same phone opens the status straight away next time.
export async function POST(request: NextRequest) {
  try {
    const { phone, date } = await request.json();
    const app = await findByPhoneAndDate(phone, date);
    if (!app) {
      return NextResponse.json(
        { success: false, error: "We couldn't find an application with that number and date. Use the WhatsApp number you applied with and the occasion date." },
        { status: 404 },
      );
    }
    const t = app.statusToken;
    const res = NextResponse.json({ success: true, token: t });
    res.cookies.set(STATUS_COOKIE, t, { path: "/club", maxAge: 60 * 60 * 24 * 120, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
    return res;
  } catch (e) {
    console.error("Club status lookup error:", e);
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
