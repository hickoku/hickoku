// Hickoku Club status page + Reel proof. Server-only.
//
// Applicants reach their status by the private link (/club/status/<token>, shown after
// applying) or by WhatsApp number + occasion date. Only a safe view is sent to the
// browser: the address is partly hidden and nothing about the review is shown.
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CLUB_TABLE, ClubError, cleanHandle, cleanPhone, docClient, type ClubApplication } from "./applications";
import { getClub } from "./settings";
import { addDays, todayIST } from "./dates";
import { orderRepository } from "@/lib/repositories/orderRepository";

export const STATUS_COOKIE = "hk_club";

export async function appByToken(token: string): Promise<ClubApplication | null> {
  if (!/^[A-Za-z0-9_-]{8,40}$/.test(token)) return null;
  const t = await docClient.send(new GetCommand({ TableName: CLUB_TABLE, Key: { pk: `TOKEN#${token}` } }));
  if (!t.Item?.appId) return null;
  const a = await docClient.send(new GetCommand({ TableName: CLUB_TABLE, Key: { pk: `APP#${t.Item.appId}` } }));
  return (a.Item as ClubApplication) || null;
}

/** The latest application from this WhatsApp number, if its occasion is on this date. */
export async function findByPhoneAndDate(phone: any, date: any): Promise<ClubApplication | null> {
  const digits = cleanPhone(phone);
  if (!/^[6-9]\d{9}$/.test(digits) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return null;
  const p = await docClient.send(new GetCommand({ TableName: CLUB_TABLE, Key: { pk: `PHONE#${digits}` } }));
  if (!p.Item?.lastId) return null;
  const a = await docClient.send(new GetCommand({ TableName: CLUB_TABLE, Key: { pk: `APP#${p.Item.lastId}` } }));
  const app = a.Item as ClubApplication | undefined;
  return app && app.partyDate === date ? app : null;
}

export type Stage = "review" | "rejected" | "approved" | "shipped" | "delivered" | "post" | "checking" | "fix" | "verified" | "featured" | "not_posted";

export type StatusView = {
  id: string;
  token: string;
  stage: Stage;
  firstName: string;
  recipientName: string;
  forWhom: "friend" | "self";
  occasionName: string;
  partyDate: string;
  gift: { name: string; size: string; image: string };
  labelName?: string;
  instagram: string;
  addressHint: string; // partly hidden
  awb?: string;
  shipBy: string;
  approvedAt?: string;
  post?: { state: string; reelUrl?: string; postedFrom?: string; fixNote?: string; submittedAt?: string };
  featuredUntil?: string;
  canPost: boolean; // proof form is open
  rules: { handle: string; hashtags: string[]; postWithinHours: number; keepUpDays: number; storyRequired: boolean; minFollowers: number; featureDays: number };
};

const hide = (s: string, keep = 3) => (s.length <= keep ? s : s.slice(0, keep) + "•".repeat(Math.min(8, s.length - keep)));

export async function statusView(app: ClubApplication, token: string): Promise<StatusView> {
  const club = await getClub();
  const s = club?.settings;
  const today = todayIST();
  let stage: Stage = "review";
  let delivered = false;
  if (app.status === "approved" && app.orderId) {
    const order = await orderRepository.getOrder(app.orderId).catch(() => null);
    delivered = order?.status === "delivered";
  }
  if (app.status === "rejected") stage = "rejected";
  else if (app.status === "approved") {
    const p = app.post?.state;
    if (app.featured && !app.featured.hidden && app.featured.until >= new Date().toISOString()) stage = "featured";
    else if (p === "not_posted") stage = "not_posted";
    else if (p === "verified") stage = "verified";
    else if (p === "fix_requested") stage = "fix";
    else if (p === "proof_sent") stage = "checking";
    else if (today >= app.partyDate) stage = "post";
    else if (delivered) stage = "delivered";
    else if (app.awb) stage = "shipped";
    else stage = "approved";
  }
  const a = app.address;
  return {
    id: app.id,
    token,
    stage,
    firstName: a.firstName,
    recipientName: app.recipientName,
    forWhom: app.forWhom,
    occasionName: app.occasionName,
    partyDate: app.partyDate,
    gift: { name: app.gift.name, size: app.gift.size, image: app.gift.image },
    labelName: app.labelName,
    instagram: app.instagram,
    addressHint: `${hide(a.street, 12)}, ${a.city} ${a.zipCode.slice(0, 4)}••`,
    awb: app.awb,
    shipBy: addDays(app.partyDate, -4),
    approvedAt: app.approvedAt,
    post: app.post ? { state: app.post.state, reelUrl: app.post.reelUrl, postedFrom: app.post.postedFrom, fixNote: app.post.fixNote, submittedAt: app.post.submittedAt } : undefined,
    featuredUntil: app.featured && !app.featured.hidden ? app.featured.until : undefined,
    canPost: stage === "post" || stage === "fix" || (stage === "delivered" && today >= app.partyDate),
    rules: {
      handle: s?.posting.instagramHandle || "@hickokuperfume",
      hashtags: s?.posting.hashtags || [],
      postWithinHours: s?.posting.postWithinHours || 24,
      keepUpDays: s?.posting.keepUpDays || 30,
      storyRequired: s?.posting.storyScreenshotRequired ?? true,
      minFollowers: s?.eligibility.minFollowers || 0,
      featureDays: s?.programme.featureDays || 30,
    },
  };
}

// ---- Proof ----

const REEL = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/[A-Za-z0-9_-]{5,}\/?(\?.*)?$/i;
export const MAX_SHOT_BYTES = 300 * 1024; // DynamoDB rows max out at 400 KB; the browser shrinks the image first

/** Saves the Reel link and Story screenshot. Allowed from the party day, after approval. */
export async function submitProof(token: string, input: any): Promise<ClubApplication> {
  const app = await appByToken(token);
  if (!app) throw new ClubError("We couldn't find this application.", 404);
  const view = await statusView(app, token);
  if (!view.canPost) {
    throw new ClubError(view.stage === "checking" || view.stage === "verified" || view.stage === "featured" ? "We already have your post. Thank you!" : "You can send your post from the day of the occasion.", 409);
  }
  const reelUrl = String(input?.reelUrl || "").trim();
  if (!REEL.test(reelUrl)) throw new ClubError("Paste the link to your Reel (it starts with instagram.com/reel/)", 400, "reelUrl");
  const postedFrom = cleanHandle(input?.postedFrom || app.instagram);
  if (!/^[a-z0-9._]{1,30}$/.test(postedFrom)) throw new ClubError("Add the Instagram account it was posted from", 400, "postedFrom");

  let shot: { type: string; data: string } | null = null;
  if (input?.storyShot) {
    const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(input.storyShot));
    if (!m) throw new ClubError("That screenshot couldn't be read. Try another image.", 400, "storyShot");
    if ((m[3].length * 3) / 4 > MAX_SHOT_BYTES) throw new ClubError("That screenshot is too big. Try a smaller one.", 400, "storyShot");
    shot = { type: m[1], data: m[3] };
  }
  const club = await getClub();
  if ((club?.settings.posting.storyScreenshotRequired ?? true) && !shot && !app.post?.storyShot) {
    throw new ClubError("Add a screenshot of your Story", 400, "storyShot");
  }

  const now = new Date().toISOString();
  if (shot) {
    await docClient.send(new PutCommand({ TableName: CLUB_TABLE, Item: { pk: `PROOF#${app.id}`, type: shot.type, data: shot.data, uploadedAt: now } }));
  }
  const post = {
    state: "proof_sent" as const,
    reelUrl,
    postedFrom,
    storyShot: !!shot || !!app.post?.storyShot,
    featureConsent: input?.featureConsent === true,
    submittedAt: now,
  };
  const r = await docClient.send(
    new UpdateCommand({
      TableName: CLUB_TABLE,
      Key: { pk: app.pk },
      UpdateExpression: "SET post = :p",
      // Not while the admin is reviewing or after a decision.
      ConditionExpression: "#s = :approved AND (attribute_not_exists(post) OR post.#st = :fix)",
      ExpressionAttributeNames: { "#s": "status", "#st": "state" },
      ExpressionAttributeValues: { ":p": post, ":approved": "approved", ":fix": "fix_requested" },
      ReturnValues: "ALL_NEW",
    }),
  ).catch((e) => {
    if (e?.name === "ConditionalCheckFailedException") throw new ClubError("We already have your post. Thank you!", 409);
    throw e;
  });
  return r.Attributes as ClubApplication;
}
