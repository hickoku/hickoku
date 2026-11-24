// Hickoku Club rules, set in the admin on Settings → Club settings. Stored in the
// site-settings[-stage] table: id "club" holds the rules, id "club-terms#<n>" each
// published version of the terms. Server-only.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { getAllProductsWithVariants } from "@/app/repositories/products.repository";

const docClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID || "", secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "" },
  }),
);
const SETTINGS_TABLE = process.env.APP_ENV === "prod" ? "site-settings" : "site-settings-stage";

export type ClubOccasion = { id: string; name: string; enabled: boolean };

export type ClubSettings = {
  programme: { open: boolean; weeklyCap: number; featureDays: number };
  eligibility: { minFollowers: number; leadDaysMin: number; leadDaysMax: number; reapplyDays: number; adultsOnly: boolean };
  occasions: ClubOccasion[];
  gift: { productIds: string[]; nameLabel: boolean; nameMaxLength: number };
  posting: {
    instagramHandle: string;
    postWithinHours: number;
    keepUpDays: number;
    markNotPostedAfterDays: number;
    hashtags: string[];
    storyScreenshotRequired: boolean;
    autoBlockNoPost: boolean;
  };
  featuring: { requireApproval: boolean; homepageWall: boolean; wallSize: number; shareImages: boolean };
  termsVersion: number;
};

export type ClubTerms = { version: number; body: string };

// A perfume that can be picked as the gift: the product's first visible size.
export type ClubGift = { productId: string; variantId: string; sku: string; name: string; slug: string; size: string; price: number; image: string; inStock: boolean };

export type ClubData = { settings: ClubSettings; terms: ClubTerms | null; gifts: ClubGift[] };

// Same defaults as the admin (lib/club.ts there), used for anything missing from the row.
const DEFAULTS: ClubSettings = {
  programme: { open: false, weeklyCap: 25, featureDays: 30 },
  eligibility: { minFollowers: 2000, leadDaysMin: 6, leadDaysMax: 60, reapplyDays: 30, adultsOnly: true },
  occasions: [],
  gift: { productIds: [], nameLabel: true, nameMaxLength: 10 },
  posting: {
    instagramHandle: "@hickokuperfume",
    postWithinHours: 24,
    keepUpDays: 30,
    markNotPostedAfterDays: 5,
    hashtags: ["#hickoku", "#gifted"],
    storyScreenshotRequired: true,
    autoBlockNoPost: true,
  },
  featuring: { requireApproval: true, homepageWall: true, wallSize: 10, shareImages: true },
  termsVersion: 0,
};

let cache: { at: number; data: ClubData | null } | null = null;
const TTL = 30_000; // admin changes show within 30 seconds, like offers

/**
 * The Club's rules, current terms and gift perfumes. null until the Club has been set up
 * in the admin (no saved row), so the pages can 404 on an environment that hasn't got it.
 */
export async function getClub(fresh = false): Promise<ClubData | null> {
  if (!fresh && cache && Date.now() - cache.at < TTL) return cache.data;
  const res = await docClient.send(new GetCommand({ TableName: SETTINGS_TABLE, Key: { id: "club" } }));
  let data: ClubData | null = null;
  if (res.Item) {
    const s = res.Item as any;
    const settings: ClubSettings = {
      programme: { ...DEFAULTS.programme, ...(s.programme || {}) },
      eligibility: { ...DEFAULTS.eligibility, ...(s.eligibility || {}) },
      occasions: Array.isArray(s.occasions) ? s.occasions : [],
      gift: { ...DEFAULTS.gift, ...(s.gift || {}) },
      posting: { ...DEFAULTS.posting, ...(s.posting || {}) },
      featuring: { ...DEFAULTS.featuring, ...(s.featuring || {}) },
      termsVersion: Number(s.termsVersion) || 0,
    };
    let terms: ClubTerms | null = null;
    if (settings.termsVersion) {
      const t = await docClient.send(new GetCommand({ TableName: SETTINGS_TABLE, Key: { id: `club-terms#${settings.termsVersion}` } }));
      if (t.Item) terms = { version: Number(t.Item.version), body: String(t.Item.body || "") };
    }
    const products = await getAllProductsWithVariants();
    const gifts: ClubGift[] = [];
    for (const id of settings.gift.productIds) {
      const p = products.find((x) => String(x.id) === String(id));
      const v = p?.variants.find((x) => x.status !== false);
      if (!p || !v || p.hidden) continue;
      gifts.push({ productId: String(p.id), variantId: v.id, sku: v.sku, name: p.name, slug: p.slug, size: v.size, price: Number(v.price) || 0, image: p.images?.[0] || "", inStock: Number(v.stock) > 0 });
    }
    data = { settings, terms, gifts };
  }
  cache = { at: Date.now(), data };
  return data;
}

/** Applications are open only when the admin switched them on and everything needed is there. */
export function isOpen(c: ClubData): boolean {
  return c.settings.programme.open && !!c.terms && c.gifts.some((g) => g.inStock) && c.settings.occasions.some((o) => o.enabled);
}
