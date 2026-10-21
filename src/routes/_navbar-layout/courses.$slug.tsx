import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { CodeEditor } from "@/components/CodeEditor";
import { TopicQuiz } from "@/components/TopicQuiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Menu, X, Lock, CheckCircle2, Circle, Star, Award, BookOpen,
  ArrowRight, ArrowLeft, Heart, FileText, CheckSquare, RefreshCw, Loader2, Sparkles, Search, ChevronRight, Code2
} from "lucide-react";

type CourseSearch = {
  topic?: string;
};

export const Route = createFileRoute("/_navbar-layout/courses/$slug")({
  validateSearch: (search: Record<string, unknown>): CourseSearch => {
    return {
      topic: search.topic as string | undefined,
    };
  },
  head: ({ match }) => {
    const slug = match.params.slug;
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      meta: [
        { title: `Learn ${name} Online | Interactive Coding Sandbox | Skyrovix` },
        { name: "description", content: `Master ${name} with step-by-step interactive lessons, inline sandbox editors, compiler tasks, and sequential progress tracking.` },
        { name: "keywords", content: `learn ${slug}, ${slug} course, ${slug} interactive editor, online ${slug} training, ${slug} certificate, skyrovix ${slug}` },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `Learn ${name} Online | Interactive Coding Sandbox` },
        { property: "og:description", content: `Master ${name} with step-by-step interactive lessons, inline sandbox editors, compiler tasks, and sequential progress tracking.` },
        { property: "og:url", content: `https://skyrovix.online/courses/${slug}` },
        { property: "og:image", content: `https://skyrovix.online/og-default.png` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `Learn ${name} Online | Interactive Coding Sandbox` },
        { name: "twitter:description", content: `Master ${name} with step-by-step interactive lessons, inline sandbox editors, compiler tasks, and sequential progress tracking.` },
        { rel: "canonical", href: `https://skyrovix.online/courses/${slug}` },
      ],
    };
  },
  component: CourseContentPage,
});

