import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getClub, isOpen } from "@/lib/club/settings";
import { Header } from "../../components/Header";
import { ApplyFlow } from "./ApplyFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply · Hickoku Club",
  description: "Apply for a free Hickoku perfume for your occasion.",
  robots: { index: false },
};

export default async function ClubApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const club = await getClub();
  if (!club) notFound();
  const sp = await searchParams;

  if (!isOpen(club)) {
    return (
      <div className="min-h-screen bg-[#FBF7F0]">
        <Header />
        <main className="max-w-xl mx-auto px-4 pt-36 pb-20 text-center">
          <h1 className="text-3xl font-bold text-[#1a0f0a]">Back soon</h1>
          <p className="mt-3 text-gray-600">
            Hickoku Club isn&apos;t taking applications right now. Follow {club.settings.posting.instagramHandle} on Instagram to hear when we open again.
          </p>
          <Link href="/club" className="mt-8 inline-flex h-12 px-6 items-center rounded-full bg-[#1a0f0a] text-white font-semibold">
            Back to Hickoku Club
          </Link>
        </main>
      </div>
    );
  }

  return (
    <ApplyFlow
      settings={club.settings}
      terms={club.terms!}
      gifts={club.gifts}
      initial={{ forWhom: sp.for === "self" ? "self" : "friend", occasionId: sp.occasion || "", partyDate: sp.date || "" }}
    />
  );
}
