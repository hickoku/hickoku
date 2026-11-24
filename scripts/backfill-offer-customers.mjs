// Creates the offer-customers table (if missing) and marks every customer who already has
// a paid order, so "first order only" offers don't go to returning customers.
// See lib/offers/customers.ts for the table layout. Safe to run more than once.
//
//   node --env-file=.env --env-file=.env.local scripts/backfill-offer-customers.mjs          # stage
//   APP_ENV=prod node --env-file=.env --env-file=.env.local scripts/backfill-offer-customers.mjs   # prod
//
// Run it on prod right before the release goes live: orders paid after the run are
// recorded by the store itself.
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const prod = process.env.APP_ENV === "prod";
const ORDERS = prod ? "orders" : "orders-stage";
const TABLE = prod ? "offer-customers" : "offer-customers-stage";
const raw = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-southeast-2" });
const db = DynamoDBDocumentClient.from(raw);

async function ensureTable() {
  try {
    await raw.send(new DescribeTableCommand({ TableName: TABLE }));
    console.log(`Table ${TABLE} exists`);
  } catch (e) {
    if (e.name !== "ResourceNotFoundException") throw e;
    await raw.send(
      new CreateTableCommand({
        TableName: TABLE,
        BillingMode: "PAY_PER_REQUEST",
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" },
        ],
      }),
    );
    await waitUntilTableExists({ client: raw, maxWaitTime: 120 }, { TableName: TABLE });
    console.log(`Created table ${TABLE}`);
  }
}

// Same keys as customerKeys() in lib/offers/customers.ts
function keys(email, phone) {
  const out = [];
  const e = String(email || "").trim().toLowerCase();
  if (e.includes("@")) out.push(`email:${e}`);
  const d = String(phone || "").replace(/\D/g, "");
  if (d.length >= 10) out.push(`phone:${d.slice(-10)}`);
  return out;
}

await ensureTable();

const rows = new Map(); // pk|sk -> item
let key;
let paid = 0;
do {
  const r = await db.send(
    new ScanCommand({
      TableName: ORDERS,
      ExclusiveStartKey: key,
      FilterExpression: "paymentStatus = :p AND SK = :m",
      ExpressionAttributeValues: { ":p": "paid", ":m": "METADATA" },
    }),
  );
  for (const o of r.Items || []) {
    paid++;
    const pks = keys(o.customerEmail || o.shippingAddress?.email, o.customerPhone || o.shippingAddress?.phone);
    const sks = ["paid", ...(o.appliedOffers || []).map((a) => `offer#${a.id}`)];
    for (const pk of pks) for (const sk of sks) rows.set(`${pk}|${sk}`, { pk, sk, orderId: o.orderId, at: o.paidAt || o.createdAt, backfilled: true });
  }
  key = r.LastEvaluatedKey;
} while (key);

const items = [...rows.values()];
for (let i = 0; i < items.length; i += 25) {
  let req = { [TABLE]: items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } })) };
  for (let t = 0; req && Object.keys(req).length && t < 8; t++) {
    const r = await db.send(new BatchWriteCommand({ RequestItems: req }));
    req = r.UnprocessedItems;
    if (req && Object.keys(req).length) await new Promise((res) => setTimeout(res, 200 * (t + 1)));
  }
}
console.log(`${paid} paid orders in ${ORDERS} → ${items.length} rows in ${TABLE}`);
