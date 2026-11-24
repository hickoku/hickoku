"use client";

// Cart offer progress: one row per automatic offer, each with "Add ₹X more to get <reward>",
// a bar and the target at the right. Offers come from the admin's Offers page.
import { motion } from "motion/react";
import { Check, Gift, Sparkles, Tag, Truck } from "lucide-react";
import { useOffers } from "../context/OffersContext";
import { offerSteps, stepText, type OfferStep } from "@/lib/offers/progress";
import type { CartLine } from "@/lib/offers/engine";

function Icon({ step }: { step: OfferStep }) {
  const cls = "w-5 h-5 shrink-0 text-gray-700";
  if (step.unlocked) return <Check className="w-5 h-5 shrink-0 text-green-600" aria-hidden="true" />;
  if (step.offer.level === "gift") return <Gift className={cls} aria-hidden="true" />;
  if (step.offer.level === "shipping") return <Truck className={cls} aria-hidden="true" />;
  if (step.offer.level === "bxgy") return <Sparkles className={cls} aria-hidden="true" />;
  return <Tag className={cls} aria-hidden="true" />;
}

export function OfferProgressBar({ lines, className = "" }: { lines: CartLine[]; className?: string }) {
  const { offers } = useOffers();
  if (lines.length === 0) return null;
  // Offers still to reach first (closest first), then the ones already unlocked.
  const steps = offerSteps(lines, offers).sort(
    (a, b) => Number(a.unlocked) - Number(b.unlocked) || b.progress - a.progress || a.offer.sequence - b.offer.sequence,
  );
  if (steps.length === 0) return null;

  return (
    <ul className={`rounded-lg bg-gray-100 px-4 py-3 space-y-3 ${className}`} aria-live="polite" aria-label="Offers in your bag">
      {steps.map((s) => {
        const t = stepText(s);
        return (
          <li key={s.offer.id}>
            <p className="flex items-center gap-2.5 text-sm text-gray-700 leading-snug">
              <Icon step={s} />
              <span>
                {t.lead} <strong className="font-semibold text-gray-900">{t.reward}</strong>
              </span>
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="h-1.5 flex-1 rounded-full bg-gray-300/70 overflow-hidden"
                role="progressbar"
                aria-label={`${s.offer.name}: ${t.lead} ${t.reward}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(s.progress * 100)}
              >
                <motion.div
                  className={`h-full rounded-full ${s.unlocked ? "bg-green-500" : "bg-yellow-300"}`}
                  initial={false}
                  animate={{ width: `${s.progress * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="w-20 text-right text-xs text-gray-600 tabular-nums shrink-0">{s.target}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
