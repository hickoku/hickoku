// Hickoku Club applications. Server-only.
//
// Table club-applications[-stage], one string key "pk":
//   APP#HC-1001        the application
//   TOKEN#<token>      private status link → application id (status page comes later)
//   HANDLE#<insta>     last application from this Instagram handle (one per N days)
//   PHONE#<10 digits>  last application from this WhatsApp number (same rule)
//   BLOCK#ig:<handle> / BLOCK#phone:<digits>   blocked by the admin (written by the admin)
//   COUNTER            running number for HC-…
//
// Applying never creates an order or touches stock: the ₹0 gift order is made only when the
// admin approves the application.
import { randomBytes } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchGetCommand, DynamoDBDocumentClient, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getClub, isOpen, type ClubGift } from "./settings";
import { addDays, dateWindow, todayIST } from "./dates";

export const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || "", secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "" },
  }),
  { marshallOptions: { removeUndefinedValues: true } },
);
export const CLUB_TABLE = process.env.APP_ENV === "prod" ? "club-applications" : "club-applications-stage";

export type ClubAddress = { firstName: string; lastName: string; phone: string; email: string; street: string; city: string; state: string; zipCode: string; country: string };

export type ClubApplication = {
  pk: string;
  id: string; // HC-1001
  statusToken: string;
  status: "submitted" | "approving" | "approved" | "rejected"; // review (set by the admin)
  forWhom: "friend" | "self";
  recipientName: string; // whose occasion it is (the applicant's own name when "self")
  occasionId: string;
  occasionName: string;
  partyDate: string; // YYYY-MM-DD
  gift: Pick<ClubGift, "productId" | "variantId" | "sku" | "name" | "size" | "price" | "image">;
  labelName?: string; // name printed on the bottle
  instagram: string; // without @, lower case
  whatsapp: string; // 10 digits
  email: string;
  adultConfirmed: boolean;
  termsVersion: number;
  termsAcceptedAt: string;
  address: ClubAddress;
  createdAt: string;
  client?: { ip?: string; userAgent?: string };
  // Set by the admin (release 5)
  approvedAt?: string;
  orderId?: string;
  awb?: string;
  rejectedAt?: string;
  // After the party (release 6)
  post?: ClubPost;
  featured?: { at: string; until: string; hidden?: boolean };
};

/** The Reel proof. state: proof_sent → (admin) verified | fix_requested; or not_posted. */
export type ClubPost = {
  state: "proof_sent" | "fix_requested" | "verified" | "not_posted";
  reelUrl?: string;
  postedFrom?: string; // Instagram handle the Reel was posted from (applicant or the person celebrating)
  storyShot?: boolean; // a Story screenshot is stored in the PROOF#<id> row
  featureConsent?: boolean;
  submittedAt?: string;
  fixNote?: string; // what the admin asked them to fix
  reviewedAt?: string;
};

export class ClubError extends Error {
  constructor(message: string, public status = 400, public field?: string) {
    super(message);
  }
}

