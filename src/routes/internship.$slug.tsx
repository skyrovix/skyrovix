import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { DOMAIN_KEYWORDS } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReviewSection from "@/components/ReviewSection";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/db-client";
import { DOMAINS, getDomain } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { FadeUp, Reveal, ScaleIn } from "@/components/motion";
import { INTERNSHIP_DETAILS, getInternshipDetail } from "@/lib/internship-detail-content";
import { getDomainTasks, getTasksByDuration } from "@/lib/tasks-data";
import { getPublicFeeSettings, type PublicFeeSettings } from "@/lib/fee-service";
import {
  BookOpen, GraduationCap, Trophy, Clock, Star, BarChart3,
  Users, ArrowRight, CheckCircle2, Sparkles, Target, Award, FileText,
  ChevronRight, ListChecks, Globe, Download,
  BookMarked, PlayCircle, Lightbulb, Briefcase, Wrench, MapIcon, Shield, Crown,
} from "lucide-react";

const DOMAIN_IMAGES: Record<string, string> = {
  fullstack: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop&auto=format",
  python: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&h=600&fit=crop&auto=format",
  java: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop&auto=format",
  mernstack: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=600&fit=crop&auto=format",
  meanstack: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&h=600&fit=crop&auto=format",
  aiml: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&auto=format",
  genai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&auto=format",
  generativeai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&auto=format",
  datascience: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&auto=format",
  dataanalytics: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=600&fit=crop&auto=format",
  powerbi: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&auto=format",
  uiux: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=600&fit=crop&auto=format",
  graphicdesign: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&h=600&fit=crop&auto=format",
  cybersecurity: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop&auto=format",
  cloudcomputing: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop&auto=format",
  devops: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200&h=600&fit=crop&auto=format",
  softwaretesting: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop&auto=format",
  mobileapp: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop&auto=format",
  flutter: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop&auto=format",
  flutterdevelopment: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop&auto=format",
  digitalmarketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&auto=format",
  socialmedia: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&h=600&fit=crop&auto=format",
  contentwriting: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop&auto=format",
  videoediting: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=1200&h=600&fit=crop&auto=format",
  wordpress: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=600&fit=crop&auto=format",
  databasemanagement: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop&auto=format",
  gamedevelopment: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format",
  frontend: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop&auto=format",
  backend: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=600&fit=crop&auto=format",
  cprogramming: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop&auto=format",
  cppprogramming: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop&auto=format",
  promptengineering: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=1200&h=600&fit=crop&auto=format",
  androiddevelopment: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&h=600&fit=crop&auto=format",
  reactnative: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop&auto=format",
  motiongraphics: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&auto=format",
  animation: "https://picsum.photos/seed/animation/600/338",
  threeddesign: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop&auto=format",
};

const INTERN_SLUGS = DOMAINS.map((d) => d.slug);

