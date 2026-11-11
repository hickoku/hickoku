import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        const order = await orderRepository.getOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Internal attribution data (IP, cookies) is not needed by the browser
        const { tracking, purchaseTrackedAt, ...publicOrder } = order;

        return NextResponse.json({
            success: true,
            order: publicOrder,
        });
    } catch (error: any) {
        console.error("Error fetching order:", error);
        return NextResponse.json(
            { error: "Failed to fetch order", details: error.message },
            { status: 500 }
        );
    }
}
