/**
 * Normalisation rules for Meta customer matching, shared by browser and server
 * so both produce identical hashes. https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */

/** Lowercase, trimmed. */
export const normText = (v?: string) => (v ? v.trim().toLowerCase() : undefined) || undefined;

/** Lowercase, no spaces or punctuation (city, state). */
export const normPlace = (v?: string) =>
  (v ? v.toLowerCase().replace(/[^a-z0-9]/g, "") : undefined) || undefined;

/** Digits with country code; 10-digit Indian numbers get 91. */
export function normPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return undefined;
  return digits.length === 10 ? `91${digits}` : digits;
}

/** ISO 3166-1 alpha-2, lowercase. Defaults to India. */
export function normCountry(country?: string): string {
  if (!country) return "in";
  const c = country.trim().toLowerCase();
  return c === "india" || c === "in" || c === "ind" ? "in" : c.slice(0, 2);
}

/** Postal code: lowercase, no spaces. */
export const normZip = (v?: string) =>
  (v ? v.toLowerCase().replace(/\s+/g, "") : undefined) || undefined;

export interface CustomerFields {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/** Normalised (not yet hashed) values keyed by Meta's parameter names. */
export function normalizeCustomer(c: CustomerFields): Record<string, string> {
  const out: Record<string, string | undefined> = {
    em: normText(c.email),
    ph: normPhone(c.phone),
    fn: normText(c.firstName),
    ln: normText(c.lastName),
    ct: normPlace(c.city),
    st: normPlace(c.state),
    zp: normZip(c.zipCode),
    country: normCountry(c.country),
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => !!v)) as Record<string, string>;
}

export const VISITOR_COOKIE = "hk_vid";
export const MATCHING_STORAGE_KEY = "hk_am";
