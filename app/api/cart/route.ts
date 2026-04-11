import { NextResponse } from 'next/server';
import { getOrCreateSessionId, getSessionId } from '../../lib/session';
import { getCart, addToCart, clearCart } from '../../repositories/cart.repository';

/**
 * GET /api/cart
 * Get current cart for session
 */
export async function GET() {
    try {
        const sessionId = await getSessionId();

        if (!sessionId) {
            // No session yet, return empty cart
            return NextResponse.json({
                items: [],
                totalItems: 0,
                totalPrice: 0,
                sessionId: null,
            });
        }

        const cart = await getCart(sessionId);

        return NextResponse.json(cart);
    } catch (error: any) {
        console.error('GET /api/cart error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cart', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cart
 * Add item to cart
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sku, productId, variantId, productName, size, price, quantity, image, slug } = body;

        // Validate required fields
        if (!sku || !productId || !variantId || !productName || !size || !price || !quantity || !image || !slug) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate quantity
        if (typeof quantity !== 'number' || quantity < 1 || quantity > 10) {
            return NextResponse.json(
                { error: 'Quantity must be between 1 and 10' },
                { status: 400 }
            );
        }

        // Get or create session
        const sessionId = await getOrCreateSessionId();

        // Add to cart
        const cart = await addToCart(sessionId, {
            sku,
            productId,
            variantId,
            productName,
            size,
            price,
            quantity,
            image,
            slug,
        });

        return NextResponse.json({
            success: true,
            cart,
        });
    } catch (error: any) {
        console.error('POST /api/cart error:', error);

        // Handle specific errors
        if (error.message.includes('out of stock')) {
            return NextResponse.json(
                { error: error.message },
                { status: 409 }
            );
        }

        if (error.message.includes('not found')) {
            return NextResponse.json(
                { error: error.message },
                { status: 404 }
            );
        }

        if (error.message.includes('Quantity') || error.message.includes('Maximum')) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add to cart', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export async function DELETE() {
    try {
        const sessionId = await getSessionId();

        if (!sessionId) {
            return NextResponse.json({
                success: true,
                message: 'No cart to clear',
            });
        }

        await clearCart(sessionId);

        return NextResponse.json({
            success: true,
            message: 'Cart cleared',
        });
    } catch (error: any) {
        console.error('DELETE /api/cart error:', error);
        return NextResponse.json(
            { error: 'Failed to clear cart', message: error.message },
            { status: 500 }
        );
    }
}
