import { DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { calculateTTL } from '../lib/session';
import { getProductWithVariant } from './products.repository';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

const docClient = DynamoDBDocumentClient.from(client);

export interface CartItem {
    sku: string;
    productId: string;
    variantId: string; // Added
    productName: string;
    size: string;
    price: number;
    quantity: number;
    image: string;
    addedAt: string;
}

export interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    sessionId: string;
}

/**
 * Get all cart items for a session
 */
export async function getCart(sessionId: string): Promise<Cart> {
    try {
        const queryCommand = new QueryCommand({
            TableName: 'cart', // Ensure this matches .env or standard name
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: {
                ':pk': `CART#${sessionId}`,
            },
        });

        const response = await docClient.send(queryCommand);
        const items: CartItem[] = (response.Items || []).map((item) => ({
            sku: item.sku,
            productId: item.productId,
            variantId: item.variantId || `${item.productId}01`, // Fallback for legacy items
            productName: item.productName,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            addedAt: item.addedAt,
        }));

        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        return {
            items,
            totalItems,
            totalPrice,
            sessionId,
        };
    } catch (error) {
        console.error('Error fetching cart:', error);
        throw new Error('Failed to fetch cart');
    }
}

/**
 * Add item to cart or update quantity if already exists
 */
export async function addToCart(
    sessionId: string,
    item: {
        sku: string;
        productId: string;
        variantId: string;
        productName: string;
        size: string;
        price: number;
        quantity: number;
        image: string;
    }
): Promise<Cart> {
    try {
        // Validate quantity
        if (item.quantity < 1 || item.quantity > 10) {
            throw new Error('Quantity must be between 1 and 10');
        }

        // Validate product exists and get current price
        const product = await getProductWithVariant(item.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Find the specific variant
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
            throw new Error('Variant not found');
        }

        // Check stock
        if (variant.inventoryStatus !== 'IN_STOCK' && variant.inventoryStatus !== 'in_stock') {
            // Handle both cases because migration uses IN_STOCK (from string?) or boolean?
            // My migration script used IN_STOCK. Old code used in_stock.
            // Let's accept both for robustness.
            // Actually, `ProductVariant` interface says `inventoryStatus: string`.
            throw new Error('Product is out of stock');
        }

        // Get existing cart to check current quantity
        const currentCart = await getCart(sessionId);
        // Identify item by SKU (assuming SKU is unique per variant) OR by VariantID
        // Architecture doc says "cart/orders will always reference variantId".
        // But `CartItem` uses SKU as SK in DynamoDB `ITEM#${sku}`.
        // So we stick to SKU for uniqueness in Cart?
        // Yes, SKU should be unique.
        const existingItem = currentCart.items.find((i) => i.sku === item.sku);
        const newQuantity = existingItem ? existingItem.quantity + item.quantity : item.quantity;

        // Validate total quantity doesn't exceed stock
        if (newQuantity > variant.stock) {
            throw new Error(`Only ${variant.stock} items available in stock`);
        }

        // Validate total quantity doesn't exceed max per item
        if (newQuantity > 10) {
            throw new Error('Maximum 10 items per product');
        }

        // Use current product price (not the price from request), applying the global 50% discount
        const currentPrice = variant.price * 0.5;

        const putCommand = new PutCommand({
            TableName: 'cart',
            Item: {
                PK: `CART#${sessionId}`,
                SK: `ITEM#${item.sku}`,
                sku: item.sku,
                productId: item.productId,
                variantId: item.variantId,
                productName: item.productName,
                size: item.size,
                price: currentPrice,
                quantity: newQuantity,
                image: item.image,
                addedAt: existingItem ? existingItem.addedAt : new Date().toISOString(),
                expiresAt: calculateTTL(),
            },
        });

        await docClient.send(putCommand);

        // Return updated cart
        return await getCart(sessionId);
    } catch (error: any) {
        console.error('Error adding to cart:', error);
        throw error;
    }
}

/**
 * Update item quantity in cart
 */
/**
 * Update item quantity in cart
 */
export async function updateQuantity(
    sessionId: string,
    sku: string,
    quantity: number
): Promise<Cart> {
    try {
        // Validate quantity
        if (quantity < 1 || quantity > 10) {
            throw new Error('Quantity must be between 1 and 10');
        }

        // Get current cart item
        const cart = await getCart(sessionId);
        const item = cart.items.find((i) => i.sku === sku);

        if (!item) {
            throw new Error('Item not found in cart');
        }

        // Validate stock
        const product = await getProductWithVariant(item.productId);
        if (!product) {
            throw new Error('Product not found');
        }

        // Find the specific variant
        // Fallback to searching by SKU if variantId is missing (legacy items)
        const variant = product.variants.find(v => v.id === item.variantId) ||
            product.variants.find(v => v.sku === sku);

        if (!variant) {
            throw new Error('Variant not found');
        }

        if (quantity > variant.stock) {
            throw new Error(`Only ${variant.stock} items available in stock`);
        }

        const putCommand = new PutCommand({
            TableName: 'cart',
            Item: {
                PK: `CART#${sessionId}`,
                SK: `ITEM#${sku}`,
                sku: item.sku,
                productId: item.productId,
                variantId: item.variantId || variant.id, // Update if missing
                productName: item.productName,
                size: item.size,
                price: item.price,
                quantity: quantity,
                image: item.image,
                addedAt: item.addedAt,
                expiresAt: calculateTTL(),
            },
        });

        await docClient.send(putCommand);

        return await getCart(sessionId);
    } catch (error: any) {
        console.error('Error updating quantity:', error);
        throw error;
    }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(sessionId: string, sku: string): Promise<Cart> {
    try {
        const deleteCommand = new DeleteCommand({
            TableName: 'cart',
            Key: {
                PK: `CART#${sessionId}`,
                SK: `ITEM#${sku}`,
            },
        });

        await docClient.send(deleteCommand);

        return await getCart(sessionId);
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw new Error('Failed to remove item from cart');
    }
}

/**
 * Clear all items from cart
 */
export async function clearCart(sessionId: string): Promise<void> {
    try {
        const cart = await getCart(sessionId);

        if (cart.items.length === 0) {
            return;
        }

        // Batch delete all items
        const deleteRequests = cart.items.map((item) => ({
            DeleteRequest: {
                Key: {
                    PK: `CART#${sessionId}`,
                    SK: `ITEM#${item.sku}`,
                },
            },
        }));

        // DynamoDB batch write supports max 25 items at a time
        for (let i = 0; i < deleteRequests.length; i += 25) {
            const batch = deleteRequests.slice(i, i + 25);
            const batchCommand = new BatchWriteCommand({
                RequestItems: {
                    cart: batch,
                },
            });
            await docClient.send(batchCommand);
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw new Error('Failed to clear cart');
    }
}
