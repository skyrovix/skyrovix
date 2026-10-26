import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";
import { motion } from "framer-motion";
import { transitions, stagger, slideUp } from "@/lib/symboolic.com-motion.framer";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { useRecentReviews } from "@/lib/reviews";
import { Star, Quote, Users, Award, TrendingUp, ThumbsUp, ChevronRight, Rocket } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Student Reviews — Skyrovix Internship Platform" },
      { name: "description", content: "Read real reviews from students who completed Skyrovix virtual internships. Discover how our internship programs helped students build skills, earn certificates, and launch careers." },
      { name: "keywords", content: "skyrovix reviews, student reviews, internship reviews, skyrovix testimonials, virtual internship feedback, skyrovix experience" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Student Reviews — Skyrovix" },
      { property: "og:description", content: "Read real reviews from students who completed Skyrovix virtual internships." },
      { property: "og:url", content: "https://skyrovix.online/reviews" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Student Reviews — Skyrovix" },
      { name: "twitter:description", content: "Read real reviews from students who completed Skyrovix virtual internships." },
      { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
      { rel: "canonical", href: "https://skyrovix.online/reviews" },
    ],
  }),
  component: ReviewsPage,
});

const STATIC_TESTIMONIALS = [
  {
    name: "Aisha Sharma",
    college: "VIT Vellore",
    domain: "Full Stack Development",
    rating: 5,
    title: "Best internship experience!",
    content: "Skyrovix gave me my first real project experience. The tasks were structured and practical — I built a complete web app and got a certificate recognised by my placement team.",
    initials: "AS",
    color: "bg-blue-500",
  },
  {
    name: "Rahul Menon",
    college: "Amrita University",
    domain: "Data Science",
    rating: 5,
    title: "Great platform for beginners",
    content: "I had zero industry experience before Skyrovix. The step-by-step tasks helped me understand real data pipelines. Now I have a project to show in interviews!",
    initials: "RM",
    color: "bg-purple-500",
  },
  {
    name: "Priya Nair",
    college: "Anna University",
    domain: "UI/UX Design",
    rating: 5,
    title: "Certificate accepted by top companies",
    content: "The MSME-registered certificate from Skyrovix added real credibility to my portfolio. I got shortlisted in 3 companies citing my Skyrovix project!",
    initials: "PN",
    color: "bg-pink-500",
  },
  {
    name: "Karthik Raj",
    college: "SRM Institute",
    domain: "AI & Machine Learning",
    rating: 4,
    title: "Practical and industry-relevant",
    content: "The AI/ML track was genuinely challenging. I worked on a real NLP classification task and learned things my college curriculum missed. Highly recommended.",
    initials: "KR",
    color: "bg-emerald-500",
  },
  {
    name: "Sneha Patel",
    college: "Gujarat Technological University",
    domain: "Python Development",
    rating: 5,
    title: "Completed in 30 days, loved it",
    content: "I loved the self-paced format. Completed the entire Python track in a month alongside my semester. The tasks were well-designed and the certificate arrived instantly.",
    initials: "SP",
    color: "bg-orange-500",
  },
  {
    name: "Akash Verma",
    college: "Delhi Technological University",
    domain: "Cyber Security",
    rating: 5,
    title: "Gained real security skills",
    content: "Skyrovix's Cyber Security track gave me hands-on exposure to ethical hacking concepts I couldn't find anywhere else at this price point. Worth every rupee.",
    initials: "AV",
    color: "bg-red-500",
  },
  {
    name: "Divya Krishnan",
    college: "PSG College of Technology",
    domain: "Cloud Computing",
    rating: 4,
    title: "Good structure and support",
    content: "The cloud track covered AWS fundamentals really well. Tasks were practical with clear instructions. Customer support was quick and helpful when I had queries.",
    initials: "DK",
    color: "bg-cyan-500",
  },
  {
    name: "Rohan Singh",
    college: "BITS Pilani",
    domain: "Java Development",
    rating: 5,
    title: "Perfect for college students",
    content: "Skyrovix fits perfectly into a student's schedule. I completed the Java internship while attending classes and now my resume has a real project instead of just college assignments.",
    initials: "RS",
    color: "bg-indigo-500",
  },
  {
    name: "Meera Iyer",
    college: "Madras Institute of Technology",
    domain: "Full Stack Development",
    rating: 5,
    title: "Certificate helped me land a job",
    content: "My interviewer specifically mentioned the Skyrovix project and certificate. It showed I had actual experience beyond classroom theory. Thank you Skyrovix team!",
    initials: "MI",
    color: "bg-teal-500",
  },
];

const STATS = [
  { icon: Users, value: "1,074+", label: "Students Enrolled", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Star, value: "4.9/5", label: "Average Rating", color: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: Award, value: "95%", label: "Completion Rate", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: TrendingUp, value: "25+", label: "Colleges Reached", color: "text-purple-600", bg: "bg-purple-50" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`size-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  name,
  college,
  domain,
  rating,
  title,
  content,
  initials,
  color,
}: (typeof STATIC_TESTIMONIALS)[0]) {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-[#e5e7eb] dark:border-white/10 bg-white dark:bg-[#201d22] p-6 shadow-sm hover:shadow-lg hover:border-[#ee9590] transition-all duration-300 cursor-default hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid size-10 shrink-0 place-items-center rounded-full ${color} text-white text-sm font-bold`}>
            {initials}
          </div>
          <div className="text-left leading-tight">
            <p className="text-[14px] font-semibold text-slate-900">{name}</p>
            <p className="text-[11.5px] text-slate-500 mt-0.5">{college}</p>
          </div>
        </div>
        <Quote className="size-5 text-slate-200 shrink-0 mt-1" />
      </div>

      <StarRating rating={rating} />

      <div className="text-left">
        <p className="text-[13.5px] font-semibold text-slate-800 mb-1">{title}</p>
        <p className="text-[13px] text-slate-600 leading-relaxed">{content}</p>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-50">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f95c4b]/10 px-3 py-1 text-[11.5px] font-bold text-[#f95c4b]">
          <span className="size-1.5 rounded-full bg-[#f95c4b] inline-block"></span>
          {domain}
        </span>
      </div>
    </div>
  );
}

