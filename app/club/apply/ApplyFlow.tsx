"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Gift, Loader2, X } from "lucide-react";
import { Header } from "../../components/Header";
import type { ClubGift, ClubSettings, ClubTerms } from "@/lib/club/settings";
import { addDays, dateWindow, todayIST } from "@/lib/club/dates";

const TERRACOTTA = "#B33D14";
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const dayParts = (ymd: string) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  const o = { timeZone: "UTC" } as const;
  return { wd: d.toLocaleDateString("en-IN", { ...o, weekday: "short" }), day: d.getUTCDate(), mon: d.toLocaleDateString("en-IN", { ...o, month: "short" }) };
};
const longDay = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

type Form = {
  forWhom: "friend" | "self";
  recipientName: string;
  occasionId: string;
  partyDate: string;
  productId: string;
  label: boolean;
  labelName: string;
  instagram: string;
  whatsapp: string;
  email: string;
  promise: boolean;
};
type Address = { firstName: string; lastName: string; phone: string; street: string; city: string; state: string; zipCode: string };
type Done = { id: string; instagram: string; statusToken: string };

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

function Step({ n, title, children, id }: { n: number; title: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6" aria-labelledby={id || `step-${n}`}>
      <h2 id={id || `step-${n}`} className="flex items-center gap-3 text-lg font-bold">
        <span className="w-7 h-7 rounded-full bg-[#1a0f0a] text-white text-sm flex items-center justify-center shrink-0">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800 mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

const inputCls = (bad?: boolean) =>
  `w-full h-12 px-4 rounded-xl border bg-white text-base outline-none focus:ring-2 focus:ring-[#1a0f0a]/20 ${bad ? "border-red-500" : "border-gray-300 focus:border-[#1a0f0a]"}`;

const chip = (on: boolean, disabled = false) =>
  `transition-colors border ${disabled ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200" : on ? "bg-[#1a0f0a] text-white border-[#1a0f0a]" : "bg-white border-gray-300 hover:border-gray-500"}`;

export function ApplyFlow({
  settings,
  terms,
  gifts,
  initial,
}: {
  settings: ClubSettings;
  terms: ClubTerms;
  gifts: ClubGift[];
  initial: { forWhom: "friend" | "self"; occasionId: string; partyDate: string };
}) {
  const occasions = settings.occasions.filter((o) => o.enabled);
  const win = useMemo(() => dateWindow(settings), [settings]);
  const today = useMemo(() => todayIST(), []);
  // Today up to the last allowed date; the days before the window show greyed out.
  const days = useMemo(() => {
    const out: string[] = [];
    for (let d = today; d <= win.last; d = addDays(d, 1)) out.push(d);
    return out;
  }, [today, win.last]);
  const handle = settings.posting.instagramHandle;
  const maxLabel = settings.gift.nameMaxLength;
  const firstGift = gifts.find((g) => g.inStock);

  const [stage, setStage] = useState<"form" | "delivery" | "done">("form");
  const [f, setF] = useState<Form>({
    forWhom: initial.forWhom,
    recipientName: "",
    occasionId: occasions.some((o) => o.id === initial.occasionId) ? initial.occasionId : "",
    partyDate: initial.partyDate >= win.first && initial.partyDate <= win.last ? initial.partyDate : "",
    productId: gifts.filter((g) => g.inStock).length === 1 ? firstGift!.productId : "",
    label: settings.gift.nameLabel,
    labelName: "",
    instagram: "",
    whatsapp: "",
    email: "",
    promise: false,
  });
  const [labelTouched, setLabelTouched] = useState(false);
  const [addr, setAddr] = useState<Address>({ firstName: "", lastName: "", phone: "", street: "", city: "", state: "", zipCode: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const dateRow = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const setA = (k: keyof Address, v: string) => {
    setAddr((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // The label follows the name until it's edited by hand.
  const firstWord = f.recipientName.trim().split(/\s+/)[0] || "";
  useEffect(() => {
    if (!labelTouched) setF((p) => ({ ...p, labelName: firstWord.replace(/[^\p{L}]/gu, "").slice(0, maxLabel) }));
  }, [firstWord, labelTouched, maxLabel]);

  // Bring the chosen (or first allowed) date into view in the scrolling row.
  useEffect(() => {
    // Scroll only the row (scrollIntoView would also scroll the page).
    const row = dateRow.current;
    const el = row?.querySelector<HTMLElement>(`[data-day="${f.partyDate || win.first}"]`);
    if (row && el) row.scrollLeft = Math.max(0, el.offsetLeft - row.offsetLeft - 8);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const gift = gifts.find((g) => g.productId === f.productId);
  const occasion = occasions.find((o) => o.id === f.occasionId);
  const shipBy = f.partyDate ? addDays(f.partyDate, -1) : "";

  function check(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.recipientName.trim()) e.recipientName = f.forWhom === "self" ? "Add your name" : "Add their name";
    if (!f.occasionId) e.occasionId = "Pick an occasion";
    if (!f.partyDate) e.partyDate = "Pick the party date";
    if (!f.productId) e.productId = "Pick the perfume";
    if (f.label && settings.gift.nameLabel) {
      if (!f.labelName.trim()) e.labelName = "Add the name for the label, or switch the label off";
      else if (f.labelName.replace(/\s/g, "").length > maxLabel) e.labelName = `The label fits ${maxLabel} letters`;
    }
    if (!/^@?[a-zA-Z0-9._]{1,30}$/.test(f.instagram.trim())) e.instagram = "Add your Instagram username";
    if (!/^(\+?91)?[6-9]\d{9}$/.test(f.whatsapp.replace(/[\s-]/g, ""))) e.whatsapp = "Add a 10-digit WhatsApp number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Add a valid email";
    if (!f.promise) e.promise = "Make the pinky promise first";
    return e;
  }

  function focusFirst(e: Record<string, string>) {
    const first = Object.keys(e).find((k) => e[k]);
    if (first) document.getElementById(`f-${first}`)?.focus();
  }

  function next() {
    const e = check();
    setErrors(e);
    if (Object.values(e).some(Boolean)) return focusFirst(e);
    // Prefill delivery from the form.
    setAddr((a) => ({
      ...a,
      firstName: a.firstName || (f.forWhom === "self" ? firstWord : ""),
      lastName: a.lastName || (f.forWhom === "self" ? f.recipientName.trim().split(/\s+/).slice(1).join(" ") : ""),
      phone: a.phone || f.whatsapp.replace(/\D/g, "").slice(-10),
    }));
    setServerError("");
    setStage("delivery");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit() {
    const e: Record<string, string> = {};
    if (!addr.firstName.trim()) e.firstName = "Add the first name";
    if (!/^(\+?91)?[6-9]\d{9}$/.test(addr.phone.replace(/[\s-]/g, ""))) e.phone = "Add a 10-digit phone number";
    if (addr.street.trim().length < 8) e.street = "Add the full address";
    if (!/^[1-9]\d{5}$/.test(addr.zipCode.trim())) e.zipCode = "Add a 6-digit PIN code";
    if (!addr.city.trim()) e.city = "Add the city";
    if (!addr.state) e.state = "Pick the state";
    setErrors(e);
    if (Object.values(e).some(Boolean)) return focusFirst(e);

    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/club/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forWhom: f.forWhom,
          recipientName: f.recipientName,
          occasionId: f.occasionId,
          partyDate: f.partyDate,
          productId: f.productId,
          labelName: f.label && settings.gift.nameLabel ? f.labelName : "",
          instagram: f.instagram,
          whatsapp: f.whatsapp,
          email: f.email,
          adultConfirmed: f.promise,
          acceptedTerms: f.promise,
          termsVersion: terms.version,
          address: { ...addr, email: f.email },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        // Errors about the first step's fields send the shopper back there.
        const formFields = ["recipientName", "occasionId", "partyDate", "productId", "labelName", "instagram", "whatsapp", "email", "promise", "terms"];
        if (data.field && formFields.includes(data.field)) {
          setStage("form");
          setErrors({ [data.field === "terms" ? "promise" : data.field]: data.error });
          if (data.field === "terms") set("promise", false);
          setTimeout(() => document.getElementById(`f-${data.field === "terms" ? "promise" : data.field}`)?.focus(), 50);
        } else if (data.field) {
          setErrors({ [data.field]: data.error });
          document.getElementById(`f-${data.field}`)?.focus();
        } else setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setDone({ id: data.id, instagram: data.instagram, statusToken: data.statusToken });
      setStage("done");
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setServerError("Couldn't reach us. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `f-${k}-error` } : {});

  // ---------- Summary card ("Your gift, live") ----------
  const summary = (
    <aside className="rounded-2xl overflow-hidden bg-[#1a0f0a] text-[#FBF3DF] lg:sticky lg:top-28" aria-label="Your gift">
      <div className="p-5 flex gap-4 items-center">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0 flex items-center justify-center">
          {gift?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={gift.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <Gift className="w-8 h-8 opacity-60" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-70">Free · ₹0</p>
          <p className="font-semibold text-lg truncate">{gift ? `${gift.name} · ${gift.size}` : "Pick your perfume"}</p>
          {f.label && settings.gift.nameLabel && f.labelName && <p className="text-sm opacity-80 truncate">Label “{f.labelName}”</p>}
        </div>
      </div>
      <p className="px-5 pb-5 text-[15px] leading-relaxed opacity-90">
        {f.forWhom === "self" ? "Your" : f.recipientName.trim() ? `${firstWord}'s` : "Their"} <strong>{occasion?.name.toLowerCase() || "occasion"}</strong>
        {f.partyDate && (
          <>
            {" "}
            on <strong>{longDay(f.partyDate)}</strong>
          </>
        )}
        {gift && (
          <>
            {" "}
            with <strong>{gift.name}</strong>
          </>
        )}
        .
      </p>
      <ul className="grid grid-cols-4 border-t border-white/10 text-center text-[11px] font-semibold">
        {[
          ["Occasion", !!occasion],
          ["Date", !!f.partyDate],
          ["Perfume", !!gift],
          ["Promise", f.promise],
        ].map(([t, ok]) => (
          <li key={t as string} className={`py-3 flex flex-col items-center gap-1 ${ok ? "text-white" : "opacity-50"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center ${ok ? "bg-green-500" : "border border-white/40"}`}>{ok && <Check className="w-3 h-3" aria-hidden="true" />}</span>
            {t as string}
            <span className="sr-only">{ok ? "done" : "to do"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1a0f0a]">
      <Header />
      <div ref={topRef} className="max-w-6xl mx-auto px-4 pt-28 md:pt-32 pb-20 scroll-mt-24">
        <Link href="/club" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Hickoku Club
        </Link>

        {stage === "done" && done ? (
          <main className="max-w-xl mx-auto mt-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-700" aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-4xl font-bold">
              You&apos;re in <span className="font-serif italic font-normal" style={{ color: TERRACOTTA }}>the queue!</span>
            </h1>
            <p className="mt-3 text-gray-700">We&apos;ll review @{done.instagram} and reply on WhatsApp within 48 hours.</p>
            <div className="mt-8 bg-white rounded-2xl border border-black/5 p-6 text-left">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-500">Application</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-2xl font-bold tabular-nums">{done.id}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(done.id).then(() => setCopied(true))}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-gray-300 text-sm font-semibold"
                >
                  {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">Keep this number. Nothing to pay, and your shopping bag is untouched.</p>
              <Link href={`/club/status/${done.statusToken}`} className="mt-4 inline-flex h-11 px-5 items-center gap-2 rounded-full bg-[#1a0f0a] text-white text-sm font-semibold">
                Check status <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <p className="mt-2 text-xs text-gray-500">Your private status page. Bookmark it, or open Hickoku Club → Check status with your WhatsApp number.</p>
            </div>
            <div className="mt-4 rounded-2xl p-6 text-left text-white" style={{ background: TERRACOTTA }}>
              <p className="text-xs font-bold tracking-[0.18em] uppercase opacity-80">Optional · faster review</p>
              <p className="mt-2 leading-relaxed">
                DM <strong>{done.id}</strong> to <strong>{handle}</strong> from your account. It helps us confirm it&apos;s really you.
              </p>
              <a
                href={`https://ig.me/m/${handle.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-[#1a0f0a] text-sm font-semibold"
              >
                Open Instagram <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
            <Link href="/" className="mt-8 inline-flex h-12 px-6 items-center rounded-full border border-gray-300 font-semibold">
              Continue shopping
            </Link>
          </main>
        ) : (
          <>
            <div className="mt-4 mb-8">
              <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TERRACOTTA }}>
                Free gift · no payment · step {stage === "form" ? 1 : 2} of 2
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold">{stage === "form" ? "Plan the gift" : "Where should we deliver?"}</h1>
              <p className="mt-2 text-gray-600">{stage === "form" ? "Takes about two minutes." : "Add the address and you're done. Nothing to pay."}</p>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
              <div className="order-2 lg:order-1 space-y-4 min-w-0">
                {stage === "form" ? (
                  <>
                    <Step n={1} title="Who's it for?">
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Who's it for?">
                        {(
                          [
                            ["friend", "Surprise a friend"],
                            ["self", "It's my party"],
                          ] as const
                        ).map(([v, t]) => (
                          <button key={v} type="button" role="radio" aria-checked={f.forWhom === v} onClick={() => set("forWhom", v)} className={`h-12 rounded-xl font-semibold ${chip(f.forWhom === v)}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Field
                          id="f-recipientName"
                          label={f.forWhom === "self" ? "Your name" : "Their name"}
                          error={errors.recipientName}
                          hint={f.forWhom === "friend" ? "Only for the gift card and label. We never contact them." : undefined}
                        >
                          <input id="f-recipientName" className={inputCls(!!errors.recipientName)} value={f.recipientName} maxLength={40} autoComplete={f.forWhom === "self" ? "name" : "off"} onChange={(e) => set("recipientName", e.target.value)} {...err("recipientName")} />
                        </Field>
                      </div>
                    </Step>

                    <Step n={2} title="What's the occasion?">
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Occasion" id="f-occasionId" tabIndex={-1}>
                        {occasions.map((o) => (
                          <button key={o.id} type="button" role="radio" aria-checked={f.occasionId === o.id} onClick={() => set("occasionId", o.id)} className={`h-10 px-4 rounded-full text-sm font-medium ${chip(f.occasionId === o.id)}`}>
                            {o.name}
                          </button>
                        ))}
                      </div>
                      {errors.occasionId && (
                        <p id="f-occasionId-error" className="mt-2 text-sm text-red-600">
                          {errors.occasionId}
                        </p>
                      )}
                    </Step>

                    <Step n={3} title="When's the party?">
                      <div ref={dateRow} className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x" role="radiogroup" aria-label="Party date" id="f-partyDate" tabIndex={-1}>
                        {days.map((d) => {
                          const p = dayParts(d);
                          const off = d < win.first;
                          return (
                            <button
                              key={d}
                              data-day={d}
                              type="button"
                              role="radio"
                              aria-checked={f.partyDate === d}
                              aria-label={`${longDay(d)}${off ? ", too soon" : ""}`}
                              disabled={off}
                              onClick={() => set("partyDate", d)}
                              className={`snap-start shrink-0 w-16 py-2 rounded-xl flex flex-col items-center ${chip(f.partyDate === d, off)}`}
                            >
                              <span className="text-[11px] font-medium opacity-70">{p.wd}</span>
                              <span className="text-xl font-bold leading-tight">{p.day}</span>
                              <span className="text-[11px] font-medium opacity-70">{p.mon}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className={`mt-2 text-sm ${errors.partyDate ? "text-red-600" : "text-gray-600"}`} id="f-partyDate-error">
                        {errors.partyDate ||
                          (f.partyDate
                            ? `We'll get it to you by ${longDay(shipBy)}.`
                            : `The next ${settings.eligibility.leadDaysMin - 1} days are too soon to ship. Up to ${settings.eligibility.leadDaysMax} days ahead.`)}
                      </p>
                    </Step>

                    <Step n={4} title="Pick the perfume">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="radiogroup" aria-label="Perfume" id="f-productId" tabIndex={-1}>
                        {gifts.map((g) => (
                          <button
                            key={g.productId}
                            type="button"
                            role="radio"
                            aria-checked={f.productId === g.productId}
                            disabled={!g.inStock}
                            onClick={() => set("productId", g.productId)}
                            className={`relative p-2 rounded-xl text-left border-2 transition-colors ${!g.inStock ? "opacity-40 cursor-not-allowed border-transparent" : f.productId === g.productId ? "border-[#1a0f0a]" : "border-transparent hover:border-gray-300"} bg-white`}
                          >
                            <span className="block aspect-square rounded-lg overflow-hidden bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {g.image && <img src={g.image} alt="" className="w-full h-full object-cover" />}
                            </span>
                            <span className="block mt-2 font-semibold text-sm">{g.name}</span>
                            <span className="block text-xs text-gray-500">{g.inStock ? `${g.size} · ${inr(g.price)} free` : "Out of stock"}</span>
                            {f.productId === g.productId && (
                              <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1a0f0a] text-white flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      {errors.productId && (
                        <p id="f-productId-error" className="mt-2 text-sm text-red-600">
                          {errors.productId}
                        </p>
                      )}
                      {settings.gift.nameLabel && (
                        <div className="mt-5 rounded-xl bg-[#FBF7F0] p-4">
                          <label className="flex items-center justify-between gap-4 cursor-pointer">
                            <span>
                              <span className="block font-semibold">Put a name on the bottle</span>
                              <span className="block text-sm text-gray-600">A handwritten-style name label. Free.</span>
                            </span>
                            <input type="checkbox" className="w-5 h-5 accent-[#1a0f0a]" checked={f.label} onChange={(e) => set("label", e.target.checked)} />
                          </label>
                          {f.label && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-end">
                              <div className="flex-1">
                                <Field id="f-labelName" label={`Name on the label (up to ${maxLabel} letters)`} error={errors.labelName}>
                                  <input
                                    id="f-labelName"
                                    className={inputCls(!!errors.labelName)}
                                    value={f.labelName}
                                    maxLength={maxLabel + 3}
                                    onChange={(e) => {
                                      setLabelTouched(true);
                                      set("labelName", e.target.value);
                                    }}
                                    {...err("labelName")}
                                  />
                                </Field>
                              </div>
                              <span className="self-start sm:self-auto -rotate-3 bg-[#FBF3DF] border border-[#E9D5A8] rounded-md px-4 py-2 font-serif italic text-2xl min-w-24 text-center" aria-hidden="true">
                                {f.labelName || "Name"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Step>

                    <Step n={5} title="Your details">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <Field id="f-instagram" label="Instagram" error={errors.instagram} hint={`Public account with ${settings.eligibility.minFollowers.toLocaleString("en-IN")}+ followers. You post the unwrap, so it's your Instagram we need.`}>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">
                                @
                              </span>
                              <input
                                id="f-instagram"
                                className={`${inputCls(!!errors.instagram)} pl-9`}
                                value={f.instagram}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                maxLength={31}
                                placeholder="yourhandle"
                                onChange={(e) => set("instagram", e.target.value.replace(/^@+/, "").trim())}
                                {...err("instagram")}
                              />
                            </div>
                          </Field>
                        </div>
                        <Field id="f-whatsapp" label="WhatsApp" error={errors.whatsapp}>
                          <input id="f-whatsapp" type="tel" inputMode="numeric" autoComplete="tel" className={inputCls(!!errors.whatsapp)} value={f.whatsapp} maxLength={14} placeholder="10-digit number" onChange={(e) => set("whatsapp", e.target.value)} {...err("whatsapp")} />
                        </Field>
                        <Field id="f-email" label="Email" error={errors.email}>
                          <input id="f-email" type="email" autoComplete="email" className={inputCls(!!errors.email)} value={f.email} maxLength={120} onChange={(e) => set("email", e.target.value)} {...err("email")} />
                        </Field>
                      </div>
                    </Step>

                    <Step n={6} title="The deal">
                      <ol className="space-y-3">
                        <li className="flex gap-3">
                          <span className="font-bold" style={{ color: TERRACOTTA }}>
                            1
                          </span>
                          <span>
                            Follow{" "}
                            <a href={`https://instagram.com/${handle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                              {handle}
                            </a>{" "}
                            before the party.
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold" style={{ color: TERRACOTTA }}>
                            2
                          </span>
                          <span>Film the unwrap at the party.</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold" style={{ color: TERRACOTTA }}>
                            3
                          </span>
                          <span>
                            Within {settings.posting.postWithinHours} hours, post it as a Reel{settings.posting.storyScreenshotRequired ? " + Story" : ""}. Tag {handle}, add {settings.posting.hashtags.join(" ")}. Keep it up for {settings.posting.keepUpDays} days. Caption is yours.
                          </span>
                        </li>
                      </ol>
                      <label className={`mt-5 flex items-start gap-3 rounded-xl p-4 cursor-pointer border ${errors.promise ? "border-red-500 bg-red-50" : "border-gray-200 bg-[#FBF7F0]"}`}>
                        <input id="f-promise" type="checkbox" className="mt-0.5 w-5 h-5 accent-[#1a0f0a] shrink-0" checked={f.promise} onChange={(e) => set("promise", e.target.checked)} {...err("promise")} />
                        <span>
                          <span className="block font-semibold">Pinky promise.</span>
                          <span className="block text-sm text-gray-700">
                            {settings.eligibility.adultsOnly ? "I'm 18+ and accept the " : "I accept the "}
                            <button type="button" onClick={(e) => (e.preventDefault(), setTermsOpen(true))} className="font-semibold underline underline-offset-4">
                              Hickoku Club terms
                            </button>
                            .
                          </span>
                        </span>
                      </label>
                      {errors.promise && (
                        <p id="f-promise-error" className="mt-2 text-sm text-red-600">
                          {errors.promise}
                        </p>
                      )}
                    </Step>

                    <div className="pt-2">
                      <button type="button" onClick={next} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#1a0f0a] text-white font-semibold text-lg">
                        Next: delivery <ArrowRight className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <p className="mt-3 text-sm text-gray-600">Next you add the delivery address. Nothing to pay.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <section className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6" aria-labelledby="addr">
                      <h2 id="addr" className="text-lg font-bold">
                        Delivery address
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {f.forWhom === "friend" ? "We deliver to you, so you can hand it over as a surprise." : "Where should we send your gift?"} It arrives before {longDay(f.partyDate)}.
                      </p>
                      <div className="mt-5 grid sm:grid-cols-2 gap-4">
                        <Field id="f-firstName" label="First name" error={errors.firstName}>
                          <input id="f-firstName" autoComplete="given-name" className={inputCls(!!errors.firstName)} value={addr.firstName} onChange={(e) => setA("firstName", e.target.value)} {...err("firstName")} />
                        </Field>
                        <Field id="f-lastName" label="Last name">
                          <input id="f-lastName" autoComplete="family-name" className={inputCls()} value={addr.lastName} onChange={(e) => setA("lastName", e.target.value)} />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field id="f-phone" label="Phone for delivery" error={errors.phone}>
                            <input id="f-phone" type="tel" inputMode="numeric" autoComplete="tel" className={inputCls(!!errors.phone)} value={addr.phone} maxLength={14} onChange={(e) => setA("phone", e.target.value)} {...err("phone")} />
                          </Field>
                        </div>
                        <div className="sm:col-span-2">
                          <Field id="f-street" label="Address" error={errors.street} hint="House or flat, building, street, area, landmark">
                            <textarea id="f-street" rows={2} autoComplete="street-address" className={`${inputCls(!!errors.street)} h-auto py-3 resize-none`} value={addr.street} maxLength={300} onChange={(e) => setA("street", e.target.value)} {...err("street")} />
                          </Field>
                        </div>
                        <Field id="f-zipCode" label="PIN code" error={errors.zipCode}>
                          <input id="f-zipCode" inputMode="numeric" autoComplete="postal-code" className={inputCls(!!errors.zipCode)} value={addr.zipCode} maxLength={6} onChange={(e) => setA("zipCode", e.target.value.replace(/\D/g, ""))} {...err("zipCode")} />
                        </Field>
                        <Field id="f-city" label="City" error={errors.city}>
                          <input id="f-city" autoComplete="address-level2" className={inputCls(!!errors.city)} value={addr.city} onChange={(e) => setA("city", e.target.value)} {...err("city")} />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field id="f-state" label="State" error={errors.state}>
                            <select id="f-state" autoComplete="address-level1" className={inputCls(!!errors.state)} value={addr.state} onChange={(e) => setA("state", e.target.value)} {...err("state")}>
                              <option value="">Select state</option>
                              {STATES.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-black/5 p-5 sm:p-6" aria-label="Order summary">
                      <dl className="space-y-2 text-[15px]">
                        <div className="flex justify-between">
                          <dt>{gift ? `${gift.name} · ${gift.size}` : "Gift"}</dt>
                          <dd>{inr(gift?.price || 0)}</dd>
                        </div>
                        <div className="flex justify-between text-green-700">
                          <dt>Hickoku Club gift</dt>
                          <dd>−{inr(gift?.price || 0)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Delivery</dt>
                          <dd className="text-green-700">Free</dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                          <dt>Total</dt>
                          <dd>₹0</dd>
                        </div>
                      </dl>
                      <p className="mt-3 text-sm text-gray-600">We review every application. Your gift ships once it&apos;s approved. Your shopping bag is kept as it is.</p>
                    </section>

                    {serverError && (
                      <p role="alert" className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 text-sm">
                        {serverError}
                      </p>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                      <button type="button" onClick={() => setStage("form")} className="h-14 px-6 rounded-full border border-gray-300 font-semibold">
                        Edit gift
                      </button>
                      <button type="button" onClick={submit} disabled={submitting} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-[#1a0f0a] text-white font-semibold text-lg disabled:opacity-70">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
                        {submitting ? "Sending…" : "Place gift order · ₹0"}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="order-1 lg:order-2 min-w-0">{summary}</div>
            </div>
          </>
        )}
      </div>

      {termsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setTermsOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            className="bg-white w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === "Escape" && setTermsOpen(false)}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 id="terms-title" className="font-bold text-lg">
                Hickoku Club terms <span className="text-sm font-normal text-gray-500">v{terms.version}</span>
              </h2>
              <button type="button" autoFocus onClick={() => setTermsOpen(false)} aria-label="Close terms" className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{terms.body}</div>
            <div className="p-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  set("promise", true);
                  setTermsOpen(false);
                }}
                className="w-full h-12 rounded-full bg-[#1a0f0a] text-white font-semibold"
              >
                I accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
