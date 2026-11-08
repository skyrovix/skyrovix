import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Gift,
  FileText,
  Briefcase,
  Award,
  Star,
  BarChart3,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

const ANNOUNCEMENT_ITEMS = [
  { icon: "🎉", label: "SPECIAL ANNOUNCEMENT: Full Stack Internship Benefits Unlocked!", tag: "OFFICIAL NOTICE", isNotice: true },
  { icon: "🎁", label: "Free Professional Student Kit – Learning Resources & Dev Tools", tag: "100% FREE" },
  { icon: "⭐", label: "Official Letter of Recommendation (LOR) Included at No Cost", tag: "FREE LOR" },
  { icon: "💼", label: "Official Experience Letter upon Internship Completion", tag: "FREE BENEFIT" },
  { icon: "🎓", label: "Project Completion & Skill Achievement Certificates", tag: "FREE CERTS" },
  { icon: "🌟", label: "Certificate of Appreciation & Performance Evaluation Report", tag: "FREE REPORT" },
  { icon: "📚", label: "Choose Duration: 3-Month & 6-Month Full Stack Development Tracks", tag: "NOW OPEN" },
  { icon: "💰", label: "Zero Extra Charges for All 7 Documents • Only Application Fee Applies", tag: "NO EXTRA FEE" },
  { icon: "🚀", label: "Learn. Build. Practice. Achieve — Click to View Full Announcement", tag: "VIEW NOTICE", isNotice: true },
];