function ReviewsPage() {
  const { data: liveReviews, isLoading } = useRecentReviews(20);

  const hasLiveReviews = !isLoading && liveReviews && liveReviews.length > 0;

  return (
    <div className="w-full">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.online/" },
          { name: "Student Reviews", url: "https://skyrovix.online/reviews" },
        ]}
      />
      <WebPageJsonLd
        title="Student Reviews — Skyrovix Internship Platform"
        description="Read real reviews from students who completed Skyrovix virtual internships."
        url="https://skyrovix.online/reviews"
      />
      <Navbar variant="public" />

      {/* Hero Section */}
      <AuroraBackground>
        <section className="relative pb-10 sm:pb-14 pt-28 sm:pt-32 md:pt-36">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <FadeUp>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f95c4b]/20 bg-[#f95c4b]/10 px-4 py-1.5 text-xs font-bold text-[#f95c4b] shadow-sm backdrop-blur">
                <ThumbsUp className="size-3.5" />
                Real Reviews · Verified Students
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                What Our{" "}
                <span className="brand-text">Students Say</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Over 10,000 students have completed Skyrovix internships. Here's what they experienced — in their own words.
              </p>
            </FadeUp>

            {/* Stats Row */}
            <FadeUp delay={0.15}>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 backdrop-blur p-4 shadow-sm"
                  >
                    <div className={`grid size-9 place-items-center rounded-xl ${stat.bg}`}>
                      <stat.icon className={`size-4.5 ${stat.color}`} />
                    </div>
                    <p className="text-[17px] font-bold text-slate-900">{stat.value}</p>
                    <p className="text-[11.5px] text-slate-500 font-medium text-center leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>
      </AuroraBackground>

      {/* Live Reviews (from DB) */}
      {hasLiveReviews && (
        <section className="py-14 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeUp>
              <div className="mb-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Latest Reviews</h2>
                <p className="text-sm text-slate-500 mt-2">Most recent reviews from our students</p>
              </div>
            </FadeUp>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {liveReviews!.map((review) => {
                const name = review.profiles?.full_name ?? "Anonymous";
                const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500"];
                const color = colors[name.charCodeAt(0) % colors.length];
                return (
                  <div
                    key={review.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#e5e7eb] dark:border-white/10 bg-white dark:bg-[#201d22] p-6 shadow-sm hover:shadow-lg hover:border-[#ee9590] transition-all duration-300 cursor-default hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {review.profiles?.photo_url ? (
                          <img
                            src={review.profiles.photo_url}
                            alt={name}
                            className="size-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`grid size-10 shrink-0 place-items-center rounded-full ${color} text-white text-sm font-bold`}>
                            {initials}
                          </div>
                        )}
                        <div className="text-left leading-tight">
                          <p className="text-[14px] font-semibold text-slate-900">{name}</p>
                          <p className="text-[11.5px] text-slate-500 mt-0.5">
                            {new Date(review.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Quote className="size-5 text-slate-200 shrink-0 mt-1" />
                    </div>
                    <StarRating rating={review.rating} />
                    <div className="text-left">
                      {review.title && <p className="text-[13.5px] font-semibold text-slate-800 mb-1">{review.title}</p>}
                      <p className="text-[13px] text-slate-600 leading-relaxed">{review.content}</p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-50">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f95c4b]/10 px-3 py-1 text-[11.5px] font-bold text-[#f95c4b]">
                        <span className="size-1.5 rounded-full bg-[#f95c4b] inline-block"></span>
                        {review.target_type === "internship" ? "Internship" : "Course"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Static Featured Testimonials */}
      <section className={`py-14 ${hasLiveReviews ? "bg-[#f8fafc]" : "bg-white"}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <div className="mb-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {hasLiveReviews ? "Featured Stories" : "Student Testimonials"}
              </h2>
              <p className="text-sm text-slate-500 mt-2">Experiences shared by students across India</p>
            </div>
          </FadeUp>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {STATIC_TESTIMONIALS.map((testimonial) => (
              <ReviewCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 bg-[#002244]">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <FadeUp>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/90">
              <Award className="size-3.5" />
              Join 1,074+ Enrolled Students
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Internship?
            </h2>
            <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
              Get hands-on experience, earn a Govt. MSME registered certificate, and build the skills employers are looking for.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.fast}
              >
                <Link
                  to="/auth"
                  search={{ redirect: undefined }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-[#002244] px-7 py-3.5 text-sm font-bold shadow-lg hover:bg-slate-50 transition-colors"
                >
                  <Rocket className="size-4" />
                  Start Your Internship
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={transitions.fast}
              >
                <Link
                  to="/internship"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 text-white px-7 py-3.5 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Explore Internships
                  <ChevronRight className="size-4" />
                </Link>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}
