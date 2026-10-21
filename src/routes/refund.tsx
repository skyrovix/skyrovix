import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, RotateCcw, Clock, CreditCard, BookOpen, 
  Briefcase, CheckCircle2, AlertCircle, Mail, ShieldCheck, 
  Sparkles, HelpCircle, ArrowRight 
} from "lucide-react";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — Skyrovix" },
      { 
        name: "description", 
        content: "Skyrovix refund and cancellation policy. Learn about course refund eligibility, cancellation periods, internship fee refund rules, and refund processing timelines." 
      },
      { 
        name: "keywords", 
        content: "skyrovix refund policy, cancellation policy, course refund eligibility, internship fee refund, refund processing timeline, skyrovix returns" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Refund & Cancellation Policy — Skyrovix" },
      { 
        property: "og:description", 
        content: "Transparent refund and cancellation policy for Skyrovix courses and virtual internship programs." 
      },
      { property: "og:url", content: "https://skyrovix.online/refund" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Refund & Cancellation Policy — Skyrovix" },
      { 
        name: "twitter:description", 
        content: "Learn about Skyrovix refund rules for courses and internship verification fees." 
      },
      { rel: "canonical", href: "https://skyrovix.online/refund" },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground flex flex-col justify-between">
      <WebPageJsonLd
        title="Refund & Cancellation Policy — Skyrovix"
        description="Skyrovix refund and cancellation policy covering course refunds, cancellation windows, internship fee rules, and processing timelines."
        url="https://skyrovix.online/refund"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online" },
          { name: "Refund Policy", url: "https://skyrovix.online/refund" },
        ]}
      />
      <Navbar />

      {/* Header Banner */}
      <AuroraBackground>
        <section className="relative pb-10 sm:pb-16 pt-20 sm:pt-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <FadeUp>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-3.5 py-1.5 text-xs font-bold text-[#f95c4b] backdrop-blur shadow-sm">
                <Sparkles className="size-3.5" /> Fair Transparency Policy
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#181619] dark:text-white">
                Refund & <span className="brand-text">Cancellation Policy</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                We believe in complete transparency. Review our clear policies regarding course refunds, cancellation windows, internship certification fees, and refund processing timelines.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground font-medium bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <Clock className="size-3.5 text-slate-500" />
                <span>Last Updated: September 2026</span>
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

        {/* Quick Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <BookOpen className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Course Refunds</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Eligible within 48–72 hours of purchase if less than 20% of content is accessed and no quizzes attempted.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
              <Briefcase className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Internship Fees</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Certificate processing fees are non-refundable once documents are generated or mentor review is performed.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Processing Time</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Approved refunds are processed in 3–5 working days and credited to original UPI/bank account in 5–7 days.
            </p>
          </div>
        </div>

        {/* Section 1: Course Refund Eligibility */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                1. Course Refund Eligibility
              </h2>
              <p className="text-xs text-muted-foreground">Conditions for claiming a refund on purchased courses</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            At Skyrovix, we strive to deliver top-tier hands-on educational courses. If you are not satisfied with a self-paced or guided course, you may be eligible for a refund under the following strict conditions:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="size-4 shrink-0" /> When You Are Eligible
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li>Refund request submitted within the official <strong>48–72 hour</strong> cancellation period.</li>
                <li>Less than <strong>20% of the total course modules</strong> have been completed or viewed.</li>
                <li>No course quizzes or exams have been attempted or submitted.</li>
                <li>No course completion certificate has been generated or issued.</li>
                <li>Verified technical defect on our platform that prevents course access, unresolved within 72 hours by our support team.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-200/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs sm:text-sm">
                <AlertCircle className="size-4 shrink-0" /> When You Are Not Eligible
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li>More than 20% of the course lectures, lessons, or code exercises have been accessed.</li>
                <li>Any graded quiz or assessment has been taken.</li>
                <li>The course certificate of completion has already been issued or claimed.</li>
                <li>Course resource files, project source code, or solution archives have been downloaded.</li>
                <li>Refund request made after the expiration of the cancellation window.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Cancellation Period */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                2. Cancellation Period & How to Request
              </h2>
              <p className="text-xs text-muted-foreground">Time limits and procedure to cancel your enrollment</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              The cancellation window begins immediately at the moment your payment is confirmed:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                Standard Window: <span className="text-blue-600 dark:text-blue-400 font-bold">Within 48 to 72 Hours</span> of payment confirmation.
              </p>
              <p className="text-xs text-muted-foreground">
                Requests submitted after 72 hours from the purchase timestamp will not be eligible for cancellation or refund under any circumstances.
              </p>
            </div>

            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 pt-2">Steps to Request Cancellation:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                Send an email from your <strong>registered Skyrovix account email address</strong> to <a href="mailto:skyrovix@gmail.com" className="font-semibold text-blue-600 underline">skyrovix@gmail.com</a>.
              </li>
              <li>
                Use the exact subject line: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-xs text-blue-600">[CANCELLATION REQUEST] - Your Full Name - Course Name</code>.
              </li>
              <li>
                Include your <strong>Student ID</strong>, <strong>Payment Transaction / UTR Number</strong>, and the <strong>reason for cancellation</strong>.
              </li>
              <li>
                Our billing and audit team will verify your content consumption logs and respond within <strong>24–48 working hours</strong>.
              </li>
            </ol>
          </div>
        </section>

        {/* Section 3: Internship Fee Refund Rules */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                3. Internship Fee Refund Rules
              </h2>
              <p className="text-xs text-muted-foreground">Policies regarding application fees, certificate issuance fees, and duplicate payments</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <CreditCard className="size-4 text-blue-600" /> Certificate Processing Fee
              </h3>
              <p className="text-xs text-muted-foreground">
                Skyrovix virtual internship applications and task learning are free. The nominal certificate processing fee covers manual mentor task evaluation, administrative verification, secure cloud hosting, and cryptographic tamper-proof QR code generation.
              </p>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Non-Refundable Policy: Once payment is submitted and verified by admin, or when official credentials (Offer Letter, ID Card, or Verified Certificate) are generated, the fee is non-refundable.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" /> 100% Refund for Duplicate Payments
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                If a technical error or bank network delay causes an accidental duplicate deduction (i.e. you were charged more than once for the same application or course), <strong>100% of the duplicate amount will be refunded immediately</strong> upon bank UTR reconciliation.
              </p>
              <p className="text-xs text-muted-foreground">
                Simply email your UTR numbers and screenshots to <a href="mailto:skyrovix@gmail.com" className="text-blue-600 font-medium">skyrovix@gmail.com</a> with the subject <code>[DUPLICATE PAYMENT REFUND]</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Discounts, Promotional Offers & Fee Waivers:</p>
              <p>
                Promotional coupons, early-bird vouchers, and certificate free-offer waivers carry zero cash value and cannot be exchanged, transferred, or converted into cash refunds.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Refund Processing Timeline */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                4. Refund Processing Timeline
              </h2>
              <p className="text-xs text-muted-foreground">Step-by-step turnaround times from review to bank settlement</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 relative">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative space-y-2">
              <div className="inline-flex items-center justify-center size-8 rounded-full bg-blue-600 text-white font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Verification & Audit</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">24 – 48 Working Hours</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our support team checks your application logs, UTR transaction records, and confirms eligibility under our policy.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative space-y-2">
              <div className="inline-flex items-center justify-center size-8 rounded-full bg-blue-600 text-white font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Approval & Processing</h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">3 – 5 Working Days</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upon approval, our finance department initiates the reverse transaction with our payment partner/banking network.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative space-y-2">
              <div className="inline-flex items-center justify-center size-8 rounded-full bg-emerald-600 text-white font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Bank Account Credit</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">5 – 7 Business Days</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Funds are credited directly back to the original payment source (same UPI ID or bank account from which payment was made).
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-3">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <strong>Note on Payment Mode:</strong> Refunds will strictly be credited back to the original account / UPI ID from which the transfer originated. We do not provide cash refunds or disburse funds to third-party bank accounts.
            </div>
          </div>
        </section>

        {/* Section 5: Help & Support Callout */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <HelpCircle className="size-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Have Questions About a Payment or Refund?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Our grievance and support desk is dedicated to assisting students. If you have any inquiries regarding your payment status or eligibility, please reach out to us.
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
              <span>Contact Support Page</span> <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
