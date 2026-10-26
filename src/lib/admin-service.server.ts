import { dbQuery, withTransaction } from "@/lib/db.server";
import type { AdminStudentAccount, AdminCourseItem, CourseStudentEnrollment } from "./admin-service";

type DeleteResult = { success: boolean; error?: string };

export async function deleteInternshipApplicationServer(applicationId: string): Promise<DeleteResult> {
  if (!applicationId) return { success: false, error: "Application ID is required" };

  console.log("[Admin] Deleting internship application via DB transaction:", applicationId);

  try {
    return await withTransaction(async (client) => {
      // 1. Delete dependent submissions
      await client.query("DELETE FROM public.submissions WHERE application_id = $1", [applicationId]);

      // 2. Delete payment records
      await client.query("DELETE FROM public.payment_records WHERE application_id = $1", [applicationId]);

      // 3. Delete payments
      await client.query("DELETE FROM public.payments WHERE application_id = $1", [applicationId]);

      // 4. Delete certificates
      await client.query("DELETE FROM public.certificates WHERE application_id = $1", [applicationId]);

      // 5. Delete coupon redemptions
      await client.query("DELETE FROM public.coupon_redemptions WHERE application_id = $1", [applicationId]);

      // 6. Delete the application itself
      const appRes = await client.query("DELETE FROM public.applications WHERE id = $1", [applicationId]);

      if (appRes.rowCount === 0) {
        console.warn("[Admin] Application ID not found in database:", applicationId);
      }

      console.log("[Admin] Successfully deleted application and all related data:", applicationId);
      return { success: true };
    });
  } catch (err: any) {
    console.error("[Admin] Failed to delete application:", err);
    return { success: false, error: err.message || "Failed to delete application" };
  }
}

export async function deleteCourseEnrollmentServer(enrollmentId: string): Promise<DeleteResult> {
  if (!enrollmentId) return { success: false, error: "Enrollment ID is required" };

  console.log("[Admin] Deleting course enrollment via DB transaction:", enrollmentId);

  try {
    return await withTransaction(async (client) => {
      await client.query("DELETE FROM public.lesson_progress WHERE enrollment_id = $1", [enrollmentId]);
      await client.query("DELETE FROM public.course_task_submissions WHERE enrollment_id = $1", [enrollmentId]);
      await client.query("DELETE FROM public.quiz_attempts WHERE enrollment_id = $1", [enrollmentId]);
      await client.query("DELETE FROM public.course_certificates WHERE enrollment_id = $1", [enrollmentId]);
      await client.query("DELETE FROM public.topic_quiz_attempts WHERE enrollment_id = $1", [enrollmentId]);
      await client.query("DELETE FROM public.enrollments WHERE id = $1", [enrollmentId]);

      console.log("[Admin] Successfully deleted enrollment and all progress:", enrollmentId);
      return { success: true };
    });
  } catch (err: any) {
    console.error("[Admin] Failed to delete course enrollment:", err);
    return { success: false, error: err.message || "Failed to delete enrollment" };
  }
}

