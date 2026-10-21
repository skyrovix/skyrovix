import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, FileSignature, ShieldCheck, UserCheck, 
  BookOpen, Briefcase, AlertCircle, CheckCircle2, 
  Clock, Scale, HelpCircle, Mail, ArrowRight, Award, Lock
} from "lucide-react";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Skyrovix Internship & Course Platform" },
      { 
        name: "description", 
        content: "Skyrovix terms of service. Review our comprehensive rules governing account usage, course access, internship program guidelines, and student responsibilities." 
      },
      { 
        name: "keywords", 
        content: "skyrovix terms and conditions, account usage rules, course access terms, internship rules, student responsibilities, skyrovix terms of service" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Terms & Conditions — Skyrovix" },
      { 
        property: "og:description", 
        content: "Clear rules and standards governing accounts, course access, internship progression, and student conduct on Skyrovix." 
      },
      { property: "og:url", content: "https://skyrovix.online/terms" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms & Conditions — Skyrovix" },
      { 
        name: "twitter:description", 
        content: "Review Skyrovix platform rules on account usage, courses, internships, and user conduct." 
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
        description="Skyrovix terms and conditions covering account usage, course access, internship rules, and user responsibilities."
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
                Please read these terms carefully before accessing our virtual internships or courses. They define your rights, learning privileges, and responsibilities as a student on Skyrovix.
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

        {/* 4 Pillars Summary Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Account Usage</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Accurate profile information, non-transferable access, one student per account, and secure credentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Course Access</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Personal learning license, video lectures, code resources, quiz certifications, and strict anti-piracy protection.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
              <Briefcase className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Internship Rules</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Task-based virtual projects, sequential mentor approvals, revision support, and educational non-employment status.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1.5">
            <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">User Responsibilities</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Anti-plagiarism compliance, authentic payment UTR verification, professional conduct, and legal adherence.
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
                <strong>Credential Confidentiality:</strong> You are responsible for maintaining the confidentiality of your login credentials. You must notify Skyrovix immediately at <a href="mailto:skyrovix@gmail.com" className="text-blue-600 font-semibold">skyrovix@gmail.com</a> if you suspect unauthorized access.
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
              <p className="text-xs text-muted-foreground">Requirements for task progression, mentor reviews, and completion certification</p>
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
                  <li><strong>Submission Quality:</strong> Submissions must include working GitHub source code links and live hosted deployment links (e.g. Vercel, Netlify, Render).</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Review, Revisions & Completion
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                  <li><strong>Mentor Revisions:</strong> If a task does not meet specifications, mentors provide feedback for resubmission without penalty.</li>
                  <li><strong>Completion Criteria:</strong> All required domain tasks (5 tasks for 1 month, 8 for 2 months, 10 for 3 months, 12 for 6 months) must be verified & passed.</li>
                  <li><strong>Certificate Issuance:</strong> Completion certificates are generated only after all tasks are approved AND certificate fee payment is verified.</li>
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

        {/* Section 4: User Responsibilities */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                4. User Responsibilities & Code of Conduct
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

        {/* Section 5: Limitation of Liability & Contact */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Scale className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                5. Limitation of Liability & Governing Law
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

        {/* Section 6: Support Callout */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Mail className="size-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Questions Regarding Our Terms?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            For legal inquiries, institutional partnerships, or clarifications regarding our internship and course terms, contact our support desk.
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
