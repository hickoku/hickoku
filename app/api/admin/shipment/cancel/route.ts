import { NextRequest, NextResponse } from "next/server";
import { cancelDelhiveryShipment } from "@/lib/services/delhiveryService";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { issueRazorpayRefund } from "@/lib/services/razorpayService";
import { render } from "@react-email/render";
import { sendHtmlEmail } from "@/lib/services/emailService";
import OrderRefundEmail from "@/app/emails/OrderRefundEmail";
import React from "react";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const awb = searchParams.get("awb");
  const orderId = searchParams.get("orderId");

  const SECRET = process.env.ADMIN_ACTION_TOKEN || "secret";

  if (token !== SECRET) {
    return new NextResponse("<h1>Unauthorized</h1><p>Invalid action token.</p>", {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!orderId) {
    return new NextResponse("<h1>Error</h1><p>Order ID is required for cancellation.</p>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const order = await orderRepository.getOrder(orderId);
    if (!order) {
        return new NextResponse("<h1>Error</h1><p>Order not found.</p>", {
            status: 404,
            headers: { "Content-Type": "text/html" },
        });
    }

    let delhiveryResult = null;
    let delhiveryError = null;
    let refundResult = null;
    let refundError = null;

    // 1. Cancel Delhivery Shipment (if AWB exists)
    if (awb) {
      console.log(`[Admin Cancel] Triggering Delhivery cancellation for AWB: ${awb}`);
      try {
        delhiveryResult = await cancelDelhiveryShipment(awb);
        console.log(`[Admin Cancel] Delhivery response for ${awb}:`, JSON.stringify(delhiveryResult));
      } catch (err: any) {
        delhiveryError = err.message;
        console.error(`[Admin Cancel] Delhivery cancellation failed for ${awb}:`, err);
      }
    }

    // 2. Issue Razorpay Refund (if order was paid)
    if (order.paymentStatus === "paid" && order.razorpayPaymentId) {
      console.log(`[Admin Cancel] Triggering Razorpay refund for Payment ID: ${order.razorpayPaymentId}`);
      try {
        refundResult = await issueRazorpayRefund(order.razorpayPaymentId);
        console.log(`[Admin Cancel] Razorpay refund successful: ${refundResult.id}`);
        
        // Save refund details to DB
        await orderRepository.updateRefundDetails(
            orderId, 
            refundResult.id, 
            refundResult.status
        );

        // 3. Trigger Customer Refund Email
        const refundHtml = await render(
            React.createElement(OrderRefundEmail, {
                customerFirstName: order.customerFirstName,
                orderNumber: order.orderNumber,
                refundAmount: order.total,
            })
        );

        await sendHtmlEmail(
            order.customerEmail,
            `Refund Initiated - Order #${order.orderNumber}`,
            refundHtml
        );
      } catch (err: any) {
        refundError = err.message;
        console.error("Refund failed during cancellation:", err);
      }
    }

    // 4. Cancel Order in DynamoDB
    await orderRepository.updateOrderStatus(orderId, "cancelled");

    return new NextResponse(`
      <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #ea580c;">🛑 Order Cancelled & Refunded</h1>
          <p>Order <strong>${order.orderNumber}</strong> has been set to <strong>cancelled</strong>.</p>
          
          <div style="max-width: 600px; margin: 0 auto; text-align: left;">
            ${awb ? `
              <div style="margin-top: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
                <h3 style="margin-top: 0;">Logistics (AWB: ${awb})</h3>
                ${delhiveryError ? `<p style="color: #dc2626;">❌ Cancel Failed: ${delhiveryError}</p>` : `<p style="color: #16a34a;">✅ Cancelled Successfully</p>`}
              </div>
            ` : ''}

            <div style="margin-top: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff;">
              <h3 style="margin-top: 0;">Razorpay Refund</h3>
              ${order.paymentStatus !== "paid" ? '<p style="color: #64748b;">(Skipped - Order was not paid pre-paid)</p>' : 
                refundError ? `<p style="color: #dc2626;">❌ Refund Failed: ${refundError}</p>` : 
                `<p style="color: #16a34a;">✅ Refund Initiated: <strong>${refundResult?.id}</strong></p>`
              }
              <p style="font-size: 13px; color: #64748b; margin-top: 8px;">* Customer email notification sent automatically.</p>
            </div>
          </div>

          <div style="margin-top: 30px;">
            <button onclick="window.close()" style="padding: 12px 24px; cursor: pointer; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600;">Close Window</button>
          </div>
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
          <h1 style="color: #dc2626;">❌ Cancellation Failed</h1>
          <p>Database Error: ${error.message}</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" },
    });
  }
}
