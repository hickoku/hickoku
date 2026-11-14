import { NextRequest, NextResponse } from "next/server";
import { orderRepository, OrderItem, ShippingAddress } from "@/lib/repositories/orderRepository";
import { getTrackingContext } from "@/lib/tracking/requestContext";
import { getProductWithVariant } from "@/app/repositories/products.repository";
import { getOffers } from "@/lib/offers/repository";
import { priceProduct, priceCart, type AppliedOffer } from "@/lib/offers/engine";

const GST_RATE = 18; // prices are GST-inclusive

class PriceError extends Error {}

/**
 * Re-prices the order on the server from the product tables and the live offers, so the
 * amount charged never comes from the browser. Returns the trusted items and totals.
 */
async function priceOrder(items: OrderItem[]) {
    const offers = await getOffers({ fresh: true });
    const products = new Map<string, Awaited<ReturnType<typeof getProductWithVariant>>>();
    const priced: OrderItem[] = [];
    const productOffers = new Map<string, AppliedOffer>();
    for (const item of items) {
        const qty = Math.floor(Number(item.quantity));
        if (!Number.isFinite(qty) || qty < 1 || qty > 10) throw new PriceError(`Invalid quantity for ${item.sku}`);
        const pid = String(item.productId);
        if (!products.has(pid)) products.set(pid, await getProductWithVariant(pid));
        const product = products.get(pid);
        const variant = product?.variants.find((v) => v.sku === item.sku) || product?.variants.find((v) => String(v.id) === String(item.variantId));
        if (!product || !variant || product.hidden || variant.status === false) throw new PriceError(`${item.productName || item.sku} is no longer available`);
        const p = priceProduct(Number(variant.price), pid, offers);
        for (const a of p.applied) {
            const prev = productOffers.get(a.id);
            productOffers.set(a.id, { id: a.id, name: a.name, amount: Math.round(((prev?.amount || 0) + a.amount * qty) * 100) / 100 });
        }
        priced.push({ ...item, sku: variant.sku, variantId: String(variant.id), quantity: qty, price: p.price, total: Math.round(p.price * qty * 100) / 100 });
    }
    const cart = priceCart(priced.map((i) => ({ productId: String(i.productId), price: i.price, quantity: i.quantity })), offers);
    const tax = Number((cart.total - cart.total / (1 + GST_RATE / 100)).toFixed(2));
    return {
        items: priced,
        subtotal: cart.subtotal,
        cartDiscount: cart.discount,
        total: cart.total,
        tax,
        appliedOffers: [...productOffers.values(), ...cart.applied.map((a) => ({ ...a, level: "cart" as const }))],
    };
}

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
            pricing = await priceOrder(body.items);
        } catch (e) {
            if (e instanceof PriceError) return NextResponse.json({ error: e.message, code: "ITEM_UNAVAILABLE" }, { status: 409 });
            throw e;
        }
        if (Math.abs(pricing.total - Number(body.total)) > 0.5) {
            console.warn("Order total mismatch", { client: body.total, server: pricing.total });
            return NextResponse.json(
                { error: "Prices or offers have changed. Please review your cart total and try again.", code: "PRICE_CHANGED", total: pricing.total },
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
            tax: pricing.tax,
            shippingCost: Math.max(0, Number(body.shippingCost) || 0), // shown as FREE; not added to the total
            total: pricing.total,
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
            amount: pricing.total,
            currency: "INR",
            receipt: orderId,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(pricing.total * 100), // server-computed total, rupees → paise
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
            amount: pricing.total,
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
