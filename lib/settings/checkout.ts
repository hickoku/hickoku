// Checkout switches (Charge shipping, Delhivery, "Use current location"). Server-only.
//
// Set in the admin panel (Settings → Store details → Checkout switches) and kept in the
// site-settings[-stage] table as the row id = "checkout". Table follows APP_ENV like orders:
//   APP_ENV=prod → "site-settings",  otherwise → "site-settings-stage"
// A switch that has never been set in the admin panel falls back to the old env var
// (ENABLE_SHIPPING / ENABLE_DELHIVERY / ENABLE_GEOLOCATION), so nothing changes until
// someone flips it.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.APP_ENV === "prod" ? "site-settings" : "site-settings-stage";

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
);

export type CheckoutSettings = {
  /** Add the delivery fee to what the customer pays (otherwise it is shown struck out as FREE). */
  shipping: boolean;
  /** PIN code check, Delhivery delivery rate, and booking the shipment after payment. */
  delhivery: boolean;
  /** "Use Current Location" button on the address form. */
  geolocation: boolean;
};

/** Delivery fee when Delhivery is off or gives no rate (the ₹50 shown on the site so far). */
export const FLAT_DELIVERY_FEE = 50;

const fromEnv = (): CheckoutSettings => ({
  // ENABLE_SHIPPING used to have no effect; delivery was always free. Default stays "free".
  shipping: false,
  delhivery: process.env.ENABLE_DELHIVERY === "true",
  geolocation: process.env.ENABLE_GEOLOCATION === "true",
});

let cache: { at: number; value: CheckoutSettings } | null = null;
const TTL_MS = 30_000;

/** fresh=true skips the 30s cache: use it where money is charged or a shipment is booked. */
export async function getCheckoutSettings({ fresh = false }: { fresh?: boolean } = {}): Promise<CheckoutSettings> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.value;
  const env = fromEnv();
  try {
    const r = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id: "checkout" } }));
    const row = r.Item || {};
    const pick = (k: keyof CheckoutSettings) => (typeof row[k] === "boolean" ? row[k] : env[k]);
    const value = { shipping: pick("shipping"), delhivery: pick("delhivery"), geolocation: pick("geolocation") };
    cache = { at: Date.now(), value };
    return value;
  } catch (e) {
    console.error("[checkout settings] read failed, using env values:", (e as Error).message);
    // A failed read must not start charging shipping or booking shipments: use the last
    // value we had, else the env defaults.
    return cache?.value || env;
  }
}

export const isDelhiveryOn = async () => (await getCheckoutSettings()).delhivery;
