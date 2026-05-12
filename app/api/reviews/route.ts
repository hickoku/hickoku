import { NextResponse } from 'next/server';
import { createReview, getApprovedReviewsByProduct } from '../../models/review-dynamo';

// GET /api/reviews?productId=xxx  — fetch approved reviews for a product
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const reviews = await getApprovedReviewsByProduct(productId);

    // Sort by newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews', message: error.message }, { status: 500 });
  }
}

// POST /api/reviews  — submit a new review (pending approval)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, name, rating, comment } = body;

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json({ error: 'productId, name, rating, and comment are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
    }

    const review = await createReview({ productId, name: name.trim(), rating: Number(rating), comment: comment.trim() });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review', message: error.message }, { status: 500 });
  }
}
