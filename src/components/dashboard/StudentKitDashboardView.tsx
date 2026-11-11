import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Gift,
  Download,
  Eye,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  Code2,
  Rocket,
  Award,
  ChevronRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  Laptop,
  Check,
  Layers,
  FileCheck,
  Zap,
  Star,
  Maximize2,
  Smartphone,
  Globe2,
  ArrowLeft,
  Search,
  BookMarked,
  Library,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getStudentKitsFn,
  unlockStudentKitFn,
  type StudentKitItem,
} from "@/lib/student-kit-service";

interface ApplicationLike {
  id?: string;
  user_id?: string;
  plan_type?: string | null;
  domain?: string | null;
  [key: string]: unknown;
}

interface StudentKitDashboardViewProps {
  app: ApplicationLike | null | undefined;
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
}

export function StudentKitDashboardView({
  app,
  isPremium,
  onUpgradeToPremium,
}: StudentKitDashboardViewProps) {
  const qc = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigation & selection state
  const [selectedBook, setSelectedBook] = useState<StudentKitItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  // Dialog states
  const [previewOpen, setPreviewOpen] = useState(false);
  const [kitForPreview, setKitForPreview] = useState<StudentKitItem | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedKitForUnlock, setSelectedKitForUnlock] = useState<StudentKitItem | null>(null);
  const [coverZoomOpen, setCoverZoomOpen] = useState(false);
  const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);

  // Smooth scroll to top whenever user opens a book or goes back to catalog
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }
      if (containerRef.current) {
        try {
          containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
          // fallback
        }
      }
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [selectedBook]);

  const handleSelectBook = (kit: StudentKitItem) => {
    setSelectedBook(kit);
    scrollToTop();
    setTimeout(() => {
      scrollToTop();
    }, 40);
  };

  const handleBackToCatalog = () => {
    setSelectedBook(null);
    scrollToTop();
    setTimeout(() => {
      scrollToTop();
    }, 40);
  };

  // Fetch Kits
  const { data, isLoading } = useQuery({
    queryKey: ["student-kits", app?.id, app?.user_id],
    queryFn: () =>
      getStudentKitsFn({
        data: {
          applicationId: app?.id,
          userId: app?.user_id,
        },
      }),
  });

  const isPremiumUser = Boolean(data?.isPremiumUser || isPremium || app?.plan_type === "premium");

  // Map kits with updated unlock status
  const allKits: StudentKitItem[] = useMemo(() => {
    const defaultKit: StudentKitItem = {
      id: "sk-kit-webdev-10",
      title: "Web Development Student Kit",
      edition: "Edition 1.0 (2026 Release)",
      description:
        "From complete beginner to job-ready full stack developer. Complete learning resources, roadmap, cheat sheets, code templates & development tools.",
      pdf_url: "/SKYROVIX_Complete_Web_Development_Student_Kit.pdf",
      cover_image_url: "/student-kit-cover.jpg",
      price: 20,
      is_free_for_premium: true,
      is_active: true,
      domain: "Web Development",
      downloads_count: 0,
      is_unlocked: isPremiumUser,
      unlock_reason: isPremiumUser ? "premium" : "locked",
      can_download: isPremiumUser,
    };

    const sourceKits = data?.kits && data.kits.length > 0 ? data.kits : [defaultKit];

    return sourceKits.map((kit) => {
      const unlocked = Boolean(kit.is_unlocked || (isPremiumUser && kit.is_free_for_premium));
      return {
        ...kit,
        is_unlocked: unlocked,
        can_download: unlocked,
        unlock_reason: unlocked ? (isPremiumUser ? "premium" : "purchased") : "locked",
      };
    });
  }, [data?.kits, isPremiumUser]);

  // Keep selectedBook synchronized with allKits data
  const activeBook = useMemo(() => {
    if (!selectedBook) return null;
    return allKits.find((k) => k.id === selectedBook.id) || selectedBook;
  }, [selectedBook, allKits]);

  // Available domain categories
  const domains = useMemo(() => {
    const list = Array.from(new Set(allKits.map((k) => k.domain).filter(Boolean))) as string[];
    return ["all", ...list];
  }, [allKits]);

  // Filtered kits based on search & domain
  const filteredKits = useMemo(() => {
    return allKits.filter((kit) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        kit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (kit.description && kit.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (kit.edition && kit.edition.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDomain =
        selectedDomain === "all" || kit.domain?.toLowerCase() === selectedDomain.toLowerCase();

      return matchesSearch && matchesDomain;
    });
  }, [allKits, searchQuery, selectedDomain]);

  // Unlock mutation
  const unlockMutation = useMutation({
    mutationFn: async (kitId: string) => {
      const targetKit =
        allKits.find((k) => k.id === kitId) || selectedKitForUnlock || activeBook || allKits[0];
      return unlockStudentKitFn({
        data: {
          kitId,
          applicationId: app?.id,
          userId: app?.user_id,
          amount: isPremiumUser ? 0 : targetKit?.price || 20,
          paymentId: isPremiumUser ? "FREE_PREMIUM_PLAN" : `PAY_${Date.now()}`,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Student kit unlocked successfully!");
      setUnlockModalOpen(false);
      qc.invalidateQueries({ queryKey: ["student-kits"] });
      // Update local state if activeBook is open
      if (selectedBook) {
        setSelectedBook((prev) =>
          prev ? { ...prev, is_unlocked: true, can_download: true } : null,
        );
      }
      // Instant download trigger if URL returned
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to unlock student kit.";
      toast.error(msg);
    },
    onSettled: () => {
      setIsProcessingUnlock(false);
    },
  });

  const handleDownload = (kit: StudentKitItem) => {
    const kitUnlocked = Boolean(kit.is_unlocked || (isPremiumUser && kit.is_free_for_premium));
    if (kitUnlocked) {
      toast.success(`Downloading ${kit.title}...`);
      const link = document.createElement("a");
      link.href = kit.pdf_url;
      const cleanFileName =
        (kit.title || "Skyrovix_Student_Kit").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
      link.download = cleanFileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSelectedKitForUnlock(kit);
      setUnlockModalOpen(true);
    }
  };

  const handleOpenPreview = (kit: StudentKitItem) => {
    const kitUnlocked = Boolean(kit.is_unlocked || (isPremiumUser && kit.is_free_for_premium));
    if (kitUnlocked) {
      setKitForPreview(kit);
      setPreviewOpen(true);
    } else {
      setSelectedKitForUnlock(kit);
      setUnlockModalOpen(true);
    }
  };

  const fallbackBook: StudentKitItem = allKits[0] || {
    id: "sk-kit-webdev-10",
    title: "Web Development Student Kit",
    edition: "Edition 1.0 (2026 Release)",
    description:
      "From complete beginner to job-ready full stack developer. Complete learning resources, roadmap, cheat sheets, code templates & development tools.",
    pdf_url: "/SKYROVIX_Complete_Web_Development_Student_Kit.pdf",
    cover_image_url: "/student-kit-cover.jpg",
    price: 20,
    is_free_for_premium: true,
    is_active: true,
    domain: "Web Development",
    downloads_count: 0,
    is_unlocked: isPremiumUser,
    unlock_reason: isPremiumUser ? "premium" : "locked",
    can_download: isPremiumUser,
  };

  const bookForUnlockModal = selectedKitForUnlock || activeBook || fallbackBook;
  const bookForPreviewModal = kitForPreview || activeBook || fallbackBook;
  const bookForCoverZoom = activeBook || fallbackBook;

  // Regular actual price is Rs. 299
  const REGULAR_PRICE = 299;

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full min-w-0">
      {/* ═══════════════════════════════════════════════════════════════════
          VIEW 1: BOOK DETAIL PAGE (When a book is clicked/selected)
         ═══════════════════════════════════════════════════════════════════ */}
      {activeBook ? (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Back Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToCatalog}
              className="gap-2 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs"
            >
              <ArrowLeft className="size-4 text-[#f95c4b]" />
              <span>Back to All Books ({allKits.length})</span>
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleBackToCatalog}
                className="hover:underline cursor-pointer hidden sm:inline"
              >
                Student Kit Library
              </button>
              <span className="hidden sm:inline">&rsaquo;</span>
              <span className="font-bold text-[#181619] dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {activeBook.title}
              </span>
            </div>
          </div>

          {/* Luxury Showcase Container for Selected Book */}
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-white via-[#faf7f2] to-white dark:from-[#181619] dark:via-[#1e1b21] dark:to-[#181619] shadow-xl shadow-orange-500/5">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/10 via-[#f95c4b]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="relative z-10 p-5 sm:p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* ─── LEFT: 3D BOOK ARTWORK SHOWCASE ─── */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="relative group w-full max-w-[420px]">
                    {/* Ambient Glow */}
                    <div className="absolute -inset-2 bg-gradient-to-tr from-[#f95c4b]/20 via-amber-500/15 to-orange-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500 -z-10" />

                    {/* Main 3D Artwork Frame */}
                    <div className="relative rounded-2xl overflow-hidden border border-border/70 dark:border-white/10 bg-slate-900 shadow-2xl shadow-slate-900/25 transition-transform duration-300 group-hover:scale-[1.015]">
                      <img
                        src={activeBook.cover_image_url || "/student-kit-cover.jpg"}
                        alt={activeBook.title}
                        className="w-full h-auto object-cover select-none block max-h-[480px]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/student-kit-cover.jpg";
                        }}
                      />

                      {/* Corner Zoom Trigger */}
                      <button
                        type="button"
                        onClick={() => setCoverZoomOpen(true)}
                        className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                        title="Zoom Full Artwork"
                      >
                        <Maximize2 className="size-3.5" />
                        <span>View Cover</span>
                      </button>
                    </div>

                    {/* Specifications Bar */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Format
                        </p>
                        <p className="text-xs font-black text-[#181619] dark:text-white mt-0.5">
                          High-Res PDF
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Domain
                        </p>
                        <p className="text-xs font-black text-[#181619] dark:text-white mt-0.5 truncate">
                          {activeBook.domain || "Full Stack"}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Edition
                        </p>
                        <p className="text-xs font-black text-[#f95c4b] mt-0.5 truncate">
                          {activeBook.edition || "2026 Edition"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT: BOOK DETAILS & ACTIONS ─── */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  {/* Top Badges & Title */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="brand-gradient text-white border-0 text-xs font-black px-3 py-1 shadow-xs tracking-wide">
                        <Gift className="mr-1.5 size-3.5 inline" />
                        OFFICIAL STUDENT KIT
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-bold border-border/80 bg-white/70 dark:bg-black/30"
                      >
                        {activeBook.edition || "Edition 1.0"}
                      </Badge>

                      {isPremiumUser ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-1">
                          <Crown className="mr-1.5 size-3.5 inline text-amber-500" />
                          100% Free with Premium Track
                        </Badge>
                      ) : activeBook.is_unlocked ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-1">
                          <CheckCircle2 className="mr-1.5 size-3.5 inline" />
                          Unlocked & Ready to Download
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-xs font-black px-2.5 py-1 flex items-center gap-1.5">
                          <Sparkles className="size-3 text-amber-500" />
                          <span>Special Offer: ₹{activeBook.price}</span>
                          <span className="line-through text-muted-foreground font-semibold text-[11px]">
                            ₹{REGULAR_PRICE}
                          </span>
                        </Badge>
                      )}
                    </div>

                    <h1 className="font-display text-2xl sm:text-4xl font-black text-[#181619] dark:text-white tracking-tight leading-tight">
                      {activeBook.title}
                    </h1>

                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl whitespace-pre-line">
                      {activeBook.description ||
                        "Official Skyrovix educational companion containing structured learning roadmaps, capstone blueprints, cheat sheets, and practical engineering guides."}
                    </p>
                  </div>

                  {/* Specs Pills Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                      <div className="size-8 rounded-lg bg-orange-500/10 text-[#f95c4b] flex items-center justify-center shrink-0">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          Curriculum
                        </p>
                        <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">
                          Full Guide
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                      <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Laptop className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          Projects
                        </p>
                        <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">
                          Capstones
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Code2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          Domain
                        </p>
                        <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">
                          {activeBook.domain || "Practical"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                      <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                          Access
                        </p>
                        <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">
                          Lifetime
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ─── ACTION & ACCESS CONTROL PANEL (OFFER PRICING) ─── */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 dark:from-[#201d22] dark:via-[#252028] dark:to-[#201d22] border-2 border-[#f95c4b]/20 shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span className="text-2xl sm:text-3xl font-black text-[#181619] dark:text-white tracking-tight">
                            {isPremiumUser
                              ? "FREE"
                              : activeBook.is_unlocked
                                ? "UNLOCKED"
                                : `₹${activeBook.price}`}
                          </span>
                          {!isPremiumUser && !activeBook.is_unlocked && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground line-through font-bold">
                                ₹{REGULAR_PRICE}.00
                              </span>
                              <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                Special Offer &bull; Save ₹
                                {REGULAR_PRICE - (activeBook.price || 20)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {isPremiumUser
                            ? "✨ Included 100% free with your Full Stack Premium Internship plan."
                            : activeBook.is_unlocked
                              ? "✓ Verified purchase for this application. Download anytime."
                              : `Actual book price is ₹${REGULAR_PRICE}.00. Exclusive student offer price is just ₹${activeBook.price}.00 (Free for Premium Track).`}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                        {activeBook.is_unlocked || isPremiumUser ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleOpenPreview(activeBook)}
                              className="rounded-xl border-border/80 text-xs font-bold gap-2 h-11 px-4 cursor-pointer hover:bg-white dark:hover:bg-white/10 shadow-2xs"
                            >
                              <Eye className="size-4 text-[#f95c4b]" />
                              Preview Online
                            </Button>
                            <Button
                              onClick={() => handleDownload(activeBook)}
                              className="rounded-xl brand-gradient text-white text-xs font-extrabold gap-2 h-11 px-5 shadow-lg shadow-[#f95c4b]/25 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Download className="size-4" />
                              Download PDF Kit
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedKitForUnlock(activeBook);
                              setUnlockModalOpen(true);
                            }}
                            className="rounded-xl brand-gradient text-white text-xs font-extrabold gap-2 h-11 px-6 shadow-lg shadow-[#f95c4b]/25 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <Lock className="size-4" />
                            Claim Offer & Unlock Kit (₹{activeBook.price})
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Standard Student Upgrade Hint */}
                    {!isPremiumUser && !activeBook.is_unlocked && (
                      <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-2 font-medium">
                          <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                          Premium interns get all Student Kits + LOR + 7 Certificates for ₹0.
                        </span>
                        {onUpgradeToPremium && (
                          <button
                            type="button"
                            onClick={onUpgradeToPremium}
                            className="font-extrabold text-[#f95c4b] hover:underline cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1"
                          >
                            Upgrade to Premium Track &rarr;
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════
            VIEW 2: CATALOG LIST VIEW (Grid of All Student Kit Books)
           ═══════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/5 p-6 sm:p-8">
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="brand-gradient text-white border-0 text-xs font-black px-3 py-1 shadow-xs tracking-wide">
                  <Library className="mr-1.5 size-3.5 inline" />
                  STUDENT KIT & BOOKS LIBRARY
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs font-bold border-border/80 bg-white/70 dark:bg-black/30"
                >
                  {allKits.length} {allKits.length === 1 ? "Book" : "Books"} Available
                </Badge>
                {isPremiumUser && (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-1">
                    <Crown className="mr-1.5 size-3.5 inline text-amber-500" />
                    All Books Free for Premium
                  </Badge>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-black text-[#181619] dark:text-white tracking-tight">
                Skyrovix Learning Kits & Books
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl font-medium">
                Comprehensive, production-ready developer books, capstone code blueprints, and cheat
                sheets designed to accelerate your technical skills. Select any book to inspect
                curriculum, preview online, and download.
              </p>

              {/* Premium Plan Banner */}
              {isPremiumUser ? (
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>
                    Your Premium Internship Track gives you 100% complimentary, lifetime access to
                    every kit below.
                  </span>
                </div>
              ) : (
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">
                    Special student offer price:{" "}
                    <strong className="text-[#f95c4b] font-bold">₹10 &ndash; ₹20</strong> (Actual
                    Price <span className="line-through">₹299</span>). Or,
                  </span>
                  {onUpgradeToPremium && (
                    <button
                      type="button"
                      onClick={onUpgradeToPremium}
                      className="font-extrabold text-[#f95c4b] hover:underline cursor-pointer"
                    >
                      Upgrade to Premium for all-inclusive access &rarr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search & Domain Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-white dark:bg-[#181619] rounded-2xl border border-border/70 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search books by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-slate-50/70 dark:bg-black/20 border-border/60 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category / Domain Chips */}
            {domains.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {domains.map((dom) => (
                  <button
                    key={dom}
                    type="button"
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      selectedDomain === dom
                        ? "brand-gradient text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dom === "all" ? "All Domains" : dom}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Grid */}
          {filteredKits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-white/50 dark:bg-black/10 space-y-3">
              <BookOpen className="size-10 text-muted-foreground/60 mx-auto" />
              <h3 className="font-display font-bold text-base text-foreground">No Books Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No student kit matching &ldquo;{searchQuery}&rdquo;. Try another keyword or clear
                the search filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDomain("all");
                }}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKits.map((kit) => {
                const isKitUnlocked = Boolean(
                  kit.is_unlocked || (isPremiumUser && kit.is_free_for_premium),
                );

                return (
                  <div
                    key={kit.id}
                    onClick={() => handleSelectBook(kit)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 hover:border-[#f95c4b]/50 bg-white dark:bg-[#181619] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  >
                    {/* Top Cover Section with Visual Depth */}
                    <div className="relative w-full aspect-[16/11] bg-gradient-to-br from-slate-900 via-slate-800 to-[#181619] overflow-hidden flex items-center justify-center p-4">
                      {/* Background Ambient Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                      {/* Cover Thumbnail */}
                      <img
                        src={kit.cover_image_url || "/student-kit-cover.jpg"}
                        alt={kit.title}
                        className="h-full w-auto max-w-[85%] object-contain rounded-lg shadow-xl shadow-black/50 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/student-kit-cover.jpg";
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
                        <Badge
                          variant="secondary"
                          className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-0.5"
                        >
                          {kit.edition || "Edition 1.0"}
                        </Badge>

                        {isKitUnlocked ? (
                          <Badge className="bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-0.5 shadow-sm">
                            <CheckCircle2 className="size-3 mr-1 inline" />
                            Unlocked
                          </Badge>
                        ) : isPremiumUser ? (
                          <Badge className="bg-emerald-500/90 text-white text-[10px] font-black px-2.5 py-0.5 shadow-sm">
                            <Crown className="size-3 mr-1 inline text-amber-300" />
                            Free
                          </Badge>
                        ) : (
                          <Badge className="brand-gradient text-white text-[10px] font-black px-2.5 py-0.5 shadow-sm flex items-center gap-1">
                            <span className="line-through text-white/70 text-[9px]">
                              ₹{REGULAR_PRICE}
                            </span>
                            <span>₹{kit.price} Offer</span>
                          </Badge>
                        )}
                      </div>

                      {/* Domain Badge at Bottom-Left of Cover */}
                      {kit.domain && (
                        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                            {kit.domain}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Book Info Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-display font-black text-lg text-[#181619] dark:text-white line-clamp-2 leading-snug group-hover:text-[#f95c4b] transition-colors">
                          {kit.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {kit.description ||
                            "Complete structured curriculum, code templates, blueprints and cheat sheets for this technology stack."}
                        </p>
                      </div>

                      {/* Offer Price Highlight Strip */}
                      {!isKitUnlocked && !isPremiumUser && (
                        <div className="flex items-center justify-between text-xs bg-orange-50/70 dark:bg-orange-950/20 px-3 py-1.5 rounded-xl border border-orange-200/50 dark:border-orange-900/30">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Offer:
                            </span>
                            <span className="text-sm font-black text-[#f95c4b]">₹{kit.price}</span>
                            <span className="text-xs text-muted-foreground line-through font-semibold">
                              ₹{REGULAR_PRICE}
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                            {Math.round(
                              ((REGULAR_PRICE - (kit.price || 20)) / REGULAR_PRICE) * 100,
                            )}
                            % OFF
                          </span>
                        </div>
                      )}

                      {/* Specs Row */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50">
                        <span className="flex items-center gap-1 font-semibold">
                          <FileText className="size-3.5 text-[#f95c4b]" />
                          PDF eBook
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <ShieldCheck className="size-3.5 text-emerald-500" />
                          Verified
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Smartphone className="size-3.5 text-blue-500" />
                          Cross-Device
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBook(kit);
                        }}
                        className="flex-1 rounded-xl text-xs font-bold brand-gradient text-white shadow-xs hover:opacity-95 gap-1.5 h-10 cursor-pointer"
                      >
                        <BookOpen className="size-3.5" />
                        <span>Open Book</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>

                      {isKitUnlocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(kit);
                          }}
                          className="rounded-xl text-xs font-bold border-border/80 h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Direct PDF Download"
                        >
                          <Download className="size-4 text-[#f95c4b]" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKitForUnlock(kit);
                            setUnlockModalOpen(true);
                          }}
                          className="rounded-xl text-xs font-bold border-border/80 h-10 px-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                          title={`Special Offer: ₹${kit.price} (Regular ₹${REGULAR_PRICE})`}
                        >
                          <Lock className="size-4 text-amber-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TRUST & ACCREDITATION RIBBON ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">
              Govt MSME Registered
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              Official Skyrovix Educational Asset
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">
              Instant Unlocked Delivery
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              Immediate PDF & browser access
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Smartphone className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">
              Cross-Device Optimized
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              Read on Laptop, Tablet & Phone
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">
              Lifetime Revisions
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">
              Free updates as tech evolves
            </p>
          </div>
        </div>
      </div>

      {/* ─── COVER ZOOM MODAL ─── */}
      <Dialog open={coverZoomOpen} onOpenChange={setCoverZoomOpen}>
        <DialogContent className="max-w-3xl p-3 sm:p-5 rounded-3xl border border-border/70 bg-black/95 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="size-4 text-[#f95c4b]" />
              {bookForCoverZoom.title} &mdash; Cover Artwork
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
            <img
              src={bookForCoverZoom.cover_image_url || "/student-kit-cover.jpg"}
              alt="High-Res Cover Artwork"
              className="w-full h-auto object-contain max-h-[75vh]"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── PDF PREVIEW MODAL ─── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[96vh] h-[88vh] p-4 sm:p-6 rounded-3xl border border-border/70 flex flex-col bg-white dark:bg-[#181619]">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <DialogTitle className="font-display font-black text-lg text-[#181619] dark:text-white flex items-center gap-2">
                <BookOpen className="size-5 text-[#f95c4b]" />
                {bookForPreviewModal.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Skyrovix Official Student Learning Companion &mdash;{" "}
                {bookForPreviewModal.edition || "Edition 1.0 (2026)"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <Button
                size="sm"
                onClick={() => handleDownload(bookForPreviewModal)}
                className="brand-gradient text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <Download className="size-3.5" /> Download PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Embedded PDF Viewer */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-border/60 bg-slate-900 mt-2 shadow-inner">
            <iframe
              src={`${bookForPreviewModal.pdf_url}#toolbar=1`}
              title="Student Kit PDF Viewer"
              className="w-full h-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── UNLOCK PAYMENT MODAL (SPECIAL STUDENT OFFER ₹10 / ₹20) ─── */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border border-border/70 bg-white dark:bg-[#181619]">
          <DialogHeader className="text-left space-y-2">
            <div className="size-12 rounded-2xl brand-gradient flex items-center justify-center text-white mb-1 shadow-md shadow-[#f95c4b]/20">
              <Tag className="size-6" />
            </div>
            <DialogTitle className="font-display font-black text-xl text-[#181619] dark:text-white">
              Unlock {bookForUnlockModal.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isPremiumUser
                ? "As a Premium Track intern, this book is 100% complimentary for you!"
                : `Actual price is ₹${REGULAR_PRICE}.00. You get this book at the exclusive student offer price of ₹${bookForUnlockModal.price || 20}.00.`}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3.5">
            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#201d22] border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>{bookForUnlockModal.title} (Actual Price)</span>
                <span className="line-through font-semibold">₹{REGULAR_PRICE}.00</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Skyrovix Student Subsidy Discount</span>
                <span>
                  {isPremiumUser
                    ? `-₹${REGULAR_PRICE}.00 (100% OFF)`
                    : `-₹${REGULAR_PRICE - (bookForUnlockModal.price || 20)}.00 (Offer Applied)`}
                </span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between font-black text-sm text-[#181619] dark:text-white">
                <span>Special Offer Price Payable</span>
                <div className="flex items-center gap-2">
                  {!isPremiumUser && (
                    <span className="text-xs text-muted-foreground line-through font-bold">
                      ₹{REGULAR_PRICE}
                    </span>
                  )}
                  <span className="text-[#f95c4b] text-base font-black">
                    {isPremiumUser ? "₹0.00 (FREE)" : `₹${bookForUnlockModal.price || 20}.00`}
                  </span>
                </div>
              </div>
            </div>

            {/* Included highlights */}
            <ul className="text-xs space-y-2 text-muted-foreground font-medium pl-1">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Complete technical roadmap, cheat sheets & architecture diagrams
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Industry capstone project blueprints & sample code
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Lifetime download access & continuous updates
              </li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setUnlockModalOpen(false)}
              disabled={isProcessingUnlock}
              className="rounded-xl text-xs font-bold h-11 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsProcessingUnlock(true);
                unlockMutation.mutate(bookForUnlockModal.id);
              }}
              disabled={isProcessingUnlock || unlockMutation.isPending}
              className="rounded-xl brand-gradient text-white text-xs font-bold h-11 px-5 shadow-md shadow-[#f95c4b]/20 cursor-pointer hover:opacity-95"
            >
              {isProcessingUnlock || unlockMutation.isPending
                ? "Unlocking Kit..."
                : isPremiumUser
                  ? "Claim Free Kit Now"
                  : `Pay Offer Price (₹${bookForUnlockModal.price || 20})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
