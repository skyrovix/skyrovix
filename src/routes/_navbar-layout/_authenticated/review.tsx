import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSubmitReview, useUserReview } from "@/lib/reviews";
import { getDomain } from "@/lib/constants";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Star, Loader2, CheckCircle2, MessageSquare, Send, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_navbar-layout/_authenticated/review")({
  head: () => ({ meta: [{ title: "Write a Review — Skyrovix" }] }),
  component: ReviewPage,
});

const RATING_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: "Poor",      color: "#ef4444", emoji: "😞" },
  2: { label: "Fair",      color: "#f97316", emoji: "😐" },
  3: { label: "Good",      color: "#eab308", emoji: "🙂" },
  4: { label: "Great",     color: "#22c55e", emoji: "😄" },
  5: { label: "Excellent", color: "#3b82f6", emoji: "🤩" },
};

function ReviewPage() {
  const { user } = useAuth();
  const { data: appsList } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const app = appsList?.find((a) => (a.status as string) === "ongoing" || (a.status as string) === "approved") ?? appsList?.[0] ?? null;
  const domain = app ? getDomain(app.domain) : null;

  if (!app) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: 400 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #e0e7ff, #ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <MessageSquare size={36} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e1b4b", marginBottom: 10 }}>No Active Internship</h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>Please apply for an internship first to leave a review.</p>
        </div>
      </div>
    );
  }

  return <ReviewForm app={app} domain={domain} user={user} />;
}

