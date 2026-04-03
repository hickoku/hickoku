import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1", // Default to new region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// Table Names from .env or default to new clean names
const PRODUCTS_TABLE = "products";
const VARIANTS_TABLE = "product_variants";

export interface ProductVariant {
  id: string; // Variant ID
  sku: string;
  size: string;
  price: number;
  stock: number;
  inventoryStatus: string;
  weight?: number;
  isAvailable?: boolean;
  shortDesc?: string;
  desc?: string;
  status?: boolean; // true = visible, false = hidden
}

export interface Product {
  id: string; // Parent ID
  name: string;
  description: string;
  highlight: string;
  category: string;
  badge: string | null;
  images: string[];
  slug: string;
  status: string;
  basePrice: number;
  variants: ProductVariant[]; // Changed from single 'variant' to array
}

/**
 * Get all products with their variants
 * @param category - Optional category filter
 */
export async function getAllProductsWithVariants(
  category?: string,
): Promise<Product[]> {
  try {
    // 1. Scan Parents
    const productsResponse = await docClient.send(
      new ScanCommand({
        TableName: PRODUCTS_TABLE,
      }),
    );
    const parentItems = productsResponse.Items || [];

    // 2. Scan Variants (efficient enough for small catalog)
    const variantsResponse = await docClient.send(
      new ScanCommand({
        TableName: VARIANTS_TABLE,
      }),
    );
    const variantItems = variantsResponse.Items || [];

    // 3. Group Variants by Product ID
    const variantsMap = new Map<string, ProductVariant[]>();
    for (const v of variantItems) {
      // Only include variants with status true (or undefined for backward compatibility)
      if (v.status === false) continue;
      const mappedVariant: ProductVariant = {
        id: v.PK?.replace("VARIANT#", "") || v.id,
        sku: v.sku,
        size: v.size,
        price: v.price,
        stock: v.stock,
        inventoryStatus: v.inventoryStatus,
        weight: v.weight,
        isAvailable: v.stock > 0, // Simple logic
        shortDesc: v.shortDesc,
        desc: v.desc,
        status: v.status !== undefined ? v.status : true,
      };
      if (!variantsMap.has(v.productId)) {
        variantsMap.set(v.productId, []);
      }
      variantsMap.get(v.productId)?.push(mappedVariant);
    }

    // 4. Combine
    const products: Product[] = [];
    for (const p of parentItems) {
      // Only include products with status true (or undefined for backward compatibility)
      if (p.status === false) continue;
      if (category && p.category !== category) continue;

      const pid = p.id;
      // Only include variants with status true
      const productVariants = (variantsMap.get(pid) || []).filter(
        (v) => v.status !== false,
      );

      // Fix: If no variants found, skip? Or show as unavailable?
      // Architecture rule: "Always a Variant". Migration should have created them.

      // Map legacy fields if needed, but new tables have clean names
      products.push({
        id: pid,
        name: p.name,
        description: p.description,
        highlight: p.highlight,
        category: p.category,
        badge: p.badge,
        images: p.images,
        slug: p.slug,
        status: p.status || "active",
        basePrice: p.basePrice,
        variants: productVariants,
      });
    }

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

/**
 * Get a single product with its variants
 * @param productId - Product ID (e.g., "1")
 */
export async function getProductWithVariant(
  productId: string,
): Promise<Product | null> {
  try {
    // 1. Get Parent
    const productResponse = await docClient.send(
      new QueryCommand({
        TableName: PRODUCTS_TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": `PRODUCT#${productId}`,
        },
      }),
    );

    if (!productResponse.Items || productResponse.Items.length === 0)
      return null;
    const parent = productResponse.Items[0];

    // 2. Get Variants (Query GSI)
    const variantsResponse = await docClient.send(
      new QueryCommand({
        TableName: VARIANTS_TABLE,
        IndexName: "productId-index",
        KeyConditionExpression: "productId = :pid",
        ExpressionAttributeValues: {
          ":pid": productId,
        },
      }),
    );

    const variantItems = variantsResponse.Items || [];
    const variants: ProductVariant[] = variantItems.map((v: any) => ({
      id: v.PK?.replace("VARIANT#", "") || v.id,
      sku: v.sku,
      size: v.size,
      price: v.price,
      stock: v.stock,
      inventoryStatus: v.inventoryStatus,
      weight: v.weight,
      isAvailable: v.stock > 0,
      shortDesc: v.shortDesc,
      desc: v.desc,
    }));

    return {
      id: parent.id,
      name: parent.name,
      description: parent.description,
      highlight: parent.highlight,
      category: parent.category,
      badge: parent.badge,
      images: parent.images,
      slug: parent.slug,
      status: parent.status || "active",
      basePrice: parent.basePrice,
      variants: variants,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

/**
 * Update stock for a variant (Atomic Decrement)
 */
export async function updateStock(
  variantId: string,
  quantity: number,
): Promise<void> {
  try {
    console.log(`Decreasing stock for variant ${variantId} by ${quantity}`);
    await docClient.send(
      new UpdateCommand({
        TableName: VARIANTS_TABLE,
        Key: {
          PK: `VARIANT#${variantId}`,
        },
        UpdateExpression: "SET stock = stock - :qty",
        ConditionExpression: "stock >= :qty", // Ensure we don't go below 0
        ExpressionAttributeValues: {
          ":qty": quantity,
        },
      }),
    );
    console.log(`Stock updated for ${variantId}`);
  } catch (error: any) {
    console.error("Error updating stock:", error);
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("Insufficient stock");
    }
    throw new Error("Failed to update stock");
  }
}
