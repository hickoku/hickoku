// Creates the Hickoku Club applications table (one string key "pk", on-demand billing).
// Stage:  node --env-file=.env --env-file=.env.local scripts/create-club-table.mjs
// Prod:   APP_ENV=prod node --env-file=.env --env-file=.env.local scripts/create-club-table.mjs
// Safe to re-run: does nothing if the table is already there.
import { CreateTableCommand, DescribeTableCommand, DynamoDBClient, waitUntilTableExists } from "@aws-sdk/client-dynamodb";

const TABLE = process.env.APP_ENV === "prod" ? "club-applications" : "club-applications-stage";
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});

try {
  await client.send(new DescribeTableCommand({ TableName: TABLE }));
  console.log(`${TABLE} already exists`);
} catch (e) {
  if (e.name !== "ResourceNotFoundException") throw e;
  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );
  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: TABLE });
  console.log(`Created ${TABLE}`);
}
