import { createServerFn } from "@tanstack/react-start";

type DeleteResult = { success: boolean; error?: string };

export const deleteInternshipApplication = createServerFn({ method: "POST" })
  .validator((d: any) => d as { applicationId: string })
  .handler(async ({ data }): Promise<DeleteResult> => {
    const { applicationId } = data;
    if (!applicationId) return { success: false, error: "Application ID is required" };

    console.log("[Admin] Deleting internship application:", applicationId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cascade = ["submissions", "payments", "certificates"] as const;
    for (const table of cascade) {
      const { error } = await supabaseAdmin.from(table).delete().eq("application_id", applicationId);
      if (error) {
        console.error(`[Admin] Failed to delete ${table}:`, error);
        return { success: false, error: `Failed to delete ${table}: ${error.message}` };
      }
    }

    const { error } = await supabaseAdmin.from("applications").delete().eq("id", applicationId);
    if (error) return { success: false, error: `Failed to delete application: ${error.message}` };

    console.log("[Admin] Application deleted successfully:", applicationId);
    return { success: true };
  });

export const deleteCourseEnrollment = createServerFn({ method: "POST" })
  .validator((d: any) => d as { enrollmentId: string })
  .handler(async ({ data }): Promise<DeleteResult> => {
    const { enrollmentId } = data;
    if (!enrollmentId) return { success: false, error: "Enrollment ID is required" };

    console.log("[Admin] Deleting course enrollment:", enrollmentId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cascade = ["lesson_progress", "course_task_submissions", "quiz_attempts", "course_certificates", "topic_quiz_attempts"] as const;
    for (const table of cascade) {
      const { error } = await (supabaseAdmin.from(table as any) as any).delete().eq("enrollment_id", enrollmentId);
      if (error) {
        console.error(`[Admin] Failed to delete ${table}:`, error);
        return { success: false, error: `Failed to delete ${table}: ${error.message}` };
      }
    }

    const { error } = await supabaseAdmin.from("enrollments").delete().eq("id", enrollmentId);
    if (error) return { success: false, error: `Failed to delete enrollment: ${error.message}` };

    console.log("[Admin] Enrollment deleted successfully:", enrollmentId);
    return { success: true };
  });

export interface AdminStudentAccount {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  year: string;
  photo_url: string | null;
  created_at: string;
  updated_at?: string | null;
  has_application: boolean;
  application_id: string | null;
  domain: string | null;
  intern_id: string | null;
  application_status: string | null;
  offer_issued_at: string | null;
  is_online: boolean;
  last_active: string | null;
  device?: string | null;
  browser?: string | null;
}

export const getAdminStudents = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminStudentAccount[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch all student profiles (the authoritative student user accounts list)
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, college, course, year, photo_url, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (pErr) {
      console.error("[Admin] Error querying profiles for students directory:", pErr);
      throw pErr;
    }

    // 2. Fetch all internship applications
    const { data: apps, error: aErr } = await supabaseAdmin
      .from("applications")
      .select("id, user_id, full_name, email, phone, college, course, year, domain, intern_id, created_at, status, offer_issued_at")
      .order("created_at", { ascending: false });

    if (aErr) {
      console.warn("[Admin] Warning: failed to fetch applications for students mapping:", aErr);
    }

    // 3. Fetch login sessions for status tracking
    const { data: sessions } = await (supabaseAdmin as any)
      .from("login_sessions")
      .select("student_id, status, last_active, device, browser")
      .order("last_active", { ascending: false });

    // Map applications by user_id and normalized email
    const appByUserId = new Map<string, any>();
    const appByEmail = new Map<string, any>();
    if (apps) {
      for (const a of apps) {
        if (a.user_id && !appByUserId.has(a.user_id)) {
          appByUserId.set(a.user_id, a);
        }
        if (a.email) {
          const em = a.email.trim().toLowerCase();
          if (!appByEmail.has(em)) {
            appByEmail.set(em, a);
          }
        }
      }
    }

    // Map latest login session by student_id
    const sessionMap = new Map<string, any>();
    if (sessions) {
      for (const s of sessions) {
        if (s.student_id && !sessionMap.has(s.student_id)) {
          sessionMap.set(s.student_id, s);
        }
      }
    }

    return (profiles ?? []).map((prof: any) => {
      const emailNorm = (prof.email || "").trim().toLowerCase();
      const app = appByUserId.get(prof.id) || (emailNorm ? appByEmail.get(emailNorm) : null);
      const sess = sessionMap.get(prof.id);

      return {
        id: prof.id,
        user_id: prof.id,
        full_name: prof.full_name || app?.full_name || "—",
        email: prof.email || app?.email || "—",
        phone: prof.phone || app?.phone || "—",
        college: prof.college || app?.college || "—",
        course: prof.course || app?.course || "—",
        year: prof.year || app?.year || "—",
        photo_url: prof.photo_url || null,
        created_at: prof.created_at,
        updated_at: prof.updated_at,

        has_application: Boolean(app),
        application_id: app?.id || null,
        domain: app?.domain || null,
        intern_id: app?.intern_id || null,
        application_status: app?.status || null,
        offer_issued_at: app?.offer_issued_at || null,

        is_online: sess?.status === "online",
        last_active: sess?.last_active || null,
        device: sess?.device || null,
        browser: sess?.browser || null,
      };
    });
  });

export interface CourseStudentEnrollment {
  enrollment_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  college: string;
  status: string;
  progress_percent: number;
  current_topic_id?: string | null;
  started_at: string;
  completed_at?: string | null;
  created_at: string;
  certificate?: {
    id: string;
    certificate_id: string;
    score: number;
    issued_at: string;
  } | null;
}

export interface AdminCourseItem {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  icon?: string | null;
  domain: string;
  total_topics: number;
  total_tasks: number;
  quiz_marks: number;
  pass_marks: number;
  quiz_duration_min: number;
  duration_weeks: number;
  difficulty: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string | null;

  // Real-time enrollment analytics
  enrollment_count: number;
  completed_count: number;
  in_progress_count: number;
  avg_progress: number;
  cert_count: number;
  students: CourseStudentEnrollment[];
}

export const getAdminCourses = createServerFn({ method: "GET" })
  .handler(async (): Promise<AdminCourseItem[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch all courses
    const { data: courses, error: cErr } = await supabaseAdmin
      .from("courses")
      .select("*")
      .order("name", { ascending: true });

    if (cErr) {
      console.error("[Admin] Error querying courses:", cErr);
      throw cErr;
    }

    // 2. Fetch all course enrollments
    const { data: enrollments, error: eErr } = await supabaseAdmin
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });

    if (eErr) {
      console.warn("[Admin] Warning: failed to fetch enrollments:", eErr);
    }

    // 3. Fetch course certificates
    const { data: certs } = await supabaseAdmin
      .from("course_certificates")
      .select("*");

    // 4. Fetch profiles for student information
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, college");

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const certsByEnrollment = new Map((certs ?? []).map((c: any) => [c.enrollment_id, c]));

    return (courses ?? []).map((c: any) => {
      const courseEnrs = (enrollments ?? []).filter((e: any) => e.course_id === c.id);
      const completed = courseEnrs.filter((e: any) => e.status === "completed" || e.progress_percent >= 100);
      const inProgress = courseEnrs.filter((e: any) => e.status !== "completed" && e.progress_percent < 100);
      const avgProgress = courseEnrs.length > 0
        ? Math.round(courseEnrs.reduce((acc: number, curr: any) => acc + (curr.progress_percent || 0), 0) / courseEnrs.length)
        : 0;

      const students: CourseStudentEnrollment[] = courseEnrs.map((e: any) => {
        const p = profileMap.get(e.user_id);
        const cert = certsByEnrollment.get(e.id);
        return {
          enrollment_id: e.id,
          user_id: e.user_id,
          full_name: p ? p.full_name : "—",
          email: p ? p.email : "—",
          phone: p ? p.phone : "—",
          college: p ? p.college : "—",
          status: e.status,
          progress_percent: e.progress_percent || 0,
          current_topic_id: e.current_topic_id,
          started_at: e.started_at || e.created_at,
          completed_at: e.completed_at,
          created_at: e.created_at,
          certificate: cert ? {
            id: cert.id,
            certificate_id: cert.certificate_id,
            score: cert.score,
            issued_at: cert.issued_at
          } : null,
        };
      });

      return {
        ...c,
        enrollment_count: courseEnrs.length,
        completed_count: completed.length,
        in_progress_count: inProgress.length,
        avg_progress: avgProgress,
        cert_count: courseEnrs.filter((e: any) => certsByEnrollment.has(e.id)).length,
        students,
      };
    });
  });

export const toggleCoursePublish = createServerFn({ method: "POST" })
  .validator((d: any) => d as { courseId: string; isPublished: boolean })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("courses")
      .update({ is_published: data.isPublished })
      .eq("id", data.courseId);
    if (error) throw error;
    return { success: true };
  });


