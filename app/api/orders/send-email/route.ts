import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";
import * as React from 'react';
import { render } from '@react-email/render';
import { sendHtmlEmail } from '@/lib/services/emailService';
import { OrderConfirmationEmail } from '@/app/emails/OrderConfirmationEmail';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await orderRepository.getOrder(orderId);

        if (order && order.customerEmail) {
            const htmlMessage = await render(
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

            await sendHtmlEmail(
                order.customerEmail,
                `Order Confirmed! #${order.orderNumber}`,
                htmlMessage
            );

            console.log(`Dispatched detached Order Confirmation to ${order.customerEmail}`);
            return NextResponse.json({ success: true, message: "Email dispatched successfully" });
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
