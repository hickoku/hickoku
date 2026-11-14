// Reads offers from DynamoDB. Server-only.
// Table is auto-selected by APP_ENV (same rule as orders):
//   APP_ENV=prod  → "offers"
//   otherwise     → "offers-stage"
// Offers are edited in the admin panel (Offers page); nothing here writes to the table.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import type { Offer } from "./engine";

const TABLE_NAME = process.env.APP_ENV === "prod" ? "offers" : "offers-stage";

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
);

function normalise(i: Record<string, any>): Offer | null {
  if (!i.id || (i.level !== "product" && i.level !== "cart")) return null;
  return {
    id: String(i.id),
    name: String(i.name || ""),
    title: i.title || undefined,
    message: i.message || undefined,
    level: i.level,
    kind: i.kind === "flat" || i.kind === "per_item" ? i.kind : "percent",
    value: Number(i.value) || 0,
    productIds: Array.isArray(i.productIds) ? i.productIds.map(String) : [],
    minItems: Number(i.minItems) || 0,
    minSubtotal: Number(i.minSubtotal) || 0,
    startsAt: i.startsAt || null,
    endsAt: i.endsAt || null,
    enabled: i.enabled === true,
    sequence: Number(i.sequence) || 0,
    combinable: i.combinable !== false,
    couponCode: i.couponCode || null,
  };
}

let cache: { at: number; offers: Offer[] } | null = null;
const TTL_MS = 30_000;

/**
 * All enabled offers (including scheduled and expired ones; callers check the time
 * window with isLive so that a cached list still switches on/off on schedule).
 * fresh=true skips the 30s cache: use it where money is charged.
 */
export async function getOffers({ fresh = false }: { fresh?: boolean } = {}): Promise<Offer[]> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.offers;
  const items: Record<string, any>[] = [];
  let key: Record<string, any> | undefined;
  do {
    const r = await docClient.send(new ScanCommand({ TableName: TABLE_NAME, ExclusiveStartKey: key }));
    items.push(...(r.Items || []));
    key = r.LastEvaluatedKey;
  } while (key);
  const offers = items.map(normalise).filter((o): o is Offer => !!o && o.enabled && !o.couponCode);
  cache = { at: Date.now(), offers };
  return offers;
}

/** Same as getOffers but never throws: a failed read means "no offers" for display only. */
export async function getOffersSafe(): Promise<Offer[]> {
  try {
    return await getOffers();
  } catch (e) {
    console.error("Failed to load offers:", e);
    return cache?.offers || [];
  }
}
