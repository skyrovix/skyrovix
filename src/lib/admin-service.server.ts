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

export async function deleteStudentAccountServer(studentId: string): Promise<DeleteResult> {
  if (!studentId) return { success: false, error: "Student ID is required" };

  console.log("[Admin] Deleting student account via DB transaction:", studentId);

  try {
    return await withTransaction(async (client) => {
      const safeDelete = async (sql: string, params: any[]) => {
        try {
          await client.query(sql, params);
        } catch (err: any) {
          console.warn(`[Admin] safeDelete notice (${sql}):`, err.message);
        }
      };

      // 1. Safety check: Protect Admin accounts from deletion
      const profRes = await client.query("SELECT id, email FROM public.profiles WHERE id = $1 LIMIT 1", [studentId]);
      const userRes = await client.query("SELECT id, email FROM public.users WHERE id = $1 LIMIT 1", [studentId]);
      const studentEmail = (profRes.rows[0]?.email || userRes.rows[0]?.email || "").trim().toLowerCase();

      if (studentEmail === "hariharan@skyrovix.com") {
        return { success: false, error: "Unauthorized: Primary Admin account cannot be deleted." };
      }

      const roleRes = await client.query("SELECT role FROM public.user_roles WHERE user_id = $1", [studentId]);
      if (roleRes.rows.some((r: any) => r.role === "admin")) {
        return { success: false, error: "Unauthorized: Admin accounts cannot be deleted." };
      }

      // 2. Find and delete all applications for this student and their dependent records
      const appRows = await client.query(
        "SELECT id FROM public.applications WHERE user_id = $1 OR (email IS NOT NULL AND email = $2)",
        [studentId, studentEmail]
      );
      const appIds: string[] = appRows.rows.map((r: any) => r.id);

      for (const appId of appIds) {
        await safeDelete("DELETE FROM public.submissions WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.submission_history WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.payment_records WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.payments WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.certificates WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.offer_letters WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.coupon_redemptions WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.intern_workflows WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.linkedin_submissions WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.document_tokens WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.student_kit_purchases WHERE application_id = $1", [appId]);
        await safeDelete("DELETE FROM public.applications WHERE id = $1", [appId]);
      }
      if (studentEmail) {
        await safeDelete("DELETE FROM public.applications WHERE user_id = $1 OR email = $2", [studentId, studentEmail]);
      } else {
        await safeDelete("DELETE FROM public.applications WHERE user_id = $1", [studentId]);
      }

      // 3. Delete direct records linked by user_id
      await safeDelete("DELETE FROM public.payment_records WHERE user_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.coupon_redemptions WHERE user_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.cashfree_orders WHERE user_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.student_kit_purchases WHERE user_id = $1", [studentId]);

      // 4. Course enrollments and progress (cascading via enrollment_id)
      const enrRows = await client.query("SELECT id FROM public.enrollments WHERE user_id = $1", [studentId]);
      for (const enr of enrRows.rows) {
        await safeDelete("DELETE FROM public.lesson_progress WHERE enrollment_id = $1", [enr.id]);
        await safeDelete("DELETE FROM public.course_task_submissions WHERE enrollment_id = $1", [enr.id]);
        await safeDelete("DELETE FROM public.quiz_attempts WHERE enrollment_id = $1", [enr.id]);
        await safeDelete("DELETE FROM public.topic_quiz_attempts WHERE enrollment_id = $1", [enr.id]);
        await safeDelete("DELETE FROM public.course_certificates WHERE enrollment_id = $1", [enr.id]);
        await safeDelete("DELETE FROM public.enrollments WHERE id = $1", [enr.id]);
      }
      await safeDelete("DELETE FROM public.enrollments WHERE user_id = $1", [studentId]);

      // 5. Delete login sessions (table uses student_id and email, not user_id)
      if (studentEmail) {
        await safeDelete("DELETE FROM public.login_sessions WHERE student_id = $1 OR email = $2", [studentId, studentEmail]);
      } else {
        await safeDelete("DELETE FROM public.login_sessions WHERE student_id = $1", [studentId]);
      }

      // 6. Delete student performance evaluations, guidance schedules and notifications
      await safeDelete("DELETE FROM public.student_performance_evaluations WHERE student_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.guidance_schedules WHERE student_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.user_notifications WHERE user_id = $1", [studentId]);
      await safeDelete("DELETE FROM public.notifications WHERE user_id = $1", [studentId]);

      // 7. Delete profile, user roles & base user account
      await client.query("DELETE FROM public.user_roles WHERE user_id = $1", [studentId]);
      await client.query("DELETE FROM public.profiles WHERE id = $1", [studentId]);
      if (studentEmail) {
        await client.query("DELETE FROM public.users WHERE id = $1 OR email = $2", [studentId, studentEmail]);
      } else {
        await client.query("DELETE FROM public.users WHERE id = $1", [studentId]);
      }

      console.log(`[Admin] Successfully deleted student account ${studentId} (${studentEmail})`);
      return { success: true };
    });
  } catch (err: any) {
    console.error("[Admin] Failed to delete student account:", err);
    return { success: false, error: err.message || "Failed to delete student account" };
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

export async function resendStudentDocumentEmailServer(
  input: {
    applicationId?: string;
    certificateId?: string;
    internId?: string;
    userId?: string;
    studentEmail?: string;
    documentType: "offer_letter" | "certificate" | "both";
    targetEmail?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
  sentOfferLetter?: boolean;
  sentCertificate?: boolean;
  certificateId?: string;
  targetEmail: string;
  message: string;
}> {
  const {
    applicationId,
    certificateId,
    internId,
    userId,
    studentEmail,
    documentType,
    targetEmail,
  } = input;

  const lookupAppId = (applicationId || "").trim();
  const lookupCertId = (certificateId || "").trim();
  const lookupInternId = (internId || "").trim();
  const lookupUserId = (userId || "").trim();
  const lookupEmail = (studentEmail || "").trim();

  if (!lookupAppId && !lookupCertId && !lookupInternId && !lookupUserId && !lookupEmail && !targetEmail) {
    return {
      success: false,
      error: "At least one student or document identifier (Application ID, Certificate ID, Intern ID, or Email) is required",
      targetEmail: targetEmail || "",
      message: "At least one student or document identifier is required",
    };
  }

  try {
    // 1. Check if a certificate exists for any of these identifiers
    let existingCert: any = null;
    if (lookupCertId || lookupAppId || lookupInternId) {
      const certRes = await dbQuery(
        `SELECT * FROM certificates 
         WHERE certificate_id = ? 
            OR id = ? 
            OR application_id = ? 
            OR intern_id = ?
         ORDER BY issued_at DESC LIMIT 1`,
        [lookupCertId || lookupAppId, lookupCertId || lookupAppId, lookupAppId, lookupInternId]
      );
      if (certRes.rows && certRes.rows.length > 0) {
        existingCert = certRes.rows[0];
      }
    }

    // 2. Fetch application record
    let app: any = null;
    const targetAppId = existingCert?.application_id || lookupAppId;
    const targetInternId = existingCert?.intern_id || lookupInternId;
    const targetUserId = existingCert?.student_id || lookupUserId;

    const appRes = await dbQuery(
      `SELECT a.*, c.certificate_id AS existing_cert_id
       FROM applications a
       LEFT JOIN certificates c ON (c.application_id = a.id OR (c.intern_id IS NOT NULL AND c.intern_id = a.intern_id))
       WHERE (a.id = ? AND ? != '')
          OR (a.intern_id = ? AND ? != '')
          OR (a.user_id = ? AND ? != '')
          OR (a.email = ? AND ? != '')
          OR (c.certificate_id = ? AND ? != '')
       ORDER BY a.created_at DESC
       LIMIT 1`,
      [
        targetAppId, targetAppId,
        targetInternId, targetInternId,
        targetUserId, targetUserId,
        lookupEmail, lookupEmail,
        lookupCertId, lookupCertId,
      ]
    );

    if (appRes.rows && appRes.rows.length > 0) {
      app = appRes.rows[0];
    } else if (existingCert) {
      // Synthesize application details from certificate & profile if application row is missing
      let profileUser: any = null;
      if (existingCert.student_id) {
        const profRes = await dbQuery(
          `SELECT id, email, full_name, college, course, year FROM profiles WHERE id = ? LIMIT 1`,
          [existingCert.student_id]
        );
        if (profRes.rows && profRes.rows.length > 0) profileUser = profRes.rows[0];
      }

      app = {
        id: existingCert.application_id || existingCert.id,
        user_id: existingCert.student_id,
        full_name: existingCert.student_name || profileUser?.full_name || "Student",
        email: profileUser?.email || lookupEmail || "",
        intern_id: existingCert.intern_id,
        domain: existingCert.domain || "internship",
        duration: 1,
        existing_cert_id: existingCert.certificate_id,
      };
    }

    if (!app) {
      return {
        success: false,
        error: "Student application record not found for this certificate",
        targetEmail: targetEmail || lookupEmail || "",
        message: "Student application record not found for this certificate",
      };
    }

    // 3. Resolve the recipient email address with multiple fallbacks
    let emailToUse = (targetEmail && targetEmail.includes("@")) ? targetEmail.trim() : "";
    if (!emailToUse && lookupEmail && lookupEmail.includes("@")) {
      emailToUse = lookupEmail;
    }
    if (!emailToUse && app.email && app.email.includes("@")) {
      emailToUse = app.email.trim();
    }
    if (!emailToUse && app.user_id) {
      const profRes = await dbQuery(`SELECT email FROM profiles WHERE id = ? LIMIT 1`, [app.user_id]);
      if (profRes.rows?.[0]?.email) emailToUse = profRes.rows[0].email.trim();
    }
    if (!emailToUse && app.user_id) {
      const userRes = await dbQuery(`SELECT email FROM users WHERE id = ? LIMIT 1`, [app.user_id]);
      if (userRes.rows?.[0]?.email) emailToUse = userRes.rows[0].email.trim();
    }

    if (!emailToUse || !emailToUse.includes("@")) {
      return {
        success: false,
        error: "Student email address not found in profile or application records. Please specify a recipient email in the resend options dialog.",
        targetEmail: emailToUse || "",
        message: "Student email address not found",
      };
    }

    const { getDomain } = await import("@/lib/constants");
    const domainObj = getDomain(app.domain);
    const domainName = domainObj?.name ?? app.domain ?? "Internship Track";

    let sentOfferLetter = false;
    let sentCertificate = false;
    let certId = app.existing_cert_id;
    const errors: string[] = [];

    // 2. Resend Offer Letter
    if (documentType === "offer_letter" || documentType === "both") {
      try {
        const { sendOfferLetterEmail } = await import("@/lib/email-helpers");
        const offerRes = await sendOfferLetterEmail({
          to: emailToUse,
          studentName: app.full_name,
          studentId: app.user_id,
          internId: app.intern_id,
          domainName,
          duration: app.duration || 1,
        });

        if (offerRes.success) {
          sentOfferLetter = true;
          await dbQuery(
            `UPDATE applications 
             SET offer_issued_at = COALESCE(offer_issued_at, NOW()),
                 email_status = 'sent',
                 email_sent_at = NOW(),
                 email_error = NULL
             WHERE id = ?`,
            [app.id]
          );
        } else {
          errors.push(`Offer Letter failed: ${offerRes.error || "Email delivery failed"}`);
          await dbQuery(
            `UPDATE applications SET email_status = 'failed', email_error = ? WHERE id = ?`,
            [offerRes.error || "Offer letter email delivery failed", app.id]
          );
        }
      } catch (e: any) {
        errors.push(`Offer Letter error: ${e.message}`);
      }
    }

    // 3. Resend Certificate
    if (documentType === "certificate" || documentType === "both") {
      try {
        // If certificate record doesn't exist yet, generate one
        if (!certId) {
          const year = new Date().getFullYear();
          const rand = Math.floor(100000 + Math.random() * 900000);
          certId = `SKX-${year}-${rand}`;
          const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
          const certRecordId = crypto.randomUUID();

          await dbQuery(
            `INSERT INTO certificates (id, application_id, certificate_id, intern_id, student_name, domain, verification_hash, issued_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [certRecordId, app.id, certId, app.intern_id, app.full_name, app.domain, hash]
          );

          await dbQuery(
            `UPDATE applications 
             SET certificate_generated = 1,
                 certificate_generated_at = COALESCE(certificate_generated_at, NOW())
             WHERE id = ?`,
            [app.id]
          );
        }

        const { sendCertificateEmail } = await import("@/lib/email-helpers");
        const certRes = await sendCertificateEmail({
          to: emailToUse,
          studentName: app.full_name,
          studentId: app.user_id,
          certId,
          domainName,
          internId: app.intern_id,
        });

        if (certRes.success) {
          sentCertificate = true;
          await dbQuery(
            `UPDATE applications 
             SET certificate_generated = 1,
                 certificate_generated_at = COALESCE(certificate_generated_at, NOW()),
                 email_status = 'sent',
                 email_sent_at = NOW(),
                 email_error = NULL
             WHERE id = ?`,
            [app.id]
          );
        } else {
          errors.push(`Certificate failed: ${certRes.error || "Email delivery failed"}`);
          await dbQuery(
            `UPDATE applications SET email_status = 'failed', email_error = ? WHERE id = ?`,
            [certRes.error || "Certificate email delivery failed", app.id]
          );
        }
      } catch (e: any) {
        errors.push(`Certificate error: ${e.message}`);
      }
    }

    const success = (documentType === "both" ? (sentOfferLetter && sentCertificate) : (sentOfferLetter || sentCertificate));
    const message = success
      ? `Document(s) successfully resent to ${emailToUse}`
      : errors.join("; ") || "Resend failed";

    return {
      success,
      error: success ? undefined : message,
      sentOfferLetter,
      sentCertificate,
      certificateId: certId,
      targetEmail: emailToUse,
      message,
    };
  } catch (err: any) {
    console.error("[Admin] resendStudentDocumentEmailServer error:", err);
    return {
      success: false,
      error: err.message || "Failed to resend document email",
      targetEmail: targetEmail || "",
      message: err.message || "Failed to resend document email",
    };
  }
}

// ══════════════════════════════════════════════
// PREMIUM PLAN PAYMENTS & EXCLUSIVE OFFERS
// ══════════════════════════════════════════════

export interface AdminPremiumPaymentRecord {
  id: string;
  application_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  intern_id: string;
  domain: string;
  duration: number;
  college: string;
  plan_type: string;
  plan_fee: number;
  agreed_fee: number;
  discount_amount: number;
  plan_payment_status: "paid" | "free" | "waived" | "pending" | "unpaid";
  plan_payment_method: string | null;
  plan_payment_id: string | null;
  plan_admin_notes: string | null;
  coupon_code: string | null;
  plan_paid_at: string | null;
  created_at: string;
  approved_tasks_count: number;
  total_tasks: number;
  payment_category: "cashfree" | "manual" | "free" | "offer_discount" | "pending";
}

export interface AdminPremiumPaymentsResult {
  records: AdminPremiumPaymentRecord[];
  stats: {
    totalStudents: number;
    cashfreePaid: number;
    manualPaid: number;
    freeWaivers: number;
    discountedOffers: number;
    pendingUnpaid: number;
    totalRevenue: number;
  };
}

export async function getAdminPremiumPaymentsServer(): Promise<AdminPremiumPaymentsResult> {
  try {
    const appsRes = await dbQuery(`
      SELECT 
        a.id, a.user_id, a.full_name, a.email, a.phone, a.intern_id, a.domain, a.duration, a.college,
        a.plan_type, a.plan_fee, a.agreed_fee, a.discount_amount, a.plan_payment_status,
        a.plan_payment_method, a.plan_payment_id, a.plan_admin_notes, a.coupon_code,
        a.plan_paid_at, a.created_at, a.total_tasks
      FROM public.applications a
      WHERE a.plan_type = 'premium'
         OR (a.plan_payment_status IS NOT NULL AND a.plan_payment_status != 'not_required')
         OR a.plan_fee > 0
         OR a.agreed_fee > 0
         OR (a.domain = 'fullstack' AND a.duration IN (3, 6))
      ORDER BY COALESCE(a.plan_paid_at, a.created_at) DESC
    `);

    const subsRes = await dbQuery(`
      SELECT application_id, COUNT(*) as approved_count 
      FROM public.submissions 
      WHERE status = 'approved' 
      GROUP BY application_id
    `).catch(() => ({ rows: [] }));

    const subsMap: Record<string, number> = {};
    for (const r of subsRes.rows || []) {
      subsMap[r.application_id] = Number(r.approved_count || 0);
    }

    let totalStudents = 0;
    let cashfreePaid = 0;
    let manualPaid = 0;
    let freeWaivers = 0;
    let discountedOffers = 0;
    let pendingUnpaid = 0;
    let totalRevenue = 0;

    const records: AdminPremiumPaymentRecord[] = (appsRes.rows || []).map((row: any) => {
      totalStudents++;

      const pStatus = (row.plan_payment_status || "pending").toLowerCase();
      const pMethod = (row.plan_payment_method || "").toLowerCase();
      const pId = (row.plan_payment_id || "").toLowerCase();
      const coupon = (row.coupon_code || "").trim();
      const baseFee = Number(row.plan_fee || 200);
      const agreed = Number(row.agreed_fee || (pStatus === "paid" ? 200 : 0));
      const discount = Number(row.discount_amount || (baseFee > agreed && agreed > 0 ? baseFee - agreed : 0));

      let category: "cashfree" | "manual" | "free" | "offer_discount" | "pending" = "pending";

      if (pStatus === "free" || pStatus === "waived" || (pStatus === "paid" && agreed === 0)) {
        category = "free";
        freeWaivers++;
      } else if (pStatus === "paid") {
        totalRevenue += agreed;
        if (coupon || discount > 0) {
          discountedOffers++;
        }
        if (pMethod.includes("cashfree") || pId.startsWith("order_") || pId.startsWith("cf_")) {
          category = coupon || discount > 0 ? "offer_discount" : "cashfree";
          cashfreePaid++;
        } else {
          category = coupon || discount > 0 ? "offer_discount" : "manual";
          manualPaid++;
        }
      } else {
        if (coupon || discount > 0) {
          discountedOffers++;
          category = "offer_discount";
        } else {
          pendingUnpaid++;
          category = "pending";
        }
      }

      return {
        id: row.id,
        application_id: row.id,
        user_id: row.user_id,
        full_name: row.full_name || "Student",
        email: row.email || "",
        phone: row.phone || "",
        intern_id: row.intern_id || "",
        domain: row.domain || "fullstack",
        duration: Number(row.duration || 3),
        college: row.college || "",
        plan_type: row.plan_type || "premium",
        plan_fee: baseFee,
        agreed_fee: agreed,
        discount_amount: discount,
        plan_payment_status: pStatus as any,
        plan_payment_method: row.plan_payment_method,
        plan_payment_id: row.plan_payment_id,
        plan_admin_notes: row.plan_admin_notes,
        coupon_code: row.coupon_code,
        plan_paid_at: row.plan_paid_at,
        created_at: row.created_at,
        approved_tasks_count: subsMap[row.id] || 0,
        total_tasks: Number(row.total_tasks || 25),
        payment_category: category,
      };
    });

    return {
      records,
      stats: {
        totalStudents,
        cashfreePaid,
        manualPaid,
        freeWaivers,
        discountedOffers,
        pendingUnpaid,
        totalRevenue,
      },
    };
  } catch (err: any) {
    console.error("[Admin] getAdminPremiumPaymentsServer error:", err);
    return {
      records: [],
      stats: {
        totalStudents: 0,
        cashfreePaid: 0,
        manualPaid: 0,
        freeWaivers: 0,
        discountedOffers: 0,
        pendingUnpaid: 0,
        totalRevenue: 0,
      },
    };
  }
}

export async function updateAdminPremiumPaymentServer(data: {
  applicationId: string;
  status: "paid" | "free" | "waived" | "pending";
  paymentMethod?: string;
  agreedFee?: number;
  discountAmount?: number;
  couponCode?: string;
  referenceId?: string;
  adminNotes?: string;
}): Promise<DeleteResult> {
  const { applicationId, status, paymentMethod, agreedFee, discountAmount, couponCode, referenceId, adminNotes } = data;
  if (!applicationId) return { success: false, error: "Application ID is required" };

  try {
    return await withTransaction(async (client) => {
      const appRes = await client.query("SELECT * FROM public.applications WHERE id = $1 LIMIT 1", [applicationId]);
      if (appRes.rows.length === 0) return { success: false, error: "Application not found" };

      const app = appRes.rows[0];
      const isPaidOrFree = status === "paid" || status === "free" || status === "waived";

      // Calculate total tasks for premium plan
      let totalTasks = app.total_tasks;
      if (isPaidOrFree) {
        if (app.domain === "fullstack" && app.duration === 6) totalTasks = 50;
        else if (app.domain === "fullstack" && app.duration === 3) totalTasks = 25;
        else if (app.duration === 6) totalTasks = 12;
        else if (app.duration === 3) totalTasks = 10;
        else if (app.duration === 2) totalTasks = 8;
        else totalTasks = 5;
      }

      const finalStatus = status;
      const finalPaidAt = isPaidOrFree ? new Date().toISOString() : null;
      const finalAgreedFee = status === "free" || status === "waived" ? 0 : (agreedFee !== undefined ? agreedFee : (app.plan_fee || 200));
      const finalDiscount = discountAmount !== undefined ? discountAmount : (app.plan_fee > finalAgreedFee ? app.plan_fee - finalAgreedFee : 0);
      const finalMethod = paymentMethod || (status === "free" ? "admin_free_waiver" : "manual_upi");
      const finalRef = referenceId || (status === "free" ? "FREE_GRANT" : "");

      await client.query(`
        UPDATE public.applications
        SET plan_payment_status = $1,
            plan_type = 'premium',
            total_tasks = $2,
            agreed_fee = $3,
            discount_amount = $4,
            plan_payment_method = $5,
            plan_payment_id = $6,
            plan_admin_notes = $7,
            coupon_code = COALESCE($8, coupon_code),
            plan_paid_at = CASE WHEN $9 IS NOT NULL THEN $9 ELSE plan_paid_at END,
            updated_at = NOW()
        WHERE id = $10
      `, [
        finalStatus,
        totalTasks,
        finalAgreedFee,
        finalDiscount,
        finalMethod,
        finalRef,
        adminNotes || null,
        couponCode || null,
        finalPaidAt,
        applicationId,
      ]);

      // If marked as paid or free, ensure audit record in payment_records
      if (isPaidOrFree) {
        await client.query(`
          INSERT INTO public.payment_records (
            id, user_id, application_id, payment_type, amount, utr_number, status, reviewed_at, admin_note
          ) VALUES (UUID(), $1, $2, 'application', $3, $4, 'approved', NOW(), $5)
          ON DUPLICATE KEY UPDATE status = 'approved', amount = $3, admin_note = $5
        `, [
          app.user_id,
          applicationId,
          finalAgreedFee,
          finalRef || "ADMIN_MANUAL",
          `Admin action: marked ${status} (${finalMethod}). Notes: ${adminNotes || "None"}`,
        ]).catch(() => {});
      }

      return { success: true };
    });
  } catch (err: any) {
    console.error("[Admin] updateAdminPremiumPaymentServer error:", err);
    return { success: false, error: err.message || "Failed to update payment status" };
  }
}

export async function getAdminPremiumCouponsServer() {
  try {
    const res = await dbQuery(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id) as redemption_count
      FROM public.coupons c
      WHERE c.applies_to = 'premium_plan' OR c.applies_to = 'both'
      ORDER BY c.created_at DESC
    `);
    return res.rows || [];
  } catch (err: any) {
    console.error("[Admin] getAdminPremiumCouponsServer error:", err);
    return [];
  }
}

export async function createAdminPremiumCouponServer(data: {
  adminId: string;
  code: string;
  description?: string;
  discountType: "fixed" | "percentage" | "free";
  discountValue: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
}) {
  const cleanCode = data.code.trim().toUpperCase();
  if (!cleanCode) throw new Error("Coupon code is required");
  if (data.discountValue < 0) throw new Error("Discount value cannot be negative");

  return withTransaction(async (client) => {
    const existing = await client.query("SELECT id FROM public.coupons WHERE LOWER(code) = LOWER($1)", [cleanCode]);
    if (existing.rows.length > 0) {
      throw new Error(`Coupon with code "${cleanCode}" already exists`);
    }

    const couponId = crypto.randomUUID();
    await client.query(`
      INSERT INTO public.coupons (
        id, code, description, discount_type, discount_value, applies_to, max_uses, single_use_per_user, expires_at, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, 'premium_plan', $6, 1, $7, $8, $9)
    `, [
      couponId,
      cleanCode,
      data.description || `Exclusive Premium Plan Offer: ${data.discountType === "free" ? "100% Free" : data.discountType === "fixed" ? `₹${data.discountValue} OFF` : `${data.discountValue}% OFF`}`,
      data.discountType,
      data.discountValue,
      data.usageLimit || 0,
      data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      data.isActive !== false ? 1 : 0,
      data.adminId || "admin",
    ]);

    return { success: true, couponId, code: cleanCode };
  });
}

export async function activateFreePremiumCouponServer(data: {
  applicationId: string;
  couponCode: string;
  userId?: string;
}) {
  const { applicationId, couponCode, userId } = data;
  if (!applicationId || !couponCode) {
    return { success: false, error: "Application ID and coupon code are required" };
  }

  const { validateCouponLogic } = await import("./fee-service.server");
  const validation = await validateCouponLogic({
    code: couponCode,
    userId,
    applicationId,
    target: "premium_plan",
  });

  if (!validation.valid) {
    return { success: false, error: validation.error || "Invalid coupon" };
  }

  if (validation.finalAmount > 0) {
    return {
      success: false,
      error: `This coupon provides a ₹${validation.discountAmount} discount. Payable amount is ₹${validation.finalAmount}. Please proceed to payment.`,
    };
  }

  return withTransaction(async (client) => {
    // 1. Fetch application
    const appRes = await client.query("SELECT * FROM public.applications WHERE id = $1 LIMIT 1", [applicationId]);
    if (appRes.rows.length === 0) return { success: false, error: "Application not found" };
    const app = appRes.rows[0];

    // 2. Compute total tasks
    let totalTasks = app.total_tasks;
    if (app.domain === "fullstack" && app.duration === 6) totalTasks = 50;
    else if (app.domain === "fullstack" && app.duration === 3) totalTasks = 25;
    else if (app.duration === 6) totalTasks = 12;
    else if (app.duration === 3) totalTasks = 10;
    else if (app.duration === 2) totalTasks = 8;
    else totalTasks = 5;

    // 3. Update application
    await client.query(`
      UPDATE public.applications
      SET plan_payment_status = 'free',
          plan_type = 'premium',
          total_tasks = $1,
          agreed_fee = 0.00,
          discount_amount = $2,
          coupon_code = $3,
          plan_payment_method = 'coupon_free',
          plan_payment_id = CONCAT('FREE_COUPON_', $3),
          plan_paid_at = NOW(),
          status = 'approved',
          updated_at = NOW()
      WHERE id = $4
    `, [totalTasks, validation.discountAmount, couponCode.trim().toUpperCase(), applicationId]);

    // 4. Update coupon usage
    await client.query(`
      UPDATE public.coupons 
      SET current_uses = current_uses + 1 
      WHERE LOWER(code) = LOWER($1)
    `, [couponCode.trim()]);

    // 5. Record redemption
    if (userId) {
      const cRes = await client.query("SELECT id FROM public.coupons WHERE LOWER(code) = LOWER($1) LIMIT 1", [couponCode.trim()]);
      if (cRes.rows.length > 0) {
        await client.query(`
          INSERT INTO public.coupon_redemptions (id, coupon_id, user_id, application_id, redeemed_at)
          VALUES (UUID(), $1, $2, $3, NOW())
        `, [cRes.rows[0].id, userId, applicationId]).catch(() => {});
      }
    }

    return { success: true };
  });
}