export async function getAdminStudentsServer(): Promise<AdminStudentAccount[]> {
  try {
    const [pRes, aRes, sRes] = await Promise.all([
      dbQuery(`
        SELECT id, full_name, email, phone, college, course, year, photo_url, created_at, updated_at 
        FROM public.profiles 
        ORDER BY created_at DESC
      `),
      dbQuery(`
        SELECT id, user_id, full_name, email, phone, college, course, year, domain, intern_id, created_at, status, offer_issued_at 
        FROM public.applications 
        ORDER BY created_at DESC
      `),
      dbQuery(`
        SELECT student_id, status, last_active, device, browser 
        FROM public.login_sessions 
        ORDER BY last_active DESC
      `),
    ]);

    const profiles = pRes.rows;
    const apps = aRes.rows;
    const sessions = sRes.rows;

    // Map applications by user_id and normalized email
    const appByUserId = new Map<string, any>();
    const appByEmail = new Map<string, any>();
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

    // Map latest login session by student_id
    const sessionMap = new Map<string, any>();
    for (const s of sessions) {
      if (s.student_id && !sessionMap.has(s.student_id)) {
        sessionMap.set(s.student_id, s);
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
  } catch (err: any) {
    console.error("[Admin] Failed to fetch students directory:", err);
    throw err;
  }
}

export async function getAdminCoursesServer(): Promise<AdminCourseItem[]> {
  try {
    const [cRes, eRes, certRes, pRes] = await Promise.all([
      dbQuery("SELECT * FROM public.courses ORDER BY name ASC"),
      dbQuery("SELECT * FROM public.enrollments ORDER BY created_at DESC"),
      dbQuery("SELECT * FROM public.course_certificates"),
      dbQuery("SELECT id, full_name, email, phone, college FROM public.profiles"),
    ]);

    const courses = cRes.rows;
    const enrollments = eRes.rows;
    const certs = certRes.rows;
    const profiles = pRes.rows;

    const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
    const certsByEnrollment = new Map(certs.map((c: any) => [c.enrollment_id, c]));

    return courses.map((c: any) => {
      const courseEnrs = enrollments.filter((e: any) => e.course_id === c.id);
      const completed = courseEnrs.filter((e: any) => e.status === "completed" || Number(e.progress_percent) >= 100);
      const inProgress = courseEnrs.filter((e: any) => e.status !== "completed" && Number(e.progress_percent) < 100);
      const avgProgress = courseEnrs.length > 0
        ? Math.round(courseEnrs.reduce((acc: number, curr: any) => acc + (Number(curr.progress_percent) || 0), 0) / courseEnrs.length)
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
          progress_percent: Number(e.progress_percent) || 0,
          current_topic_id: e.current_topic_id,
          started_at: e.started_at || e.created_at,
          completed_at: e.completed_at,
          created_at: e.created_at,
          certificate: cert ? {
            id: cert.id,
            certificate_id: cert.certificate_id,
            score: Number(cert.score),
            issued_at: cert.issued_at,
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
  } catch (err: any) {
    console.error("[Admin] Failed to fetch courses analytics:", err);
    throw err;
  }
}

export async function toggleCoursePublishServer(data: { courseId: string; isPublished: boolean }) {
  await dbQuery("UPDATE public.courses SET is_published = $1 WHERE id = $2", [data.isPublished, data.courseId]);
  return { success: true };
}

export async function syncApplicationsEmailStatusServer(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const colsRes = await dbQuery("DESCRIBE `applications`");
    const colNames = new Set((colsRes.rows || []).map((c: any) => c.Field.toLowerCase()));

    if (!colNames.has("email_status")) {
      await dbQuery("ALTER TABLE `applications` ADD COLUMN `email_status` VARCHAR(50) DEFAULT 'sent'");
    }
    if (!colNames.has("email_sent_at")) {
      await dbQuery("ALTER TABLE `applications` ADD COLUMN `email_sent_at` DATETIME(3) NULL");
    }
    if (!colNames.has("email_error")) {
      await dbQuery("ALTER TABLE `applications` ADD COLUMN `email_error` TEXT NULL");
    }
    if (!colNames.has("email_attempts")) {
      await dbQuery("ALTER TABLE `applications` ADD COLUMN `email_attempts` INT DEFAULT 1");
    }

    const res = await dbQuery(`
      UPDATE \`applications\` 
      SET 
        \`email_status\` = 'sent',
        \`email_sent_at\` = COALESCE(\`offer_issued_at\`, \`created_at\`, NOW()),
        \`email_error\` = NULL
      WHERE \`offer_issued_at\` IS NOT NULL AND (\`email_status\` != 'sent' OR \`email_status\` IS NULL)
    `);

    console.log(`[Admin] Successfully synced email_status='sent' for ${res.rowCount} application(s).`);
    return { success: true, count: res.rowCount || 0 };
  } catch (err: any) {
    console.error("[Admin] Failed to sync application email status:", err);
    return { success: false, count: 0, error: err.message || "Failed to sync application email status" };
  }
}

