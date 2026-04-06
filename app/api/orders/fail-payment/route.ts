import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";
import * as React from 'react';
import { render } from '@react-email/render';
import { sendHtmlEmail } from '@/lib/services/emailService';
import PaymentFailureEmail from '@/app/emails/PaymentFailureEmail';

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Mark payment as failed locally without razorpay credentials because user dismissed
        await orderRepository.updatePaymentDetails(orderId, {
            razorpayPaymentId: "cancelled_by_user",
            razorpaySignature: "cancelled_by_user",
            paymentStatus: "failed",
            status: "failed",
        });

        const order = await orderRepository.getOrder(orderId);

        if (order && order.customerEmail) {
            // Do not await this block so the UI can proceed instantly
            Promise.resolve().then(async () => {
                try {
                    const htmlMessage = await render(
                        React.createElement(PaymentFailureEmail, {
                            customerFirstName: order.customerFirstName,
                            checkoutUrl: `${process.env.APP_URL || 'http://localhost:3000'}/checkout`
                        })
                    );
                    await sendHtmlEmail(
                        order.customerEmail,
                        `Payment Unsuccessful - Action Required for Order ${order.orderNumber}`,
                        htmlMessage
                    );
                    console.log(`Dispatched checkout-dismissal Payment Failure email to ${order.customerEmail}`);
                } catch (emailError) {
                    console.error("Failed to send payment failure email:", emailError);
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error failing payment explicitly:", error);
        return NextResponse.json(
            { error: "Failed to explicitly fail payment", details: error.message },
            { status: 500 }
        );
    }
}
