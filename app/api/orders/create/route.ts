import { NextRequest, NextResponse } from "next/server";
import { orderRepository, OrderItem, ShippingAddress } from "@/lib/repositories/orderRepository";

// Use dynamic require for Razorpay to avoid TypeScript issues
const Razorpay = require("razorpay");

interface CreateOrderRequest {
    customerEmail: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    subtotal: number;
    surpriseDiscount?: number;
    tax: number;
    shippingCost: number;
    total: number;
}

export async function POST(request: NextRequest) {
    try {
        // Debug: Check environment variables
        console.log("=== Environment Variables Check ===");
        console.log("NEXT_PUBLIC_RAZORPAY_KEY_ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
        console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET);
        console.log("RAZORPAY_KEY_SECRET length:", process.env.RAZORPAY_KEY_SECRET?.length);

        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("❌ Razorpay credentials missing!");
            return NextResponse.json(
                { error: "Razorpay credentials not configured" },
                { status: 500 }
            );
        }

        // Initialize Razorpay inside the function to ensure env vars are loaded
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const body: CreateOrderRequest = await request.json();

        // Validate required fields
        if (!body.customerEmail || !body.customerFirstName || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate order ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9).toUpperCase();
        const orderId = `ORD-${timestamp}-${random}`;

        // Generate order number (sequential, you might want to use a counter in production)
        const orderNumber = `HK-${timestamp.toString().slice(-6)}`;

        // Create order in DynamoDB
        const order = await orderRepository.createOrder({
            orderId,
            orderNumber,
            customerEmail: body.customerEmail,
            customerFirstName: body.customerFirstName,
            customerLastName: body.customerLastName,
            customerPhone: body.customerPhone,

            // User tracking (for conversion analytics)
            userId: undefined, // Guest checkout - no userId yet
            placedAsGuest: true, // Mark as guest order for conversion tracking
            linkedAt: undefined, // Will be set when/if user registers

            shippingAddress: body.shippingAddress,
            items: body.items,
            subtotal: body.subtotal,
            surpriseDiscount: body.surpriseDiscount,
            tax: body.tax,
            shippingCost: body.shippingCost,
            total: body.total,
            paymentStatus: "pending",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Create Razorpay order
        console.log("=== Creating Razorpay Order ===");
        console.log("Key ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
        console.log("Key Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);
        console.log("Order details:", {
            amount: body.total,
            currency: "INR",
            receipt: orderId,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(body.total * 100), // convert rupees to paise for Razorpay API
            currency: "INR",
            receipt: orderId,
            notes: {
                orderId,
                customerEmail: body.customerEmail,
                customerName: `${body.customerFirstName} ${body.customerLastName}`,
            },
        });

        console.log("Razorpay order created successfully:", razorpayOrder.id);

        // Update order with Razorpay order ID
        await orderRepository.updateRazorpayOrderId(orderId, razorpayOrder.id);

        return NextResponse.json({
            success: true,
            orderId,
            orderNumber,
            razorpayOrderId: razorpayOrder.id,
            amount: body.total,
            currency: "INR",
        });
    } catch (error: any) {
        console.error("Error creating order:", error);
        console.error("Error details:", {
            message: error.message,
            description: error.description,
            statusCode: error.statusCode,
            error: error.error,
        });
        return NextResponse.json(
            {
                error: "Failed to create order",
                details: error.message,
                razorpayError: error.description || error.error?.description
            },
            { status: 500 }
        );
    }
}
