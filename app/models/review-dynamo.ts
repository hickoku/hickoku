import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const TABLE_NAME = 'reviews';

export interface Review {
  reviewId: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export async function createReview(data: {
  productId: string;
  name: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const review: Review = {
    reviewId: uuidv4(),
    productId: data.productId,
    name: data.name,
    rating: data.rating,
    comment: data.comment,
    approved: false,
    createdAt: new Date().toISOString(),
  };

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        reviewId: { S: review.reviewId },
        productId: { S: review.productId },
        name: { S: review.name },
        rating: { N: review.rating.toString() },
        comment: { S: review.comment },
        approved: { BOOL: false },
        createdAt: { S: review.createdAt },
      },
    })
  );

  return review;
}

export async function getApprovedReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'productId-index',
        KeyConditionExpression: 'productId = :pid',
        FilterExpression: 'approved = :approved',
        ExpressionAttributeValues: {
          ':pid': { S: productId },
          ':approved': { BOOL: true },
        },
      })
    );
    return (result.Items || []).map((item) => unmarshall(item) as Review);
  } catch (error: any) {
    if (error.__type?.includes('ResourceNotFoundException') || error.name === 'ResourceNotFoundException') {
      console.warn('[reviews] Table or GSI not found — returning empty reviews.');
      return [];
    }
    throw error;
  }
}

export async function getAllPendingReviews(): Promise<Review[]> {
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'approved = :approved',
      ExpressionAttributeValues: {
        ':approved': { BOOL: false },
      },
    })
  );

  return (result.Items || []).map((item) => unmarshall(item) as Review);
}

export async function getAllReviews(): Promise<Review[]> {
  const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
  return (result.Items || []).map((item) => unmarshall(item) as Review);
}

export async function approveReview(reviewId: string): Promise<void> {
  await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { reviewId: { S: reviewId } },
      UpdateExpression: 'SET approved = :approved',
      ExpressionAttributeValues: { ':approved': { BOOL: true } },
    })
  );
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { DeleteItemCommand } = await import('@aws-sdk/client-dynamodb');
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: { reviewId: { S: reviewId } },
    })
  );
}
