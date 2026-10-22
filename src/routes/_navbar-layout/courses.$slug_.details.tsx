import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/db-client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { INTERNSHIP_DETAILS, type InternshipDetail } from "@/lib/internship-detail-content";
import ReviewSection from "@/components/ReviewSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Clock, Layers, Award, Users, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Star, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

// Fallback metadata helper for course-specific details if not in INTERNSHIP_DETAILS
const COURSE_METADATA_FALLBACKS: Record<string, Partial<InternshipDetail>> = {
  html: {
    tagline: "Build beautiful web pages with HTML5 from scratch.",
    longDescription: "HTML (HyperText Markup Language) is the most fundamental building block of the Web. It defines the structure and layout of a web page. In this course, you will learn the core concepts of HTML5, including tags, attributes, lists, tables, forms, and semantic elements. By the end, you'll be able to structure professional web pages independently.",
    learningOutcomes: [
      "Understand the basic anatomy of an HTML document.",
      "Work with semantic tags (header, nav, article, section, footer).",
      "Create forms with input validation for user feedback.",
      "Integrate multimedia elements like audio, video, and images.",
      "Structure content using tables and nested lists."
    ],
    projects: [
      { title: "Personal Profile Page", description: "Create a simple web page about yourself with structured bio, headings, and contacts.", difficulty: "Beginner" },
      { title: "Online Survey Form", description: "Design a feature-rich user feedback form with multiple inputs and validations.", difficulty: "Beginner" },
      { title: "Structured Recipe Book", description: "Build a multi-page site showing recipes with nested lists and images.", difficulty: "Intermediate" }
    ],
    skills: ["HTML5", "Semantic Web", "Form Validation", "Web Accessibility", "SEO Basics"],
    prerequisites: ["Computer with internet connection", "No prior coding experience required"],
    benefits: [
      "Fulfill foundations for frontend web development careers.",
      "Build portfolio-ready structured web pages.",
      "Gain direct coding experience with live exercises."
    ],
    faqs: [
      { question: "Is this course suitable for complete beginners?", answer: "Yes, HTML is the absolute starting point for coding. No prior background is needed." }
    ]
  },
  css: {
    tagline: "Style beautiful responsive websites with modern CSS layouts.",
    longDescription: "CSS (Cascading Style Sheets) controls the visual representation of HTML elements. This course covers everything from basic selectors and colors to advanced layouts like Flexbox, CSS Grid, and custom animations. You will learn to build responsive designs that look stunning on mobile, tablet, and desktop screens.",
    learningOutcomes: [
      "Master selectors, box model, margins, padding, and borders.",
      "Build complex responsive layouts with Flexbox and CSS Grid.",
      "Utilize CSS variables and custom styling themes.",
      "Create animations, keyframes, and smooth transition effects.",
      "Understand mobile-first design principles and media queries."
    ],
    projects: [
      { title: "Landing Page Styling", description: "Style a beautiful responsive marketing page with flexbox and custom hover states.", difficulty: "Beginner" },
      { title: "CSS Grid Gallery", description: "Create a photorealistic grid grid layout displaying portfolio pieces.", difficulty: "Intermediate" },
      { title: "Animated Interactive Dashboard", description: "Build an interactive UI dashboard showcasing hover animations and dark mode transitions.", difficulty: "Advanced" }
    ],
    skills: ["CSS3", "Flexbox", "CSS Grid", "Responsive Web Design", "CSS Animations", "Media Queries"],
    prerequisites: ["Basic HTML knowledge", "A modern browser and code editor"],
    benefits: [
      "Master the styling layouts used by professional designers.",
      "Build modern responsive web layouts from scratch.",
      "Certificate of styling excellence."
    ],
    faqs: [
      { question: "Do I need to know programming for CSS?", answer: "No, CSS is a stylesheet language. Knowing basic HTML structures is enough to succeed." }
    ]
  },
  javascript: {
    tagline: "Master JavaScript for dynamic, interactive web applications.",
    longDescription: "JavaScript is the programming language of the Web. This course covers variables, loops, DOM manipulation, asynchronous programming, and APIs. You will learn to write logic that drives modern reactive user interfaces and handles web events dynamically.",
    learningOutcomes: [
      "Understand variable declaration, data types, and functions.",
      "Manipulate the DOM to change text, styles, and list items in real time.",
      "Use asynchronous operations like fetch, promises, and async/await.",
      "Listen to user click, hover, keypress, and submit events.",
      "Store client data using LocalStorage and SessionStorage."
    ],
    projects: [
      { title: "Interactive Calculator", description: "Build a functioning browser calculator with dynamic result computation.", difficulty: "Beginner" },
      { title: "Weather Dashboard App", description: "Fetch and render live weather data using REST APIs.", difficulty: "Intermediate" },
      { title: "Task Manager CRUD", description: "Create a list management app with filter filters and LocalStorage persistence.", difficulty: "Advanced" }
    ],
    skills: ["JavaScript ES6+", "DOM Manipulation", "Async Programming", "REST APIs", "Event Listeners", "Web Storage"],
    prerequisites: ["Basic HTML & CSS knowledge"],
    benefits: [
      "Learn the core language powering Next.js, React, and Node.",
      "Build fully interactive browser applications.",
      "QR-verified completion certificate."
    ],
    faqs: [
      { question: "Will I learn ES6+ modern features?", answer: "Yes, we focus on modern ES6+ standards including arrow functions, destructuring, and async/await." }
    ]
  },
  php: {
    tagline: "Build dynamic database-driven web applications with PHP.",
    longDescription: "PHP is a popular server-side scripting language designed for web development. In this course, you will learn PHP syntax, forms processing, file handling, session tracking, and database integration. You will construct functional web servers and handle dynamic content generation.",
    learningOutcomes: [
      "Understand PHP syntax, structures, and arrays.",
      "Process GET and POST forms safely from client requests.",
      "Track user sessions, logins, and cookies.",
      "Integrate SQL databases to store and query application state.",
      "Deploy PHP backends and organize files modularly."
    ],
    projects: [
      { title: "User Registration System", description: "Build a sign-up and log-in system storing hashes in databases.", difficulty: "Intermediate" },
      { title: "Personal Blogging Site", description: "Create a blog platform with database-driven posts, authors, and categories.", difficulty: "Intermediate" },
      { title: "Secure Feedback Portal", description: "Develop an admin dashboard to review and reply to user feedback.", difficulty: "Advanced" }
    ],
    skills: ["PHP", "Backend Scripting", "Form Handling", "SQL Database Integration", "User Sessions"],
    prerequisites: ["Basic HTML knowledge", "Understanding of database concepts helps"],
    benefits: [
      "Master the language behind WordPress and millions of active sites.",
      "Learn backend development workflows locally.",
      "Boost backend engineering resume points."
    ],
    faqs: [
      { question: "Do I need a server to run PHP?", answer: "We cover local PHP setup, but our sandbox executes code examples directly in the editor environment!" }
    ]
  },
  sql: {
    tagline: "Master SQL query statements and database relationships.",
    longDescription: "SQL (Structured Query Language) is the global standard for database management. In this course, you will learn to write queries, join tables, aggregate data, and optimize performance. You'll master filtering conditions and designing table relationships.",
    learningOutcomes: [
      "Select, filter, and order records from tables.",
      "Join multiple tables using INNER, LEFT, RIGHT, and FULL joins.",
      "Aggregate values with SUM, AVG, COUNT, MIN, and MAX.",
      "Group data and apply having conditions.",
      "Design database schemas and optimize indexing queries."
    ],
    projects: [
      { title: "Library Database System", description: "Design a relational schema for tracking books, borrows, and members.", difficulty: "Beginner" },
      { title: "E-Commerce Database Queries", description: "Write reports summarizing monthly revenue, top items, and user lifetime values.", difficulty: "Intermediate" },
      { title: "Query Optimization Task", description: "Analyze index performance and refactor nested queries for speed.", difficulty: "Advanced" }
    ],
    skills: ["SQL", "Relational Databases", "Joins", "Data Aggregation", "Database Schema Design", "Query Optimization"],
    prerequisites: ["No prior database experience required"],
    benefits: [
      "Gain skills essential for backend, data analytics, and DevOps roles.",
      "Understand relational databases used by modern tech firms.",
      "QR-code verified certificate."
    ],
    faqs: [
      { question: "Which SQL engine do we learn?", answer: "The course teaches ANSI SQL standard syntax, which applies to PostgreSQL, MySQL, SQLite, and SQL Server." }
    ]
  }
};

