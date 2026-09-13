import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  FileText,
  Sparkles,
  CheckCheck,
  MessageSquare,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: "task_approved" | "task_rejected" | "task_pending" | "certificate" | "offer" | "system" | "admin_feedback";
  read: boolean;
  link?: { to: string; search?: Record<string, string> };
  createdAt: number;
  feedbackText?: string;
};

export function NotificationMenu() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined" || !user?.id) return [];
    try {
      const saved = localStorage.getItem(`skyrovix_read_notifs_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Real-time Supabase postgres listener for instant feedback updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`realtime-user-notifs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
        qc.invalidateQueries({ queryKey: ["notif-subs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "project_submissions", filter: `user_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["notif-proj-subs"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["notif-apps"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "certificates", filter: `user_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["notif-certs"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Save readIds to localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`skyrovix_read_notifs_${user.id}`, JSON.stringify(readIds));
    }
  }, [readIds, user?.id]);

  // Queries
  const { data: userApps } = useQuery({
    queryKey: ["notif-apps", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  const { data: userSubs } = useQuery({
    queryKey: ["notif-subs", user?.id, userApps?.map((a) => a.id)],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      let appIds = userApps?.map((a) => a.id) ?? [];
      if (appIds.length === 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("id")
          .eq("user_id", user!.id);
        appIds = apps?.map((a) => a.id) ?? [];
      }
      if (appIds.length === 0) return [];

      const { data } = await supabase
        .from("submissions")
        .select("*, tasks(title, task_number)")
        .in("application_id", appIds)
        .order("submitted_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 3000,
  });

  const { data: userProjSubs } = useQuery({
    queryKey: ["notif-proj-subs", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await (supabase.from as any)("project_submissions")
        .select("*, project_challenges(title, project_id)")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
    refetchInterval: 3000,
  });

  const { data: userCerts } = useQuery({
    queryKey: ["notif-certs", user?.id, userApps?.map((a) => a.id)],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      let appIds = userApps?.map((a) => a.id) ?? [];
      if (appIds.length === 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("id")
          .eq("user_id", user!.id);
        appIds = apps?.map((a) => a.id) ?? [];
      }
      if (appIds.length === 0) return [];

      const { data } = await supabase
        .from("certificates")
        .select("*")
        .in("application_id", appIds);
      return data ?? [];
    },
    refetchInterval: 5000,
  });

  // Dynamic notification items
  const notifications: NotificationItem[] = [];

  // 1. Applications & Offer Letters
  if (userApps && userApps.length > 0) {
    userApps.forEach((app) => {
      notifications.push({
        id: `offer-${app.id}`,
        title: "Offer Letter & ID Card Issued",
        message: `Your official ID Card and Offer Letter for ${app.domain} are ready.`,
        timeAgo: app.offer_issued_at ? new Date(app.offer_issued_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recently",
        type: "offer",
        read: readIds.includes(`offer-${app.id}`),
        link: { to: "/dashboard", search: { tab: "internships" } },
        createdAt: new Date(app.offer_issued_at || app.created_at).getTime(),
      });
    });
  }

  // 2. Submissions & Admin Feedbacks
  if (userSubs && userSubs.length > 0) {
    userSubs.forEach((sub: any) => {
      const taskNum = sub.tasks?.task_number ? `Task ${sub.tasks.task_number}` : "Task";
      const taskTitle = sub.tasks?.title ? `${taskNum}: ${sub.tasks.title}` : "Task Submission";
      const reviewedDate = sub.reviewed_at || sub.submitted_at;
      const formattedDate = reviewedDate ? new Date(reviewedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently";
      const feedbackId = `feedback-sub-${sub.id}-${sub.reviewed_at || 'v1'}`;

      // Dedicated Admin Feedback Notification (if feedback exists)
      if (sub.feedback) {
        notifications.push({
          id: feedbackId,
          title: `Admin Feedback (${taskNum})`,
          message: sub.feedback,
          timeAgo: formattedDate,
          type: "admin_feedback",
          read: readIds.includes(feedbackId),
          link: { to: "/dashboard", search: { tab: "tasks" } },
          createdAt: new Date(reviewedDate).getTime() + 1000,
          feedbackText: sub.feedback,
        });
      }

      if (sub.status === "approved") {
        const apprId = `sub-appr-${sub.id}-${sub.reviewed_at || 'v1'}`;
        notifications.push({
          id: apprId,
          title: `${taskNum} Approved 🎉`,
          message: `${taskTitle} was reviewed and approved! ${sub.feedback ? `Mentor note: "${sub.feedback}"` : ""}`,
          timeAgo: formattedDate,
          type: "task_approved",
          read: readIds.includes(apprId),
          link: { to: "/dashboard", search: { tab: "tasks" } },
          createdAt: new Date(reviewedDate).getTime(),
        });
      } else if (sub.status === "rejected") {
        const rejId = `sub-rej-${sub.id}-${sub.reviewed_at || 'v1'}`;
        notifications.push({
          id: rejId,
          title: `${taskNum} Needs Revision ⚠️`,
          message: `${taskTitle} requires revision. ${sub.feedback ? `Feedback: "${sub.feedback}"` : "Please resubmit."}`,
          timeAgo: formattedDate,
          type: "task_rejected",
          read: readIds.includes(rejId),
          link: { to: "/dashboard", search: { tab: "tasks" } },
          createdAt: new Date(reviewedDate).getTime(),
        });
      } else if (sub.status === "pending") {
        const pendId = `sub-pend-${sub.id}`;
        notifications.push({
          id: pendId,
          title: `${taskNum} Under Review`,
          message: `${taskTitle} is currently undergoing mentor evaluation.`,
          timeAgo: formattedDate,
          type: "task_pending",
          read: readIds.includes(pendId),
          link: { to: "/dashboard", search: { tab: "tasks" } },
          createdAt: new Date(sub.submitted_at).getTime(),
        });
      }
    });
  }

  // 2b. Project Submissions & Rejections
  if (userProjSubs && userProjSubs.length > 0) {
    userProjSubs.forEach((psub: any) => {
      const projTitle = psub.project_challenges?.title || "Project Solution";
      const evaluatedDate = psub.evaluated_at || psub.updated_at || psub.created_at;
      const formattedDate = evaluatedDate ? new Date(evaluatedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently";

      if (psub.status === "approved") {
        const projApprId = `proj-appr-${psub.id}-${psub.evaluated_at || 'v1'}`;
        notifications.push({
          id: projApprId,
          title: `Project Challenge Approved! 🏆`,
          message: `Your solution for "${projTitle}" was graded and approved! Final Score: ${psub.final_score ?? 100}/100.`,
          timeAgo: formattedDate,
          type: "task_approved",
          read: readIds.includes(projApprId),
          link: { to: "/dashboard", search: { tab: "projects" } },
          createdAt: new Date(evaluatedDate).getTime(),
        });
      } else if (psub.status === "rejected") {
        const projRejId = `proj-rej-${psub.id}-${psub.evaluated_at || 'v1'}`;
        const notesClean = psub.notes ? psub.notes.replace(/\[Rejection Notes\]\s*/i, "").split("\n\n")[0] : "Please check submission notes and resubmit.";
        notifications.push({
          id: projRejId,
          title: `Project Needs Revision ⚠️`,
          message: `Your project submission for "${projTitle}" requires revision. Reason: "${notesClean}"`,
          timeAgo: formattedDate,
          type: "admin_feedback",
          read: readIds.includes(projRejId),
          link: { to: "/dashboard", search: { tab: "projects" } },
          createdAt: new Date(evaluatedDate).getTime() + 1000,
          feedbackText: notesClean,
        });
      }
    });
  }

  // 3. Certificates
  if (userCerts && userCerts.length > 0) {
    userCerts.forEach((cert) => {
      notifications.push({
        id: `cert-${cert.id}`,
        title: "Certificate Generated! 🏆",
        message: `Congratulations! Verified certificate ${cert.certificate_id} is available for download.`,
        timeAgo: cert.issued_at ? new Date(cert.issued_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recently",
        type: "certificate",
        read: readIds.includes(`cert-${cert.id}`),
        link: { to: "/dashboard", search: { tab: "certificates" } },
        createdAt: new Date(cert.issued_at).getTime(),
      });
    });
  }

  // 4. Default Welcome System Notif
  notifications.push({
    id: "system-welcome",
    title: "Welcome to Skyrovix! 🚀",
    message: "Complete your assigned tasks to earn your verified certificate and performance badge.",
    timeAgo: "Platform",
    type: "system",
    read: readIds.includes("system-welcome"),
    link: { to: "/dashboard", search: { tab: "overview" } },
    createdAt: 0,
  });

  // Sort newest first
  notifications.sort((a, b) => b.createdAt - a.createdAt);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
  };

  const markSingleRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markSingleRead(notif.id);
    if (notif.type === "admin_feedback") {
      setSelectedNotif(notif);
      return;
    }
    setOpen(false);
    if (notif.link) {
      navigate({ to: notif.link.to, search: notif.link.search });
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "admin_feedback":
        return <MessageSquare className="size-4 text-blue-600 shrink-0" />;
      case "task_approved":
        return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />;
      case "task_rejected":
        return <AlertCircle className="size-4 text-rose-500 shrink-0" />;
      case "task_pending":
        return <Clock className="size-4 text-amber-500 shrink-0" />;
      case "certificate":
        return <Award className="size-4 text-blue-500 shrink-0" />;
      case "offer":
        return <FileText className="size-4 text-indigo-500 shrink-0" />;
      default:
        return <Sparkles className="size-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center size-8 sm:size-9 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="size-3.5 sm:size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {open && (
        <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-11 z-[999] w-auto sm:w-[380px] rounded-2xl border border-slate-200/90 bg-white p-0 shadow-2xl backdrop-blur-2xl dark:bg-[#0F172A] dark:border-slate-800 animate-in zoom-in-95 overflow-hidden">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white text-[10px] h-4 px-1.5 border-0 font-bold">
                  {unreadCount} New
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3" /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-border/40 px-3 py-2 gap-2 bg-white dark:bg-[#0F172A]">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition ${
                filter === "all"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition ${
                filter === "unread"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-border/30">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No {filter === "unread" ? "unread " : ""}notifications right now.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex items-start gap-3 p-3.5 text-xs transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !notif.read ? "bg-blue-50/50 dark:bg-blue-950/25" : ""
                  } ${notif.type === "admin_feedback" ? "border-l-4 border-l-blue-600" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>

                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`font-semibold truncate ${!notif.read ? "text-blue-950 dark:text-blue-200 font-bold" : "text-foreground"}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{notif.timeAgo}</span>
                    </div>

                    <p className={`mt-0.5 leading-relaxed line-clamp-2 ${notif.type === "admin_feedback" ? "text-blue-900 dark:text-blue-300 font-medium" : "text-muted-foreground"}`}>
                      {notif.message}
                    </p>

                    {notif.link && (
                      <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        View tasks <ChevronRight className="size-3" />
                      </span>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="absolute top-3.5 right-3 size-2 rounded-full bg-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-border/40 p-2 text-center bg-slate-50/70 dark:bg-slate-900/60">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/dashboard", search: { tab: "tasks" } });
              }}
            >
              Go to Tasks & Submissions
            </Button>
          </div>

        </div>
      )}

      {/* Admin Feedback Detail Modal Popup */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-6 shadow-2xl dark:bg-[#0F172A] dark:border-blue-900/50 animate-in zoom-in-95 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-foreground">{selectedNotif.title}</h3>
              </div>
              <button onClick={() => setSelectedNotif(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400">
                <MessageSquare className="size-4" /> Admin Feedback Note:
              </p>
              <p className="text-sm font-medium leading-relaxed pl-5 text-slate-800 dark:text-slate-200">
                "{selectedNotif.feedbackText || selectedNotif.message}"
              </p>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                size="sm"
                className="brand-gradient text-white border-0 rounded-xl px-5 h-9 text-xs font-bold"
                onClick={() => {
                  const link = selectedNotif.link;
                  setSelectedNotif(null);
                  setOpen(false);
                  if (link) navigate({ to: link.to, search: link.search });
                }}
              >
                Go to Task Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
