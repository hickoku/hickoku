import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";
import * as React from 'react';
import { render } from '@react-email/render';
import { sendHtmlEmail } from '@/lib/services/emailService';
import { OrderConfirmationEmail } from '@/app/emails/OrderConfirmationEmail';
import { AdminOrderNotification } from '@/app/emails/AdminOrderNotification';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await orderRepository.getOrder(orderId);

        if (order && order.customerEmail) {
            // 1. Customer Confirmation Email
            const customerHtml = await render(
                React.createElement(OrderConfirmationEmail, {
                    orderNumber: order.orderNumber,
                    customerFirstName: order.customerFirstName,
                    items: order.items || [],
                    subtotal: order.subtotal,
                    surpriseDiscount: order.surpriseDiscount || 0,
                    shippingCost: order.shippingCost,
                    tax: order.tax,
                    total: order.total,
                    trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-tracking/${order.orderId}`
                })
            );

            // 2. Admin Order Notification Email
            const adminHtml = await render(
                React.createElement(AdminOrderNotification, {
                    orderNumber: order.orderNumber,
                    orderId: order.orderId,
                    customerFirstName: order.customerFirstName,
                    customerLastName: order.customerLastName,
                    customerEmail: order.customerEmail,
                    customerPhone: order.customerPhone,
                    shippingAddress: order.shippingAddress,
                    items: order.items || [],
                    subtotal: order.subtotal,
                    surpriseDiscount: order.surpriseDiscount || 0,
                    tax: order.tax,
                    shippingCost: order.shippingCost,
                    total: order.total,
                    paymentId: (order as any).razorpayPaymentId || "",
                    razorpayOrderId: order.razorpayOrderId || "",
                    orderDate: order.createdAt,
                })
            );

            // Send both emails in parallel
            await Promise.all([
                sendHtmlEmail(
                    order.customerEmail,
                    `Order Confirmed! #${order.orderNumber}`,
                    customerHtml
                ),
                sendHtmlEmail(
                    "support@hickoku.com",
                    `🚨 New Order #${order.orderNumber} — ${order.customerFirstName} ${order.customerLastName}`,
                    adminHtml
                ),
            ]);

            console.log(`Dispatched Customer + Admin emails for Order ${order.orderNumber}`);
            return NextResponse.json({ success: true, message: "Emails dispatched successfully" });
        }

        return NextResponse.json({ success: false, error: "Order or email not found" }, { status: 404 });
    } catch (error: any) {
        console.error("Error dispatching async confirmation email:", error);
        return NextResponse.json(
            { error: "Failed to dispatch email", details: error.message },
            { status: 500 }
        );
    }
}

