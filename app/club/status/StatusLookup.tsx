"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "../../components/Header";

const WHATSAPP = "https://wa.me/9360922878?text=" + encodeURIComponent("Hi, I need help with my Hickoku Club application");

export function StatusLookup() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^(\+?91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ""))) return setError("Enter the 10-digit WhatsApp number you applied with.");
    if (!date) return setError("Pick the occasion date.");
    setBusy(true);
    try {
      const res = await fetch("/api/club/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, date }) });
      const data = await res.json();
      if (!data.success) return setError(data.error);
      router.push(`/club/status/${data.token}`);
    } catch {
      setError("Couldn't reach us. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1a0f0a]">
      <Header />
      <main className="max-w-md mx-auto px-4 pt-28 md:pt-36 pb-20">
        <Link href="/club" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Hickoku Club
        </Link>
        <h1 className="mt-6 text-3xl font-bold">Check your application</h1>
        <p className="mt-2 text-gray-600">See where your gift is, from review to your post going live.</p>
        <form onSubmit={submit} className="mt-8 bg-white rounded-2xl border border-black/5 p-6 space-y-5" noValidate>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1.5">
              WhatsApp number you applied with
            </label>
            <div className="flex">
              <span className="h-12 px-3 flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600">+91</span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-r-xl border border-gray-300 bg-white outline-none focus:border-[#1a0f0a]"
              />
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-semibold mb-1.5">
              Occasion date
            </label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white outline-none focus:border-[#1a0f0a]" />
            <p className="mt-1.5 text-xs text-gray-500">Planned a surprise? Use your own number and the party date.</p>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full h-12 rounded-full bg-[#1a0f0a] text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70">
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} Check status
          </button>
          <p className="text-xs text-gray-500 text-center">No account or password needed. We remember this phone next time.</p>
        </form>
        <p className="mt-6 text-sm text-gray-600 text-center">
          Can&apos;t find it?{" "}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
            Message us on WhatsApp
          </a>{" "}
          with your HC number.
        </p>
      </main>
    </div>
  );
}
