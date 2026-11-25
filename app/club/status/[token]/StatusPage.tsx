"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Gift, ImagePlus, Loader2, MessageCircle, Truck } from "lucide-react";
import { Header } from "../../../components/Header";
import type { StatusView } from "@/lib/club/status";

const TERRACOTTA = "#B33D14";
const WHATSAPP = (text: string) => "https://wa.me/9360922878?text=" + encodeURIComponent(text);
const longDay = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const isoDay = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "");

const STEPS = ["Applied", "Approved", "Shipped", "Delivered", "Posted", "Featured"];
// How many steps are done for each stage.
const DONE: Record<StatusView["stage"], number> = { review: 1, rejected: 1, approved: 2, shipped: 3, delivered: 4, post: 4, fix: 4, checking: 5, verified: 5, not_posted: 4, featured: 6 };

// Shrinks a screenshot in the browser so it uploads quickly and fits our storage (< 280 KB).
async function shrink(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => bad(new Error("That file isn't an image we can read."));
      i.src = url;
    });
    let max = 1280;
    for (let q = 0.75; ; q -= 0.1) {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const data = c.toDataURL("image/jpeg", Math.max(0.4, q));
      if (data.length * 0.75 < 280 * 1024 || max < 500) return data;
      max = Math.round(max * 0.8);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ProofForm({ view, onDone }: { view: StatusView; onDone: () => void }) {
  const r = view.rules;
  const [reelUrl, setReelUrl] = useState(view.post?.reelUrl || "");
  const [from, setFrom] = useState<"me" | "them">(view.post?.postedFrom && view.post.postedFrom !== view.instagram ? "them" : "me");
  const [theirHandle, setTheirHandle] = useState(view.post?.postedFrom && view.post.postedFrom !== view.instagram ? view.post.postedFrom : "");
  const [shot, setShot] = useState<string | null>(null);
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function pick(f?: File) {
    if (!f) return;
    try {
      setShot(await shrink(f));
      setErrors((e) => ({ ...e, storyShot: "" }));
    } catch (e: any) {
      setErrors((x) => ({ ...x, storyShot: e.message }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/instagram\.com\/(reel|reels|p)\//i.test(reelUrl)) err.reelUrl = "Paste the link to your Reel (Share → Copy link on Instagram)";
    if (from === "them" && !/^@?[a-zA-Z0-9._]{1,30}$/.test(theirHandle.trim())) err.postedFrom = "Add their Instagram username";
    if (r.storyRequired && !shot && view.post?.state !== "fix_requested") err.storyShot = "Add a screenshot of your Story";
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/club/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: view.token, reelUrl: reelUrl.trim(), postedFrom: from === "me" ? view.instagram : theirHandle, storyShot: shot, featureConsent: consent }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrors({ [data.field || "form"]: data.error });
        return;
      }
      onDone();
    } catch {
      setErrors({ form: "Couldn't reach us. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
      <div>
        <label htmlFor="reel" className="block text-sm font-semibold mb-1.5">
          Your Reel link
        </label>
        <input
          id="reel"
          type="url"
          inputMode="url"
          placeholder="https://www.instagram.com/reel/…"
          value={reelUrl}
          onChange={(e) => setReelUrl(e.target.value)}
          className={`w-full h-12 px-4 rounded-xl border bg-white outline-none ${errors.reelUrl ? "border-red-500" : "border-gray-300 focus:border-[#1a0f0a]"}`}
          aria-invalid={!!errors.reelUrl}
        />
        {errors.reelUrl && <p className="mt-1.5 text-sm text-red-600">{errors.reelUrl}</p>}
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold mb-1.5">Posted from</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["me", `@${view.instagram}`],
              ["them", view.forWhom === "friend" ? `${view.recipientName.split(" ")[0]}'s account` : "Another account"],
            ] as const
          ).map(([v, t]) => (
            <button
              key={v}
              type="button"
              aria-pressed={from === v}
              onClick={() => setFrom(v)}
              className={`h-11 rounded-xl border text-sm font-semibold truncate px-2 ${from === v ? "bg-[#1a0f0a] text-white border-[#1a0f0a]" : "bg-white border-gray-300"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {from === "them" && (
          <input
            aria-label="Their Instagram username"
            placeholder="@theirhandle"
            autoCapitalize="none"
            value={theirHandle}
            onChange={(e) => setTheirHandle(e.target.value)}
            className={`mt-2 w-full h-12 px-4 rounded-xl border bg-white outline-none ${errors.postedFrom ? "border-red-500" : "border-gray-300 focus:border-[#1a0f0a]"}`}
          />
        )}
        {errors.postedFrom && <p className="mt-1.5 text-sm text-red-600">{errors.postedFrom}</p>}
      </fieldset>

      <div>
          <span className="block text-sm font-semibold mb-1.5">Story screenshot{r.storyRequired ? "" : " (optional)"}</span>
          <label className={`flex items-center gap-4 rounded-xl border border-dashed p-4 cursor-pointer bg-white ${errors.storyShot ? "border-red-500" : "border-gray-300 hover:border-gray-500"}`}>
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shot} alt="Your Story screenshot" className="w-14 h-24 object-cover rounded-md" />
            ) : (
              <span className="w-14 h-24 rounded-md bg-gray-100 flex items-center justify-center">
                <ImagePlus className="w-6 h-6 text-gray-500" aria-hidden="true" />
              </span>
            )}
            <span className="text-sm">
              <span className="block font-semibold">{shot ? "Screenshot added · tap to replace" : view.post?.state === "fix_requested" ? "Add a new screenshot (optional)" : "Add your Story screenshot"}</span>
              <span className="block text-gray-600">Stories vanish after 24 hours, so a screenshot is our proof. Make sure the {r.handle} tag shows.</span>
            </span>
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {errors.storyShot && <p className="mt-1.5 text-sm text-red-600">{errors.storyShot}</p>}
      </div>

      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input type="checkbox" className="mt-0.5 w-5 h-5 accent-[#1a0f0a] shrink-0" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Hickoku can feature my Reel on hickoku.com and Instagram, with credit. I can ask to remove it anytime.</span>
      </label>

      {errors.form && (
        <p role="alert" className="text-sm text-red-600">
          {errors.form}
        </p>
      )}
      <button type="submit" disabled={busy} className="w-full h-12 rounded-full bg-[#1a0f0a] text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70">
        {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />} {busy ? "Sending…" : "Send my post"}
      </button>
      <p className="text-xs text-gray-500 text-center">We check every post. Keep the Reel up for {r.keepUpDays} days.</p>
    </form>
  );
}

export function StatusPage({ view }: { view: StatusView }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const done = DONE[view.stage];
  const r = view.rules;
  const they = view.forWhom === "friend" ? view.recipientName.split(" ")[0] : "you";

  // Remember this application on this device, so /club/status opens it next time.
  useEffect(() => {
    try {
      document.cookie = `hk_club=${view.token}; path=/club; max-age=${60 * 60 * 24 * 120}; samesite=lax`;
    } catch {}
  }, [view.token]);

  const link = typeof window !== "undefined" ? window.location.href : "";
  const card = (() => {
    switch (view.stage) {
      case "review":
        return {
          tone: "wait",
          title: "We're reviewing your application",
          body: `We check that @${view.instagram} is public, has ${r.minFollowers.toLocaleString("en-IN")}+ followers and follows ${r.handle}. You'll hear from us on WhatsApp within 48 hours.`,
          extra: (
            <p className="mt-3 text-sm">
              Want it faster? DM <strong>{view.id}</strong> to <strong>{r.handle}</strong> from @{view.instagram}. Optional.
            </p>
          ),
        };
      case "rejected":
        return {
          tone: "no",
          title: "Not approved this time",
          body: `Your application didn't meet the Club rules this time (public profile, ${r.minFollowers.toLocaleString("en-IN")}+ followers, following ${r.handle}). You're welcome to apply again for your next occasion.`,
          extra: (
            <Link href="/collection" className="mt-4 inline-flex h-11 px-5 items-center rounded-full border border-gray-300 font-semibold text-sm">
              Shop Hickoku
            </Link>
          ),
        };
      case "approved":
        return { tone: "ok", title: `You're in, ${view.firstName}!`, body: `Your gift${view.forWhom === "friend" ? ` for ${they}` : ""} is being packed. It ships by ${longDay(view.shipBy)} so it lands before ${longDay(view.partyDate)}.` };
      case "shipped":
      case "delivered":
        return {
          tone: "ok",
          title: view.stage === "delivered" ? "Delivered. Get ready to film!" : "Your gift is on its way",
          body: view.forWhom === "friend" ? `Don't let ${they} open it early. The unwrap happens on camera.` : "Keep it wrapped until the day. The unwrap happens on camera.",
          extra: view.awb ? (
            <a href={`https://www.delhivery.com/track-v2/package/${view.awb}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-11 px-5 items-center gap-2 rounded-full bg-[#1a0f0a] text-white font-semibold text-sm">
              <Truck className="w-4 h-4" aria-hidden="true" /> Track shipment
            </a>
          ) : null,
        };
      case "post":
      case "fix":
        return {
          tone: view.stage === "fix" ? "no" : "ok",
          title: view.stage === "fix" ? "One thing to fix" : "Party done? Send us your post",
          body:
            view.stage === "fix"
              ? view.post?.fixNote || "Please check your post and send it again."
              : `Post a Reel${r.storyRequired ? " + Story" : ""} tagging ${r.handle} with ${r.hashtags.join(" ")} within ${r.postWithinHours} hours of the occasion, then send it here.`,
          form: true,
        };
      case "checking":
        return { tone: "wait", title: "Thanks! We're checking your post", body: "Once it's approved, we may feature you on hickoku.com. We'll WhatsApp you." };
      case "verified":
        return { tone: "ok", title: "Your post is approved", body: `Thank you! Keep the Reel up for ${r.keepUpDays} days. We'll WhatsApp you if you're featured.` };
      case "featured":
        return { tone: "ok", title: "You're featured!", body: `Your Reel is featured on Hickoku${view.featuredUntil ? ` until ${isoDay(view.featuredUntil)}` : ""}. Thank you for celebrating with us.` };
      case "not_posted":
        return { tone: "no", title: "We didn't see your post", body: "The Reel wasn't posted in time, so we can't take another application from this account. If something went wrong, message us on WhatsApp." };
    }
  })();

  const toneCls = card.tone === "no" ? "bg-red-50 border-red-200" : card.tone === "wait" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1a0f0a]">
      <Header />
      <main className="max-w-5xl mx-auto px-4 pt-28 md:pt-32 pb-20">
        <Link href="/club" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Hickoku Club
        </Link>
        <p className="mt-6 text-xs font-bold tracking-[0.18em] uppercase" style={{ color: TERRACOTTA }}>
          Your application · {view.id}
        </p>
        <h1 className="mt-1 text-3xl md:text-4xl font-bold">Hi {view.firstName}</h1>

        {/* Steps */}
        {view.stage !== "rejected" && (
          <ol className="mt-8 grid grid-cols-6 gap-1" aria-label="Progress">
            {STEPS.map((label, i) => {
              const ok = i < done && !(view.stage === "not_posted" && i >= 4);
              const current = i === done && view.stage !== "not_posted";
              return (
                <li key={label} className="flex flex-col items-center text-center gap-1.5" aria-current={current ? "step" : undefined}>
                  <span className={`w-full h-1.5 rounded-full ${ok ? "bg-green-500" : current ? "bg-amber-300" : "bg-gray-200"}`} />
                  <span className={`text-[11px] sm:text-xs font-semibold ${ok ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
                  <span className="sr-only">{ok ? "done" : current ? "in progress" : "to come"}</span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <section className={`rounded-2xl border p-6 ${toneCls}`} aria-live="polite">
            <h2 className="text-xl font-bold">{card.title}</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">{card.body}</p>
            {card.extra}
            {card.form && <ProofForm view={view} onDone={() => router.refresh()} />}
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-black/5 p-5">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {view.gift.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={view.gift.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="w-6 h-6 text-gray-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {view.gift.name} · {view.gift.size}
                  </p>
                  {view.labelName && <p className="text-sm text-gray-600">Label “{view.labelName}”</p>}
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-[90px_1fr] gap-y-1.5 text-sm">
                <dt className="text-gray-500">Occasion</dt>
                <dd>
                  {view.occasionName} · {longDay(view.partyDate)}
                </dd>
                <dt className="text-gray-500">For</dt>
                <dd>{view.forWhom === "friend" ? `${view.recipientName} (surprise)` : view.recipientName}</dd>
                <dt className="text-gray-500">Delivering to</dt>
                <dd className="break-words">{view.addressHint}</dd>
              </dl>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 p-5 text-sm">
              <p className="font-semibold">Keep this page</p>
              <p className="mt-1 text-gray-600">This private link shows your status anytime. Don&apos;t share it.</p>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true))}
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-gray-300 font-semibold"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />} {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <a
              href={WHATSAPP(`Hi, I have a question about my Hickoku Club application ${view.id}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white rounded-2xl border border-black/5 p-5 text-sm"
            >
              <MessageCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
              <span>
                <span className="block font-semibold">Need help or a change?</span>
                <span className="block text-gray-600">Chat with us on WhatsApp, 10 am to 7 pm.</span>
              </span>
            </a>
          </aside>
        </div>
      </main>
    </div>
  );
}
