import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { render } from "@react-email/render";
import { sendHtmlEmail } from "@/lib/services/emailService";
import PaymentFailureEmail from "@/app/emails/PaymentFailureEmail";
import React from "react";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  try {
    const order = await orderRepository.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const htmlMessage = await render(
      React.createElement(PaymentFailureEmail, {
        customerFirstName: order.customerFirstName,
        checkoutUrl: `${process.env.APP_URL || "http://localhost:3000"}/checkout`,
      })
    );

    await sendHtmlEmail(
      order.customerEmail,
      `[TEST] Payment Unsuccessful - Action Required for Order ${order.orderNumber}`,
      htmlMessage
    );

    return NextResponse.json({ success: true, message: "Test failure email sent to " + order.customerEmail });
  } catch (error: any) {
    console.error("Debug Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
