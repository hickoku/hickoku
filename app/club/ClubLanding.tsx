"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Camera, Gift, Heart, Instagram, PartyPopper, Sparkles, Star, Truck, Plus, Minus } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import type { ClubGift, ClubSettings } from "@/lib/club/settings";
import { dateWindow } from "@/lib/club/dates";

const TERRACOTTA = "#B33D14";
const WHATSAPP = "https://wa.me/9360922878?text=" + encodeURIComponent("Hi, I have a question about Hickoku Club");

// Gift wrap: two halves of patterned paper with a ribbon. Tap to open and see a perfume;
// each new unwrap shows the next gift perfume (starting from a random one).
function GiftBox({ gifts }: { gifts: ClubGift[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  // Random start after the first render, so server and browser HTML match.
  useEffect(() => {
    if (gifts.length > 1) setIndex(Math.floor(Math.random() * gifts.length));
  }, [gifts.length]);
  const gift = gifts[index % Math.max(1, gifts.length)];
  const toggle = () => {
    // Swap the perfume while the box is closed, so the change isn't seen.
    if (open && gifts.length > 1) setTimeout(() => setIndex((i) => (i + 1) % gifts.length), 900);
    setOpen((o) => !o);
  };
  const paper = {
    backgroundColor: TERRACOTTA,
    backgroundImage: "radial-gradient(rgba(255,237,213,.45) 1.4px,transparent 1.6px),repeating-linear-gradient(45deg,#B33D14 0 16px,#A3360F 16px 32px)",
    backgroundSize: "20px 20px,auto",
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={open}
      aria-label={open ? "Wrap the gift again" : "Tap to unwrap the gift"}
      className="relative block w-full max-w-sm mx-auto aspect-[4/5] rounded-3xl overflow-hidden bg-[#1a0f0a] shadow-2xl cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
    >
      {/* What's inside */}
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
        {gift?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gift.image} alt={gift.name} className="w-3/4 aspect-square object-cover rounded-2xl" />
        ) : (
          <Gift className="w-24 h-24 text-amber-200" aria-hidden="true" />
        )}
        <span className="text-amber-100 text-xs font-bold tracking-[0.2em] uppercase">It&apos;s yours</span>
        {gift && (
          <span className="text-white text-lg font-semibold" aria-live="polite">
            {gift.name} · {gift.size}
          </span>
        )}
        {gifts.length > 1 && open && <span className="text-white/60 text-xs">Tap to wrap it again and try another</span>}
      </span>
      {/* Wrapping paper */}
      <span
        className="absolute inset-y-0 left-0 w-1/2 transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] shadow-[inset_0_0_60px_rgba(0,0,0,.25)]"
        style={{ ...paper, transform: open ? "translateX(-105%) rotate(-8deg)" : "none" }}
        aria-hidden="true"
      />
      <span
        className="absolute inset-y-0 right-0 w-1/2 transition-transform duration-[900ms] ease-[cubic-bezier(.7,0,.2,1)] shadow-[inset_0_0_60px_rgba(0,0,0,.25)]"
        style={{ ...paper, transform: open ? "translateX(105%) rotate(8deg)" : "none" }}
        aria-hidden="true"
      />
      {/* Ribbon + tag */}
      <span
        className={`absolute inset-0 transition-opacity duration-500 ${open ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      >
        <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r from-[#E9D5A8] via-[#FBF3DF] to-[#E9D5A8]" />
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-b from-[#E9D5A8] via-[#FBF3DF] to-[#E9D5A8]" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] bg-[#FBF3DF] rounded-lg px-5 py-3 shadow-xl text-left">
          <span className="block font-serif italic text-2xl text-[#1a0f0a]">For you</span>
          <span className="block text-[10px] font-bold tracking-[0.2em] text-[#7a5a2a] uppercase mt-1">From Hickoku</span>
        </span>
        <span className="absolute bottom-5 inset-x-0 text-center text-white/90 text-xs font-bold tracking-[0.2em] uppercase">Tap to unwrap</span>
      </span>
    </button>
  );
}

// "Your birthday." with the occasion word changing every couple of seconds.
function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (reduced || words.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length, reduced]);
  return (
    <span className="inline-block font-serif italic font-normal normal-case" style={{ color: TERRACOTTA }} aria-live="off">
      <span key={i} className="inline-block animate-[clubword_.5s_ease-out]">
        {words[i] || "occasion"}
      </span>
    </span>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold text-gray-900">
        {q}
        {open ? <Minus className="w-5 h-5 shrink-0" aria-hidden="true" /> : <Plus className="w-5 h-5 shrink-0" aria-hidden="true" />}
      </button>
      {open && <p className="pb-5 -mt-1 text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

const dayLabel = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export function ClubLanding({ open, settings, gifts }: { open: boolean; settings: ClubSettings; gifts: ClubGift[] }) {
  const occasions = settings.occasions.filter((o) => o.enabled);
  const words = occasions.map((o) => (/(party)$/i.test(o.name) ? o.name : o.name.toLowerCase()));
  const handle = settings.posting.instagramHandle;
  const tags = settings.posting.hashtags.join(" ");
  const { minFollowers, leadDaysMin, leadDaysMax, reapplyDays } = settings.eligibility;
  const followers = minFollowers.toLocaleString("en-IN");

  // "Plan it in 10 seconds"
  const [planOcc, setPlanOcc] = useState(occasions[0]?.id || "");
  const [planDate, setPlanDate] = useState("");
  const win = useMemo(() => dateWindow(settings), [settings]);
  const planOk = planDate && planDate >= win.first && planDate <= win.last;

  const steps = [
    { icon: Heart, title: "Pick the occasion", text: "Surprise someone, or treat yourself.", when: "1 min" },
    { icon: PartyPopper, title: "Apply early", text: `At least ${leadDaysMin} days before, so it arrives in time.`, when: "2 min" },
    { icon: Star, title: "We approve", text: "We check your profile and confirm on WhatsApp.", when: "48 hrs" },
    { icon: Gift, title: "Unwrap on camera", text: "At the party: unwrap it, wear it, react.", when: "On the day" },
    { icon: Instagram, title: "Post Reel + Story", text: `Tag ${handle}. Add ${tags}.`, when: `Within ${settings.posting.postWithinHours} hrs` },
    { icon: Sparkles, title: "Get featured", text: "Your Reel can be featured on hickoku.com.", when: "After review" },
  ];
  const rules = [
    { n: "01", title: `Follow ${handle}`, when: "Before your occasion", text: `Follow ${handle} on Instagram before the party. We check it before we approve.` },
    { n: "02", title: "Film the unwrap", when: "At the party", text: "Unwrap the gift on camera, wear it, and react. One honest take is perfect." },
    {
      n: "03",
      title: settings.posting.storyScreenshotRequired ? "Post Reel + Story" : "Post the Reel",
      when: `Within ${settings.posting.postWithinHours} hours`,
      text: `Post the video as a Reel${settings.posting.storyScreenshotRequired ? " and a Story" : ""}. Tag ${handle}. Caption is yours. Add ${tags}. Keep it up for ${settings.posting.keepUpDays} days.`,
    },
  ];
  const faqs = [
    { q: "Is it really free?", a: "Yes. The perfume and the delivery are on us. No deposit, no hidden charge, and no card needed." },
    { q: "Who can apply?", a: `Anyone ${settings.eligibility.adultsOnly ? "18+ " : ""}in India with a public Instagram account and ${followers}+ followers.` },
    { q: "How early should I apply?", a: `At least ${leadDaysMin} days and at most ${leadDaysMax} days before the occasion, so we have time to review and deliver.` },
    { q: "Can I apply for a friend?", a: "Yes. Pick “Surprise a friend”. We deliver to you, so you can hand it over at the party. You post the unwrap from your account, or they can post it from theirs." },
    { q: "What do I have to post?", a: `A Reel of the unwrap${settings.posting.storyScreenshotRequired ? " and a Story" : ""}, tagging ${handle} with ${tags}, within ${settings.posting.postWithinHours} hours of the occasion. The caption is yours.` },
    { q: "What if I don't post?", a: settings.posting.autoBlockNoPost ? "Then we can't take an application from you again. Life happens, so message us if something went wrong." : "Please message us on WhatsApp if something went wrong." },
    { q: "How often can I apply?", a: `Once every ${reapplyDays} days per Instagram account.` },
  ];

  const applyHref = (forWhom: "friend" | "self") => `/club/apply?for=${forWhom}`;
  const cta = (forWhom: "friend" | "self", label: string, primary: boolean) =>
    open ? (
      <Link
        href={applyHref(forWhom)}
        className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full font-semibold transition-colors ${primary ? "bg-[#1a0f0a] text-white hover:bg-black" : "bg-white text-[#1a0f0a] border border-[#1a0f0a]/20 hover:border-[#1a0f0a]"}`}
      >
        {label} {primary && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
      </Link>
    ) : null;

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1a0f0a]">
      <style>{`@keyframes clubword{from{opacity:0;transform:translateY(40%)}to{opacity:1;transform:none}}@keyframes clubmarq{to{transform:translateX(-50%)}}@media (prefers-reduced-motion: reduce){.club-marq{animation:none!important}}`}</style>
      <Header />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-28 pb-14 md:pt-36 md:pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TERRACOTTA }}>
            <Gift className="w-4 h-4" aria-hidden="true" /> Hickoku Club · free gifts
          </p>
          {/* Sized so the longest occasion ("Diwali party") stays on one line. */}
          <h1 className="mt-4 text-[2.05rem] sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-tight">
            <span className="whitespace-nowrap">
              Your <RotatingWord words={words} />.
            </span>
            <br />
            Our gift.
          </h1>
          <p className="mt-5 text-lg text-gray-700 max-w-md">A free Hickoku perfume for any occasion. Unwrap it on camera, post the Reel, and get featured.</p>
          {open ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {cta("friend", "Plan a surprise", true)}
              {cta("self", "It's my occasion", false)}
            </div>
          ) : (
            <div className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gray-200 text-gray-600 font-semibold" role="status">
              Back soon
            </div>
          )}
          <p className="mt-5 text-sm text-gray-600 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>No payment</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Truck className="w-4 h-4" aria-hidden="true" /> Free delivery
            </span>
            <span aria-hidden="true">·</span>
            <span>{followers}+ followers</span>
          </p>
          <p className="mt-3 text-sm">
            <Link href="/club/status" className="font-semibold underline underline-offset-4">
              Already applied? Check status →
            </Link>
          </p>
          {!open && <p className="mt-3 text-sm text-gray-600">We&apos;re not taking new applications right now. Follow {handle} to hear when we open again.</p>}
        </div>
        <GiftBox gifts={gifts.filter((g) => g.inStock).length ? gifts.filter((g) => g.inStock) : gifts} />
      </section>

      {/* Ticker */}
      <div className="overflow-hidden bg-[#1a0f0a] text-[#FBF3DF] py-3" aria-hidden="true">
        <div className="club-marq flex w-max gap-8 whitespace-nowrap text-sm font-bold tracking-[0.15em] uppercase animate-[clubmarq_30s_linear_infinite]">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-8">
              {["Free gift", "Any occasion", "Unwrap on camera", "Get featured", "Free delivery", "No payment"].map((t) => (
                <span key={t} className="flex gap-8">
                  {t} <span style={{ color: "#E9A07F" }}>✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24" aria-labelledby="how">
        <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TERRACOTTA }}>
          How it works
        </p>
        <h2 id="how" className="mt-2 text-3xl md:text-4xl font-bold">
          Six steps. Zero rupees.
        </h2>
        <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-400 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">{s.when}</span>
              </div>
              <s.icon className="mt-5 w-7 h-7" style={{ color: TERRACOTTA }} aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
              <p className="mt-1 text-gray-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Plan it */}
      {open && (
        <section className="bg-white border-y border-black/5" aria-labelledby="plan">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <h2 id="plan" className="text-3xl font-bold text-center">
              Plan it in 10 seconds
            </h2>
            <fieldset className="mt-8">
              <legend className="font-semibold mb-3">What&apos;s the occasion?</legend>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={planOcc === o.id}
                    onClick={() => setPlanOcc(o.id)}
                    className={`h-10 px-4 rounded-full border text-sm font-medium transition-colors ${planOcc === o.id ? "bg-[#1a0f0a] text-white border-[#1a0f0a]" : "bg-white border-gray-300 hover:border-gray-500"}`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-6">
              <label htmlFor="plan-date" className="block font-semibold mb-3">
                When is it?
              </label>
              <input
                id="plan-date"
                type="date"
                min={win.first}
                max={win.last}
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="h-12 px-4 rounded-xl border border-gray-300 bg-white w-full sm:w-auto"
              />
              <p className="mt-2 text-sm text-gray-600">
                Pick a date between {dayLabel(win.first)} and {dayLabel(win.last)}. Sooner than that is too soon for us to deliver.
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between rounded-2xl bg-[#FBF7F0] p-5">
              <p className="text-sm text-gray-700" aria-live="polite">
                {planOk ? (
                  <>
                    <strong>You&apos;re in time.</strong> Apply today for {occasions.find((o) => o.id === planOcc)?.name.toLowerCase()} on {dayLabel(planDate)}.
                  </>
                ) : planDate ? (
                  planDate < win.first ? "That's too soon for us to deliver. Pick a later date." : "That's a bit far ahead. Come back closer to the day."
                ) : (
                  "Pick a date to see if you're in time."
                )}
              </p>
              <Link
                href={planOk ? `/club/apply?occasion=${encodeURIComponent(planOcc)}&date=${planDate}` : "/club/apply"}
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#1a0f0a] text-white font-semibold shrink-0"
              >
                Apply for this date <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* The deal */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24" aria-labelledby="deal">
        <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TERRACOTTA }}>
          The deal
        </p>
        <h2 id="deal" className="mt-2 text-3xl md:text-4xl font-bold">
          3 rules. That&apos;s it.
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          {rules.map((r) => (
            <div key={r.n} className="rounded-2xl p-6 text-white" style={{ background: r.n === "02" ? "#1a0f0a" : TERRACOTTA }}>
              <span className="text-xs font-bold tracking-[0.2em] opacity-80">RULE {r.n}</span>
              <h3 className="mt-3 text-2xl font-bold">{r.title}</h3>
              <p className="mt-1 text-sm opacity-80">{r.when}</p>
              <p className="mt-5 leading-relaxed opacity-95">{r.text}</p>
              {r.n === "01" && (
                <a
                  href={`https://instagram.com/${handle.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-[#1a0f0a] text-sm font-semibold"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" /> Follow on Instagram
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-20" aria-labelledby="faq">
        <h2 id="faq" className="text-3xl font-bold">
          Good to know
        </h2>
        <div className="mt-6">
          {faqs.map((f) => (
            <Faq key={f.q} {...f} />
          ))}
        </div>
        <p className="mt-8 text-gray-600">
          Still unsure?{" "}
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4" style={{ color: TERRACOTTA }}>
            Message us on WhatsApp
          </a>
          .
        </p>
        {open && (
          <div className="mt-10 flex flex-wrap gap-3">
            {cta("friend", "Plan a surprise", true)}
            {cta("self", "It's my occasion", false)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
