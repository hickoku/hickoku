// Party date window for Hickoku Club, in India time. Browser-safe (used by the form and the server).

// ---- Dates: the party date window, in India time ----

const IST_OFFSET = 330 * 60_000;
/** Today's date in India as YYYY-MM-DD. */
export function todayIST(now = new Date()): string {
  return new Date(now.getTime() + IST_OFFSET).toISOString().slice(0, 10);
}
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
/** First and last party dates someone can apply for today. */
export function dateWindow(s: { eligibility: { leadDaysMin: number; leadDaysMax: number } }, now = new Date()): { first: string; last: string } {
  const today = todayIST(now);
  return { first: addDays(today, s.eligibility.leadDaysMin), last: addDays(today, s.eligibility.leadDaysMax) };
}
