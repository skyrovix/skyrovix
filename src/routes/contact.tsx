import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { COMPANY } from "@/lib/constants";
import { Mail, MapPin, Globe, Sparkles, Clock, MessageSquare, Phone, HelpCircle, ChevronDown } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp, Reveal } from "@/components/motion";
import { BreadcrumbJsonLd, WebPageJsonLd, LocalBusinessJsonLd } from "@/components/JsonLd";
import { useState } from "react";

const FAQS = [
  { q: "How do I apply for an internship?", a: "Browse our domains, pick a track, fill the application form, and receive your offer letter instantly — no interview needed." },
  { q: "Is there any application fee?", a: "No. Applications are completely free. The only charge is a ₹100 certification fee upon completion." },
  { q: "How long does it take to get a certificate?", a: "Once you complete all tasks in your track, your certificate is issued within 24–48 hours after final review." },
  { q: "Can I verify my certificate online?", a: "Yes. Every certificate has a unique QR code and ID. Use our Verify Certificate page to check authenticity instantly." },
  { q: "What if I need help during my internship?", a: "You can reach us anytime via email or the contact form below. Our team responds within 1–2 business days." },
  { q: "Do you offer internships for non-engineering students?", a: "Yes! Our tracks are open to all college students, graduates, and anyone looking to build real-world skills." },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Skyrovix — Get Internship Support | Help Center" },
      { name: "description", content: "Have questions about Skyrovix internships? Contact our team for support with applications, payments, certificates, and general inquiries. We respond within 1–2 business days." },
      { name: "keywords", content: "contact skyrovix, internship support, help skyrovix, skyrovix contact, internship queries, skyrovix email, skyrovix help center, certificate support" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Contact Skyrovix — Get in Touch" },
      { property: "og:description", content: "Contact Skyrovix for internship support, certificate queries, and general inquiries. Response within 1–2 business days." },
      { property: "og:url", content: "https://skyrovix.online/contact" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Contact Skyrovix — Virtual Internship Platform" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:title", content: "Contact Skyrovix — Get in Touch" },
      { name: "twitter:description", content: "Contact Skyrovix for internship support, applications, certificates, and general inquiries." },
      { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
      { name: "twitter:image:alt", content: "Contact Skyrovix — Virtual Internship Platform" },
      { rel: "canonical", href: "https://skyrovix.online/contact" },
    ],
  }),
  component: ContactPage,
});

interface ContactInfoItem {
  icon: any;
  label: string;
  value?: string;
  href?: string | null;
  links?: Array<{ label: string; href: string }>;
}

const ITEMS: ContactInfoItem[] = [
  { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  {
    icon: Globe,
    label: "Websites",
    links: [
      { label: "www.skyrovix.online", href: "https://www.skyrovix.online" },
      { label: "www.skyrovix.in", href: "https://www.skyrovix.in" },
    ],
  },
  { icon: MapPin, label: "Location", value: "India (Remote-First)", href: null },
  { icon: Clock, label: "Response Time", value: "1–2 business days", href: null },
];

function ContactPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="w-full">
      <LocalBusinessJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online/" },
          { name: "Contact", url: "https://skyrovix.online/contact" },
        ]}
      />
      <WebPageJsonLd
        title="Contact Skyrovix — Get Internship Support"
        description="Have questions about Skyrovix internships? Contact our team for support with applications, payments, certificates, and general inquiries."
        url="https://skyrovix.online/contact"
      />
      <Navbar />
      <AuroraBackground>
        <section className="relative pb-6 sm:pb-10 pt-8 sm:pt-16 md:pt-24">
          <div className="mx-auto max-w-5xl px-4">
            <FadeUp className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#07284a]/15 bg-white/60 dark:bg-[#0f172a]/60 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-[#07284a] dark:text-[#60a5fa] shadow-sm backdrop-blur">
                <Sparkles className="size-3 sm:size-3.5" /> Get in Touch
              </div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                Talk to <span className="brand-text">Skyrovix</span>.
              </h1>
              <p className="mt-5 mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground">
                Questions about your internship, certificate verification, or partnerships? Send
                us a message and our team will get back within 1–2 business days.
              </p>
            </FadeUp>
          </div>
        </section>
      </AuroraBackground>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:pt-16 sm:pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.1} className="space-y-4">
            <div className="space-y-3">
              {ITEMS.map((it) => (
                <div key={it.label} className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-[#07284a]/20 hover:shadow-sm hover:bg-[#f8fafc]/50 dark:hover:bg-[#0f172a]/50">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#07284a]/10 text-[#07284a] dark:bg-[#07284a]/20 dark:text-[#60a5fa] transition-all group-hover:bg-[#07284a] group-hover:text-white">
                    <it.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{it.label}</p>
                    {it.links ? (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-foreground text-sm mt-0.5">
                        {it.links.map((link, idx) => (
                          <span key={link.href} className="inline-flex items-center gap-2">
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-foreground hover:text-[#07284a] dark:hover:text-[#60a5fa] hover:underline transition-colors"
                            >
                              {link.label}
                            </a>
                            {idx < it.links.length - 1 && (
                              <span className="text-muted-foreground/50">·</span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : it.href ? (
                      <a href={it.href} className="truncate font-medium text-foreground hover:text-[#07284a] dark:hover:text-[#60a5fa] transition-colors">{it.value}</a>
                    ) : (
                      <p className="truncate font-medium">{it.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-[#f8fafc] to-white dark:from-[#0f172a] dark:to-[#0f172a] p-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="size-5 text-[#07284a] dark:text-[#60a5fa] shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Prefer instant answers?</p>
                  <p className="mt-1">Check our FAQ section below for quick answers to common questions.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const subject = encodeURIComponent(`Skyrovix inquiry from ${fd.get("name")}`);
                const body = encodeURIComponent(`${fd.get("message")}\n\n— ${fd.get("name")} (${fd.get("email")})`);
                window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
              }}
              className="space-y-5 rounded-2xl border border-border/50 bg-card p-6 sm:p-8 h-full shadow-sm"
            >
              <div>
                <p className="text-base font-bold">Send us a message</p>
                <p className="text-xs text-muted-foreground mt-0.5">We'll get back within 1–2 business days.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</label>
                <input name="name" required placeholder="Hariharan S" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-[#07284a] focus:ring-1 focus:ring-[#07284a]/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input name="email" type="email" required placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-[#07284a] focus:ring-1 focus:ring-[#07284a]/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message</label>
                <textarea name="message" rows={5} required placeholder="Tell us how we can help..." className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-[#07284a] focus:ring-1 focus:ring-[#07284a]/20 resize-none" />
              </div>
              <button type="submit" className="w-full rounded-xl bg-[#07284a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d3b66] transition-all active:scale-[0.98] shadow-md shadow-[#07284a]/20">
                Send message
              </button>
            </form>
          </Reveal>
        </div>

        {/* ─── FAQ ─── */}
        <section className="mt-16 sm:mt-20">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/50 dark:bg-[#0f172a]/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
                  <HelpCircle className="size-3.5" /> FAQ
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Frequently asked questions</h2>
              </div>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:border-[#07284a]/20">
                    <button
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:text-[#07284a] dark:hover:text-[#60a5fa]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ${openIdx === i ? "max-h-40" : "max-h-0"}`}>
                      <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
