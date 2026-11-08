import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface StudentKitDashboardViewProps {
  app: any;
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
}

export function StudentKitDashboardView({
  app,
  isPremium,
  onUpgradeToPremium,
}: StudentKitDashboardViewProps) {
  const qc = useQueryClient();
  const [selectedKit, setSelectedKit] = useState<StudentKitItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [coverZoomOpen, setCoverZoomOpen] = useState(false);
  const [isProcessingUnlock, setIsProcessingUnlock] = useState(false);

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

  const kits = data?.kits || [];
  const isPremiumUser = Boolean(isPremium);

  // Primary kit (Web Development Student Kit)
  const primaryKit: StudentKitItem = kits[0] || {
    id: "sk-kit-webdev-10",
    title: "Web Development Student Kit",
    edition: "Edition 1.0 (2026 Release)",
    description:
      "From complete beginner to job-ready full stack developer. Complete learning resources, roadmap, cheat sheets, code templates & development tools.",
    pdf_url: "/SKYROVIX_Complete_Web_Development_Student_Kit.pdf",
    cover_image_url: "/student-kit-cover.jpg",
    price: 200,
    is_unlocked: isPremiumUser,
    unlock_reason: isPremiumUser ? "premium" : "locked",
    can_download: isPremiumUser,
  };

  const isUnlocked = Boolean(isPremiumUser);

  // Unlock mutation
  const unlockMutation = useMutation({
    mutationFn: async (kitId: string) => {
      return unlockStudentKitFn({
        data: {
          kitId,
          applicationId: app?.id,
          userId: app?.user_id,
          amount: isPremiumUser ? 0 : primaryKit.price || 20,
          paymentId: isPremiumUser ? "FREE_PREMIUM_PLAN" : `PAY_${Date.now()}`,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res.message || "Student kit unlocked successfully!");
      setUnlockModalOpen(false);
      qc.invalidateQueries({ queryKey: ["student-kits"] });
      // Trigger instant download
      window.open(res.downloadUrl, "_blank");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to unlock student kit.");
    },
    onSettled: () => {
      setIsProcessingUnlock(false);
    },
  });

  const handleDownload = (kit: StudentKitItem) => {
    if (isPremiumUser) {
      toast.success("Downloading Student Kit PDF...");
      const link = document.createElement("a");
      link.href = kit.pdf_url;
      link.download = "SKYROVIX_Complete_Web_Development_Student_Kit.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (onUpgradeToPremium) {
        onUpgradeToPremium();
      } else {
        setSelectedKit(kit);
        setUnlockModalOpen(true);
      }
    }
  };

  const handleOpenPreview = (kit: StudentKitItem) => {
    if (isPremiumUser) {
      setSelectedKit(kit);
      setPreviewOpen(true);
    } else {
      if (onUpgradeToPremium) {
        onUpgradeToPremium();
      } else {
        setSelectedKit(kit);
        setUnlockModalOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* ─── LUXURY SHOWCASE HERO CONTAINER ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-white via-[#faf7f2] to-white dark:from-[#181619] dark:via-[#1e1b21] dark:to-[#181619] shadow-xl shadow-orange-500/5">
        {/* Ambient Top Glow Mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-400/10 via-[#f95c4b]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/10 via-orange-400/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* ─── LEFT: 3D BOOK & BUDDY ARTWORK SHOWCASE ─── */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group w-full max-w-[460px]">
                {/* Ambient Soft Glow Behind Book */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#f95c4b]/20 via-amber-500/15 to-orange-400/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-90 transition duration-500 -z-10" />

                {/* Main 3D Artwork Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-border/70 dark:border-white/10 bg-slate-900 shadow-2xl shadow-slate-900/25 transition-transform duration-300 group-hover:scale-[1.015]">
                  <img
                    src={primaryKit.cover_image_url || "/student-kit-cover.jpg"}
                    alt="Skyrovix Web Development Student Kit Cover"
                    className="w-full h-auto object-cover select-none block"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/student-kit-cover.jpg";
                    }}
                  />

                  {/* Corner Zoom Trigger */}
                  <button
                    type="button"
                    onClick={() => setCoverZoomOpen(true)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md flex items-center gap-1.5 text-xs font-bold"
                    title="Zoom Full Artwork"
                  >
                    <Maximize2 className="size-3.5" />
                    <span>View Cover</span>
                  </button>
                </div>

                {/* Sub-Artwork Specifications Bar */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Format</p>
                    <p className="text-xs font-black text-[#181619] dark:text-white mt-0.5">High-Res PDF</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Volume</p>
                    <p className="text-xs font-black text-[#181619] dark:text-white mt-0.5">120+ Pages</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-border/60 backdrop-blur-xs">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Edition</p>
                    <p className="text-xs font-black text-[#f95c4b] mt-0.5">2026 Release</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: KIT DETAILS & ACCESS CONTROL ─── */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Top Badges & Title */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="brand-gradient text-white border-0 text-xs font-black px-3 py-1 shadow-xs tracking-wide">
                    <Gift className="mr-1.5 size-3.5 inline" />
                    OFFICIAL STUDENT KIT
                  </Badge>
                  <Badge variant="outline" className="text-xs font-bold border-border/80 bg-white/70 dark:bg-black/30">
                    Edition 1.0 (2026)
                  </Badge>

                  {isPremiumUser ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-1">
                      <Crown className="mr-1.5 size-3.5 inline text-amber-500" />
                      100% Free with Premium Track
                    </Badge>
                  ) : isUnlocked ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-1">
                      <CheckCircle2 className="mr-1.5 size-3.5 inline" />
                      Unlocked & Ready to Download
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-black px-2.5 py-1">
                      Standard Plan: ₹{primaryKit.price}
                    </Badge>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-black text-[#181619] dark:text-white tracking-tight leading-tight">
                  Web Development Student Kit
                </h1>

                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                  From complete beginner to job-ready full stack engineer. Your official Skyrovix companion containing structured learning roadmaps, capstone blueprints, 10+ cheat sheets, and industry interview toolkits.
                </p>
              </div>

              {/* Quick Spec Pills Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                  <div className="size-8 rounded-lg bg-orange-500/10 text-[#f95c4b] flex items-center justify-center shrink-0">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Curriculum</p>
                    <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">120+ Pages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                  <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Laptop className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Projects</p>
                    <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">5 Capstones</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                  <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Code2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Stack</p>
                    <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">React & Node</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#201d22] border border-border/60 shadow-2xs">
                  <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase">Access</p>
                    <p className="text-xs font-extrabold text-[#181619] dark:text-white truncate">Lifetime</p>
                  </div>
                </div>
              </div>

              {/* ─── ACTION & ACCESS CONTROL PANEL ─── */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 dark:from-[#201d22] dark:via-[#252028] dark:to-[#201d22] border-2 border-[#f95c4b]/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-[#181619] dark:text-white tracking-tight">
                        {isPremiumUser ? "UNLOCKED & FREE" : "LOCKED (PREMIUM ONLY)"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {isPremiumUser
                        ? "✨ Complimentarily unlocked for your Full Stack Premium Internship plan."
                        : "The official Student Kit is exclusively available for verified Full Stack Premium Interns."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                    {isPremiumUser ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleOpenPreview(primaryKit)}
                          className="rounded-xl border-border/80 text-xs font-bold gap-2 h-11 px-4 cursor-pointer hover:bg-white dark:hover:bg-white/10 shadow-2xs"
                        >
                          <Eye className="size-4 text-[#f95c4b]" />
                          Preview Online
                        </Button>
                        <Button
                          onClick={() => handleDownload(primaryKit)}
                          className="rounded-xl brand-gradient text-white text-xs font-extrabold gap-2 h-11 px-5 shadow-lg shadow-[#f95c4b]/25 cursor-pointer hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Download className="size-4" />
                          Download PDF Kit
                        </Button>
                      </>
                    ) : (
                      <>
                        {onUpgradeToPremium && (
                          <Button
                            onClick={onUpgradeToPremium}
                            className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold gap-2 h-11 px-6 shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            <Crown className="size-4" />
                            {app?.plan_type === "premium" ? "Complete Payment (₹200) to Unlock" : "Upgrade to Premium (₹200) to Unlock"}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Standard Student Upgrade Hint */}
                {!isPremiumUser && !isUnlocked && (
                  <div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-2 font-medium">
                      <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                      Premium interns get the Student Kit + LOR + 7 Certificates for ₹0.
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

      {/* ─── TRUST & ACCREDITATION RIBBON ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">Govt MSME Registered</p>
            <p className="text-[11px] text-muted-foreground font-medium">Official Skyrovix Educational Asset</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">Instant Unlocked Delivery</p>
            <p className="text-[11px] text-muted-foreground font-medium">Immediate PDF & browser access</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Smartphone className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">Cross-Device Optimized</p>
            <p className="text-[11px] text-muted-foreground font-medium">Read on Laptop, Tablet & Phone</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181619] border border-border/70 flex items-center gap-3 shadow-2xs">
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-[#181619] dark:text-white">Lifetime Revisions</p>
            <p className="text-[11px] text-muted-foreground font-medium">Free updates as tech evolves</p>
          </div>
        </div>
      </div>

      {/* ─── COVER ZOOM MODAL ─── */}
      <Dialog open={coverZoomOpen} onOpenChange={setCoverZoomOpen}>
        <DialogContent className="max-w-3xl p-3 sm:p-5 rounded-3xl border border-border/70 bg-black/95 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="size-4 text-[#f95c4b]" />
              Skyrovix Web Development Student Kit Cover Artwork
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
            <img
              src={primaryKit.cover_image_url || "/student-kit-cover.jpg"}
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
                {selectedKit?.title || "Web Development Student Kit"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Skyrovix Official Student Learning Companion — {selectedKit?.edition || "Edition 1.0 (2026)"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <Button
                size="sm"
                onClick={() => selectedKit && handleDownload(selectedKit)}
                className="brand-gradient text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <Download className="size-3.5" /> Download PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Embedded PDF Viewer */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-border/60 bg-slate-900 mt-2 shadow-inner">
            <iframe
              src={`${selectedKit?.pdf_url || "/SKYROVIX_Complete_Web_Development_Student_Kit.pdf"}#toolbar=1`}
              title="Student Kit PDF Viewer"
              className="w-full h-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── UNLOCK PAYMENT MODAL (STANDARD PLAN ₹20) ─── */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border border-border/70 bg-white dark:bg-[#181619]">
          <DialogHeader className="text-left space-y-2">
            <div className="size-12 rounded-2xl brand-gradient flex items-center justify-center text-white mb-1 shadow-md shadow-[#f95c4b]/20">
              <Gift className="size-6" />
            </div>
            <DialogTitle className="font-display font-black text-xl text-[#181619] dark:text-white">
              Unlock Web Development Student Kit
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {isPremiumUser
                ? "As a Premium Track intern, this kit is 100% complimentary for you!"
                : "Standard Plan nominal download fee to access full developer kit, capstone blueprints & code templates."}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3.5">
            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#201d22] border border-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Student Kit Edition 1.0 (Full 120+ Pages)</span>
                <span>₹499.00</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Skyrovix Student Education Subsidy</span>
                <span>{isPremiumUser ? "-₹499.00" : "-₹479.00"}</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between font-black text-sm text-[#181619] dark:text-white">
                <span>Total Payable Amount</span>
                <span className="text-[#f95c4b] text-base">
                  {isPremiumUser ? "₹0.00 (FREE)" : `₹${primaryKit.price}.00`}
                </span>
              </div>
            </div>

            {/* Included highlights */}
            <ul className="text-xs space-y-2 text-muted-foreground font-medium pl-1">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Complete HTML, CSS, JS, React & Node.js cheat sheets
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                5 Production-grade capstone project blueprints
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
                unlockMutation.mutate(selectedKit?.id || primaryKit.id);
              }}
              disabled={isProcessingUnlock || unlockMutation.isPending}
              className="rounded-xl brand-gradient text-white text-xs font-bold h-11 px-5 shadow-md shadow-[#f95c4b]/20 cursor-pointer hover:opacity-95"
            >
              {isProcessingUnlock || unlockMutation.isPending ? (
                "Unlocking Kit..."
              ) : isPremiumUser ? (
                "Claim Free Kit Now"
              ) : (
                `Complete Payment (₹${primaryKit.price})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
