import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/repositories/orderRepository";
import { createDelhiveryOrder } from "@/lib/services/delhiveryService";

export async function POST(request: NextRequest) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await orderRepository.getOrder(orderId);

        if (order) {
            const apiResponse = await createDelhiveryOrder(order);
            return NextResponse.json({
                success: true,
                message: "Delhivery sync finished",
                delhiveryData: apiResponse
            });
        }

        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    } catch (error: any) {
        console.error("Error dispatching async delhivery manifest:", error);
        return NextResponse.json(
            { error: "Failed to dispatch delhivery sync", details: error.message },
            { status: 500 }
        );
    }
}
