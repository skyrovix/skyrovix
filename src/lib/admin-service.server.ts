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

