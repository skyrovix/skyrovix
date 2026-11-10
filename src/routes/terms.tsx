import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, FileSignature, ShieldCheck, UserCheck, 
  BookOpen, Briefcase, AlertCircle, CheckCircle2, 
  Clock, Scale, HelpCircle, Mail, ArrowRight, Award, Lock,
  IndianRupee, Gift, Sparkles, Tag, Zap, CreditCard, Check, Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Skyrovix Internship & Course Platform" },
      { 
        name: "description", 
        content: "Skyrovix terms of service. Transparent rules covering 100% free internship applications, certificate verification fees, course access, and student responsibilities." 
      },
      { 
        name: "keywords", 
        content: "skyrovix terms and conditions, free internship application, certificate fee policy, internship rules, student responsibilities, skyrovix terms of service, msme certificate verification" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Terms & Conditions — Skyrovix" },
      { 
        property: "og:description", 
        content: "Clear rules and standards governing 100% free applications, certificate issuance fees, courses, internships, and user conduct on Skyrovix." 
      },
      { property: "og:url", content: "https://skyrovix.online/terms" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms & Conditions — Skyrovix" },
      { 
        name: "twitter:description", 
        content: "Review Skyrovix platform rules on 100% free applications, certificate fees, courses, and internships." 
      },
      { rel: "canonical", href: "https://skyrovix.online/terms" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground flex flex-col justify-between">
      <WebPageJsonLd
        title="Terms & Conditions — Skyrovix"
        description="Skyrovix terms and conditions covering 100% free applications, certificate fee policies, course access, internship rules, and user responsibilities."
        url="https://skyrovix.online/terms"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online" },
          { name: "Terms & Conditions", url: "https://skyrovix.online/terms" },
        ]}
      />
      <Navbar />

      {/* Hero Header */}
      <AuroraBackground>
        <section className="relative pb-10 sm:pb-16 pt-20 sm:pt-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <FadeUp>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3.5 py-1.5 text-xs font-bold text-[#f95c4b] backdrop-blur shadow-sm">
                <FileSignature className="size-3.5" /> Platform Service Agreement
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#181619] dark:text-white">
                Terms & <span className="brand-text">Conditions</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Please read these terms carefully before accessing our virtual internships or courses. They define our 100% free application policy, certificate fee structure, learning privileges, and student responsibilities.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground font-medium bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <Clock className="size-3.5 text-slate-500" />
                <span>Last Updated: November 2026</span>
              </div>
            </FadeUp>
          </div>
        </section>
      </AuroraBackground>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        {/* 5 Pillars Summary Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Account Usage</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Authentic profile data, non-transferable access, one student per account, and security.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Gift className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">100% Free Application</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Zero registration charges, free official Offer Letter, and free access to project tasks.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Certificate Fee</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Nominal fee upon task completion for MSME verification, QR credentials, and LOR.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
              <Briefcase className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Internship Rules</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Sequential task reviews, GitHub code verification, mentor feedback, and educational status.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5 sm:col-span-2 lg:col-span-1">
            <div className="size-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldCheck className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Student Conduct</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Strict anti-plagiarism compliance, payment integrity, and ethical professional conduct.
            </p>
          </div>
        </div>

        {/* Section 1: Account Usage */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                1. Account Usage & Profile Integrity
              </h2>
              <p className="text-xs text-muted-foreground">Guidelines governing student registration, security, and account management</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              To participate in Skyrovix virtual internships or enroll in courses, you must create an authentic user account:
            </p>
            <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>Accurate Information:</strong> You agree to provide accurate, up-to-date, and truthful information during registration, including your real full name (as it should appear on official certificates), email address, phone number, and academic institution.
              </li>
              <li>
                <strong>Individual & Non-Transferable:</strong> Accounts are strictly personal. You may not sell, trade, lease, transfer, or share your account credentials with any other student or third party.
              </li>
              <li>
                <strong>One Student, One Account:</strong> Students are limited to one active user account. Creating duplicate accounts to circumvent task reviews or exploit promotions is prohibited.
              </li>
              <li>
                <strong>Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality of your login credentials. You must notify Skyrovix immediately at <a href="mailto:skyrovix@gmail.com" className="text-blue-600 font-semibold hover:underline">skyrovix@gmail.com</a> if you suspect unauthorized access.
              </li>
              <li>
                <strong>Account Suspension/Termination:</strong> Skyrovix reserves the right to suspend or permanently deactivate accounts that engage in fraudulent submissions, security tampering, payment forgery, or violation of these terms.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2: Course Access */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                2. Course Access & Intellectual Property
              </h2>
              <p className="text-xs text-muted-foreground">Terms governing educational materials, video lessons, and curriculum licensing</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              When you enroll in a Skyrovix course, you receive a limited, revocable, personal, non-exclusive license to access the curriculum for personal educational growth:
            </p>
            <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
              <li>
                <strong>Scope of Access:</strong> Enrollment grants access to designated video lectures, interactive coding exercises, reference source files, and assessments for the specified course duration.
              </li>
              <li>
                <strong>Copyright & Anti-Piracy:</strong> All video content, diagrams, assignments, and curriculum text are proprietary intellectual property of Skyrovix. Unauthorized downloading, screen recording, republishing, sharing on file-hosting platforms (such as Telegram, Mega, or Google Drive), or commercial redistribution is strictly illegal and will result in immediate legal action under the Indian Copyright Act.
              </li>
              <li>
                <strong>Course Certification:</strong> To earn a verified course certificate, students must complete all required modules and achieve the minimum passing grade on the final assessment quiz.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Internship Rules */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                3. Internship Rules & Progression Guidelines
              </h2>
              <p className="text-xs text-muted-foreground">Requirements for task progression, mentor reviews, and completion workflow</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Skyrovix virtual internships are project-oriented programs structured to provide genuine industry development experience. All interns must adhere to the following workflow:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Task Progression & Verification
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Task 0 (LinkedIn Announcement):</strong> Mandatory social verification task to confirm internship acceptance before domain projects unlock.</li>
                  <li><strong>Sequential Unlock:</strong> Tasks must be completed in order. Task N+1 unlocks only after Task N is evaluated and approved by an admin or mentor.</li>
                  <li><strong>Submission Quality:</strong> Submissions must include working GitHub repository links and live hosted deployment URLs (e.g. Vercel, Netlify, Render).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Review, Revisions & Completion
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Mentor Revisions:</strong> If a task does not meet specifications, mentors provide constructive feedback for resubmission without penalty.</li>
                  <li><strong>Completion Criteria:</strong> All required domain tasks (5 tasks for 1 month, 8 for 2 months, 10 for 3 months, 12 for 6 months, or 25/50 for Premium) must be verified and passed.</li>
                  <li><strong>Certificate Eligibility:</strong> The official certificate issuance workflow is unlocked only after 100% of the required curriculum tasks have been successfully approved.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <p className="font-bold">Educational Non-Employment Disclaimer:</p>
              <p>
                Skyrovix virtual internships are skill-building educational programs. Participation does not establish an employer-employee relationship, does not constitute an employment contract, does not guarantee job placement, and does not provide financial wages or stipends.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: DEDICATED FEE POLICY (Application Free, Certificate Fee, Premium Track & Waivers) */}
        <section className="rounded-3xl border border-amber-300/80 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <IndianRupee className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  4. Fee Policy: Standard (₹100) &amp; Premium (₹200) Plan Pricing Structure
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Transparent Pricing
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete transparency regarding 100% free application, Standard Plan (₹100 certificate fee), and Premium Plan (₹200 all-inclusive)
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {/* ── Official Plan Pricing Comparison Grid ── */}
            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              {/* Standard Plan Card */}
              <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Standard Internship Plan
                  </Badge>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Free Application (₹0)
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Standard Track</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Self-paced practical domain internship for all students</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Application &amp; Registration:</span>
                    <span className="text-sm font-extrabold text-emerald-600">₹0 (100% FREE)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Official Offer Letter &amp; ID:</span>
                    <span className="text-xs font-extrabold text-emerald-600">₹0 (FREE)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Task Access &amp; Mentor Reviews:</span>
                    <span className="text-xs font-extrabold text-emerald-600">₹0 (FREE)</span>
                  </div>
                  <div className="border-t border-border/50 pt-1 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Certificate &amp; LOR Fee:</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">₹100 (At Completion)</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground text-right italic">
                    *₹0 (100% Free) with FIRST100 or Scholarship Coupon
                  </div>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>No Upfront Charges:</strong> Start working on your tasks immediately for free.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Standard Tasks:</strong> 5 (1M), 8 (2M), 10 (3M), or 12 (6M) projects.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Payable Only If Passed:</strong> ₹100 certificate fee is charged only after mentor approves all tasks.</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan Card */}
              <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-500/5 via-white to-orange-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/10 p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                  VIP INTENSIVE
                </div>

                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500 text-white text-xs font-bold border-0">
                    👑 Premium Internship Plan
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Premium Track <Crown className="size-4 text-amber-500" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Advanced full-stack capstone track with priority 1-on-1 mentorship</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Application &amp; Registration:</span>
                    <span className="text-sm font-extrabold text-emerald-600">₹0 (100% FREE)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Premium Plan Upgrade:</span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">₹200 (One-Time)</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Certificate Fee at End:</span>
                    <span className="text-xs font-extrabold text-emerald-600">₹0 (Included in ₹200)</span>
                  </div>
                  <div className="border-t border-amber-500/20 pt-1 text-[10px] text-muted-foreground text-right italic">
                    *₹150 with PREM50 · ₹175 with PREM25 · ₹0 with PREMFREE
                  </div>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>All-Inclusive ₹200 Price:</strong> Zero additional certificate fees upon completion.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Intensive Tasks:</strong> 25 Projects (3-Month track) or 50 Projects (6-Month track).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>VIP Mentorship:</strong> Priority queue, 1-on-1 guidance &amp; architecture review.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4.1 100% Free Application Policy */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <Gift className="size-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    4.1 100% Free Internship Application Policy
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Zero Upfront Cost (₹0)
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Skyrovix believes every aspiring engineer and student should have unhindered access to high-quality project experience. Therefore, <strong>all internship applications across all domains are 100% FREE</strong>:
              </p>

              <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
                <li>
                  <strong>No Registration or Application Charges:</strong> Students can register, browse all internship domains (Full Stack, Python, Java, Data Science, AI/ML, Cyber Security, Cloud, UI/UX, etc.), select their preferred duration (1, 2, 3, or 6 months), and submit their application with <strong>₹0 upfront fee</strong>.
                </li>
                <li>
                  <strong>Free Official Offer Letter:</strong> Upon application submission and acceptance, an official Skyrovix Offer Letter and Student ID card are generated and issued to the student's dashboard completely free of charge.
                </li>
                <li>
                  <strong>Free Curriculum &amp; Task Access:</strong> Enrolled students gain immediate access to all project task briefs, GitHub submission forms, curriculum guidance documents, and mentor code review without paying any registration fee.
                </li>
              </ul>
            </div>

            {/* 4.2 Certificate Processing & Verification Fee */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="size-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    4.2 Certificate Processing &amp; Verification Fee
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Upon Task Completion Only
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                To maintain the integrity, government compliance, and credibility of our credentials, an official <strong>Certificate Processing &amp; Verification Fee</strong> is charged only after a student completes all required domain tasks:
              </p>

              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" /> What the Fee Covers
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Government MSME Registered credential verification.</li>
                    <li>Cryptographically signed Certificate of Completion with unique Certificate ID (e.g. <code>SK-CERT-XXXXX</code>).</li>
                    <li>Permanent live QR code verification hosted on <code>skyrovix.online/verify</code>.</li>
                    <li>Official Letter of Recommendation (LOR) &amp; Performance Evaluation Report signed by Founders.</li>
                    <li>Secure lifetime cloud credential storage for resumes and LinkedIn.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-blue-500" /> When It Is Charged
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                    <li>The fee is <strong>never charged upfront</strong> during registration.</li>
                    <li>Payment is unlocked only after 100% of project tasks are submitted, evaluated, and approved by mentors.</li>
                    <li>Students who do not wish to claim a verified certificate are under no obligation to pay.</li>
                    <li>Standard certificate fee is nominally fixed at <strong>₹100</strong> (inclusive of verification, cloud hosting, and MSME compliance), which can be waived to <strong>₹0 (100% Free)</strong> with valid scholarship coupons.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4.3 100% Free Certificate Waivers & Coupon Redemptions */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-purple-200/80 dark:border-purple-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                    <Tag className="size-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    4.3 100% Free Waivers &amp; Scholarship Coupons
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                  Scholarships &amp; Offers
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Skyrovix actively sponsors top-performing students and early cohort applicants through discount vouchers and 100% free waivers:
              </p>

              <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
                <li>
                  <strong>100% Free Certificate Waivers:</strong> Eligible students holding official promotional coupons (such as <code>FIRST100</code>, <code>PREMFREE</code>, or merit-based admin grants) can claim their verified certificate package with <strong>zero payment (₹0)</strong>. Instant fulfillment is activated directly on the portal without requiring payment gateway processing.
                </li>
                <li>
                  <strong>Discount Offers:</strong> Verified coupons (e.g. ₹50 OFF, ₹25 OFF, or percentage discounts) can be applied directly inside the checkout dialog, automatically deducting the discount from the total payable amount.
                </li>
                <li>
                  <strong>Single-Use &amp; Validity:</strong> Coupons are subject to specified usage limits, expiration dates, and account restrictions as defined during issuance.
                </li>
              </ul>
            </div>

            {/* 4.4 Premium Plan (Full Stack Intensive & VIP Upgrade) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-amber-200/80 dark:border-amber-800/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Zap className="size-4 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    4.4 Premium Plan Upgrade (Full Stack Intensive — ₹200)
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Fixed ₹200 Price
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                For students seeking deep industry immersion, Skyrovix offers an optional <strong>Premium Plan Upgrade</strong> at a fixed price of <strong>₹200</strong> (one-time payment, all-inclusive with zero extra fees at completion):
              </p>

              <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
                <li>
                  <strong>All-Inclusive Fixed Fee:</strong> The ₹200 fee covers the entire program from start to finish, including curriculum, priority reviews, verified MSME certificate, LOR, and digital credentials with <strong>no separate certificate fee at the end</strong>.
                </li>
                <li>
                  <strong>Advanced Capstone Track:</strong> Unlocks comprehensive sequential tracks featuring <strong>25 projects (3-Month track)</strong> or <strong>50 projects (6-Month track)</strong> with architecture reviews and production deployment standards.
                </li>
                <li>
                  <strong>Priority Mentor Guidance &amp; Speed Reviews:</strong> Premium students receive expedited task reviews, priority 1-on-1 code feedback, and dedicated interview preparation resources.
                </li>
                <li>
                  <strong>Exclusive Offer Coupons:</strong> Students can apply Premium-specific discount coupons during payment, such as <code>PREM50</code> (Flat ₹50 OFF &rarr; ₹150 payable), <code>PREM25</code> (Flat ₹25 OFF &rarr; ₹175 payable), or <code>PREMFREE</code> (100% Free Waiver &rarr; ₹0 payable).
                </li>
              </ul>
            </div>

            {/* 4.5 Payment Gateway & Non-Refundability */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="size-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  4.5 Payment Processing, Gateway Security &amp; Non-Refundability
                </h3>
              </div>

              <ul className="text-xs sm:text-sm space-y-2 list-disc pl-5">
                <li>
                  <strong>Secure Payment Gateways:</strong> Online transactions are processed through RBI-authorized payment aggregator <strong>Cashfree Payments</strong> using 256-bit SSL encryption, supporting UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, and Net Banking.
                </li>
                <li>
                  <strong>Manual UPI Verification:</strong> Students opting for direct UPI QR payment must enter their authentic bank UTR / Reference ID for manual admin verification within 12–24 hours.
                </li>
                <li>
                  <strong>Non-Refundable Policy Upon Generation:</strong> Because official certificates, LORs, and verification QR codes are cryptographically generated, registered under Ministry of MSME guidelines, and permanently indexed in the public registry for employer verification, certificate fees are <strong>strictly non-refundable</strong> once generated.
                </li>
                <li>
                  <strong>Duplicate Payment Guarantee:</strong> In the rare event that a bank network delay causes an accidental duplicate charge for the same student ID, <strong>100% of the duplicate amount is refunded immediately</strong> upon UTR submission to <a href="mailto:skyrovix@gmail.com" className="text-blue-600 font-semibold hover:underline">skyrovix@gmail.com</a>.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 5: User Responsibilities */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                5. User Responsibilities & Code of Conduct
              </h2>
              <p className="text-xs text-muted-foreground">Mandatory student obligations regarding integrity, payments, and platform conduct</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              As a member of the Skyrovix student community, you agree to conduct yourself with the highest standards of professional ethics:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Academic Honesty & Anti-Plagiarism
                </div>
                <p className="text-xs text-muted-foreground">
                  You agree to submit 100% original project code. While open-source reference libraries are encouraged, direct uncredited plagiarism, copying from fellow students, or submitting unmodified AI boilerplate without comprehension will result in instant rejection of your internship.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                  <Lock className="size-4 text-rose-600" /> Payment Integrity & Anti-Fraud
                </div>
                <p className="text-xs text-muted-foreground">
                  You must submit authentic UPI Transaction / UTR numbers and genuine bank confirmation screenshots. Uploading forged, edited, or borrowed payment proofs is a criminal offence that results in immediate expulsion, cancellation of all credentials, and legal reporting.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                  <UserCheck className="size-4 text-blue-600" /> Respectful Communication
                </div>
                <p className="text-xs text-muted-foreground">
                  You agree to treat mentors, evaluators, and support staff with courtesy. Abusive, harassing, discriminatory, or defamatory language in review notes or emails will lead to account termination.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                  <Scale className="size-4 text-purple-600" /> Legal Compliance
                </div>
                <p className="text-xs text-muted-foreground">
                  You agree to comply with all applicable local, national, and international laws, including the Information Technology Act, 2000, and intellectual property rights regulations in India.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Limitation of Liability & Contact */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Scale className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                6. Limitation of Liability & Governing Law
              </h2>
              <p className="text-xs text-muted-foreground">Legal jurisdiction and scope of platform warranty</p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Skyrovix provides educational tools and internship frameworks on an &quot;as is&quot; and &quot;as available&quot; basis. In no event shall Skyrovix, its founders, mentors, or affiliates be liable for any indirect, punitive, or consequential damages resulting from platform downtime, internet disruptions, or career outcomes.
            </p>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Tamil Nadu, India.
            </p>
          </div>
        </section>

        {/* Section 7: Support Callout */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Mail className="size-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Questions Regarding Our Terms &amp; Policies?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            For questions regarding 100% free applications, certificate fee policies, scholarship waivers, or institutional partnerships, contact our support desk.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:skyrovix@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              <Mail className="size-4" /> Email: skyrovix@gmail.com
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all"
            >
              <span>Contact Support</span> <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