function ReviewForm({ app, domain, user }: { app: any; domain: any; user: any }) {
  const { data: existingReview, isLoading: reviewLoading } = useUserReview("internship", app.domain, user?.id);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setContent(existingReview.content);
      setTitle(existingReview.title ?? "");
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    if (!rating) { toast.error("Please select a rating"); return; }
    if (content.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }
    submitReview.mutate(
      { target_type: "internship", target_id: app.domain, rating, title: title || undefined, content },
      {
        onSuccess: () => {
          toast.success(existingReview ? "Review updated!" : "Review submitted! Pending approval.");
          if (!existingReview) setSubmitted(true);
        }
      },
    );
  };

  const displayRating = hoverRating || rating;
  const ratingInfo = displayRating ? RATING_LABELS[displayRating] : null;

  // Success State
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "white", borderRadius: 28, padding: "3.5rem 2.5rem", maxWidth: 460, width: "100%", textAlign: "center", boxShadow: "0 25px 80px rgba(99,102,241,0.12)", border: "1px solid #e0e7ff" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle2 size={38} color="#059669" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#064e3b", marginBottom: 12 }}>Review Submitted! 🎉</h2>
          <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Thank you for sharing your experience. Your review is pending approval and will be published soon to help other students.
          </p>
          <div style={{ background: "#f0fdf4", borderRadius: 16, padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
            <span style={{ fontSize: 28 }}>🌟</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#065f46", margin: 0 }}>You're helping students!</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Your review will appear on the public reviews page.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)" }}>
      {/* Decorative blobs */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 1.25rem 4rem" }}>

        {/* Top label */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e0e7ff", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 600, color: "#4f46e5" }}>
            <Sparkles size={12} />
            Share Your Experience
          </span>
        </div>

        {/* Main Card */}
        <div style={{ background: "white", borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 60px rgba(99,102,241,0.1), 0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(224,231,255,0.8)" }}>

          {/* Card Header Gradient Bar */}
          <div style={{ height: 5, background: "linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)" }} />

          {/* Domain Strip */}
          <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 14, background: "#fafafa" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(135deg, ${domain?.color?.includes("from-") ? "#4f46e5, #7c3aed" : "#4f46e5, #7c3aed"})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "white", boxShadow: "0 4px 14px rgba(79,70,229,0.3)"
            }}>
              {domain?.icon ?? "🎓"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.3 }}>
                {domain?.name ?? app.domain}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0", fontFamily: "monospace" }}>
                {app.intern_id}
              </p>
            </div>
            {existingReview && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
                background: existingReview.status === "approved" ? "#dcfce7" : "#fef9c3",
                color: existingReview.status === "approved" ? "#15803d" : "#a16207",
                border: `1px solid ${existingReview.status === "approved" ? "#bbf7d0" : "#fde68a"}`,
                whiteSpace: "nowrap"
              }}>
                {existingReview.status === "approved" ? "✓ Published" : "⏳ Pending"}
              </span>
            )}
          </div>

          <div style={{ padding: "2rem" }}>

            {reviewLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 0", gap: 12 }}>
                <Loader2 size={28} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading your review...</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* Rating Section */}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 16 }}>
                    How would you rate your overall experience?
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        style={{
                          background: "none", border: "none", cursor: "pointer", padding: 4,
                          transform: star <= displayRating ? "scale(1.15)" : "scale(1)",
                          transition: "transform 0.15s ease",
                        }}
                      >
                        <Star
                          size={38}
                          fill={star <= displayRating ? (ratingInfo?.color ?? "#fbbf24") : "#e5e7eb"}
                          color={star <= displayRating ? (ratingInfo?.color ?? "#fbbf24") : "#e5e7eb"}
                          style={{ filter: star <= displayRating ? `drop-shadow(0 2px 6px ${ratingInfo?.color}50)` : "none", transition: "all 0.15s ease" }}
                        />
                      </button>
                    ))}
                    {ratingInfo && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, animation: "fadeIn 0.2s ease" }}>
                        <span style={{ fontSize: 24 }}>{ratingInfo.emoji}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: ratingInfo.color }}>{ratingInfo.label}</span>
                      </div>
                    )}
                  </div>
                  {/* Rating bar indicators */}
                  <div style={{ display: "flex", gap: 4, marginTop: 14 }}>
                    {[1,2,3,4,5].map((s) => (
                      <div key={s} style={{
                        flex: 1, height: 4, borderRadius: 999,
                        background: s <= (rating || 0) ? (RATING_LABELS[rating]?.color ?? "#6366f1") : "#e5e7eb",
                        transition: "background 0.2s ease"
                      }} />
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #e5e7eb, transparent)" }} />

                {/* Title */}
                <div>
                  <label htmlFor="review-title" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
                    Review Headline
                    <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>· optional</span>
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    placeholder="e.g. Amazing learning experience at Skyrovix!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box", height: 48, padding: "0 16px",
                      borderRadius: 14, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111827",
                      outline: "none", transition: "border-color 0.2s",
                      fontFamily: "inherit", background: "#fafafa",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>

                {/* Review content */}
                <div>
                  <label htmlFor="review-content" style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
                    Your Review
                  </label>
                  <textarea
                    id="review-content"
                    placeholder="Tell us about the tasks you worked on, skills you gained, support you received, and how it helped your career. Be as detailed as you like!"
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                    rows={6}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "14px 16px",
                      borderRadius: 14, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111827",
                      outline: "none", resize: "none", lineHeight: 1.7,
                      fontFamily: "inherit", background: "#fafafa", transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                      Minimum 10 characters · Reviews are approved before publishing
                    </p>
                    <p style={{
                      fontSize: 12, fontWeight: 600, margin: 0,
                      color: content.length > 450 ? "#f97316" : "#9ca3af"
                    }}>
                      {content.length}/500
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div style={{ paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitReview.isPending || !rating || content.trim().length < 10}
                    style={{
                      width: "100%", height: 54, borderRadius: 16,
                      background: (!rating || content.trim().length < 10)
                        ? "#e5e7eb"
                        : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: (!rating || content.trim().length < 10) ? "#9ca3af" : "white",
                      border: "none", cursor: (!rating || content.trim().length < 10) ? "not-allowed" : "pointer",
                      fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      transition: "all 0.2s ease",
                      boxShadow: (!rating || content.trim().length < 10) ? "none" : "0 8px 24px rgba(79,70,229,0.35)",
                      letterSpacing: 0.3,
                    }}
                  >
                    {submitReview.isPending ? (
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                    ) : existingReview ? (
                      <>Update Review <ArrowRight size={18} /></>
                    ) : (
                      <>Submit Review <Send size={18} /></>
                    )}
                  </button>

                  {existingReview && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", borderRadius: 12, background: existingReview.status === "approved" ? "#f0fdf4" : "#fefce8", border: `1px solid ${existingReview.status === "approved" ? "#bbf7d0" : "#fde68a"}` }}>
                      <CheckCircle2 size={15} color={existingReview.status === "approved" ? "#16a34a" : "#ca8a04"} />
                      <p style={{ fontSize: 12, margin: 0, color: existingReview.status === "approved" ? "#15803d" : "#a16207", fontWeight: 500 }}>
                        {existingReview.status === "approved"
                          ? "Your review is live on the student reviews page."
                          : "Your review is pending admin approval. It'll be visible soon."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Trust Note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 20 }}>
          🔒 Reviews are verified and only published after admin approval.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
        button:hover:not(:disabled) { opacity: 0.93; }
      `}</style>
    </div>
  );
}
