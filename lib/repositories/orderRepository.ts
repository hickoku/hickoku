import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_ORDERS_TABLE || "orders";



export interface OrderItem {
    sku: string;
    productId: string;
    variantId: string; // Added to support tracking specific variants
    productName: string;
    size: string;
    quantity: number;
    price: number; // in paise
    image: string;
    total: number; // price * quantity
}

export interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface Order {
    PK: string; // ORDER#{orderId}
    SK: string; // METADATA
    orderId: string;
    orderNumber: string; // HK-001, HK-002, etc.

    // Payment Info
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paymentStatus: "pending" | "paid" | "failed";
    paymentMethod?: string; // card, upi, netbanking, wallet

    // Customer Info
    customerEmail: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;

    // User Tracking (for guest-to-customer conversion analytics)
    userId?: string; // undefined/null = guest order, set = registered user order
    placedAsGuest?: boolean; // Was this order originally placed as a guest?
    linkedAt?: string; // ISO timestamp when guest order was linked to user account

    // Shipping
    shippingAddress: ShippingAddress;

    // Items
    items: OrderItem[];

    // Pricing
    subtotal: number; // in paise
    surpriseDiscount?: number; // in paise
    tax: number; // in paise
    shippingCost: number; // in paise
    total: number; // in paise

    // Status
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

    // Timestamps
    createdAt: string;
    paidAt?: string;
    confirmedAt?: string;
    awb?: string;
    refundId?: string;
    refundStatus?: string;
    updatedAt: string;
}

export class OrderRepository {
    /**
     * Create a new order
     */
    async createOrder(orderData: Omit<Order, "PK" | "SK">): Promise<Order> {
        const order: Order = {
            PK: `ORDER#${orderData.orderId}`,
            SK: "METADATA",
            ...orderData,
        };

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: order,
            })
        );

        return order;
    }

    /**
     * Get order by ID
     */
    async getOrder(orderId: string): Promise<Order | null> {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
            })
        );

        return (result.Item as Order) || null;
    }

    /**
     * Update order payment details
     */
    async updatePaymentDetails(
        orderId: string,
        paymentDetails: {
            razorpayPaymentId: string;
            razorpaySignature: string;
            paymentStatus: "paid" | "failed";
            paymentMethod?: string;
            status: "confirmed" | "failed";
            paidAt?: string;
            confirmedAt?: string;
        }
    ): Promise<void> {
        const updateExpression = [
            "razorpayPaymentId = :paymentId",
            "razorpaySignature = :signature",
            "paymentStatus = :paymentStatus",
            "#status = :status",
            "updatedAt = :updatedAt",
        ];

        const expressionAttributeValues: Record<string, any> = {
            ":paymentId": paymentDetails.razorpayPaymentId,
            ":signature": paymentDetails.razorpaySignature,
            ":paymentStatus": paymentDetails.paymentStatus,
            ":status": paymentDetails.status,
            ":updatedAt": new Date().toISOString(),
        };

        if (paymentDetails.paymentMethod) {
            updateExpression.push("paymentMethod = :paymentMethod");
            expressionAttributeValues[":paymentMethod"] = paymentDetails.paymentMethod;
        }

        if (paymentDetails.paidAt) {
            updateExpression.push("paidAt = :paidAt");
            expressionAttributeValues[":paidAt"] = paymentDetails.paidAt;
        }

        if (paymentDetails.confirmedAt) {
            updateExpression.push("confirmedAt = :confirmedAt");
            expressionAttributeValues[":confirmedAt"] = paymentDetails.confirmedAt;
        }

        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
                UpdateExpression: `SET ${updateExpression.join(", ")}`,
                ExpressionAttributeNames: {
                    "#status": "status",
                },
                ExpressionAttributeValues: expressionAttributeValues,
            })
        );
    }

    /**
     * Update Razorpay order ID
     */
    async updateRazorpayOrderId(
        orderId: string,
        razorpayOrderId: string
    ): Promise<void> {
        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
                UpdateExpression: "SET razorpayOrderId = :razorpayOrderId, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":razorpayOrderId": razorpayOrderId,
                    ":updatedAt": new Date().toISOString(),
                },
            })
        );
    }

    /**
     * Update order status
     */
    async updateOrderStatus(
        orderId: string,
        status: Order["status"]
    ): Promise<void> {
        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
                UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
                ExpressionAttributeNames: {
                    "#status": "status",
                },
                ExpressionAttributeValues: {
                    ":status": status,
                    ":updatedAt": new Date().toISOString(),
                },
            })
        );
    }

    /**
     * Update Delhivery shipment details (AWB)
     */
    async updateDelhiveryDetails(
        orderId: string,
        awb: string
    ): Promise<void> {
        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
                UpdateExpression: "SET awb = :awb, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":awb": awb,
                    ":updatedAt": new Date().toISOString(),
                },
            })
        );
    }

    /**
     * Update refund details
     */
    async updateRefundDetails(
        orderId: string,
        refundId: string,
        refundStatus: string
    ): Promise<void> {
        await docClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    PK: `ORDER#${orderId}`,
                    SK: "METADATA",
                },
                UpdateExpression: "SET refundId = :refundId, refundStatus = :refundStatus, updatedAt = :updatedAt",
                ExpressionAttributeValues: {
                    ":refundId": refundId,
                    ":refundStatus": refundStatus,
                    ":updatedAt": new Date().toISOString(),
                },
            })
        );
    }

    /**
     * Get orders by customer email (for order history)
     */
    async getOrdersByEmail(email: string): Promise<Order[]> {
        // Note: This requires a GSI on customerEmail
        // For now, we'll implement this later when we add the GSI
        throw new Error("Not implemented yet - requires GSI");
    }
}

export const orderRepository = new OrderRepository();
