import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FadeUp } from "@/components/motion";
import { motion } from "framer-motion";
import { transitions, stagger, slideUp } from "@/lib/symboolic.com-motion.framer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Layers, Monitor, Server, Brain, Palette, Code2, Award, Clock, ArrowRight, BookMarked, Search, Loader2 } from "lucide-react";

// Only show courses that have actual content in the course-content directory
const VALID_COURSE_SLUGS = [
  "python", "java", "html", "css", "javascript", "php",
  "mysql", "django", "numpy", "pandas", "scipy", "matplotlib",
];

// Lucide icon mapping based on DB strings
const COURSE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Layers, Monitor, Server, Brain, Palette, Code2,
};

// Course-specific banner images
const BANNER_MAP: Record<string, string> = {
  python: "/images/courses/python.png",
  java: "/images/courses/java.png",
  html: "/images/courses/html.png",
  css: "/images/courses/css.png",
  javascript: "/images/courses/javascript.png",
  php: "/images/courses/php.png",
  mysql: "/images/courses/mysql.png",
  django: "/images/courses/django.png",
  numpy: "/images/courses/numpy.png",
  pandas: "/images/courses/pandas.png",
  scipy: "/images/courses/scipy.png",
  matplotlib: "/images/courses/matplotlib.png",
};

// Offline backup data in case database seeding fails or DB is down
const LOCAL_COURSES = [
  { id: "python-fallback", slug: "python", name: "Python", short_description: "Learn Python programming from basics to advanced concepts.", icon: "Code2", domain: "python", total_topics: 60, total_tasks: 5, quiz_marks: 100, duration_weeks: 10, difficulty: "Beginner" },
  { id: "java-fallback", slug: "java", name: "Java", short_description: "Master Java development with OOP and data structures.", icon: "Monitor", domain: "java", total_topics: 40, total_tasks: 5, quiz_marks: 100, duration_weeks: 10, difficulty: "Intermediate" },
  { id: "html-fallback", slug: "html", name: "HTML", short_description: "Build beautiful web pages with HTML5 from scratch.", icon: "Code2", domain: "html", total_topics: 30, total_tasks: 5, quiz_marks: 100, duration_weeks: 6, difficulty: "Beginner" },
  { id: "css-fallback", slug: "css", name: "CSS", short_description: "Style responsive websites using modern layouts like Flexbox/Grid.", icon: "Palette", domain: "css", total_topics: 30, total_tasks: 5, quiz_marks: 100, duration_weeks: 8, difficulty: "Intermediate" },
  { id: "javascript-fallback", slug: "javascript", name: "JavaScript", short_description: "Master JavaScript for dynamic web interfaces.", icon: "Brain", domain: "javascript", total_topics: 50, total_tasks: 5, quiz_marks: 100, duration_weeks: 10, difficulty: "Intermediate" },
  { id: "php-fallback", slug: "php", name: "PHP", short_description: "Build robust dynamic web backends with PHP.", icon: "Server", domain: "php", total_topics: 40, total_tasks: 5, quiz_marks: 100, duration_weeks: 8, difficulty: "Intermediate" },
  { id: "mysql-fallback", slug: "mysql", name: "MySQL", short_description: "Write database queries and structure relationships with MySQL.", icon: "Layers", domain: "mysql", total_topics: 30, total_tasks: 5, quiz_marks: 100, duration_weeks: 6, difficulty: "Intermediate" },
  { id: "django-fallback", slug: "django", name: "Django", short_description: "Build scalable web applications with Django framework.", icon: "Server", domain: "django", total_topics: 30, total_tasks: 5, quiz_marks: 100, duration_weeks: 8, difficulty: "Intermediate" },
  { id: "numpy-fallback", slug: "numpy", name: "NumPy", short_description: "Master numerical computing with NumPy arrays and operations.", icon: "Brain", domain: "numpy", total_topics: 20, total_tasks: 5, quiz_marks: 100, duration_weeks: 4, difficulty: "Intermediate" },
  { id: "pandas-fallback", slug: "pandas", name: "Pandas", short_description: "Analyze and manipulate data with Pandas DataFrames.", icon: "Layers", domain: "pandas", total_topics: 20, total_tasks: 5, quiz_marks: 100, duration_weeks: 4, difficulty: "Intermediate" },
  { id: "scipy-fallback", slug: "scipy", name: "SciPy", short_description: "Scientific computing and statistical analysis with SciPy.", icon: "Brain", domain: "scipy", total_topics: 20, total_tasks: 5, quiz_marks: 100, duration_weeks: 4, difficulty: "Intermediate" },
  { id: "matplotlib-fallback", slug: "matplotlib", name: "Matplotlib", short_description: "Create stunning data visualizations with Matplotlib.", icon: "Palette", domain: "matplotlib", total_topics: 20, total_tasks: 5, quiz_marks: 100, duration_weeks: 4, difficulty: "Intermediate" },
];

