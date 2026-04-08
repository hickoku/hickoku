import { NextRequest, NextResponse } from "next/server";
import { cancelDelhiveryShipment } from "@/lib/services/delhiveryService";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { issueRazorpayRefund } from "@/lib/services/razorpayService";
import { render } from "@react-email/render";
import { sendHtmlEmail } from "@/lib/services/emailService";
import OrderRefundEmail from "@/app/emails/OrderRefundEmail";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await orderRepository.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Validate Cancellation Window (2 PM / 1 PM rule)
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    
    let expiry = new Date(createdAt);
    if (createdAt.getHours() < 14) {
      expiry.setHours(14, 0, 0, 0);
    } else {
      expiry.setDate(expiry.getDate() + 1);
      expiry.setHours(13, 0, 0, 0);
    }

    if (now > expiry) {
      return NextResponse.json({ 
        error: "Cancellation window has closed. Please contact support." 
      }, { status: 400 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ 
        error: `Order cannot be cancelled as it is already ${order.status}.` 
      }, { status: 400 });
    }

    // 2. Cancel Delhivery Shipment (if AWB exists)
    const awb = order.awb || ((order as any).shipmentData?.packages?.[0]?.waybill);
    if (awb) {
      try {
        await cancelDelhiveryShipment(awb);
        console.log(`[User Cancel] Delhivery shipment ${awb} cancelled.`);
      } catch (err) {
        console.error(`[User Cancel] Delhivery cancellation failed for ${awb}:`, err);
        // We continue even if Delhivery fails, as the order must be cancelled in our DB
      }
    }

    // 3. Issue Razorpay Refund (if order was paid)
    if (order.paymentStatus === "paid" && order.razorpayPaymentId) {
      try {
        const refundResult = await issueRazorpayRefund(order.razorpayPaymentId);
        
        // Save refund details to DB
        await orderRepository.updateRefundDetails(
            orderId, 
            refundResult.id, 
            refundResult.status
        );

        // 4. Trigger Customer Refund Email
        const refundHtml = await render(
            React.createElement(OrderRefundEmail, {
                customerFirstName: order.customerFirstName,
                orderNumber: order.orderNumber,
                refundAmount: order.total,
            })
        );

        await sendHtmlEmail(
            order.customerEmail,
            `Cancellation Confirmed & Refund Initiated - Order #${order.orderNumber}`,
            refundHtml
        );
      } catch (err: any) {
        console.error("[User Cancel] Refund failed:", err);
        return NextResponse.json({ 
          error: "Order cancellation processing failed during refund. Please contact support.",
          details: err.message
        }, { status: 500 });
      }
    }

    // 5. Update Order status in DynamoDB
    await orderRepository.updateOrderStatus(orderId, "cancelled");

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled and refund initiated." 
    });

  } catch (error: any) {
    console.error("[User Cancel] Critical Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