export function HeroRunningTicker() {
  const [openNotice, setOpenNotice] = useState(false);

  // Duplicate array twice for seamless continuous infinite marquee
  const duplicated = [...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS];

  return (
    <>
      <div
        aria-label="Skyrovix Official Internship Benefits Announcement"
        className="relative w-full border-y border-[#f95c4b]/20 bg-white/75 dark:bg-[#181619]/75 backdrop-blur-md py-2 sm:py-2.5 overflow-hidden select-none z-20 shrink-0 shadow-2xs group"
      >
        <style>{`
          @keyframes hero-marquee-track-scroll {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(-50%, 0, 0);
            }
          }
          .hero-running-track {
            display: flex !important;
            width: max-content !important;
            will-change: transform;
            animation: hero-marquee-track-scroll 32s linear infinite !important;
          }
          .hero-running-track:hover {
            animation-play-state: paused !important;
          }
          @media (max-width: 640px) {
            .hero-running-track {
              animation-duration: 22s !important;
            }
          }
        `}</style>

        {/* Left side gradient fade mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-20 bg-gradient-to-r from-[#faf8f2] dark:from-[#181619] to-transparent"
        />

        {/* Right side gradient fade mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-20 bg-gradient-to-l from-[#faf8f2] dark:from-[#181619] to-transparent"
        />

        {/* Running Marquee Track */}
        <div className="hero-running-track flex items-center gap-3 sm:gap-5 px-3">
          {duplicated.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setOpenNotice(true)}
              title="Click to view full benefits announcement"
              className={`inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border shadow-2xs backdrop-blur-sm transition-all duration-200 cursor-pointer shrink-0 ${
                item.isNotice
                  ? "bg-gradient-to-r from-[#f95c4b]/15 via-[#ee9590]/15 to-transparent border-[#f95c4b]/35 hover:scale-105"
                  : "bg-white/85 dark:bg-[#201d22]/85 border-border/60 hover:border-[#f95c4b]/40 hover:scale-[1.02]"
              }`}
            >
              <span className="text-sm sm:text-base leading-none">{item.icon}</span>
              <span className="text-[11px] sm:text-xs font-bold text-[#181619] dark:text-white/95 whitespace-nowrap">
                {item.label}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  item.isNotice
                    ? "bg-[#f95c4b] text-white border-[#f95c4b] shadow-xs"
                    : "bg-[#f95c4b]/10 text-[#f95c4b] dark:text-[#ee9590] border-[#f95c4b]/20"
                }`}
              >
                {item.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── FULL OFFICIAL ANNOUNCEMENT NOTICE MODAL ─── */}
      <Dialog open={openNotice} onOpenChange={setOpenNotice}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-7 rounded-3xl border border-border/60 bg-white/95 dark:bg-[#181619]/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#f95c4b]/15 text-[#f95c4b] border border-[#f95c4b]/30 text-xs font-black px-3 py-1">
                <Megaphone className="mr-1.5 size-3.5 inline animate-pulse" />
                OFFICIAL ANNOUNCEMENT
              </Badge>
              <Badge variant="outline" className="text-xs font-bold border-border/70">
                Full Stack Internship
              </Badge>
            </div>
            <DialogTitle className="font-display text-xl sm:text-2xl font-black text-[#181619] dark:text-white leading-tight">
              🎉 SKYROVIX – Full Stack Internship Benefits Announcement
            </DialogTitle>
            <p className="text-xs sm:text-sm font-semibold text-[#f95c4b] dark:text-[#ee9590]">
              Build Real-World Skills. Gain Professional Experience. Get Recognised!
            </p>
          </DialogHeader>

          <div className="mt-3 space-y-5 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {/* Intro paragraph */}
            <div className="p-4 rounded-2xl bg-[#faf8f2] dark:bg-[#201d22] border border-border/60 leading-relaxed font-medium">
              Skyrovix is excited to announce that our <strong>3-Month</strong> and <strong>6-Month Full Stack Development Internship Programs</strong> come with a comprehensive range of learning resources and professional recognition benefits at <strong>no additional cost</strong>.
            </div>

            {/* 7 Free Benefits Grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="size-4.5 text-[#f95c4b]" />
                <h4 className="font-display font-extrabold text-sm sm:text-base text-[#181619] dark:text-white">
                  🎁 What You Get – Absolutely FREE
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Students enrolled in either Full Stack Internship plan will receive all 7 professional credentials and kits:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: "Free Professional Student Kit",
                    desc: "Complete learning resources and development tools.",
                    icon: Gift,
                    badge: "FREE",
                  },
                  {
                    title: "Letter of Recommendation (LOR)",
                    desc: "Based on eligibility and performance.",
                    icon: FileText,
                    badge: "FREE",
                  },
                  {
                    title: "Experience Letter",
                    desc: "Upon meeting the internship completion requirements.",
                    icon: Briefcase,
                    badge: "FREE",
                  },
                  {
                    title: "Project Completion Certificate",
                    desc: "For successfully completed projects.",
                    icon: Award,
                    badge: "FREE",
                  },
                  {
                    title: "Skill Achievement Certificate",
                    desc: "Recognition of demonstrated technical skills.",
                    icon: CheckCircle2,
                    badge: "FREE",
                  },
                  {
                    title: "Certificate of Appreciation",
                    desc: "Recognition of outstanding contributions.",
                    icon: Star,
                    badge: "FREE",
                  },
                  {
                    title: "Performance Evaluation Report",
                    desc: "Assessment of technical skills, project work and overall performance.",
                    icon: BarChart3,
                    badge: "FREE",
                  },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-2xl border border-border/60 bg-white/80 dark:bg-[#201d22]/80 shadow-2xs"
                  >
                    <div className="size-8 rounded-xl bg-[#f95c4b]/10 text-[#f95c4b] flex items-center justify-center shrink-0 mt-0.5">
                      <b.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-[#181619] dark:text-white truncate">
                          {b.title}
                        </span>
                        <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                          {b.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration Options */}
            <div className="p-4 rounded-2xl border border-border/60 bg-[#faf8f2] dark:bg-[#201d22]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-[#f95c4b]" />
                <h4 className="font-display font-extrabold text-sm text-[#181619] dark:text-white">
                  📚 Choose Your Internship Duration
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#181619] border border-border/60 font-semibold text-xs">
                  <span className="size-2 rounded-full bg-[#f95c4b]" />
                  <span>3-Month Full Stack Development Internship</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#181619] border border-border/60 font-semibold text-xs">
                  <span className="size-2 rounded-full bg-[#f95c4b]" />
                  <span>6-Month Full Stack Development Internship</span>
                </div>
              </div>
            </div>

            {/* Transparent Fee Structure */}
            <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-display font-extrabold text-sm text-[#181619] dark:text-white">
                  💰 Transparent Fee Structure
                </h4>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">
                <li>• Student Kit: <strong className="text-emerald-600">FREE</strong></li>
                <li>• LOR: <strong className="text-emerald-600">FREE</strong></li>
                <li>• Experience Letter: <strong className="text-emerald-600">FREE</strong></li>
                <li>• Project Certificate: <strong className="text-emerald-600">FREE</strong></li>
                <li>• Skill Certificate: <strong className="text-emerald-600">FREE</strong></li>
                <li>• Appreciation Cert: <strong className="text-emerald-600">FREE</strong></li>
                <li>• Performance Report: <strong className="text-emerald-600">FREE</strong></li>
              </ul>
              <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-muted-foreground leading-relaxed">
                <p>
                  <strong>Only the Internship Application Fee is applicable.</strong> No additional charges for the above-listed benefits.
                </p>
              </div>
            </div>

            {/* Mission & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div>
                <p className="font-extrabold text-xs text-[#181619] dark:text-white">
                  🚀 Start Your Development Journey!
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Learn. Build. Practice. Achieve. — Skyrovix
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/auth" search={{ redirect: undefined }}>
                  <Button
                    onClick={() => setOpenNotice(false)}
                    className="brand-gradient text-white rounded-xl font-bold text-xs h-10 px-5 shadow-md shadow-[#f95c4b]/20 hover:opacity-95 cursor-pointer"
                  >
                    Apply for Full Stack Track <ArrowRight className="ml-1.5 size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Official Website Links & Disclaimer */}
            <div className="pt-3 border-t border-border/60 text-[10.5px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold">Official Portals:</span>
                <a
                  href="https://skyrovix.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f95c4b] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  www.skyrovix.in <ExternalLink className="size-2.5" />
                </a>
                <span>•</span>
                <a
                  href="https://skyrovix.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f95c4b] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  www.skyrovix.online <ExternalLink className="size-2.5" />
                </a>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground/80">
                Note: All certificates, letters and reports are issued subject to applicable internship completion criteria, project submissions and performance evaluations. LOR and appreciation recognition are subject to eligibility.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