const str = (v: any, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
export const cleanHandle = (v: any) => str(v, 60).replace(/^@+/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").toLowerCase();
export const cleanPhone = (v: any) => {
  const d = String(v ?? "").replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? d.slice(2) : d.length === 11 && d.startsWith("0") ? d.slice(1) : d;
};
const fmtDay = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** Checks the form against the current Club rules and saves it. Returns the new application. */
export async function submitApplication(input: any, client?: { ip?: string; userAgent?: string }): Promise<ClubApplication> {
  const club = await getClub(true);
  if (!club || !isOpen(club)) throw new ClubError("Hickoku Club isn't taking applications right now. Please check back soon.", 409);
  const { settings, terms, gifts } = club;

  const forWhom = input?.forWhom === "self" ? "self" : "friend";
  const recipientName = str(input?.recipientName, 40);
  if (!recipientName) throw new ClubError(forWhom === "self" ? "Add your name" : "Add their name", 400, "recipientName");

  const occasion = settings.occasions.find((o) => o.enabled && o.id === input?.occasionId);
  if (!occasion) throw new ClubError("Pick an occasion", 400, "occasionId");

  const partyDate = str(input?.partyDate, 10);
  const { first, last } = dateWindow(settings);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(partyDate)) throw new ClubError("Pick the party date", 400, "partyDate");
  if (partyDate < first) throw new ClubError(`That's too soon for us to deliver. Pick ${fmtDay(first)} or later.`, 400, "partyDate");
  if (partyDate > last) throw new ClubError(`That's too far ahead. Apply again closer to the day (from ${fmtDay(addDays(partyDate, -settings.eligibility.leadDaysMax))}).`, 400, "partyDate");

  const gift = gifts.find((g) => g.productId === String(input?.productId));
  if (!gift) throw new ClubError("Pick the perfume", 400, "productId");
  if (!gift.inStock) throw new ClubError(`${gift.name} is out of stock. Please pick another.`, 409, "productId");

  let labelName: string | undefined;
  if (settings.gift.nameLabel && input?.labelName) {
    labelName = str(input.labelName, 40);
    if (labelName && !/^[\p{L} .'-]+$/u.test(labelName)) throw new ClubError("The label can only have letters", 400, "labelName");
    if (labelName.replace(/\s/g, "").length > settings.gift.nameMaxLength) throw new ClubError(`The label fits ${settings.gift.nameMaxLength} letters`, 400, "labelName");
    labelName = labelName || undefined;
  }

  const instagram = cleanHandle(input?.instagram);
  if (!/^[a-z0-9._]{1,30}$/.test(instagram)) throw new ClubError("Add your Instagram username", 400, "instagram");
  const whatsapp = cleanPhone(input?.whatsapp);
  if (!/^[6-9]\d{9}$/.test(whatsapp)) throw new ClubError("Add a 10-digit WhatsApp number", 400, "whatsapp");
  const email = str(input?.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ClubError("Add a valid email", 400, "email");

  if (settings.eligibility.adultsOnly && input?.adultConfirmed !== true) throw new ClubError("Please confirm you're 18 or older", 400, "promise");
  if (input?.acceptedTerms !== true) throw new ClubError("Please accept the Hickoku Club terms", 400, "promise");
  if (Number(input?.termsVersion) !== terms!.version) throw new ClubError("The Club terms were just updated. Please read them again and accept.", 409, "terms");

  const a = input?.address || {};
  const address: ClubAddress = {
    firstName: str(a.firstName, 60),
    lastName: str(a.lastName, 60),
    phone: cleanPhone(a.phone),
    email,
    street: str(a.street, 300),
    city: str(a.city, 80),
    state: str(a.state, 80),
    zipCode: String(a.zipCode ?? "").replace(/\D/g, ""),
    country: "India",
  };
  if (!address.firstName) throw new ClubError("Add the first name for delivery", 400, "firstName");
  if (!/^[6-9]\d{9}$/.test(address.phone)) throw new ClubError("Add a 10-digit phone number for delivery", 400, "phone");
  if (address.street.length < 8) throw new ClubError("Add the full delivery address", 400, "street");
  if (!/^[1-9]\d{5}$/.test(address.zipCode)) throw new ClubError("Add a 6-digit PIN code", 400, "zipCode");
  if (!address.city) throw new ClubError("Add the city", 400, "city");
  if (!address.state) throw new ClubError("Add the state", 400, "state");

  // Blocked by the admin (spam, or didn't post last time)? Applied recently? Checked before
  // taking a number; the save below checks "applied recently" again, atomically.
  const cutoff = new Date(Date.now() - settings.eligibility.reapplyDays * 86_400_000).toISOString();
  const blockKeys = [`BLOCK#ig:${instagram}`, `BLOCK#phone:${whatsapp}`, ...(address.phone !== whatsapp ? [`BLOCK#phone:${address.phone}`] : [])];
  const found = await docClient.send(
    new BatchGetCommand({ RequestItems: { [CLUB_TABLE]: { Keys: [...blockKeys, `HANDLE#${instagram}`, `PHONE#${whatsapp}`].map((pk) => ({ pk })) } } }),
  );
  const rows = new Map((found.Responses?.[CLUB_TABLE] || []).map((r) => [String(r.pk), r]));
  if (blockKeys.some((k) => rows.has(k))) throw new ClubError("Sorry, we can't take an application from this account. Message us on WhatsApp if you think this is a mistake.", 403);
  const recent = (pk: string) => {
    const at = rows.get(pk)?.lastAt;
    return at && at >= cutoff ? String(at) : null;
  };
  const tooSoon = (byPhone: boolean, lastAt: string | null) => {
    const again = lastAt ? fmtDay(addDays(todayIST(new Date(lastAt)), settings.eligibility.reapplyDays)) : null;
    return new ClubError(
      byPhone
        ? `This WhatsApp number already has an application from the last ${settings.eligibility.reapplyDays} days.${again ? ` You can apply again from ${again}.` : ""}`
        : `@${instagram} already applied in the last ${settings.eligibility.reapplyDays} days.${again ? ` You can apply again from ${again}.` : ""}`,
      409,
      byPhone ? "whatsapp" : "instagram",
    );
  };
  if (recent(`HANDLE#${instagram}`)) throw tooSoon(false, recent(`HANDLE#${instagram}`));
  if (recent(`PHONE#${whatsapp}`)) throw tooSoon(true, recent(`PHONE#${whatsapp}`));

  const counter = await docClient.send(
    new UpdateCommand({ TableName: CLUB_TABLE, Key: { pk: "COUNTER" }, UpdateExpression: "ADD n :one", ExpressionAttributeValues: { ":one": 1 }, ReturnValues: "UPDATED_NEW" }),
  );
  const id = `HC-${1000 + Number(counter.Attributes?.n || 1)}`;
  const now = new Date().toISOString();
  const app: ClubApplication = {
    pk: `APP#${id}`,
    id,
    statusToken: randomBytes(9).toString("base64url"),
    status: "submitted",
    forWhom,
    recipientName,
    occasionId: occasion.id,
    occasionName: occasion.name,
    partyDate,
    gift: { productId: gift.productId, variantId: gift.variantId, sku: gift.sku, name: gift.name, size: gift.size, price: gift.price, image: gift.image },
    labelName,
    instagram,
    whatsapp,
    email,
    adultConfirmed: input?.adultConfirmed === true,
    termsVersion: terms!.version,
    termsAcceptedAt: now,
    address,
    createdAt: now,
    client,
  };

  // One application per handle (and per WhatsApp number) every N days. The check and the
  // save happen together, so two quick submits can't both get through.
  const lastRow = (pk: string) => ({
    Update: {
      TableName: CLUB_TABLE,
      Key: { pk },
      UpdateExpression: "SET lastAt = :now, lastId = :id",
      ConditionExpression: "attribute_not_exists(lastAt) OR lastAt < :cutoff",
      ExpressionAttributeValues: { ":now": now, ":id": id, ":cutoff": cutoff },
    },
  });
  try {
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          { Put: { TableName: CLUB_TABLE, Item: app, ConditionExpression: "attribute_not_exists(pk)" } },
          { Put: { TableName: CLUB_TABLE, Item: { pk: `TOKEN#${app.statusToken}`, appId: id } } },
          lastRow(`HANDLE#${instagram}`),
          lastRow(`PHONE#${whatsapp}`),
        ],
      }),
    );
  } catch (e: any) {
    if (e?.name === "TransactionCanceledException") {
      // Another application from this handle or number was saved a moment ago.
      const byPhone = e.CancellationReasons?.[3]?.Code === "ConditionalCheckFailed" && e.CancellationReasons?.[2]?.Code !== "ConditionalCheckFailed";
      throw tooSoon(byPhone, now);
    }
    throw e;
  }
  return app;
}