function CourseContentPage() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { topic: searchTopicId } = Route.useSearch();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topicSearch, setTopicSearch] = useState("");
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [savingNote, setSavingNote] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [lastSavedNote, setLastSavedNote] = useState("");

  const noteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedActiveTopic = useRef(false);

  // 1. Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["content-course", slug],
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
  const { data: enrollment, isLoading: isEnrollmentLoading } = useQuery({
    queryKey: ["content-enrollment", course?.id, user?.id],
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

  // Redirect to details if not enrolled
  useEffect(() => {
    if (!loading && !isCourseLoading && !isEnrollmentLoading && course && !enrollment) {
      toast.info("You need to enroll in this course first.");
      navigate({ to: `/courses/${slug}/details` });
    }
  }, [loading, course, enrollment, isCourseLoading, isEnrollmentLoading, slug, navigate]);

  // 3. Fetch course topics
  const { data: topics = [], isLoading: isTopicsLoading } = useQuery({
    queryKey: ["content-topics", course?.id],
    enabled: !!course?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_topics")
        .select("*")
        .eq("course_id", course!.id)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data || []).map((t: any) => {
        let pts: string[] = [];
        if (Array.isArray(t.key_points)) {
          pts = t.key_points;
        } else if (typeof t.key_points === "string" && t.key_points.trim()) {
          try {
            const parsed = JSON.parse(t.key_points);
            if (Array.isArray(parsed)) {
              pts = parsed;
            } else if (parsed && typeof parsed === "object") {
              pts = Object.values(parsed).filter((v) => typeof v === "string") as string[];
            } else {
              pts = [String(parsed)];
            }
          } catch {
            if (t.key_points.includes("\n")) {
              pts = t.key_points
                .split("\n")
                .map((line: string) => line.replace(/^[-*•\d.]\s*/, "").trim())
                .filter(Boolean);
            } else {
              pts = [t.key_points.trim()];
            }
          }
        } else if (t.key_points && typeof t.key_points === "object") {
          pts = Object.values(t.key_points).filter((v) => typeof v === "string") as string[];
        }
        return { ...t, key_points: pts };
      });
    },
  });

  const topicIds = topics.map((t) => t.id);

  // 4. Fetch lesson progress (completed topics)
  const { data: progressList = [] } = useQuery({
    queryKey: ["content-progress", enrollment?.id],
    enabled: !!enrollment?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("topic_id")
        .eq("enrollment_id", enrollment!.id);
      if (error) throw error;
      return data.map((p) => p.topic_id);
    },
  });
  const completedTopicIds = new Set(progressList);

  // 5. Fetch quiz attempts (topic quizzes)
  const { data: quizAttemptsList = [] } = useQuery({
    queryKey: ["content-topic-quizzes", enrollment?.id],
    enabled: !!enrollment?.id,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("topic_quiz_attempts" as any) as any)
        .select("topic_id, passed")
        .eq("enrollment_id", enrollment!.id);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
  const topicQuizAttempts = new Map((quizAttemptsList as any[]).map((q: any) => [q.topic_id, q.passed]));

  // 6. Fetch topic quiz questions
  const { data: quizQuestions = [] } = useQuery({
    queryKey: ["content-quiz-questions", topics.length],
    enabled: topics.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("topic_quiz_questions" as any) as any)
        .select("*")
        .in("topic_id", topicIds)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // Group quiz questions by topic
  const questionsByTopic = new Map<string, any[]>();
  (quizQuestions as any[]).forEach((q: any) => {
    if (!questionsByTopic.has(q.topic_id)) {
      questionsByTopic.set(q.topic_id, []);
    }
    questionsByTopic.get(q.topic_id)!.push(q);
  });

  // 7. Fetch user bookmarks
  const { data: bookmarksList = [] } = useQuery({
    queryKey: ["content-bookmarks", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("bookmarks" as any) as any)
        .select("topic_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return ((data ?? []) as any[]).map((b: any) => b.topic_id);
    },
  });
  const bookmarkedTopicIds = new Set(bookmarksList);

  // 8. Fetch notes
  const { data: notesList = [] } = useQuery({
    queryKey: ["content-notes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("notes" as any) as any)
        .select("topic_id, content")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
  const notesMap = new Map((notesList as any[]).map((n: any) => [n.topic_id, n.content]));

  // Handle active topic change
  const currentTopic = topics[activeTopicIdx];

  // Topic select handler that updates the state and the URL query param
  const handleTopicSelect = (idx: number) => {
    setActiveTopicIdx(idx);
    const targetTopic = topics[idx];
    if (targetTopic) {
      navigate({
        to: "/courses/$slug",
        params: { slug },
        search: { topic: targetTopic.id },
      });
    }
  };

  // Automatically find the starting topic when topics & enrollment are loaded
  useEffect(() => {
    if (topics.length > 0 && enrollment && !hasInitializedActiveTopic.current) {
      hasInitializedActiveTopic.current = true;
      
      let targetIdx = -1;

      // 1. Check if URL search param topic exists and matches a topic
      if (searchTopicId) {
        targetIdx = topics.findIndex((t) => t.id === searchTopicId);
      }

      // 2. Check if enrollment has a saved current_topic_id
      if (targetIdx === -1 && enrollment.current_topic_id) {
        targetIdx = topics.findIndex((t) => t.id === enrollment.current_topic_id);
      }

      // 3. Find the first incomplete topic
      const completedSet = new Set(progressList);
      if (targetIdx === -1 || completedSet.has(topics[targetIdx].id)) {
        const firstIncompleteIdx = topics.findIndex((t) => !completedSet.has(t.id));
        if (firstIncompleteIdx !== -1) {
          targetIdx = firstIncompleteIdx;
        }
      }

      // 4. Fallback to 0 if still not found
      if (targetIdx === -1) {
        targetIdx = 0;
      }

      setActiveTopicIdx(targetIdx);
      
      // Update URL search parameter to match
      navigate({
        to: "/courses/$slug",
        params: { slug },
        search: { topic: topics[targetIdx].id },
        replace: true,
      });
    }
  }, [topics, enrollment, progressList, searchTopicId, slug, navigate]);

  // Synchronize activeTopicIdx with URL search param changes (e.g. back/forward button)
  useEffect(() => {
    if (topics.length > 0 && searchTopicId) {
      const idx = topics.findIndex((t) => t.id === searchTopicId);
      if (idx !== -1 && idx !== activeTopicIdx) {
        setActiveTopicIdx(idx);
      }
    }
  }, [searchTopicId, topics]);

  // Mutation to update current topic id in enrollment
  const updateCurrentTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      if (!enrollment) return;
      const { error } = await supabase
        .from("enrollments")
        .update({ current_topic_id: topicId })
        .eq("id", enrollment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-enrollment", course?.id, user?.id] });
    }
  });

  // Update current topic in DB when activeTopicIdx changes
  useEffect(() => {
    if (currentTopic && enrollment && enrollment.current_topic_id !== currentTopic.id) {
      updateCurrentTopicMutation.mutate(currentTopic.id);
    }
  }, [activeTopicIdx, currentTopic, enrollment]);

  // Set note field when active topic changes
  useEffect(() => {
    if (currentTopic) {
      const existing = notesMap.get(currentTopic.id) || "";
      setUserNote(existing);
      setLastSavedNote(existing);
    }
  }, [activeTopicIdx, currentTopic, notesList]);

  // Sequential Locking Logic
  const isLocked = (idx: number) => {
    if (idx === 0) return false; // First topic always unlocked
    const prev = topics[idx - 1];
    const prevQs = questionsByTopic.get(prev.id) ?? [];
    if (prevQs.length === 0) {
      // No quiz implies auto-unlocked once completed
      return !completedTopicIds.has(prev.id);
    }
    const quizPassed = topicQuizAttempts.get(prev.id);
    const completed = completedTopicIds.has(prev.id);
    return !(quizPassed || completed); // Locked if neither passed nor completed
  };

  // Actions: Toggle Bookmark
  const toggleBookmarkMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const isBookmarked = bookmarkedTopicIds.has(topicId);
      if (isBookmarked) {
        const { error } = await (supabase
          .from("bookmarks" as any) as any)
          .delete()
          .eq("user_id", user!.id)
          .eq("topic_id", topicId);
        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("bookmarks" as any) as any)
          .insert({ user_id: user!.id, topic_id: topicId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-bookmarks", user?.id] });
      toast.success("Bookmark updated");
    },
  });

  // Action: Save Note
  const saveNoteMutation = useMutation({
    mutationFn: async ({ topicId, content }: { topicId: string; content: string }) => {
      setSavingNote(true);
      const { error } = await (supabase
        .from("notes" as any) as any)
        .upsert(
          { user_id: user!.id, topic_id: topicId, content },
          { onConflict: "user_id,topic_id" }
        );
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      setLastSavedNote(variables.content);
      queryClient.invalidateQueries({ queryKey: ["content-notes", user?.id] });
      setSavingNote(false);
    },
    onError: () => {
      setSavingNote(false);
      toast.error("Failed to save note");
    }
  });

  const handleNoteChange = (content: string) => {
    setUserNote(content);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    noteTimeoutRef.current = setTimeout(() => {
      if (currentTopic && content !== lastSavedNote) {
        saveNoteMutation.mutate({ topicId: currentTopic.id, content });
      }
    }, 1500);
  };

  // Action: Mark Topic Complete
  const markCompleteMutation = useMutation({
    mutationFn: async (topicId: string) => {
      // 1. Insert lesson progress
      const { error: progressErr } = await supabase
        .from("lesson_progress")
        .upsert(
          { enrollment_id: enrollment!.id, topic_id: topicId },
          { onConflict: "enrollment_id,topic_id" }
        );
      if (progressErr) throw progressErr;

      // 2. Re-compute progress percent
      const total = topics.length;
      const completed = progressList.length + (completedTopicIds.has(topicId) ? 0 : 1);
      const newPct = Math.min(Math.round((completed / total) * 100), 100);

      // 3. Update enrollment
      const { error: enrollErr } = await supabase
        .from("enrollments")
        .update({ progress_percent: newPct, current_topic_id: topicId })
        .eq("id", enrollment!.id);
      if (enrollErr) throw enrollErr;
    },
    onSuccess: (_, topicId) => {
      queryClient.invalidateQueries({ queryKey: ["content-progress", enrollment?.id] });
      queryClient.invalidateQueries({ queryKey: ["content-enrollment", course?.id, user?.id] });
      toast.success("Progress saved!");

      // Find the next incomplete lesson
      const completedSet = new Set(progressList);
      completedSet.add(topicId); // Add the just completed topic to the set
      
      const nextIncompleteIdx = topics.findIndex((t) => !completedSet.has(t.id));
      if (nextIncompleteIdx !== -1) {
        // Automatically switch to the next incomplete lesson
        handleTopicSelect(nextIncompleteIdx);
      } else {
        // All completed!
        toast.success("Congratulations! You have completed all lessons in this course!");
      }
    },
  });

  // Action: Quiz Completed
  const topicQuizMutation = useMutation({
    mutationFn: async ({ topicId, passed, score, total }: { topicId: string; passed: boolean; score: number; total: number }) => {
      const { error } = await (supabase
        .from("topic_quiz_attempts" as any) as any)
        .upsert(
          { enrollment_id: enrollment!.id, topic_id: topicId, answers: {}, score, total, passed },
          { onConflict: "enrollment_id,topic_id" }
        );
      if (error) throw error;
      
      // If passed, trigger topic complete
      if (passed) {
        await markCompleteMutation.mutateAsync(topicId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-topic-quizzes", enrollment?.id] });
      toast.success("Quiz score submitted");
    },
  });

  const handleTopicQuizComplete = (score: number, total: number) => {
    if (!currentTopic) return;
    const passed = score >= total;
    topicQuizMutation.mutate({ topicId: currentTopic.id, passed, score, total });
  };

  // Custom regex markdown parser into elements
  function renderMarkdown(md: string) {
    if (!md) return null;
    const lines = md.split("\n");
    let inList = false;
    const listItems: string[] = [];
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    // Helper to render table
    const renderTable = (key: string) => {
      return (
        <div key={key} className="my-5 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm bg-white dark:bg-slate-900/30">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800/80">
                {tableHeaders.map((header, idx) => (
                  <th key={idx} className="px-4 py-3 font-semibold text-foreground border-r border-slate-200/40 dark:border-slate-800/30 last:border-r-0">
                    {parseInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/40">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300 border-r border-slate-200/30 dark:border-slate-800/20 last:border-r-0 font-normal">
                      {parseInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 my-4 space-y-2 text-sm md:text-[14.5px] text-slate-700 dark:text-slate-300">
              {listItems.map((item, idx) => <li key={idx}>{parseInlineMarkdown(item)}</li>)}
            </ul>
          );
          listItems.length = 0;
          inList = false;
        }
        if (inTable) {
          elements.push(renderTable(`table-${i}`));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }

        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-5 rounded-2xl font-mono text-xs overflow-x-auto my-5 border border-slate-200/50 dark:border-slate-800/80 shadow-md select-text">
              <code>{codeBlockContent.join("\n")}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Check for table rows starting with |
      if (trimmed.startsWith("|")) {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 my-4 space-y-2 text-sm md:text-[14.5px] text-slate-700 dark:text-slate-300">
              {listItems.map((item, idx) => <li key={idx}>{parseInlineMarkdown(item)}</li>)}
            </ul>
          );
          listItems.length = 0;
          inList = false;
        }

        // If it's a separator line like |---|---| or |:---|:---|, skip it
        if (trimmed.replace(/[\s|:-]/g, "") === "") {
          continue;
        }

        const cols = trimmed
          .split("|")
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        if (!inTable) {
          inTable = true;
          tableHeaders = cols;
          tableRows = [];
        } else {
          tableRows.push(cols);
        }
        continue;
      } else {
        if (inTable) {
          elements.push(renderTable(`table-${i}`));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.substring(2));
        continue;
      } else {
        if (inList) {
          elements.push(
            <ul key={`list-${i}`} className="list-disc pl-6 my-4 space-y-2 text-sm md:text-[14.5px] text-slate-700 dark:text-slate-300">
              {listItems.map((item, idx) => <li key={idx}>{parseInlineMarkdown(item)}</li>)}
            </ul>
          );
          listItems.length = 0;
          inList = false;
        }
      }

      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-xl md:text-2xl font-extrabold my-5 text-foreground">
            {parseInlineMarkdown(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-base md:text-lg font-bold mt-7 mb-3.5 text-foreground border-b border-border/80 pb-2">
            {parseInlineMarkdown(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-sm md:text-base font-semibold mt-5 mb-2 text-foreground/90">
            {parseInlineMarkdown(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed === "") {
        continue;
      } else {
        elements.push(
          <p key={i} className="text-sm md:text-[14.5px] leading-relaxed text-slate-700 dark:text-slate-300 my-3 font-normal">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      }
    }

    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-end`} className="list-disc pl-6 my-4 space-y-2 text-sm md:text-[14.5px] text-slate-700 dark:text-slate-300">
          {listItems.map((item, idx) => <li key={idx}>{parseInlineMarkdown(item)}</li>)}
        </ul>
      );
    }

    if (inTable && tableHeaders.length > 0) {
      elements.push(renderTable("table-end"));
    }

    return <div className="space-y-1 select-text">{elements}</div>;
  }

  function parseInlineMarkdown(text: string) {
    let parts: React.ReactNode[] = [];
    let remaining = text;
    let idx = 0;

    while (remaining.length > 0) {
      const boldStart = remaining.indexOf("**");
      const codeStart = remaining.indexOf("`");

      if (boldStart === -1 && codeStart === -1) {
        parts.push(<span key={idx++}>{remaining}</span>);
        break;
      }

      if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) {
        if (boldStart > 0) {
          parts.push(<span key={idx++}>{remaining.substring(0, boldStart)}</span>);
        }
        const boldEnd = remaining.indexOf("**", boldStart + 2);
        if (boldEnd !== -1) {
          parts.push(
            <strong key={idx++} className="font-bold text-slate-900 dark:text-slate-100">
              {remaining.substring(boldStart + 2, boldEnd)}
            </strong>
          );
          remaining = remaining.substring(boldEnd + 2);
        } else {
          parts.push(<span key={idx++}>**</span>);
          remaining = remaining.substring(boldStart + 2);
        }
      } else {
        if (codeStart > 0) {
          parts.push(<span key={idx++}>{remaining.substring(0, codeStart)}</span>);
        }
        const codeEnd = remaining.indexOf("`", codeStart + 1);
        if (codeEnd !== -1) {
          parts.push(
            <code key={idx++} className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-lg text-[12px] font-mono text-blue-600 dark:text-blue-400 font-semibold border border-slate-200/50 dark:border-slate-700/50">
              {remaining.substring(codeStart + 1, codeEnd)}
            </code>
          );
          remaining = remaining.substring(codeEnd + 1);
        } else {
          parts.push(<span key={idx++}>`</span>);
          remaining = remaining.substring(codeStart + 1);
        }
      }
    }

    return <>{parts}</>;
  }

  if (loading || isCourseLoading || isEnrollmentLoading || isTopicsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading curriculum workspace...</p>
      </div>
    );
  }

  if (!course || !enrollment || topics.length === 0) {
    return null; // triggers the redirect in useEffect
  }

  // Filter topics in sidebar by search query
  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const activeQuizQuestions = questionsByTopic.get(currentTopic?.id) ?? [];
  const activeQuizPassed = topicQuizAttempts.get(currentTopic?.id) ?? false;
  const isCompleted = completedTopicIds.has(currentTopic?.id);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-background text-foreground select-none">
      {/* ─── Sidebar Toggle for Mobile ─── */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="size-11 rounded-full shadow-2xl p-0 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700"
        >
          {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* ─── Sidebar Collapsible panel ─── */}
      <div
        className={`fixed inset-y-20 left-0 lg:static z-35 shrink-0 flex flex-col h-full bg-white dark:bg-[#0b0f19] border-r border-border/40 transition-all duration-300 w-72 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-0 lg:overflow-hidden border-r-0"
        }`}
      >
        <div className="p-4 border-b border-border/40 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="size-4 text-blue-500" /> Curriculum
            </h3>
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-[10px] font-bold border-0">
              {enrollment.progress_percent}% Done
            </Badge>
          </div>
          <Progress value={enrollment.progress_percent} className="h-1.5 bg-muted" />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground/60" />
            <Input
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search topics..."
              className="h-8 pl-8 text-xs rounded-lg border-border/50 bg-muted/20"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTopics.map((topic) => {
            const idx = topics.findIndex((t) => t.id === topic.id);
            const locked = isLocked(idx);
            const completed = completedTopicIds.has(topic.id);
            const active = idx === activeTopicIdx;
            const bookmarked = bookmarkedTopicIds.has(topic.id);

            return (
              <button
                key={topic.id}
                disabled={locked}
                onClick={() => {
                  handleTopicSelect(idx);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                  active
                    ? "bg-[#07284a]/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                    : locked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {locked ? (
                    <Lock className="size-3.5 text-muted-foreground shrink-0" />
                  ) : completed ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className="truncate">{idx + 1}. {topic.title}</span>
                </div>
                {bookmarked && <Star className="size-3 text-amber-400 fill-current shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Quiz Navigation */}
        <div className="p-4 border-t border-border/40 bg-muted/15">
          <Button
            asChild
            className="w-full text-xs font-bold brand-gradient text-white border-0 rounded-xl h-10 shadow"
          >
            <Link to="/courses/$slug/quiz" params={{ slug }}>
              <Award className="size-4 mr-2" />
              Take Final Quiz
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── Main Content Workspace ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafbfc] dark:bg-[#070a13]">
        {/* Workspace Header */}
        <div className="flex items-center justify-between h-14 border-b border-border/40 bg-white dark:bg-[#0b0f19] px-6 select-none shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="size-4" />
            </Button>
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Link to="/courses" className="hover:text-foreground">Courses</Link>
              <ChevronRight className="size-3" />
              <Link to="/courses/$slug/details" params={{ slug }} className="hover:text-foreground">{course.name}</Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                {currentTopic?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Final Quiz CTA badge */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold rounded-lg border-border/50 bg-white dark:bg-[#0f172a] shadow-sm text-blue-600 dark:text-blue-400 gap-1.5"
            >
              <Link to="/courses/$slug/quiz" params={{ slug }}>
                <Award className="size-3.5" />
                Final Quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Scrollable Lesson Workspace Panels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentTopic ? (
            <div className="max-w-4xl mx-auto space-y-8 pb-10">
              
              {/* Header Topic Title */}
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Lesson {activeTopicIdx + 1} of {topics.length}
                  </span>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                    {currentTopic.title}
                  </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border border-border/40 hover:bg-muted/60"
                    onClick={() => toggleBookmarkMutation.mutate(currentTopic.id)}
                    title={bookmarkedTopicIds.has(currentTopic.id) ? "Remove Bookmark" : "Bookmark Topic"}
                  >
                    <Star
                      className={`size-4 ${bookmarkedTopicIds.has(currentTopic.id) ? "text-amber-400 fill-current" : "text-muted-foreground"}`}
                    />
                  </Button>
                </div>
              </div>

              {/* Rendered Markdown Lesson Body */}
              <div className="p-6 rounded-2xl border border-border/40 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-sm">
                {renderMarkdown(currentTopic.content_md)}
              </div>

              {(() => {
                let pts: string[] = [];
                if (Array.isArray(currentTopic.key_points)) {
                  pts = currentTopic.key_points;
                } else if (typeof currentTopic.key_points === "string" && currentTopic.key_points.trim()) {
                  try {
                    const parsed = JSON.parse(currentTopic.key_points);
                    if (Array.isArray(parsed)) {
                      pts = parsed;
                    } else if (parsed && typeof parsed === "object") {
                      pts = Object.values(parsed).filter((v) => typeof v === "string") as string[];
                    } else {
                      pts = [String(parsed)];
                    }
                  } catch {
                    if (currentTopic.key_points.includes("\n")) {
                      pts = currentTopic.key_points
                        .split("\n")
                        .map((line: string) => line.replace(/^[-*•\d.]\s*/, "").trim())
                        .filter(Boolean);
                    } else {
                      pts = [currentTopic.key_points.trim()];
                    }
                  }
                } else if (currentTopic.key_points && typeof currentTopic.key_points === "object") {
                  pts = Object.values(currentTopic.key_points).filter((v) => typeof v === "string") as string[];
                }

                if (!Array.isArray(pts) || pts.length === 0) return null;

                return (
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs space-y-2 select-text">
                    <h4 className="font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#f95c4b]" /> Key Takeaways
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground leading-relaxed">
                      {pts.map((pt, idx) => (
                        <li key={idx}>{typeof pt === "string" ? pt : JSON.stringify(pt)}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* Code Playground */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <Code2 className="size-4 text-[#f95c4b]" /> Interactive Coding Playground
                </h3>
                <CodeEditor language={course.domain} initialCode={currentTopic.code_example} />
              </div>

              {/* Personal Notes Workspace */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="size-4 text-[#f95c4b]" /> Personal Notes
                </h3>
                <div className="relative rounded-2xl border border-border/40 overflow-hidden shadow-sm bg-white dark:bg-[#0b0f19]">
                  <textarea
                    value={userNote}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Type notes for this topic here... Notes save automatically."
                    className="w-full h-32 p-4 text-xs resize-none outline-none focus:ring-0 bg-transparent text-foreground placeholder-muted-foreground/30 leading-relaxed font-sans"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground flex items-center gap-1.5">
                    {savingNote ? (
                      <>
                        <Loader2 className="size-3 animate-spin text-blue-500" />
                        <span>Saving...</span>
                      </>
                    ) : userNote !== lastSavedNote ? (
                      <span>Unsaved edits</span>
                    ) : (
                      <span>Saved</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Topic Quiz Assessment Block */}
              {activeQuizQuestions.length > 0 && (
                <div className="p-6 rounded-2xl border border-border/40 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckSquare className="size-4 text-[#f95c4b]" /> Lesson Assessment
                  </h3>
                  {activeQuizPassed ? (
                    <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 flex items-center gap-2.5">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Assessment Cleared</h4>
                        <p className="text-[10px] text-emerald-600/80 mt-0.5">You have successfully cleared the quiz for this lesson and unlocked sequential lessons.</p>
                      </div>
                    </div>
                  ) : (
                    <TopicQuiz questions={activeQuizQuestions} onComplete={handleTopicQuizComplete} />
                  )}
                </div>
              )}

              {/* Simple complete check if no quiz exists */}
              {activeQuizQuestions.length === 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => markCompleteMutation.mutate(currentTopic.id)}
                    disabled={isCompleted || markCompleteMutation.isPending}
                    className={`rounded-xl text-xs h-10 px-6 font-semibold ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-0"
                        : "brand-gradient text-white border-0 shadow"
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="size-4" /> Completed</span>
                    ) : markCompleteMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Mark Lesson Complete"
                    )}
                  </Button>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex justify-between items-center border-t border-border/20 pt-6">
                <Button
                  disabled={activeTopicIdx === 0}
                  onClick={() => handleTopicSelect(activeTopicIdx - 1)}
                  variant="outline"
                  className="rounded-xl text-xs h-10 border-border/50 bg-white hover:bg-muted/80"
                >
                  <ArrowLeft className="size-4 mr-1.5" /> Previous Lesson
                </Button>

                {activeTopicIdx === topics.length - 1 ? (
                  <Button
                    asChild
                    className="rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold px-6 shadow"
                  >
                    <Link to="/courses/$slug/quiz" params={{ slug }}>
                      Take Final Quiz <Award className="size-4 ml-1.5" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    disabled={isLocked(activeTopicIdx + 1)}
                    onClick={() => handleTopicSelect(activeTopicIdx + 1)}
                    className="rounded-xl text-xs h-10 brand-gradient text-white border-0 font-semibold px-6 shadow"
                  >
                    Next Lesson <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="size-12 mx-auto text-muted-foreground/35 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Select a topic from the sidebar curriculum to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
