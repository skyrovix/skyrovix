import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Clock, ArrowLeft, ArrowRight, BookOpen, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Download, HelpCircle, ShieldAlert, Loader2, Star } from "lucide-react";
import { CourseCertificateDoc, downloadPdf } from "@/components/pdf-docs";
import { FadeUp } from "@/components/motion";
import { getLocalQuizQuestions } from "@/lib/quiz-content.generated";
import { getPublicSiteUrl } from "@/lib/constants";

// Local fallback questions for final quizzes if database questions are empty
const MOCK_QUIZ_QUESTIONS: Record<string, any[]> = {
  python: [
    { id: "q1", question: "What is the correct file extension for Python files?", options: [".python", ".pl", ".py", ".p"], correct_index: 2, marks: 20 },
    { id: "q2", question: "Which keyword is used to define functions in Python?", options: ["function", "def", "fun", "define"], correct_index: 1, marks: 20 },
    { id: "q3", question: "How do you insert comments in Python code?", options: ["//", "/* */", "#", "<!-- -->"], correct_index: 2, marks: 20 },
    { id: "q4", question: "Which data structure is mutable in Python?", options: ["Tuple", "String", "List", "Int"], correct_index: 2, marks: 20 },
    { id: "q5", question: "What is the output of print(3 * 3)?", options: ["6", "9", "27", "12"], correct_index: 1, marks: 20 },
  ],
  java: [
    { id: "q1", question: "Which data type is block-scoped in Java?", options: ["int", "static", "all types within blocks", "none"], correct_index: 2, marks: 20 },
    { id: "q2", question: "What is the default value of a local boolean variable in Java?", options: ["true", "false", "null", "It has no default value (must be initialized)"], correct_index: 3, marks: 20 },
    { id: "q3", question: "Which of the following is NOT an OOP concept?", options: ["Polymorphism", "Compilation", "Inheritance", "Encapsulation"], correct_index: 1, marks: 20 },
    { id: "q4", question: "Which keyword makes a class variable unchangeable?", options: ["const", "final", "static", "sealed"], correct_index: 1, marks: 20 },
    { id: "q5", question: "Which package is imported by default in Java?", options: ["java.io", "java.util", "java.lang", "java.net"], correct_index: 2, marks: 20 },
  ],
  html: [
    { id: "q1", question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyperlink Tool Manager"], correct_index: 0, marks: 20 },
    { id: "q2", question: "Who is making the Web standards?", options: ["Google", "Mozilla", "The World Wide Web Consortium (W3C)", "Microsoft"], correct_index: 2, marks: 20 },
    { id: "q3", question: "Choose the correct HTML element for the largest heading:", options: ["<heading>", "<h6>", "<head>", "<h1>"], correct_index: 3, marks: 20 },
    { id: "q4", question: "What is the correct HTML element for inserting a line break?", options: ["<break>", "<br>", "<lb>", "<next>"], correct_index: 1, marks: 20 },
    { id: "q5", question: "Which HTML attribute specifies an alternate text for an image?", options: ["title", "src", "alt", "longdesc"], correct_index: 2, marks: 20 },
  ],
  css: [
    { id: "q1", question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct_index: 1, marks: 20 },
    { id: "q2", question: "Which HTML tag is used to define an internal style sheet?", options: ["<css>", "<script>", "<style>", "<link>"], correct_index: 2, marks: 20 },
    { id: "q3", question: "Which HTML attribute is used to define inline styles?", options: ["class", "styles", "font", "style"], correct_index: 3, marks: 20 },
    { id: "q4", question: "Which CSS property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], correct_index: 2, marks: 20 },
    { id: "q5", question: "What is the default value of the position property in CSS?", options: ["relative", "absolute", "static", "fixed"], correct_index: 2, marks: 20 },
  ],
  javascript: [
    { id: "q1", question: "Which keyword is block-scoped in JavaScript?", options: ["var", "let", "global", "scope"], correct_index: 1, marks: 20 },
    { id: "q2", question: "How do you write a single-line comment in JavaScript?", options: ["#", "//", "/*", "<!-- -->"], correct_index: 1, marks: 20 },
    { id: "q3", question: "What is the correct way to check equality of both value and type?", options: ["=", "==", "===", "equals"], correct_index: 2, marks: 20 },
    { id: "q4", question: "Which method converts a JSON string into a JavaScript object?", options: ["JSON.stringify()", "JSON.parse()", "Object.parse()", "JSON.objectify()"], correct_index: 1, marks: 20 },
    { id: "q5", question: "What does DOM stand for?", options: ["Document Object Model", "Data Object Manager", "Dynamic Object Model", "Document Order Map"], correct_index: 0, marks: 20 },
  ],
  php: [
    { id: "q1", question: "What does PHP stand for?", options: ["Personal Home Page", "Private Hypertext Processor", "PHP: Hypertext Preprocessor", "Pixel Home Page"], correct_index: 2, marks: 20 },
    { id: "q2", question: "PHP server scripts are surrounded by which delimiters?", options: ["<script>...</script>", "<?php...?>", "<&>...</&>", "<?php.../?>"], correct_index: 1, marks: 20 },
    { id: "q3", question: "In PHP, how do you declare a variable?", options: ["var name;", "$name;", "let name;", "int name;"], correct_index: 1, marks: 20 },
    { id: "q4", question: "How do you output text in PHP?", options: ["print()", "console.log()", "echo", "System.out.print()"], correct_index: 2, marks: 20 },
    { id: "q5", question: "Which superglobal array holds information about headers, paths, and script locations?", options: ["$_GET", "$_POST", "$_SERVER", "$_GLOBALS"], correct_index: 2, marks: 20 },
  ],
  sql: [
    { id: "q1", question: "What does SQL stand for?", options: ["Structured Query Language", "Strong Query Language", "Structured Question Language", "Simple Query Layout"], correct_index: 0, marks: 20 },
    { id: "q2", question: "Which SQL statement is used to extract data from a database?", options: ["OPEN", "GET", "SELECT", "EXTRACT"], correct_index: 2, marks: 20 },
    { id: "q3", question: "Which SQL statement is used to update data in a database?", options: ["SAVE", "UPDATE", "MODIFY", "ALTER"], correct_index: 1, marks: 20 },
    { id: "q4", question: "With SQL, how can you return all the records from a table named 'Persons' sorted descending by 'FirstName'?", options: ["SELECT * FROM Persons ORDER BY FirstName DESC", "SELECT * FROM Persons SORT BY FirstName DESC", "SELECT * FROM Persons ORDER FirstName DESC", "SELECT * FROM Persons SORT DESC 'FirstName'"], correct_index: 0, marks: 20 },
    { id: "q5", question: "Which join returns all rows when there is a match in either left or right table?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], correct_index: 3, marks: 20 },
  ]
};

export const Route = createFileRoute("/_navbar-layout/courses/$slug_/quiz")({
  head: ({ match }) => {
    const slug = match.params.slug;
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      meta: [
        { title: `${name} Course Final Quiz Assessment | Skyrovix` },
        { name: "description", content: `Take the final timed quiz for the ${name} course. Achieve 60% or higher to instantly receive your verified certificate.` },
        { name: "keywords", content: `${slug} final quiz, ${slug} certification exam, ${slug} test, skyrovix ${slug} quiz` },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${name} Course Final Quiz Assessment | Skyrovix` },
        { property: "og:description", content: `Take the final timed quiz for the ${name} course. Achieve 60% or higher to instantly receive your verified certificate.` },
        { property: "og:url", content: `https://skyrovix.online/courses/${slug}/quiz` },
        { property: "og:image", content: `https://skyrovix.online/og-default.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${name} Course Final Quiz Assessment | Skyrovix` },
        { name: "twitter:description", content: `Take the final timed quiz for the ${name} course. Achieve 60% or higher to instantly receive your verified certificate.` },
        { rel: "canonical", href: `https://skyrovix.online/courses/${slug}/quiz` },
      ],
    };
  },
  component: CourseQuizPage,
});

function CourseQuizPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [quizState, setQuizState] = useState<"lobby" | "running" | "result">("lobby");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // Timer and Cheat metrics
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Result state
  const [finalScore, setFinalScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<any | null>(null);

  // 1. Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["quiz-course", slug],
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

  // 2. Fetch enrollment status
  const { data: enrollment } = useQuery({
    queryKey: ["quiz-enrollment", course?.id, user?.id],
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

  // 3. Fetch final quiz questions from DB
  const { data: dbQuestions = [] } = useQuery({
    queryKey: ["quiz-questions", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_quiz_questions")
        .select("id, question, options, correct_index, marks")
        .eq("course_id", course!.id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 4. Fetch previous quiz attempts
  const { data: attempts = [], isLoading: isAttemptsLoading } = useQuery({
    queryKey: ["quiz-attempts", enrollment?.id],
    enabled: !!enrollment?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("enrollment_id", enrollment!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 5. Fetch generated certificate (if passed)
  const { data: existingCert } = useQuery({
    queryKey: ["quiz-cert", enrollment?.id],
    enabled: !!enrollment?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("enrollment_id", enrollment!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  // Action: Save attempt and generate certificate
  const submitAttemptMutation = useMutation({
    mutationFn: async ({ score, passed }: { score: number; passed: boolean }) => {
      const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 20), 0);
      const percentage = Math.round((score / totalMarks) * 100);

      // Save to database quiz_attempts
      const { data: attempt, error: attemptErr } = await supabase
        .from("quiz_attempts")
        .insert({
          enrollment_id: enrollment!.id,
          score,
          total: totalMarks,
          passed,
          answers: selectedAnswers,
        })
        .select()
        .single();
      if (attemptErr) throw attemptErr;

      if (passed) {
        // Complete the course enrollment
        const { error: completeErr } = await supabase
          .from("enrollments")
          .update({ status: "completed", completed_at: new Date().toISOString(), progress_percent: 100 })
          .eq("id", enrollment!.id);
        if (completeErr) throw completeErr;

        // Fetch user profile full name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user!.id)
          .single();

        const studentName = profile?.full_name ?? "Student";

        // Generate certificate details
        const year = new Date().getFullYear();
        const rand = Math.floor(100000 + Math.random() * 900000);
        const certId = `SKY-${course!.slug.toUpperCase().slice(0, 4)}-${year}-${rand}`;
        const hash = crypto.randomUUID();

        const { data: cert, error: certErr } = await supabase
          .from("course_certificates")
          .insert({
            enrollment_id: enrollment!.id,
            certificate_id: certId,
            verification_hash: hash,
            score: percentage,
          })
          .select()
          .single();
        
        if (certErr) throw certErr;

        // Upsert to leaderboard
        await (supabase as any).from("leaderboard").upsert({
          user_id: user!.id,
          course_id: course!.id,
          score,
          total: totalMarks,
          quiz_attempt_id: attempt.id
        }, { onConflict: "user_id,course_id" });

        return { cert, studentName };
      }

      return { cert: null, studentName: "" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", enrollment?.id] });
      queryClient.invalidateQueries({ queryKey: ["quiz-cert", enrollment?.id] });
      if (data.cert) {
        setGeneratedCert({ ...data.cert, studentName: data.studentName });
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit attempt data");
    }
  });

  // Start the Timed Quiz
  const startQuiz = () => {
    let list = dbQuestions.length > 0 ? dbQuestions : [];

    if (list.length === 0) {
      const localQs = getLocalQuizQuestions(course!.slug);
      if (localQs && localQs.length > 0) {
        // Take a random sample of 20 questions
        const sampled = [...localQs].sort(() => Math.random() - 0.5).slice(0, 20);
        // Map marks to 5 each so total score is 100
        list = sampled.map(q => ({ ...q, marks: 5 }));
      } else {
        list = MOCK_QUIZ_QUESTIONS[course!.slug] || MOCK_QUIZ_QUESTIONS.python;
      }
    }
    
    // Shuffle questions
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setMarkedForReview(new Set());
    setTabSwitches(0);
    setShowWarning(false);

    // Start timer (minutes per course)
    const duration = course?.quiz_duration_min || 15;
    setTimeLeft(duration * 60);
    setQuizState("running");
  };

  // Submit Quiz Action
  const submitQuiz = (forceSubmit = false) => {
    if (!forceSubmit && !confirm("Are you sure you want to submit your final assessment?")) return;

    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_index) {
        score += (q.marks || 20);
      }
    });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 20), 0);
    const passThreshold = course?.pass_marks || 60;
    const percentage = Math.round((score / totalMarks) * 100);
    const hasPassed = percentage >= passThreshold;

    setFinalScore(score);
    setPassed(hasPassed);
    setQuizState("result");

    submitAttemptMutation.mutate({ score, passed: hasPassed });
  };

  // Auto-submit countdown timer effect
  useEffect(() => {
    if (quizState !== "running") return;
    if (timeLeft <= 0) {
      toast.error("Time's up! Submitting your answers automatically.");
      submitQuiz(true);
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, quizState]);

  // Anti-cheat visibility listener
  useEffect(() => {
    if (quizState !== "running") return;
    const handleTabSwitch = () => {
      setTabSwitches((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          toast.error("Anti-cheat limit exceeded. Auto-submitting assessment.");
          submitQuiz(true);
        } else {
          setShowWarning(true);
          toast.warning(`Warning ${next}/3: Tab switches are monitored. Reaching 3 will auto-submit.`);
        }
        return next;
      });
    };
    window.addEventListener("blur", handleTabSwitch);
    document.addEventListener("visibilitychange", handleTabSwitch);
    return () => {
      window.removeEventListener("blur", handleTabSwitch);
      document.removeEventListener("visibilitychange", handleTabSwitch);
    };
  }, [quizState, questions, selectedAnswers]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  const handleDownloadCert = async () => {
    const cert = existingCert || generatedCert;
    if (!cert) return toast.error("Certificate not generated yet.");
    
    // Fetch profile details for PDF
    let studentName = generatedCert?.studentName;
    if (!studentName) {
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
      studentName = profile?.full_name ?? "Student";
    }

    const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?cert=${cert.certificate_id}`;
    
    toast.info("Generating certificate PDF...");
    await downloadPdf(
      <CourseCertificateDoc
        fullName={studentName}
        courseName={course!.name}
        score={cert.score}
        total={100}
        certId={cert.certificate_id}
        issuedAt={cert.issued_at}
        verifyUrl={verifyUrl}
      />,
      `Certificate_${course!.slug.toUpperCase()}_${cert.certificate_id}.pdf`
    );
  };

  if (isCourseLoading || isAttemptsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading final assessment...</p>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-destructive">LMS Enrollment Required</h2>
        <p className="text-sm text-muted-foreground">You must enroll in the course before taking the final assessment.</p>
        <Button asChild className="rounded-xl brand-gradient text-white border-0">
          <Link to="/courses/$slug/details" params={{ slug }}>View Course Details</Link>
        </Button>
      </div>
    );
  }

  const maxAttempts = 999;
  const attemptsLeft = maxAttempts - attempts.length;

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] dark:bg-[#070a13] text-foreground pb-20 pt-8 sm:pt-12 select-none">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* ─── Lobby Screen ─── */}
        {quizState === "lobby" && (
          <FadeUp className="max-w-xl mx-auto">
            <Card className="border border-border/50 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-xl rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                  <Award className="size-8" />
                </div>
                <CardTitle className="text-2xl font-extrabold">{course.name} Course Final Quiz</CardTitle>
                <CardDescription className="text-xs">Final timed assessment to verify your course completion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center border-y border-border/30 py-4 text-xs font-semibold text-muted-foreground">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Questions</p>
                    <p className="text-foreground font-bold">20 MCQs</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Pass Mark</p>
                    <p className="text-foreground font-bold">{course.pass_marks}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Attempts</p>
                    <p className="text-foreground font-bold">
                      {attempts.length} Taken
                    </p>
                  </div>
                </div>

                {/* History list */}
                {attempts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attempt History</h3>
                    <div className="space-y-2">
                      {attempts.map((att, idx) => {
                        const date = new Date(att.submitted_at || "").toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                        return (
                          <div key={att.id} className="flex justify-between items-center py-2 px-3 border border-border/30 rounded-xl bg-muted/20 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">Attempt {attempts.length - idx}</p>
                              <p className="text-[10px] text-muted-foreground">{date}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold">{Math.round((att.score / att.total) * 100)}%</span>
                              {att.passed ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 px-2 py-0.5 text-[10px] border-0">Passed</Badge>
                              ) : (
                                <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-2 py-0.5 text-[10px] border-0">Failed</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {existingCert && (
                  <div className="p-4 rounded-xl border border-green-200/50 bg-green-50/40 dark:bg-green-950/10 text-xs text-center space-y-3">
                    <CheckCircle2 className="size-8 mx-auto text-emerald-500" />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">You've Passed This Course!</p>
                      <p className="text-[10px] text-emerald-600/80 mt-0.5">Your certificate is verified and ready for download.</p>
                    </div>
                    <Button onClick={handleDownloadCert} className="w-full text-xs rounded-xl h-9 brand-gradient text-white border-0 font-semibold gap-1.5 shadow">
                      <Download className="size-4" /> Download Certificate
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild variant="outline" className="flex-1 rounded-xl text-xs h-10 border-border/60 hover:bg-muted/80">
                    <Link to="/courses/$slug" params={{ slug }}>
                      <ArrowLeft className="size-4 mr-1.5" /> Back to Syllabus
                    </Link>
                  </Button>
                  {!existingCert && (
                    <Button
                      onClick={startQuiz}
                      disabled={attemptsLeft <= 0}
                      className="flex-1 rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold shadow"
                    >
                      {attemptsLeft <= 0 ? "No Attempts Left" : "Start Assessment"}
                      <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          </FadeUp>
        )}

        {/* ─── Quiz Timed Interface ─── */}
        {quizState === "running" && (
          <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-6 items-start">
            
            {/* Main Question Panel */}
            <div className="space-y-4">
              {showWarning && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5 shadow-sm">
                  <ShieldAlert className="size-5 shrink-0" />
                  <div>
                    <h4 className="font-bold">Tab Switch Detected! (Warning {tabSwitches}/3)</h4>
                    <p className="mt-0.5 leading-relaxed opacity-90">Switching tabs, windows, or opening other apps is monitored. Reaching 3 tab switches will submit your quiz immediately.</p>
                  </div>
                </div>
              )}

              <Card className="border border-border/40 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-lg rounded-2xl">
                <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-border/20 bg-muted/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Question {currentIdx + 1} of {questions.length}</span>
                    <h3 className="font-bold text-xs text-foreground mt-0.5">Final Exam Section</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 text-xs rounded-lg gap-1 ${
                      markedForReview.has(questions[currentIdx]?.id)
                        ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        : "hover:bg-muted/80 text-muted-foreground"
                    }`}
                    onClick={() => {
                      const id = questions[currentIdx].id;
                      setMarkedForReview((prev) => {
                        const next = new Set(prev);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      });
                    }}
                  >
                    <Star className={`size-4 ${markedForReview.has(questions[currentIdx]?.id) ? "fill-current" : ""}`} />
                    Review
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Question Text */}
                  <p className="text-sm font-bold leading-relaxed">{questions[currentIdx]?.question}</p>

                  {/* Options List */}
                  <div className="space-y-2">
                    {questions[currentIdx]?.options.map((opt: string, oIdx: number) => {
                      const qId = questions[currentIdx].id;
                      const selected = selectedAnswers[qId] === oIdx;

                      return (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qId]: oIdx }))}
                          className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-center gap-3 border ${
                            selected
                              ? "bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-600/20"
                              : "bg-muted/10 border-border/40 hover:bg-muted/30"
                          }`}
                        >
                          <span className={`size-5 rounded-lg text-[10px] font-extrabold flex items-center justify-center uppercase shrink-0 ${
                            selected ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer Navigation */}
                  <div className="flex justify-between items-center border-t border-border/20 pt-4 mt-2">
                    <Button
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((prev) => prev - 1)}
                      variant="outline"
                      className="rounded-xl text-xs h-9 border-border/50 bg-white"
                    >
                      <ArrowLeft className="size-4 mr-1" /> Previous
                    </Button>

                    {currentIdx === questions.length - 1 ? (
                      <Button
                        onClick={() => submitQuiz()}
                        className="rounded-xl text-xs h-9 brand-gradient text-white border-0 px-6 font-semibold shadow"
                      >
                        Submit Exam
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentIdx((prev) => prev + 1)}
                        className="rounded-xl text-xs h-9 brand-gradient text-white border-0 px-6 font-semibold shadow"
                      >
                        Next <ArrowRight className="size-4 ml-1" />
                      </Button>
                    )}
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* Sidebar Stats and Grid panel */}
            <Card className="border border-border/40 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-lg rounded-2xl">
              <CardContent className="p-5 space-y-6">
                
                {/* Timer details */}
                <div className="text-center space-y-2 py-2 border-b border-border/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Remaining Time</span>
                  <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                    <Clock className="size-6 text-blue-500" />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Progress</span>
                    <span>{Object.keys(selectedAnswers).length} / {questions.length} Answered</span>
                  </div>
                  <Progress value={(Object.keys(selectedAnswers).length / questions.length) * 100} className="h-1 bg-muted" />
                </div>

                {/* Question Grid Map */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Questions map</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const answered = selectedAnswers[q.id] !== undefined;
                      const marked = markedForReview.has(q.id);
                      const isCurrent = idx === currentIdx;

                      const col = marked
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/40 hover:bg-amber-500/20"
                        : answered
                        ? "bg-blue-600 text-white border-blue-600 hover:opacity-90"
                        : "bg-muted/30 border-border/40 hover:bg-muted/50 text-muted-foreground";

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`aspect-square rounded-xl border text-xs font-bold transition-all ${col} ${
                            isCurrent ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#070a13]" : ""
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={() => submitQuiz()}
                  className="w-full text-xs font-bold rounded-xl h-10 brand-gradient text-white border-0 shadow"
                >
                  Submit Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Result Screen ─── */}
        {quizState === "result" && (
          <FadeUp className="max-w-xl mx-auto">
            <Card className="border border-border/50 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-xl rounded-2xl">
              <CardContent className="p-8 text-center space-y-6">
                
                {/* Visual Pass/Fail Icon */}
                <div className="size-16 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  {passed ? (
                    <div className="size-full rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="size-10" />
                    </div>
                  ) : (
                    <div className="size-full rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <XCircle className="size-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {passed ? "Congratulations!" : "Keep Practicing"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {passed
                      ? "You have successfully cleared the final assessment for this course."
                      : "You did not reach the pass threshold. Revise syllabus contents and try again."}
                  </p>
                </div>

                {/* Score panel */}
                <div className="p-5 rounded-2xl border border-border/40 bg-muted/20 max-w-sm mx-auto space-y-3">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Your Score</span>
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {finalScore} <span className="text-xs text-muted-foreground">/ 100 Marks</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground">Threshold</span>
                    <span className="text-foreground">{course.pass_marks}% to pass</span>
                  </div>
                </div>

                {passed && (
                  <div className="p-4 rounded-xl border border-green-200/50 bg-green-50/40 dark:bg-green-950/10 text-xs space-y-3 max-w-sm mx-auto">
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">Verified Certificate Issued</p>
                      <p className="text-[10px] text-emerald-650 dark:text-emerald-400/70 mt-1 font-mono">
                        ID: {(existingCert || generatedCert)?.certificate_id || "SKY-XXXX-XXXX-XXXXXX"}
                      </p>
                    </div>
                    <Button
                      onClick={handleDownloadCert}
                      className="w-full text-xs rounded-xl h-9 brand-gradient text-white border-0 font-semibold gap-1.5 shadow"
                    >
                      <Download className="size-4" /> Download Certificate
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2">
                  <Button asChild variant="outline" className="flex-1 rounded-xl text-xs h-10 border-border/60 hover:bg-muted/80">
                    <Link to="/courses/$slug" params={{ slug }}>
                      Back to Course
                    </Link>
                  </Button>
                  {!passed && attemptsLeft > 0 && (
                    <Button
                      onClick={startQuiz}
                      className="flex-1 rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold shadow gap-1.5"
                    >
                      <RotateCcw className="size-4" /> Try Again
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          </FadeUp>
        )}

      </div>
    </div>
  );
}
