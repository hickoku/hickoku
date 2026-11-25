import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { appByToken, statusView } from "@/lib/club/status";
import { StatusPage } from "./StatusPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your application · Hickoku Club", robots: { index: false, follow: false } };

export default async function ClubStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const app = await appByToken(token);
  if (!app) notFound();
  return <StatusPage view={await statusView(app, token)} />;
}
