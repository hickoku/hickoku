import { NextRequest, NextResponse } from "next/server";
import { orderRepository, OrderItem, ShippingAddress } from "@/lib/repositories/orderRepository";
import { getTrackingContext } from "@/lib/tracking/requestContext";
import { priceOrder, PriceError } from "@/lib/offers/pricing";
import { deliveryFeeFor } from "@/lib/shipping";

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
    codes?: string[]; // discount codes entered at checkout
}

export async function POST(request: NextRequest) {
    try {
        // Debug: Check environment variables
        const isProd = process.env.APP_ENV === "prod";
        const MUX_RAZORPAY_KEY_ID = isProd ? process.env.RAZORPAY_KEY_ID_PROD : process.env.RAZORPAY_KEY_ID_STAGE;
        const MUX_RAZORPAY_KEY_SECRET = isProd ? process.env.RAZORPAY_KEY_SECRET_PROD : process.env.RAZORPAY_KEY_SECRET_STAGE;

        // Debug: Check environment variables
        console.log("=== Environment Variables Check ===");
        console.log("APP_ENV:", process.env.APP_ENV);
        console.log("MUX_RAZORPAY_KEY_ID:", MUX_RAZORPAY_KEY_ID);
        console.log("MUX_RAZORPAY_KEY_SECRET exists:", !!MUX_RAZORPAY_KEY_SECRET);

        if (!MUX_RAZORPAY_KEY_ID || !MUX_RAZORPAY_KEY_SECRET) {
            console.error("❌ Razorpay credentials missing!");
            return NextResponse.json(
                { error: "Razorpay credentials not configured" },
                { status: 500 }
            );
        }

        // Initialize Razorpay inside the function to ensure env vars are loaded
        const razorpay = new Razorpay({
            key_id: MUX_RAZORPAY_KEY_ID,
            key_secret: MUX_RAZORPAY_KEY_SECRET,
        });

        const body: CreateOrderRequest = await request.json();

        // Validate required fields
        if (!body.customerEmail || !body.customerFirstName || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Work out the price on the server. If it differs from what the shopper saw (an offer
        // started/ended or a price changed), stop and ask them to review the new total.
        let pricing: Awaited<ReturnType<typeof priceOrder>>;
        try {
            pricing = await priceOrder(body.items, body.codes, { email: body.customerEmail, phone: body.customerPhone });
        } catch (e) {
            if (e instanceof PriceError) return NextResponse.json({ error: e.message, code: "ITEM_UNAVAILABLE" }, { status: 409 });
            throw e;
        }
        // A code that no longer works (expired, used up, already used by this customer) is an
        // error the shopper can fix, so say which one rather than just "total changed".
        const badCode = pricing.codes.find((c) => !c.ok);
        if (badCode) {
            return NextResponse.json({ error: `${badCode.code}: ${badCode.message}`, code: "CODE_INVALID", codes: pricing.codes, total: pricing.total }, { status: 409 });
        }
        // Delivery: always worked out here, never taken from the browser. Added to the total only
        // when "Charge shipping" is on in the admin panel and no free-delivery offer applies;
        // otherwise it is shown struck out as FREE.
        const delivery = await deliveryFeeFor(
            body.shippingAddress?.zipCode,
            pricing.items.filter((i) => !i.gift).reduce((n, i) => n + i.quantity, 0),
            { fresh: true },
        );
        const shippingCharged = delivery.charged && !pricing.freeShipping ? delivery.fee : 0;
        const grandTotal = Math.round((pricing.total + shippingCharged) * 100) / 100;

        if (grandTotal < 1) {
            // Razorpay can't take a ₹0 payment.
            return NextResponse.json({ error: "Your discounts cover the whole order. Please add another item to check out.", code: "TOTAL_TOO_LOW", total: grandTotal }, { status: 409 });
        }
        if (Math.abs(grandTotal - Number(body.total)) > 0.5) {
            console.warn("Order total mismatch", { client: body.total, server: grandTotal });
            return NextResponse.json(
                {
                    error: "Prices, offers or the delivery fee have changed. Please review your total and try again.",
                    code: "PRICE_CHANGED",
                    total: grandTotal,
                    delivery, // { fee, charged } so the checkout can update
                },
                { status: 409 },
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
            items: pricing.items,
            subtotal: pricing.subtotal,
            surpriseDiscount: pricing.cartDiscount, // total of cart-level offers
            appliedOffers: pricing.appliedOffers,
            couponCodes: pricing.codes.filter((c) => c.ok).map((c) => c.code),
            freeShipping: pricing.freeShipping,
            tax: pricing.tax,
            shippingCost: delivery.fee, // server-computed
            shippingCharged: shippingCharged > 0, // true = included in total; false = shown as FREE
            total: grandTotal,
            paymentStatus: "pending",
            status: "pending",
            tracking: getTrackingContext(request),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Create Razorpay order
        console.log("=== Creating Razorpay Order ===");
        console.log("Key ID:", isProd ? "PROD" : "STAGE");
        console.log("Key Secret exists:", true);
        console.log("Order details:", {
            amount: grandTotal,
            currency: "INR",
            receipt: orderId,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(grandTotal * 100), // server-computed total, rupees → paise
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
            amount: grandTotal,
            currency: "INR",
            keyId: MUX_RAZORPAY_KEY_ID,
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
