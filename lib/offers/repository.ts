// Reads offers from DynamoDB. Server-only.
// Table is auto-selected by APP_ENV (same rule as orders):
//   APP_ENV=prod  → "offers"
//   otherwise     → "offers-stage"
// Offers are edited in the admin panel (Offers page). The only write here is usedCount
// (countOfferUse), added when an order that used the offer is paid.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { normaliseCode, type Offer } from "./engine";

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

const LEVELS = ["product", "cart", "bxgy", "gift", "shipping"];
const ids = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);

// Mirrors the admin's fromItem (hickoku-admin lib/offers.ts). Rows with a level this
// store doesn't know are skipped, never guessed.
function normalise(i: Record<string, any>): Offer | null {
  if (!i.id || !LEVELS.includes(i.level)) return null;
  return {
    id: String(i.id),
    name: String(i.name || ""),
    title: i.title || undefined,
    message: i.message || undefined,
    badge: i.badge || undefined,
    level: i.level,
    kind: i.kind === "flat" || i.kind === "per_item" ? i.kind : "percent",
    value: Number(i.value) || 0,
    maxDiscount: Number(i.maxDiscount) || 0,
    productIds: ids(i.productIds),
    minItems: Number(i.minItems) || 0,
    minSubtotal: Number(i.minSubtotal) || 0,
    buyQty: Number(i.buyQty) || 0,
    getQty: Number(i.getQty) || 0,
    getProductIds: ids(i.getProductIds),
    getKind: i.getKind === "percent" ? "percent" : "free",
    getValue: Number(i.getValue) || 0,
    giftProductId: i.giftProductId ? String(i.giftProductId) : null,
    eligibility: i.eligibility === "first_order" ? "first_order" : "everyone",
    usageLimit: Number(i.usageLimit) || 0,
    oncePerCustomer: i.oncePerCustomer === true,
    usedCount: Number(i.usedCount) || 0,
    startsAt: i.startsAt || null,
    endsAt: i.endsAt || null,
    enabled: i.enabled === true,
    sequence: Number(i.sequence) || 0,
    combinable: i.combinable !== false,
    couponCode: i.couponCode ? normaliseCode(i.couponCode) : null,
  };
}

let cache: { at: number; offers: Offer[] } | null = null;
const TTL_MS = 30_000;

/**
 * All enabled offers, including code-only ones (the engine applies those only when the
 * shopper enters the code) and scheduled/expired ones (callers check the time window with
 * isLive so that a cached list still switches on/off on schedule). Server-only: use
 * publicOffers() for anything sent to the browser, so discount codes never leak.
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
  const offers = items.map(normalise).filter((o): o is Offer => !!o && o.enabled);
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

/** Offers safe to send to the browser: everything except code-only offers. */
export const publicOffers = (offers: Offer[]) => offers.filter((o) => !o.couponCode);

/**
 * Adds 1 to usedCount on each offer (called once per paid order). The admin shows this
 * number and the engine stops an offer once it reaches its usage limit.
 */
export async function countOfferUse(offerIds: string[]): Promise<void> {
  await Promise.all(
    [...new Set(offerIds)].map((id) =>
      docClient
        .send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: `OFFER#${id}` },
            UpdateExpression: "ADD usedCount :one",
            ConditionExpression: "attribute_exists(PK)",
            ExpressionAttributeValues: { ":one": 1 },
          }),
        )
        .catch((e) => {
          if (e?.name !== "ConditionalCheckFailedException") throw e; // offer deleted since: nothing to count
        }),
    ),
  );
  cache = null;
}
