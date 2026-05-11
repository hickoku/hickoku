"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Loader, Star, RefreshCw, Trash2 } from "lucide-react";

interface Review {
  reviewId: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

const ADMIN_TOKEN = "hickoki_delhiver_test"; // Must match ADMIN_ACTION_TOKEN in .env

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews${filter === "all" ? "?all=true" : ""}`, {
        headers: { "x-admin-token": ADMIN_TOKEN },
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews);
      else showToast(data.error || "Failed to fetch", "error");
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approveReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Review approved ✓", "success");
        fetchReviews();
      } else {
        showToast(data.error || "Failed to approve", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_TOKEN },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Review deleted", "success");
        fetchReviews();
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Review Moderation</h1>
            <p className="text-xs text-gray-500 mt-0.5">Hickoku Admin — Manage customer reviews</p>
          </div>
          <button onClick={fetchReviews} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
              }`}
            >
              {f === "pending" ? "⏳ Pending Approval" : "📋 All Reviews"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No {filter === "pending" ? "pending" : ""} reviews</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <motion.div
                key={review.reviewId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-bold text-gray-900">{review.name}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        review.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {review.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Product ID: <span className="font-mono">{review.productId}</span> •{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    {!review.approved && (
                      <button
                        onClick={() => approveReview(review.reviewId)}
                        disabled={actionLoading === review.reviewId}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === review.reviewId ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.reviewId)}
                      disabled={actionLoading === review.reviewId}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold z-50 ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