export const Route = createFileRoute("/_navbar-layout/courses/$slug_/details")({
  head: ({ match }) => {
    const slug = match.params.slug;
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      meta: [
        { title: `${name} Course Details, Curriculum & Syllabus | Skyrovix` },
        { name: "description", content: `Learn ${name} online. View course modules, syllabus requirements, prerequisites, hands-on tasks, and projects. Start learning with our inline code sandbox.` },
        { name: "keywords", content: `${slug} course details, ${slug} syllabus, ${slug} learning curriculum, skyrovix ${slug} training, ${slug} prerequisites` },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${name} Course Details & Curriculum | Skyrovix` },
        { property: "og:description", content: `Learn ${name} online. View course modules, syllabus requirements, prerequisites, hands-on tasks, and projects.` },
        { property: "og:url", content: `https://skyrovix.online/courses/${slug}/details` },
        { property: "og:image", content: `https://skyrovix.online/og-default.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${name} Course Details & Curriculum | Skyrovix` },
        { name: "twitter:description", content: `Learn ${name} online. View course modules, syllabus requirements, prerequisites, hands-on tasks, and projects.` },
        { rel: "canonical", href: `https://skyrovix.online/courses/${slug}/details` },
      ],
    };
  },
  component: CourseDetailsPage,
});

function CourseDetailsPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch course details
  const { data: course, isLoading: isCourseLoading, isError } = useQuery({
    queryKey: ["course-details", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // 2. Fetch topics in course
  const { data: topics = [] } = useQuery({
    queryKey: ["course-topics", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_topics")
        .select("id, title, order_index")
        .eq("course_id", course!.id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 3. Fetch enrollment count
  const { data: enrolledCount = 0 } = useQuery({
    queryKey: ["course-enrolled-count", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("count_course_enrollments", {
        p_course_id: course!.id,
      });
      if (error) throw error;
      return Number(data);
    },
  });

  // 4. Fetch user enrollment status
  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ["user-enrollment", course?.id, user?.id],
    enabled: !!course?.id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", course!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  // 5. Fetch other courses for recommendations
  const { data: otherCourses = [] } = useQuery({
    queryKey: ["related-courses", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, name, short_description, icon, difficulty, duration_weeks")
        .eq("is_published", true)
        .neq("slug", slug)
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");
      if (!course) throw new Error("Course not loaded");
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: course.id, status: "enrolled", progress_percent: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully enrolled!");
      queryClient.invalidateQueries({ queryKey: ["user-enrollment", course?.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["course-enrolled-count", course?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to enroll");
    },
  });

  const handleEnroll = async () => {
    if (!user) {
      toast.info("Please sign in to enroll.");
      navigate({ to: "/auth", search: { redirect: `/courses/${slug}/details` } });
      return;
    }
    enrollMutation.mutate();
  };

  // Group topics into modules of 5 lessons each
  const groupIntoModules = (topicList: any[], perModule = 5) => {
    const modules = [];
    for (let i = 0; i < topicList.length; i += perModule) {
      modules.push({
        title: `Module ${Math.floor(i / perModule) + 1}: ${topicList[i]?.title || "Fundamentals"}`,
        lessons: topicList.slice(i, i + perModule),
      });
    }
    return modules;
  };

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading course overview...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">Course Not Found</h2>
        <p className="text-sm text-muted-foreground">The course you are looking for does not exist or has been removed.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/courses">
            <ArrowLeft className="size-4 mr-2" /> Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  // Load metadata from INTERNSHIP_DETAILS or fallbacks
  const metaKey = course.slug.toLowerCase();
  const dbMeta = INTERNSHIP_DETAILS[metaKey] || {};
  const fallbackMeta = COURSE_METADATA_FALLBACKS[metaKey] || {};

  const tagline = dbMeta.tagline || fallbackMeta.tagline || course.short_description;
  const longDescription = dbMeta.longDescription || fallbackMeta.longDescription || "Expand your expertise with structured syllabus segments and tasks.";
  const learningOutcomes = dbMeta.learningOutcomes || fallbackMeta.learningOutcomes || [
    "Understand the core elements of the programming language.",
    "Solve problems and build tasks using practical code.",
    "Implement real-world portfolio projects.",
    "Prepare for interviews and job placements."
  ];
  const projects = dbMeta.projects || fallbackMeta.projects || [
    { title: "Basic Calculator", description: "Write functions to handle user inputs and returns.", difficulty: "Beginner" },
    { title: "Portfolio Assignment", description: "Design a showcase of your finished course assignments.", difficulty: "Intermediate" }
  ];
  const skills = dbMeta.skills || fallbackMeta.skills || [course.name, "Problem Solving", "Software Architecture", "Debugging"];
  const prerequisites = dbMeta.prerequisites || fallbackMeta.prerequisites || ["Personal computer with internet connection", "Willingness to learn"];
  const benefits = dbMeta.benefits || fallbackMeta.benefits || [
    "Flexible remote-only learning environment.",
    "Dynamic in-browser interactive coding challenges.",
    "Verified PDF certificate with QR code for verification.",
    "Dedicated mentorship discussions panel."
  ];
  const faqs = dbMeta.faqs || fallbackMeta.faqs || [
    { question: "Is this course free?", answer: "Yes, all lessons, code runner challenges, and quizzes are 100% free. Verified certificate download is included upon completion." },
    { question: "How long do I have to finish?", answer: "The course is completely self-paced. You can start and resume whenever you want." }
  ];

  const modules = groupIntoModules(topics, 5);
  const isEnrolled = !!enrollment;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-24">
      {/* ─── Hero Header ─── */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 border-b border-border/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-[#07284a]/50 mix-blend-multiply" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500 text-white rounded-lg text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 border-0">
                Course Overview
              </Badge>
              <Badge className="bg-white/10 text-white/80 rounded-lg text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 border-0">
                {course.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {course.name} Course
            </h1>
            <p className="text-base md:text-lg text-slate-350 max-w-xl font-medium">
              {tagline}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 text-blue-400" />
                {course.duration_weeks} Weeks
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="size-4 text-blue-400" />
                {modules.length} Module{modules.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-blue-400" />
                {topics.length} Lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-blue-400" />
                {enrolledCount} Enrolled Students
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid lg:grid-cols-[1.4fr_0.6fr] gap-8">
        
        {/* Left Side Info Panel */}
        <div className="space-y-12">
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Course Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {longDescription}
            </p>
          </div>

          {/* Learning Outcomes Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">What You Will Learn</h2>
            <div className="grid sm:grid-cols-2 gap-3.5">
              {learningOutcomes.map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-3.5 rounded-xl border border-border/40 bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-sm">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Accordion */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Course Syllabus</h2>
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Syllabus details loading or no topics available yet.</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-3 w-full">
                {modules.map((mod, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`item-${idx}`}
                    className="border border-border/50 rounded-xl px-4 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold text-foreground">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex-1">{mod.title}</span>
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold border-0">
                          {mod.lessons.length} Lesson{mod.lessons.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-1 border-t border-border/20">
                      <div className="space-y-2">
                        {mod.lessons.map((lesson: any, lidx: number) => (
                          <div key={lesson.id} className="flex items-center justify-between py-2 px-3 hover:bg-muted/40 rounded-lg text-xs transition-colors">
                            <span className="text-muted-foreground font-medium">
                              {idx * 5 + lidx + 1}. {lesson.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">Lesson</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Projects Gained */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Hands-on Projects</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <Card key={idx} className="bg-white/40 dark:bg-[#0f172a]/40 border-border/50">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-foreground">{proj.title}</h3>
                      <Badge className="bg-slate-500/10 text-slate-650 hover:bg-slate-500/10 px-2 py-0.5 text-[9px] font-bold uppercase border-0">
                        {proj.difficulty || "Intermediate"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Skills badge list */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Skills Gained</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="rounded-lg px-2.5 py-1 text-xs bg-muted/60 text-muted-foreground border-0 font-medium">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Course Prerequisites</h2>
            <ul className="space-y-2">
              {prerequisites.map((pre, idx) => (
                <li key={idx} className="flex gap-2.5 items-center text-xs text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-blue-500" />
                  {pre}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Benefits Checklist</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {benefits.map((ben, idx) => (
                <div key={idx} className="flex gap-2 items-center text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />
                  <span>{ben}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-4 border-t border-border/20">
            <ReviewSection targetType="course" targetId={slug} />
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2 w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="border border-border/50 rounded-xl px-4 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-sm"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-xs font-bold text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-xs text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="relative">
          <div className="sticky top-24 space-y-6">
            <Card className="overflow-hidden border border-border/50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md shadow-xl">
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Free</span>
                    <span className="text-xs text-muted-foreground line-through">₹1,999</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{course.duration_weeks} Weeks</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-semibold capitalize">{course.difficulty}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-semibold">English</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Access Mode</span>
                    <span className="font-semibold">Self-paced, Online</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/20">
                    <span className="text-muted-foreground">Certification</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included (Free)</span>
                  </div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="text-blue-600 dark:text-blue-400">{enrollment.progress_percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                        style={{ width: `${enrollment.progress_percent}%` }}
                      />
                    </div>
                    <Button
                      asChild
                      className="w-full rounded-xl text-xs h-11 brand-gradient text-white border-0 font-semibold hover:opacity-95 shadow-md"
                    >
                      <Link to="/courses/$slug" params={{ slug: course.slug }}>
                        Resume Learning
                        <ArrowRight className="size-4 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="w-full rounded-xl text-xs h-11 brand-gradient text-white border-0 font-semibold hover:opacity-95 shadow-md"
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Enroll in Course"
                    )}
                  </Button>
                )}
              </div>
            </Card>

            {/* Related Courses */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Suggested Courses</h3>
              <div className="space-y-3">
                {otherCourses.map((rc: any) => (
                  <Card key={rc.id} className="bg-white/40 dark:bg-[#0f172a]/40 border-border/40 hover:border-blue-500/20 transition-colors">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs hover:text-blue-500 transition-colors">
                          <Link to="/courses/$slug/details" params={{ slug: rc.slug }}>{rc.name}</Link>
                        </h4>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{rc.difficulty}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{rc.short_description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile CTAs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur border-t border-border/30 px-6 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Course Fee</span>
          <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">Free</p>
        </div>
        {isEnrolled ? (
          <Button
            asChild
            className="rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold px-6"
          >
            <Link to="/courses/$slug" params={{ slug: course.slug }}>
              Resume
              <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        ) : (
          <Button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending}
            className="rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold px-6"
          >
            {enrollMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Enroll Now"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
