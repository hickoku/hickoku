"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Star, Send, CheckCircle, Loader } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Review {
  reviewId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

import { getPDPFaqs } from "./pdpData";

// ── Small Accordion ────────────────────────────────────────────────────────
function SmallAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Star Picker ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >
          <Star className={`w-7 h-7 transition-colors ${s <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
        </button>
      ))}
    </div>
  );
}

// ── Review Display ─────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
          {review.name[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
          ))}
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </motion.div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function ProductPageSections({
  productId,
  productName,
  initialReviews,
}: {
  productId: string;
  productName: string;
  initialReviews: Review[];
}) {
  const pdpFaqs = getPDPFaqs(productName);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [form, setForm] = useState({ name: "", rating: 0, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.rating === 0) return setError("Please select a star rating.");
    if (form.comment.trim().length < 10) return setError("Review must be at least 10 characters.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: "", rating: 0, comment: "" });
      } else {
        setError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 mt-12 border-t border-gray-100 pt-10">

      {/* ── Section A: FAQ ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>❓</span> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {pdpFaqs.map((faq, i) => (
            <SmallAccordion key={i} title={faq.q}>{faq.a}</SmallAccordion>
          ))}
        </div>
      </section>

      {/* ── Section B: Policies ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📦</span> Shipping & Returns
        </h2>
        <div className="space-y-3">
          <SmallAccordion title="🚚 Shipping Policy">
            <ul className="space-y-1.5 list-none">
              <li>✓ Orders dispatched within <strong>24–48 hours</strong> (business days)</li>
              <li>✓ Standard delivery: <strong>3–7 business days</strong> across India</li>
              <li>✓ Shipping charges calculated at checkout based on your pin code.</li>
              <li>✓ We currently offering <strong>free shipping</strong> across India as our launch offer</li>
              <li>✓ You'll receive an email with tracking info once shipped</li>
            </ul>
          </SmallAccordion>
          <SmallAccordion title="↩️ Return & Refund Policy">
            <ul className="space-y-1.5 list-none">
              <li>✓ <strong>2-3 days return window</strong> from date of delivery</li>
              <li>✓ Product must be <strong>unopened and in original packaging</strong></li>
              <li>✓ Damaged/defective items: contact us within <strong>48 hours</strong> with photos</li>
              <li>✓ Refund processed within <strong>5–7 business days</strong> to original payment source</li>
              <li>✓ Contact us at <strong>support@hickoku.com</strong> to initiate a return</li>
              <li>✓ You can also contect us on whatsapp <strong>+91 9360922878</strong> to initiate a return</li>
            </ul>
          </SmallAccordion>
        </div>
      </section>

      {/* ── Section C: Reviews ── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⭐</span> Customer Reviews
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-bold text-amber-500">{avgRating}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{reviews.length} verified review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Display Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-4 mb-8">
            {reviews.map((r) => <ReviewCard key={r.reviewId} review={r} />)}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl mb-8">
            <Star className="w-10 h-10 mx-auto text-gray-200 fill-gray-200 mb-3" />
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}

        {/* Submit Review */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p className="font-bold text-gray-900">Thank you for your review!</p>
              <p className="text-sm text-gray-500 mt-1">It will be visible after our team approves it.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-blue-600 underline">Write another review</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Rating *</label>
                <StarPicker value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Arjun S."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Review *</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience with this fragrance..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.comment.length}/500</p>
              </div>

              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Submitting..." : "Submit Review"}
              </motion.button>
              <p className="text-xs text-gray-400 text-center">Reviews are moderated and appear after approval.</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
