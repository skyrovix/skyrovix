import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  ArrowLeft, Shield, Lock, Database, UserCheck, 
  FileCheck, Mail, Sparkles, CheckCircle2, AlertCircle, 
  Clock, Server, EyeOff, ShieldCheck, HelpCircle, ArrowRight 
} from "lucide-react";
import { WebPageJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Student Data Protection | Skyrovix" },
      { 
        name: "description", 
        content: "Skyrovix student privacy policy. Understand how we collect, use, and securely store student personal data, task submissions, and payment records." 
      },
      { 
        name: "keywords", 
        content: "skyrovix privacy policy, student data collection, student data storage, internship data protection, skyrovix data security" 
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Privacy Policy — Skyrovix Student Data Protection" },
      { 
        property: "og:description", 
        content: "Complete transparency on how Skyrovix collects, uses, and safeguards student data during virtual internships and courses." 
      },
      { property: "og:url", content: "https://skyrovix.online/privacy" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — Skyrovix" },
      { 
        name: "twitter:description", 
        content: "Learn how student personal information, task submissions, and certificates are safeguarded at Skyrovix." 
      },
      { rel: "canonical", href: "https://skyrovix.online/privacy" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-foreground flex flex-col justify-between">
      <WebPageJsonLd
        title="Privacy Policy — Skyrovix"
        description="Skyrovix privacy policy explaining how student data is collected, used, and stored."
        url="https://skyrovix.online/privacy"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online" },
          { name: "Privacy Policy", url: "https://skyrovix.online/privacy" },
        ]}
      />
      <Navbar />

      {/* Hero Header */}
      <AuroraBackground>
        <section className="relative pb-10 sm:pb-16 pt-20 sm:pt-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <FadeUp>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-950/40 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 backdrop-blur shadow-sm">
                <Shield className="size-3.5" /> Data Protection & Student Privacy
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-[#181619] dark:text-white">
                Privacy <span className="brand-text">Policy</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Your trust is our highest priority. This policy outlines how we collect, use, store, and protect your personal information, task submissions, and academic records.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground font-medium bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                <Clock className="size-3.5 text-slate-500" />
                <span>Last Updated: September 2026</span>
              </div>
            </FadeUp>
          </div>
        </section>
      </AuroraBackground>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Home
        </Link>

        {/* Highlight Summary Cards (Collection / Usage / Storage) */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">
              <Database className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">What We Collect</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Name, email, college, phone, task GitHub/deployment links, and verification UTR. Zero bank passwords or card PINs.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">
              <UserCheck className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">How We Use It</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Issuing Offer Letters, ID Cards, reviewing project tasks, verifying QR certificates, and essential service updates.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Lock className="size-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">How We Protect It</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Encrypted PostgreSQL database, Row-Level Security, signed storage URLs, and a strict zero-data-selling guarantee.
            </p>
          </div>
        </div>

        {/* Section 1: Data Collection (மாணவர் தரவு சேகரிப்பு) */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                1. Student Data We Collect (மாணவர் தரவு சேகரிப்பு)
              </h2>
              <p className="text-xs text-muted-foreground">Detailed breakdown of information gathered when you use Skyrovix</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We only collect information that is strictly necessary to deliver high-quality internship training, evaluate your submissions, issue accredited certificates, and protect account security.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <UserCheck className="size-4 text-blue-600" /> Personal & Academic Details
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li><strong>Full Name & Email Address:</strong> Used for account creation, communication, and certificate issuance.</li>
                <li><strong>Phone Number:</strong> For urgent support updates and verification purposes.</li>
                <li><strong>College / University Name & Degree:</strong> To personalize your Offer Letter, Student ID card, and internship documents.</li>
                <li><strong>Year of Study:</strong> To cater appropriate difficulty levels in training.</li>
                <li><strong>Profile Photo (Optional):</strong> Displayed on your digital Student ID card and internship dashboard.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileCheck className="size-4 text-purple-600" /> Academic Submissions & Technical Logs
              </h3>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                <li><strong>Task Submissions:</strong> GitHub repositories, hosted demo URLs, architecture diagrams, and project code uploaded for mentor review.</li>
                <li><strong>Course Performance:</strong> Quiz responses, assessment scores, and completion percentage.</li>
                <li><strong>Payment References:</strong> UPI Transaction / UTR reference number and payment confirmation screenshots.</li>
                <li><strong>Security Logs:</strong> IP address, device/browser details, and login timestamps to detect fraudulent activity.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <strong>What We NEVER Collect:</strong> Skyrovix strictly never requests, processes, or stores your banking passwords, UPI MPIN, debit/credit card CVVs, or biometric credentials. All payment confirmations are verified via standard manual UTR reconciliation.
            </div>
          </div>
        </section>

        {/* Section 2: How We Use Data (மாணவர் தரவு பயன்பாடு) */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                2. How We Use Student Data (மாணவர் தரவு பயன்பாடு)
              </h2>
              <p className="text-xs text-muted-foreground">The legitimate educational and operational purposes for which your data is processed</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Your personal data is used solely to facilitate your internship and educational journey on Skyrovix. Specifically, your information enables us to:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                  🎓 Digital Document Generation
                </p>
                <p className="text-xs text-muted-foreground">
                  Instantly generate personalized Offer Letters, digital Student ID Cards, and accredited completion certificates bearing your name, Intern ID, and college.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                  🔍 Mentor Review & Feedback
                </p>
                <p className="text-xs text-muted-foreground">
                  Provide mentors with access to your project code and live URLs to grade submissions, deliver constructive feedback, and approve sequential stages.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                  🛡️ Public Credential Verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Maintain the public verification portal (<code className="text-blue-600 font-mono">/verify-certificate</code>) allowing future employers and university officials to authenticate your credential via unique ID and cryptographic QR code.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white">
                  📩 Transactional Communications
                </p>
                <p className="text-xs text-muted-foreground">
                  Send important notifications regarding task approvals, revisions required, payment confirmations, and direct certificate PDF dispatch via email.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Data Storage & Protection (மாணவர் தரவு சேமிப்பு & பாதுகாப்பு) */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Server className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                3. Data Storage & Cloud Protection (தரவு சேமிப்பு & பாதுகாப்பு)
              </h2>
              <p className="text-xs text-muted-foreground">Architecture and safeguards protecting student databases and files</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              We implement enterprise-grade security protocols to ensure that student records are safeguarded against unauthorized access, loss, or alteration:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <ShieldCheck className="size-5 text-emerald-600" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-white">Row-Level Security (RLS)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our Supabase PostgreSQL databases enforce strict RLS policies. Students can only query their own application and submission records.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <Lock className="size-5 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-white">Encrypted Cloud Storage</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uploaded profile pictures, payment proofs, and project archives are stored in isolated encrypted cloud buckets accessible only via signed URLs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <EyeOff className="size-5 text-purple-600" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-white">Zero Data Selling</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We maintain an absolute prohibition on selling, renting, or monetizing student contact data with third-party advertisers or marketing brokers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Role-Based Access Control (RBAC):</p>
              <p>
                Access to admin verification queues, task evaluations, and student records is strictly restricted to verified administrators and mentors via cryptographically secure JWT authentication.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Data Retention & Student Rights */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                4. Data Retention & Your Rights (உங்கள் உரிமைகள்)
              </h2>
              <p className="text-xs text-muted-foreground">How long records are retained and how you can manage your data</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              You maintain sovereign rights over your personal data under applicable Indian information technology and digital privacy regulations:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li>
                <strong>Certificate Verification Retention:</strong> Certificate records (Certificate ID, Intern ID, Full Name, Domain, and Completion Date) are preserved indefinitely so that your academic credentials can always be validated by prospective employers.
              </li>
              <li>
                <strong>Right to Access & Rectify:</strong> You can request a copy of the personal data we hold or request corrections to incorrect college or contact details by contacting support.
              </li>
              <li>
                <strong>Right to Erasure (Account Deletion):</strong> You may request permanent deletion of your account and uploaded submission files at any time by emailing us. Please note that deleting your account revokes access to the student dashboard.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Cookies & Analytics */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="size-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                5. Cookies & Session Management
              </h2>
              <p className="text-xs text-muted-foreground">How cookies are used to maintain your login session</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Skyrovix uses only strictly essential session cookies and local storage tokens required for secure authentication, maintaining login state across navigation, and preserving UI preferences (such as dark mode). We do not deploy third-party advertising trackers or invasive behavioral cookies.
          </p>
        </section>

        {/* Section 6: Grievance Officer & Contact */}
        <section className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 p-6 sm:p-8 text-center space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Mail className="size-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Privacy Inquiries & Grievance Redressal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            If you have any questions, concerns, or requests regarding how your student data is collected, used, or stored, our privacy desk responds within 24 to 48 hours.
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
              <span>Contact Page</span> <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