export const Route = createFileRoute("/_navbar-layout/courses/")({
  head: () => ({
    meta: [
      { title: "Interactive Coding Courses | Skyrovix" },
      { name: "description", content: "Master Python, Java, JavaScript, HTML, CSS, SQL, and PHP through interactive coding courses, in-browser code editor tasks, and verified certification." },
      { name: "keywords", content: "coding courses, learn python, learn java, learn javascript, html css course, in-browser code editor, interactive learning platform, skyrovix courses" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Interactive Coding Courses — Skyrovix" },
      { property: "og:description", content: "Learn coding online with an interactive code runner, sequential lesson unlocking, and verified certificate upon passing final quizzes." },
      { property: "og:url", content: "https://skyrovix.online/courses" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Interactive Coding Courses — Skyrovix" },
    ],
  }),
  component: CoursesIndexPage,
});

function CoursesIndexPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // 1. Fetch courses — only those with actual course-content
  const { data: dbCourses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, name, short_description, icon, domain, total_topics, total_tasks, quiz_marks, duration_weeks, difficulty")
        .eq("is_published", true)
        .in("slug", VALID_COURSE_SLUGS)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch user enrollments
  const { data: enrollments = [], isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["user-enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, progress_percent, status")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  // 3. Enroll Action
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("Authentication required");
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: courseId, status: "enrolled", progress_percent: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, courseId) => {
      toast.success("Successfully enrolled!");
      queryClient.invalidateQueries({ queryKey: ["user-enrollments", user?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to enroll");
    },
  });

  const handleEnroll = async (courseId: string, slug: string) => {
    if (!user) {
      toast.info("Please sign in to enroll.");
      navigate({ to: "/auth", search: { redirect: `/courses/${slug}` } });
      return;
    }
    enrollMutation.mutate(courseId);
  };

  const courses = dbCourses && dbCourses.length > 0 ? dbCourses : LOCAL_COURSES;
  const enrollmentMap = new Map((enrollments || []).map((e: any) => [e.course_id, e]));

  // Filter courses based on real-time search query
  const filteredCourses = courses.filter(
    (c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.short_description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-20 bg-background text-foreground">
      {/* ─── Hero Section ─── */}
      <AuroraBackground>
        <div className="mx-auto max-w-5xl px-4 text-center py-20 relative z-10">
          <FadeUp y={20} duration={0.8} delay={0.1}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#f95c4b]/10 text-[#f95c4b] mb-6 border border-[#f95c4b]/20 shadow-sm backdrop-blur-md">
              <BookMarked className="size-3.5" />
              <span>Interactive Learning</span>
            </div>
          </FadeUp>
          <FadeUp y={20} duration={0.8} delay={0.2}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#181619] dark:text-white leading-[1.15]">
              Master Coding through{" "}
              <span className="brand-text">
                Interactive Lessons
              </span>
            </h1>
          </FadeUp>
          <FadeUp y={20} duration={0.8} delay={0.3}>
            <p className="mt-4 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              Step-by-step topic guides, in-browser code editor playgrounds, module quizzes, and verified certification to boost your developer portfolio.
            </p>
          </FadeUp>
        </div>
      </AuroraBackground>

      {/* ─── Search Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 -mt-8 relative z-20">
        <div className="max-w-xl mx-auto relative rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-md">
          <Search className="absolute left-4 top-3.5 size-4 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course name or description..."
            className="h-12 border-0 pl-11 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
          />
        </div>
      </div>

      {/* ─── Courses Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isCoursesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="size-8 animate-spin text-blue-500" />
            <p className="text-xs text-muted-foreground">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/60 rounded-3xl">
            <BookOpen className="size-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground">No courses found matching "{search}"</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredCourses.map((c: any) => {
              const enrollment = enrollmentMap.get(c.id);
              const isEnrolled = !!enrollment;
              const progress = (enrollment as any)?.progress_percent ?? 0;
              const Icon = COURSE_ICONS[c.icon] || BookOpen;
              const banner = BANNER_MAP[c.slug] || "/images/courses/python.png";

              // Difficulty color matching
              const diffCol =
                c.difficulty.toLowerCase() === "beginner"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
                  : c.difficulty.toLowerCase() === "intermediate"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20";

              return (
                <motion.div
                  key={c.id}
                  variants={slideUp}
                  whileHover={{ y: -4, transition: transitions.base }}
                  className="h-full"
                >
                  <Card
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-md hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 h-full"
                  >
                    <div>
                      {/* Course Banner */}
                      <div className="relative h-40 overflow-hidden w-full bg-slate-100 dark:bg-slate-900 border-b border-border/30">
                        <img
                          src={banner}
                          alt={c.name}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <Badge
                          className={`absolute top-4 right-4 rounded-lg px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ring-1 ${diffCol}`}
                        >
                          {c.difficulty}
                        </Badge>
                      </div>

                      {/* Content */}
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Icon className="size-5" />
                          </div>
                          <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {c.name}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 h-8">
                          {c.short_description}
                        </p>

                        {/* Info badges */}
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <Layers className="size-3.5 text-blue-500/70" />
                            {c.total_topics || LOCAL_COURSES.find(lc => lc.slug === c.slug)?.total_topics} Topics
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-blue-500/70" />
                            {c.duration_weeks} Weeks
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="size-3.5 text-blue-500/70" />
                            Certificate
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Enrollment Tracking / Actions */}
                    <div className="p-5 border-t border-border/30 bg-muted/10 space-y-4">
                      {isEnrolled ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <Button
                            asChild
                            className="w-full mt-2 rounded-xl text-xs h-10 brand-gradient text-white border-0 shadow-md font-semibold hover:opacity-95"
                          >
                            <Link to="/courses/$slug" params={{ slug: c.slug }}>
                              Continue Learning
                              <ArrowRight className="size-3.5 ml-1.5" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            asChild
                            className="rounded-xl text-xs h-10 border-border/50 hover:bg-muted/80"
                          >
                            <Link to="/courses/$slug/details" params={{ slug: c.slug }}>
                              View Details
                            </Link>
                          </Button>
                          <Button
                            onClick={() => handleEnroll(c.id, c.slug)}
                            disabled={enrollMutation.isPending}
                            className="rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold hover:opacity-95"
                          >
                            {enrollMutation.isPending && enrollMutation.variables === c.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              "Enroll Now"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
