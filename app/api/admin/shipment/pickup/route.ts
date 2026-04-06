import { NextRequest, NextResponse } from "next/server";
import { createDelhiveryPickup } from "@/lib/services/delhiveryService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const orderId = searchParams.get("orderId");

  const SECRET = process.env.ADMIN_ACTION_TOKEN || "secret";

  if (token !== SECRET) {
    return new NextResponse("<h1>Unauthorized</h1><p>Invalid action token.</p>", {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const result = await createDelhiveryPickup();
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #16a34a;">✅ Pickup Initiated</h1>
          <p>Delhivery pickup request created successfully for Order: <strong>${orderId || 'N/A'}</strong></p>
          <pre style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: left;">${JSON.stringify(result, null, 2)}</pre>
          <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Close Window</button>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    return new NextResponse(`
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #dc2626;">❌ Pickup Failed</h1>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
