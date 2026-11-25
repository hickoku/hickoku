import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getClub } from "@/lib/club/settings";
import { appByToken, STATUS_COOKIE } from "@/lib/club/status";
import { StatusLookup } from "./StatusLookup";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Check your application · Hickoku Club", robots: { index: false } };

export default async function ClubStatusLookupPage() {
  if (!(await getClub())) notFound();
  // Same phone as last time: open the status straight away.
  const token = (await cookies()).get(STATUS_COOKIE)?.value;
  if (token && (await appByToken(token))) redirect(`/club/status/${token}`);
  return <StatusLookup />;
}
