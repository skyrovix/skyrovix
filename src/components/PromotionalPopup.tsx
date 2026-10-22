import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/db-client";

export function PromotionalPopup() {
  const [popup, setPopup] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("promotional_popups" as any)
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setPopup(data);
    };
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!popup || dismissed) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDismissed(true)}>
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-300 rounded-2xl border border-border/50 bg-white shadow-2xl dark:bg-[#1E293B] dark:border-white/10 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 z-10 grid size-8 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition backdrop-blur-sm"
        >
          <X className="size-4" />
        </button>

        {popup.image_url && (
          <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#07284a]/10 to-blue-500/10 dark:from-[#07284a]/30 dark:to-blue-500/20">
            <img
              src={popup.image_url}
              alt={popup.title || "Promotion"}
              className="size-full object-cover"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {popup.title && (
            <h3 className="text-lg sm:text-xl font-bold text-foreground">{popup.title}</h3>
          )}
          {popup.description && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{popup.description}</p>
          )}
          {popup.link_url && (
            <a
              href={popup.link_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#07284a]/20 transition hover:brightness-110"
            >
              <ExternalLink className="size-4" />
              {popup.link_label || "Learn More"}
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

