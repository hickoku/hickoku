import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClub, isOpen } from "@/lib/club/settings";
import { ClubLanding } from "./ClubLanding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hickoku Club · A free perfume for your occasion",
  description: "Apply for a free Hickoku perfume for a birthday, anniversary or any occasion. Unwrap it on camera, post the Reel, and get featured.",
  alternates: { canonical: "/club" },
};

export default async function ClubPage() {
  const club = await getClub();
  // Not set up in the admin for this environment yet.
  if (!club) notFound();
  return <ClubLanding open={isOpen(club)} settings={club.settings} gifts={club.gifts} />;
}