export const Route = createFileRoute("/internship/$slug")({
  head: ({ params }) => {
    const d = getDomain(params.slug);
    const name = d?.name ?? "Domain";
    const desc = d?.description ?? "Skyrovix internship domain.";
    const canonicalUrl = `https://skyrovix.online/internship/${params.slug}`;
    // Domain-specific keywords from map, fallback to generic pattern
    const domainKws = DOMAIN_KEYWORDS[params.slug] ?? [];
    const genericKws = [
      `${name} internship`,
      `${name.toLowerCase()} virtual internship`,
      `${name} internship with certificate`,
      `${name} internship for students`,
      `${name} internship with offer letter`,
      `${name} internship India`,
      `${name} online training`,
      `Skyrovix ${name} internship`,
      "virtual internship with certificate",
      "internship with real projects",
      "project based internship online",
      "work from home internship",
      "summer internship 2026",
    ];
    const allKws = [...new Set([...domainKws, ...genericKws])].join(", ");
    return {
      meta: [
        { title: `${name} Internship | Virtual Internship with Certificate & Real Projects | Skyrovix` },
        { name: "description", content: `Join the ${name} virtual internship at Skyrovix and gain hands-on experience through real-world projects. ${desc} Get an instant offer letter, digital ID card, complete real-world tasks, and earn a QR-verified certificate. Apply online in minutes — 100% remote, work from home.` },
        { name: "keywords", content: allKws },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Skyrovix" },
        { property: "og:title", content: `${name} Internship | Virtual Internship with Certificate & Real Projects | Skyrovix` },
        { property: "og:description", content: `${desc} Get an instant offer letter, digital ID card, and earn a QR-verified certificate after completing real-world tasks. Apply in minutes.` },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: "https://skyrovix.online/og-default.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: `${name} Virtual Internship with Certificate — Skyrovix` },
        { property: "og:image:type", content: "image/png" },
        { property: "og:locale", content: "en_IN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@skyrovix" },
        { name: "twitter:title", content: `${name} Internship | Virtual Internship with Certificate | Skyrovix` },
        { name: "twitter:description", content: `${desc} Get an offer letter, digital ID card & QR-verified certificate. 100% work from home.` },
        { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
        { name: "twitter:image:alt", content: `${name} Virtual Internship Certificate — Skyrovix` },
        { rel: "canonical", href: canonicalUrl },
      ],
    };
  },
  component: InternshipDetailsPage,
});

function InternshipDetailsPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);

  const domain = getDomain(slug);
  const detail = getInternshipDetail(slug) || (domain ? getInternshipDetail(domain.slug) : undefined);
  const heroImage = DOMAIN_IMAGES[slug] || (domain ? DOMAIN_IMAGES[domain.slug] : undefined) || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop&auto=format";

  const { data: feeSettings } = useQuery<PublicFeeSettings>({
    queryKey: ["public-fee-settings"],
    queryFn: () => getPublicFeeSettings(),
    staleTime: 5000,
    refetchInterval: 10000,
  });

  const standardFee = feeSettings?.applicationFee?.isEnabled && feeSettings.applicationFee.amount > 0
    ? feeSettings.applicationFee.amount
    : (feeSettings?.certificateFee?.amount ?? 100);
  const premiumFee = feeSettings?.premiumPlan?.amount ?? 200;
  const isPremiumPlanGlobalEnabled = Boolean(
    feeSettings?.premiumPlan?.isEnabled ?? feeSettings?.premiumPlan?.enabled
  );

  const { data: userApplication } = useQuery({
    queryKey: ["my-application-duration", slug],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("applications")
        .select("duration")
        .eq("user_id", user.id)
        .eq("domain", slug)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const taskRoadmap = useMemo(() => {
    const appDur = (userApplication as any)?.duration;
    const appPlan = (userApplication as any)?.plan_type;
    const appTasks = (userApplication as any)?.total_tasks;
    const tasks = appDur
      ? getTasksByDuration(slug, appDur, appTasks || appPlan)
      : (getDomainTasks(slug)?.tasks ?? []);
    return tasks.map((task) => ({
      title: task.title,
      milestones: [...task.features, `Outcome: ${task.outcome}`],
    }));
  }, [slug, userApplication]);

  const { data: internCount = 0 } = useQuery({
    queryKey: ["intern-count", slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("count_domain_applications" as any, { p_domain: slug });
      if (error) return 0;
      return data ?? 0;
    },
  });

  if (!detail || !domain) throw notFound();

  const handleApply = () => {
    if (!user) { navigate({ to: "/auth", search: {} as any }); return; }
    navigate({ to: "/internship", search: { apply: slug } });
  };

  const StatCard = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
    <Card className="bg-white/60 dark:bg-[#201d22]/60 backdrop-blur border-border/50">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="size-10 rounded-lg bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 flex items-center justify-center shrink-0">
          <Icon className="size-5 text-[#f95c4b] dark:text-[#ee9590]" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  const SectionHeading = ({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="size-10 rounded-xl bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 flex items-center justify-center">
        <Icon className="size-5 text-[#f95c4b] dark:text-[#ee9590]" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );

  return (
    <div className="w-full">
      <CourseJsonLd
        name={`${domain.name} Internship`}
        description={detail.longDescription || domain.description || ""}
        url={`https://skyrovix.online/internship/${slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online/" },
          { name: "Internship Domains", url: "https://skyrovix.online/internship" },
          { name: `${domain.name} Internship`, url: `https://skyrovix.online/internship/${slug}` },
        ]}
      />
      <Navbar />
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${domain.color}`}>
          <img
            src={heroImage}
            alt={`${domain.name} internship program — task-based virtual training at Skyrovix`}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pt-20 sm:pt-28 pb-12 sm:pb-16">
          <FadeUp className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-white/20 backdrop-blur text-white border-0">Internship</Badge>
              <Badge className="bg-white/20 backdrop-blur text-white border-0">Remote</Badge>
            </div>
            <div className="flex items-start gap-4 mb-4">
              <div className="size-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white shrink-0">{domain.icon}</div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">{domain.name} Internship</h1>
                <p className="mt-3 text-base sm:text-lg text-white/80 max-w-2xl">{detail.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70 mt-4">
              <span className="flex items-center gap-1.5"><Clock className="size-4" /> {detail.duration}</span>
              <span className="flex items-center gap-1.5"><Globe className="size-4" /> {detail.mode}</span>
              <span className="flex items-center gap-1.5"><Users className="size-4" /> {internCount.toLocaleString()} interns</span>
              <span className="flex items-center gap-1.5"><FileText className="size-4" /> Certificate & Offer Letter</span>
            </div>
          </FadeUp>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="space-y-16">
            <Reveal>
              <SectionHeading icon={FileText} title="Overview" />
              <p className="text-muted-foreground leading-relaxed">{detail.longDescription}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                {detail.achievements.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Shield} title="Your Responsibilities" />
              <div className="grid sm:grid-cols-2 gap-3">
                {detail.responsibilities.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 dark:bg-[#201d22]/60 border border-border/50">
                    <div className="size-8 rounded-lg bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    </div>
                    <span className="text-sm">{r}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={MapIcon} title="Internship Roadmap" />

              {domain.slug === "fullstack" ? (
                <div className="mb-6 p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent text-xs text-foreground flex items-start gap-3">
                  <Crown className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-foreground">
                      3-Month (25 Projects) &amp; 6-Month (50 Projects) Real-World Deployment Track
                    </p>
                    <p className="mt-1 text-muted-foreground leading-relaxed">
                      Includes mandatory live cloud deployment, <strong>Letter of Recommendation (LOR) for selected top-performing students</strong>, complete architectural blueprints, and curated course &amp; YouTube channel learning references with verified credentials.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-start gap-3">
                  <Sparkles className="size-4.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Comprehensive 1, 2, 3 &amp; 6-Month Durations Available</p>
                    <p className="mt-0.5 text-muted-foreground leading-relaxed">
                      Standard track is available across all 4 durations (1M: 5 tasks, 2M: 8 tasks, 3M: 10 tasks, 6M: 12 tasks) with a common registration fee of ₹{standardFee}.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-6">
                {(domain.slug === "fullstack" ? [
                  { months: 1, tasks: 5, label: "Foundation (1M)", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300" },
                  { months: 2, tasks: 8, label: "Intermediate (2M)", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300" },
                  { months: 3, tasks: 25, label: "3-Month Intensive (25 Tasks + LOR)", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300" },
                  { months: 6, tasks: 50, label: "6-Month Mastery (50 Tasks + LOR)", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300" },
                ] : [
                  { months: 1, tasks: 5, label: "Foundation Track (1M)", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300" },
                  { months: 2, tasks: 8, label: "Intermediate Track (2M)", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300" },
                  { months: 3, tasks: 10, label: "Advanced Track (3M)", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300" },
                  { months: 6, tasks: 12, label: "Mastery Capstone (6M)", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300" },
                ]).map((tier) => (
                  <div key={tier.months} className={`rounded-lg border px-3 py-2 text-xs ${tier.color}`}>
                    <span className="font-semibold">{tier.label}</span>
                    <span className="ml-1.5 opacity-80">· {tier.months}M · {tier.tasks} tasks</span>
                  </div>
                ))}
              </div>
              {taskRoadmap.length > 0 ? (
                <div className="space-y-2">
                  {taskRoadmap.map((phase, i) => {
                    const tier = domain.slug === "fullstack"
                      ? (i < 5 ? 1 : i < 8 ? 2 : i < 25 ? 3 : 4)
                      : (i < 5 ? 1 : i < 8 ? 2 : i < 10 ? 3 : 4);
                    const tierMeta = domain.slug === "fullstack"
                      ? [
                          { label: "Foundation (1M)", color: "border-emerald-400 bg-emerald-500" },
                          { label: "Intermediate (2M)", color: "border-blue-400 bg-blue-500" },
                          { label: "3-Month Track (25 Tasks + LOR)", color: "border-amber-400 bg-amber-500" },
                          { label: "6-Month Capstone (50 Tasks + LOR)", color: "border-purple-400 bg-purple-500" },
                        ][tier - 1]
                      : [
                          { label: "Foundation (1M)", color: "border-emerald-400 bg-emerald-500" },
                          { label: "Intermediate (2M)", color: "border-blue-400 bg-blue-500" },
                          { label: "Advanced (3M)", color: "border-amber-400 bg-amber-500" },
                          { label: "Mastery Capstone (6M)", color: "border-purple-400 bg-purple-500" },
                        ][tier - 1];
                    return (
                      <div key={i} className="relative pl-8 border-l-2 border-[#f95c4b]/20 dark:border-[#f95c4b]/30 group hover:border-[#f95c4b]/50 transition-colors">
                        <div className={`absolute -left-2.5 top-0 size-5 rounded-full ${tierMeta.color} flex items-center justify-center ring-2 ring-background`}>
                          <span className="text-[10px] font-bold text-white">{i + 1}</span>
                        </div>
                        <div className="mb-1">
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-border/40 text-muted-foreground">{tierMeta.label}</Badge>
                        </div>
                        <h4 className="font-semibold mb-2 text-sm">{phase.title}</h4>
                        <ul className="space-y-0.5 mb-4">
                          {phase.milestones.map((m, j) => (
                            <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="size-3 shrink-0 text-[#f95c4b]/60 dark:text-[#ee9590]/60" /> {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Internship tasks are being prepared. Check back soon!</p>
              )}
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Target} title="What You Will Learn" />
              <div className="grid sm:grid-cols-2 gap-3">
                {detail.learningOutcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/60 dark:bg-[#201d22]/60 border border-border/50">
                    <div className="size-8 rounded-lg bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="size-4 text-[#f95c4b] dark:text-[#ee9590]" />
                    </div>
                    <span className="text-sm">{o}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Briefcase} title="Projects You Will Build" />
              <div className="grid sm:grid-cols-2 gap-4">
                {detail.projects.map((proj, i) => (
                  <ScaleIn key={i} delay={i * 0.05}>
                    <Card className="bg-white/60 dark:bg-[#0f172a]/60 border-border/50 h-full">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{proj.title}</h4>
                          <Badge variant="outline" className="text-[10px]">{proj.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{proj.description}</p>
                      </CardContent>
                    </Card>
                  </ScaleIn>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={ListChecks} title="Expected Deliverables" />
              <ul className="space-y-2">
                {detail.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" /> {d}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Wrench} title="Tools & Technologies" />
              <div className="flex flex-wrap gap-2">
                {detail.toolsAndTechnologies.map((t) => (
                  <Badge key={t} variant="secondary" className="px-3 py-1.5 text-xs">{t}</Badge>
                ))}
                {detail.skills.slice(0, 12).map((s) => (
                  <Badge key={s} variant="secondary" className="px-3 py-1.5 text-xs">{s}</Badge>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Award} title="Skills You Will Gain" />
              <div className="flex flex-wrap gap-2">
                {detail.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-xs">{skill}</Badge>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Trophy} title="Certificate Eligibility" />
              <ul className="space-y-2">
                {detail.certificateEligibility.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" /> {c}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={BookOpen} title="Prerequisites" />
              <ul className="space-y-2">
                {detail.prerequisites.map((pr, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <ChevronRight className="size-4 text-[#07284a] dark:text-[#60a5fa] shrink-0 mt-0.5" /> {pr}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Award} title="Benefits" />
              <div className="grid sm:grid-cols-2 gap-3">
                {detail.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={BarChart3} title="Internship Statistics" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard icon={Clock} label="Duration" value={detail.duration} />
                <StatCard icon={MapIcon} label="Tasks" value={`${taskRoadmap.length}`} />
                <StatCard icon={Briefcase} label="Projects" value={`${detail.projects.length}`} />
                <StatCard icon={Award} label="Certificate" value="Yes" />
                <StatCard icon={GraduationCap} label="Offer Letter" value="Provided" />
                <StatCard icon={Users} label="Interns" value={internCount.toLocaleString()} />
              </div>
            </Reveal>
            <Separator />
            <Reveal>
              <SectionHeading icon={Users} title="Your Mentors" />
              <div className="flex flex-wrap gap-4">
                {detail.mentors.map((mentor, i) => (
                  <Card key={i} className="bg-white/60 dark:bg-[#0f172a]/60 border-border/50 flex-1 min-w-[200px]">
                    <CardContent className="p-5 flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-[#f95c4b]/10 dark:bg-[#f95c4b]/20 text-[#f95c4b] dark:text-[#ee9590] font-semibold">
                          {mentor.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{mentor.name}</p>
                        <p className="text-xs text-muted-foreground">{mentor.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>
            <Separator />
            <ReviewSection targetType="internship" targetId={slug} />
            <Separator />
            <Reveal>
              <SectionHeading icon={FileText} title="Frequently Asked Questions" />
              <Accordion type="multiple" className="w-full">
                {detail.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl mb-3 px-5 bg-white/60 dark:bg-[#0f172a]/60">
                    <AccordionTrigger className="hover:no-underline py-4 text-sm font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <Card className="border-border/50 shadow-lg bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur">
                <CardContent className="p-6 space-y-5">
                  <div className={`relative h-36 rounded-xl overflow-hidden bg-gradient-to-br ${domain.color}`}>
                    <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <div className="size-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold text-white">{domain.icon}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">1, 2, 3 or 6 Months</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium">Remote (Flexible)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">{detail.language}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Certificate</span>
                      <span className="font-medium">Verified QR Certificate</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Offer Letter</span>
                      <span className="font-medium">Instant PDF Download</span>
                    </div>
                    {slug === "fullstack" && isPremiumPlanGlobalEnabled && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Letter of Recommendation (LOR)</span>
                        <span className="font-semibold text-[#f95c4b]">For Selected Students</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks / Projects</span>
                      <span className="font-medium">{slug === "fullstack" && isPremiumPlanGlobalEnabled ? "5 to 50 Tasks (Live Deploy)" : "5 to 12 Tasks"}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-center">
                    {slug === "fullstack" && isPremiumPlanGlobalEnabled ? (
                      <>
                        <div className="flex items-baseline justify-center gap-1.5">
                          <p className="text-2xl font-black text-foreground">₹{standardFee} <span className="text-muted-foreground text-base font-normal">/</span> ₹{premiumFee}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">₹{standardFee} (1-2M) • ₹{premiumFee} (3-6M Intensive Track + LOR)</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-foreground">₹{standardFee}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">One-time registration for all durations (1, 2, 3, 6M)</p>
                      </>
                    )}
                  </div>
                  <Button className="w-full h-11 rounded-xl gap-2 bg-[#f95c4b] hover:bg-[#e04b3a] text-white shadow-lg shadow-[#f95c4b]/20 font-bold transition-all" onClick={handleApply}>
                    <Sparkles className="size-4" /> Apply Now
                  </Button>
                  <Button variant="outline" className="w-full h-11 rounded-xl gap-2" asChild>
                    <Link to="/internship" search={{ apply: undefined }}><Download className="size-4" /> View All Internships</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur border-t border-border/50 p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{domain.name} Internship</p>
            <p className="text-lg font-bold text-foreground">{slug === "fullstack" && isPremiumPlanGlobalEnabled ? `₹${standardFee} / ₹${premiumFee}` : `₹${standardFee}`}</p>
          </div>
          <Button className="h-11 rounded-xl gap-2 bg-[#f95c4b] hover:bg-[#e04b3a] text-white shrink-0 px-6 font-bold shadow-lg shadow-[#f95c4b]/20 transition-all" onClick={handleApply}>
            <Sparkles className="size-4" /> Apply Now
          </Button>
        </div>

        <Reveal className="mt-16">
          <SectionHeading icon={GraduationCap} title="Related Internships" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERN_SLUGS.filter((s) => s !== slug).slice(0, 3).map((s) => {
              const dom = getDomain(s);
              const d = getInternshipDetail(s) || (dom ? getInternshipDetail(dom.slug) : undefined);
              if (!d || !dom) return null;
              return (
                <Link key={s} to="/internship/$slug" params={{ slug: s }} className="group block rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${dom.color}`}>
                    <img src={DOMAIN_IMAGES[s] || DOMAIN_IMAGES[dom.slug]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <div className="size-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-sm font-bold text-white">{dom.icon}</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <h4 className="font-semibold text-sm">{dom.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{d.tagline}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
        <div className="pb-20 lg:pb-0" />
      </main>
      <Footer />
    </div>
  );
}
