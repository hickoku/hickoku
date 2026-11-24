"use client";

import { useId, useState } from "react";
import { Check, Loader, Tag, X } from "lucide-react";
import { useCheckoutPricing } from "../../context/CheckoutPricingContext";

// "Have a discount code?" box for the checkout summary. Codes stay in the list while they
// can still work (e.g. "add 1 more bottle"), with the reason shown under them.
export function DiscountCodeBox() {
  const { codeResults, applyCode, removeCode } = useCheckoutPricing();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId(); // the summary is on the page twice (mobile + desktop)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await applyCode(value);
    setBusy(false);
    if (res.ok || res.fixable) setValue("");
    if (!res.ok && !res.fixable) setError(res.message);
  };

  return (
    <div className="p-4 border-b border-gray-200 space-y-2">
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor={`${id}-code`} className="sr-only">
          Discount code
        </label>
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id={`${id}-code`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Discount code"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={32}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-wide"
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || busy}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {busy ? <Loader className="w-4 h-4 animate-spin" aria-label="Checking code" /> : "Apply"}
        </button>
      </form>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {codeResults.map((r) => (
        <div
          key={r.code}
          className={`flex items-start gap-2 text-xs rounded-lg px-2.5 py-2 ${r.ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}
        >
          {r.ok ? <Check className="w-4 h-4 flex-none mt-px" aria-hidden="true" /> : <Tag className="w-4 h-4 flex-none mt-px" aria-hidden="true" />}
          <div className="flex-1 min-w-0">
            <span className="font-bold tracking-wide">{r.code}</span>
            {r.ok ? " applied" : " not applied yet"}
            {r.message && <span className="block text-[11px] opacity-90">{r.message}</span>}
          </div>
          <button type="button" onClick={() => removeCode(r.code)} className="p-0.5 rounded hover:bg-black/5" aria-label={`Remove code ${r.code}`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
