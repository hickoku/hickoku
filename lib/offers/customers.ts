// Remembers, per customer, whether they have a paid order and which offers they have used.
// Needed for "first order only" and "once per customer" offers. Server-only.
//
// Table (auto-selected by APP_ENV): "offer-customers" on prod, "offer-customers-stage" otherwise.
//   pk  "email:<lower-case email>" or "phone:<last 10 digits>"
//   sk  "paid"               the customer has at least one paid order
//       "offer#<offerId>"    the customer has a paid order that used this offer
// A customer is recognised by email OR phone, so a new email with an old phone number
// still counts as a returning customer.
// Rows are written when an order is paid (recordPaidOrder). Orders paid before this table
// existed are added by scripts/backfill-offer-customers.mjs.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchGetCommand, BatchWriteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const CUSTOMERS_TABLE = process.env.APP_ENV === "prod" ? "offer-customers" : "offer-customers-stage";

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
);

export function customerKeys(email?: string | null, phone?: string | null): string[] {
  const keys: string[] = [];
  const e = String(email || "").trim().toLowerCase();
  if (e.includes("@")) keys.push(`email:${e}`);
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length >= 10) keys.push(`phone:${digits.slice(-10)}`);
  return keys;
}

export type CustomerHistory = { known: boolean; firstOrder: boolean; usedOfferIds: Set<string> };

/**
 * What this customer has done before. `known` is false when there is no email/phone to go
 * on: then they are not treated as a first-time customer and once-per-customer offers are
 * refused (the order route always has both, so this only affects early checkout quotes).
 * Throws if the table can't be read: callers must not hand out first-order or
 * once-per-customer discounts they couldn't check.
 */
export async function customerHistory(email: string | null | undefined, phone: string | null | undefined, offerIds: string[]): Promise<CustomerHistory> {
  const pks = customerKeys(email, phone);
  if (pks.length === 0) return { known: false, firstOrder: false, usedOfferIds: new Set() };
  const sks = ["paid", ...new Set(offerIds).values()].map((id) => (id === "paid" ? id : `offer#${id}`));
  const keys = pks.flatMap((pk) => sks.map((sk) => ({ pk, sk })));
  const found: Record<string, any>[] = [];
  // BatchGet takes up to 100 keys per call.
  for (let i = 0; i < keys.length; i += 100) {
    let req: Record<string, any> | undefined = { [CUSTOMERS_TABLE]: { Keys: keys.slice(i, i + 100), ProjectionExpression: "pk, sk" } };
    for (let tries = 0; req && Object.keys(req).length && tries < 5; tries++) {
      const r: any = await docClient.send(new BatchGetCommand({ RequestItems: req }));
      found.push(...(r.Responses?.[CUSTOMERS_TABLE] || []));
      req = r.UnprocessedKeys;
    }
  }
  return {
    known: true,
    firstOrder: !found.some((r) => r.sk === "paid"),
    usedOfferIds: new Set(found.filter((r) => String(r.sk).startsWith("offer#")).map((r) => String(r.sk).slice(6))),
  };
}

/** Marks the customer as having a paid order, and as having used these offers. Safe to repeat. */
export async function recordPaidOrder(email: string | null | undefined, phone: string | null | undefined, offerIds: string[], orderId: string): Promise<void> {
  const pks = customerKeys(email, phone);
  const now = new Date().toISOString();
  const items = pks.flatMap((pk) => ["paid", ...new Set(offerIds).values()].map((id) => ({ pk, sk: id === "paid" ? id : `offer#${id}`, orderId, at: now })));
  for (let i = 0; i < items.length; i += 25) {
    let req: Record<string, any> | undefined = { [CUSTOMERS_TABLE]: items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } })) };
    for (let tries = 0; req && Object.keys(req).length && tries < 5; tries++) {
      const r: any = await docClient.send(new BatchWriteCommand({ RequestItems: req }));
      req = r.UnprocessedItems;
    }
  }
}
