import { NextResponse } from 'next/server';
import { getAllPendingReviews, approveReview, deleteReview, getAllReviews } from '../../../models/review-dynamo';

const ADMIN_TOKEN = process.env.ADMIN_ACTION_TOKEN;

function isAuthorized(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  return token === ADMIN_TOKEN;
}

// GET /api/admin/reviews?all=true  — fetch all or pending reviews
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const reviews = all ? await getAllReviews() : await getAllPendingReviews();
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews', message: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/reviews  — approve a review
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    await approveReview(reviewId);
    return NextResponse.json({ success: true, message: 'Review approved' });
  } catch (error: any) {
    console.error('Error approving review:', error);
    return NextResponse.json({ error: 'Failed to approve review', message: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/reviews  — delete/reject a review
export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    await deleteReview(reviewId);
    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review', message: error.message }, { status: 500 });
  }
}
