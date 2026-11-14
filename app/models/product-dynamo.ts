// This is a helper for product queries using DynamoDB
import { DynamoDBClient, GetItemCommand, ScanCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
// Helper to marshall a JS object to DynamoDB item format
function marshallProduct(product: Record<string, any>) {
  const item: Record<string, any> = {};
  for (const key in product) {
    if (product[key] === undefined) continue;
    const value = product[key];
    if (typeof value === 'string') item[key] = { S: value };
    else if (typeof value === 'number') item[key] = { N: value.toString() };
    else if (typeof value === 'boolean') item[key] = { BOOL: value };
    // Add more types as needed
  }
  return item;
}

// Create a new product in DynamoDB
export async function createProduct(product: Record<string, any>) {
  if (!product.id) throw new Error('Product must have an id');
  const params = {
    TableName: TABLE_NAME,
    Item: marshallProduct(product),
  };
  const command = new PutItemCommand(params);
  await client.send(command);
  return product;
}
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-southeast-2" });
const TABLE_NAME = process.env.APP_ENV === 'prod' ? 'products' : 'products-stage';

export async function getAllProducts({ category, name }: { category?: string; name?: string }) {
  const params: any = {
    TableName: TABLE_NAME,
  };

  // For now, use Scan with filter expressions (not efficient for large tables)
  const filterExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  if (category) {
    filterExpressions.push('#category = :category');
    expressionAttributeValues[':category'] = { S: category };
    expressionAttributeNames['#category'] = 'category';
  }
  if (name) {
    filterExpressions.push('contains (LOWER(#name), :name)');
    expressionAttributeValues[':name'] = { S: name.toLowerCase() };
    expressionAttributeNames['#name'] = 'name';
  }
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
    params.ExpressionAttributeNames = expressionAttributeNames;
  }

  const command = new ScanCommand(params);
  const result = await client.send(command);
  return (result.Items || []).map(item => unmarshall(item));
}

export async function getProductById(id: string) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id: { S: id },
    },
  };
  const command = new GetItemCommand(params);
  const result = await client.send(command);
  return result.Item ? unmarshall(result.Item) : null;
}
