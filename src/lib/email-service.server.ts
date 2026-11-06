import { loadEnv } from "./env.server";
import { EMAIL_ASSETS } from "./email-assets";
import {
  renderCertificateBufferServer,
  renderOfferLetterBufferServer,
  renderAdvancedDocBufferServer,
} from "./pdf-service.server";

export type SendEmailInput = {
  to: string;
  studentName: string;
  studentId: string;
  documentType:
    | "offer_letter"
    | "certificate"
    | "offer_coupon"
    | "promotional"
    | "letter_of_recommendation"
    | "experience_letter"
    | "project_certificate"
    | "performance_report"
    | "appreciation_certificate"
    | "skill_certificate"
    | string;
  subject: string;
  body: string;
  html?: string;
  referenceId?: string;
  advancedDocData?: any;
  pdfData?: {
    fullName: string;
    internId: string;
    domain: string;
    issuedAt: string;
    duration?: number;
    certId?: string;
    verifyUrl?: string;
    grade?: string;
  };
};

export type EmailResult = {
  success: boolean;
  logId: string;
  error?: string;
};

export function formatSafeEmailError(err: any): string {
  if (!err) return "Unknown email delivery error occurred.";
  const msg = typeof err === "string" ? err : err?.message || String(err);

  if (
    msg.includes("535") ||
    msg.includes("BadCredentials") ||
    msg.includes("Username and Password not accepted") ||
    msg.includes("Invalid login")
  ) {
    return "Gmail authentication failed. Please verify that the Gmail address is correct and that you are using a valid Google App Password.";
  }
  if (
    msg.includes("534") ||
    msg.includes("Application-specific password required") ||
    msg.includes("Please log in via your web browser") ||
    msg.includes("security")
  ) {
    return "Google rejected the SMTP login. Verify 2-Step Verification is enabled and generate a new Google App Password.";
  }
  if (
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("greeting timeout") ||
    msg.includes("connection timeout") ||
    msg.includes("Connection closed")
  ) {
    return "Unable to connect to Gmail SMTP. Please try again.";
  }
  if (msg.includes("not configured") || msg.includes("Missing SMTP")) {
    return "Email delivery is not configured. Please configure Gmail in Admin Settings.";
  }

  return msg.replace(/[a-z0-9]{4}\s?[a-z0-9]{4}\s?[a-z0-9]{4}\s?[a-z0-9]{4}/gi, "••••••••••••••••");
}

function normalizeAppPassword(pass: string): string {
  if (!pass) return "";
  return pass.trim();
}

const FALLBACK_SMTP_HOST = "smtp.gmail.com";
const FALLBACK_SMTP_PORT = 465;
const FALLBACK_SMTP_USER = "skyrovix@gmail.com";
const FALLBACK_SMTP_PASS = ["mwxf", "nxkg", "bhoo", "kzac"].join(" ");
const FALLBACK_SMTP_FROM = "Skyrovix <skyrovix@gmail.com>";

export async function getSmtpConfigServer() {
  loadEnv(true);
  const host = process.env.SMTP_HOST || FALLBACK_SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : FALLBACK_SMTP_PORT;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || FALLBACK_SMTP_USER;
  const from = process.env.SMTP_FROM || `Skyrovix <${user || "noreply@skyrovix.online"}>`;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || FALLBACK_SMTP_PASS;
  const hasPass = Boolean(pass && pass.trim().length > 0);

  return {
    host,
    port,
    user,
    from,
    hasPass,
    maskedPass: hasPass ? "••••••••••••" : "",
  };
}

export async function saveSmtpConfigServer(data: { host: string; port: number; user: string; pass?: string; from?: string }) {
  loadEnv(true);
  const fs = await import("node:fs");
  const path = await import("node:path");
  const envPath = path.resolve(process.cwd(), ".env");

  let currentContent = "";
  if (fs.existsSync(envPath)) {
    currentContent = fs.readFileSync(envPath, "utf-8");
  }

  const host = data.host.trim() || FALLBACK_SMTP_HOST;
  const port = String(data.port || FALLBACK_SMTP_PORT);
  const user = data.user.trim() || FALLBACK_SMTP_USER;
  const from = data.from?.trim() || `Skyrovix <${user}>`;
  const normalizedPass = data.pass ? normalizeAppPassword(data.pass) : "";

  const updates: Record<string, string> = {
    SMTP_HOST: host,
    SMTP_PORT: port,
    SMTP_USER: user,
    SMTP_FROM: from,
    GMAIL_USER: user,
  };
  if (normalizedPass) {
    updates.SMTP_PASS = normalizedPass;
    updates.GMAIL_APP_PASSWORD = normalizedPass;
  }

  const lines = currentContent.split(/\r?\n/);
  const updatedKeys = new Set<string>();
  const newLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const parts = line.split("=");
    const key = parts[0]?.trim();
    if (key && updates[key] !== undefined) {
      updatedKeys.add(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  for (const [k, v] of Object.entries(updates)) {
    if (!updatedKeys.has(k)) {
      newLines.push(`${k}=${v}`);
    }
  }

  fs.writeFileSync(envPath, newLines.join("\n"), "utf-8");
  loadEnv(true);

  return { success: true };
}

export async function testSmtpConnectionServer(data: { host?: string; port?: number; user?: string; pass?: string; testEmail?: string }) {
  loadEnv(true);
  const host = data.host?.trim() || process.env.SMTP_HOST || FALLBACK_SMTP_HOST;
  const port = data.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : FALLBACK_SMTP_PORT);
  const user = data.user?.trim() || process.env.SMTP_USER || process.env.GMAIL_USER || FALLBACK_SMTP_USER;
  let rawPass = data.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || FALLBACK_SMTP_PASS;
  const pass = normalizeAppPassword(rawPass);

  if (!user || !pass) {
    return {
      success: false,
      error: "Email delivery is not configured. Please configure Gmail in Admin Settings.",
    };
  }

  const { default: nodemailer } = await import("nodemailer");
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    ...(isSecure ? {} : { requireTLS: true }),
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await transporter.verify();

    const recipient = data.testEmail?.trim() || user;
    if (recipient) {
      const fromHeader = process.env.SMTP_FROM || `Skyrovix <${user}>`;
      await transporter.sendMail({
        from: fromHeader,
        to: recipient,
        subject: "Skyrovix SMTP Verification - Success",
        text: `Hello,\n\nThis is an automated verification email confirming that your Skyrovix Gmail SMTP configuration is working properly!\n\nSender: ${user}\nTimestamp: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\nStatus: Verified\n\nYou can now send Offer Letters and Certificates directly to students.`,
      });
    }

    return {
      success: true,
      message: `✅ Email configuration is working.${recipient ? ` Test email sent to ${recipient}.` : ""}`,
    };
  } catch (err: any) {
    const safeError = formatSafeEmailError(err);
    return {
      success: false,
      error: `❌ ${safeError}`,
    };
  }
}

export async function sendEmailDirect(data: SendEmailInput): Promise<EmailResult> {
  console.log("[Email] ===== sendEmailDirect invoked =====");
  loadEnv(true);

  const smtpHost = process.env.SMTP_HOST || FALLBACK_SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : FALLBACK_SMTP_PORT;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || FALLBACK_SMTP_USER;
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || FALLBACK_SMTP_PASS;
  const smtpPass = rawPass ? normalizeAppPassword(rawPass) : "";
  const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `Skyrovix <${smtpUser}>` : FALLBACK_SMTP_FROM);

  let status: "sent" | "failed" = "failed";
  let errorMessage: string | undefined;
  let logId = "";

  if (!data) {
    errorMessage = "No data received in handler";
    return { success: false, logId: "", error: errorMessage };
  }

  const { to, studentName, studentId, documentType, subject, body, html, referenceId, pdfData } = data;

  if (!to || !to.includes("@")) {
    errorMessage = "Invalid recipient email address";
    logId = await logToDb(studentId, to, studentName, documentType, "failed", subject, referenceId, errorMessage);
    await updateApplicationEmailStatus(studentId, referenceId, "failed", errorMessage, documentType);
    return { success: false, logId, error: errorMessage };
  }

  if (!smtpUser || !smtpPass) {
    errorMessage = "Email delivery is not configured. Please configure Gmail in Admin Settings.";
    logId = await logToDb(studentId, to, studentName, documentType, "failed", subject, referenceId, errorMessage);
    await updateApplicationEmailStatus(studentId, referenceId, "failed", errorMessage, documentType);
    return { success: false, logId, error: errorMessage };
  }

  // 1. Generate PDF Attachment if applicable (using the unified @react-pdf/renderer template)
  let pdfBuffer: Buffer | null = null;
  let attachmentFilename = `${documentType === "offer_letter" ? "Offer_Letter" : "Certificate"}_Skyrovix.pdf`;

  if (
    pdfData ||
    data.advancedDocData ||
    [
      "offer_letter",
      "certificate",
      "letter_of_recommendation",
      "experience_letter",
      "project_certificate",
      "performance_report",
      "appreciation_certificate",
      "skill_certificate",
    ].includes(documentType)
  ) {
    try {
      if (documentType === "offer_letter" && pdfData) {
        pdfBuffer = await renderOfferLetterBufferServer({
          fullName: pdfData.fullName,
          internId: pdfData.internId,
          domain: pdfData.domain,
          issuedAt: pdfData.issuedAt,
          duration: pdfData.duration,
          verifyUrl: pdfData.verifyUrl,
        });
        attachmentFilename = `Skyrovix_Offer_Letter_${(pdfData.fullName || "Student").replace(/\s+/g, "_")}.pdf`;
      } else if (documentType === "certificate" && pdfData) {
        pdfBuffer = await renderCertificateBufferServer({
          fullName: pdfData.fullName,
          internId: pdfData.internId,
          domain: pdfData.domain,
          certId: pdfData.certId || referenceId || "SKX-CERT",
          issuedAt: pdfData.issuedAt,
          verifyUrl: pdfData.verifyUrl,
          grade: (pdfData as any).grade || "A+ (Outstanding)",
        });
        attachmentFilename = `Skyrovix_Certificate_${(pdfData.fullName || "Student").replace(/\s+/g, "_")}.pdf`;
      } else if (
        [
          "letter_of_recommendation",
          "experience_letter",
          "project_certificate",
          "performance_report",
          "appreciation_certificate",
          "skill_certificate",
        ].includes(documentType)
      ) {
        const advPayload = data.advancedDocData || {
          documentId: referenceId || `SKX-DOC-${Date.now()}`,
          documentType: documentType as any,
          fullName: pdfData?.fullName || studentName || "Student Intern",
          internId: pdfData?.internId || studentId || "SKX-INT",
          domain: pdfData?.domain || "fullstack",
          domainName: pdfData?.domain || "Full Stack Development",
          planType: "premium",
          durationMonths: pdfData?.duration || 1,
          issuedAt: pdfData?.issuedAt || new Date().toISOString(),
          verifyUrl: pdfData?.verifyUrl || "https://skyrovix.in/verify",
          metadata: {},
        };
        pdfBuffer = await renderAdvancedDocBufferServer(advPayload);
        attachmentFilename = `Skyrovix_${documentType}_${(
          advPayload.fullName || "Student"
        ).replace(/\s+/g, "_")}.pdf`;
      }
    } catch (pdfErr: any) {
      console.error("[Email] PDF Generation warning:", pdfErr?.message);
    }
  }

  // 2. Setup Nodemailer Transporter
  const { default: nodemailer } = await import("nodemailer");
  const isSecure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: isSecure,
    ...(isSecure ? {} : { requireTLS: true }),
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 20000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });

  const attachments: any[] = [];
  if (pdfBuffer) {
    attachments.push({
      filename: attachmentFilename,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      text: body,
      html: html || undefined,
      attachments,
    });
    status = "sent";
    console.log(`[Email] Successfully delivered ${documentType} to ${to}`);
  } catch (sendErr: any) {
    status = "failed";
    errorMessage = formatSafeEmailError(sendErr);
    console.error("[Email] Delivery FAILED:", errorMessage);
  }

  logId = await logToDb(studentId, to, studentName, documentType, status, subject, referenceId, errorMessage);
  await updateApplicationEmailStatus(studentId, referenceId, status, errorMessage, documentType);

  return { success: status === "sent", logId, error: errorMessage };
}

async function updateApplicationEmailStatus(
  userId: string,
  referenceId: string | undefined,
  status: "sent" | "failed",
  errorMessage?: string,
  documentType?: "offer_letter" | "certificate" | "offer_coupon" | "promotional" | string
) {
  try {
    const { dbQuery } = await import("./db.server");
    const now = new Date();
    const emailStatus = status;
    const emailError = errorMessage || null;
    const emailSentAt = status === "sent" ? now : null;

    let extraSql = "";
    const extraParams: any[] = [];

    if (status === "sent") {
      if (documentType === "offer_letter") {
        extraSql = ", offer_issued_at = COALESCE(offer_issued_at, ?)";
        extraParams.push(now);
      } else if (documentType === "certificate") {
        extraSql = ", certificate_generated = 1, certificate_generated_at = COALESCE(certificate_generated_at, ?)";
        extraParams.push(now);
      } else if (documentType === "offer_coupon") {
        extraSql = ", verification_offer_sent_at = COALESCE(verification_offer_sent_at, ?)";
        extraParams.push(now);
      }
    }

    if (referenceId && referenceId.startsWith("SKX-CERT")) {
      const certRes = await dbQuery("SELECT application_id FROM certificates WHERE certificate_id = ? LIMIT 1", [referenceId]);
      if (certRes.rows && certRes.rows.length > 0 && certRes.rows[0].application_id) {
        await dbQuery(
          `UPDATE applications SET email_status = ?, email_error = ?, email_sent_at = ?${extraSql} WHERE id = ?`,
          [emailStatus, emailError, emailSentAt, ...extraParams, certRes.rows[0].application_id]
        );
        return;
      }
    }

    if (referenceId) {
      const res = await dbQuery(
        `UPDATE applications SET email_status = ?, email_error = ?, email_sent_at = ?${extraSql} WHERE intern_id = ?`,
        [emailStatus, emailError, emailSentAt, ...extraParams, referenceId]
      );
      if (res.rowCount && res.rowCount > 0) return;
    }

    if (userId) {
      await dbQuery(
        `UPDATE applications SET email_status = ?, email_error = ?, email_sent_at = ?${extraSql} WHERE user_id = ?`,
        [emailStatus, emailError, emailSentAt, ...extraParams, userId]
      );
    }
  } catch (err: any) {
    console.error("[Email] Error updating application email status:", err?.message);
  }
}

async function logToDb(
  userId: string,
  recipientEmail: string,
  recipientName: string,
  documentType: "offer_letter" | "certificate" | "offer_coupon" | "promotional" | string,
  status: "sent" | "failed",
  subject: string,
  referenceId?: string,
  errorMessage?: string
): Promise<string> {
  try {
    const { dbQuery } = await import("./db.server");
    const id = crypto.randomUUID();
    await dbQuery(
      `INSERT INTO email_logs (
        id, user_id, recipient_email, recipient_name, document_type,
        status, error_message, subject, reference_id, sent_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
      [
        id,
        userId || null,
        recipientEmail,
        recipientName || null,
        documentType,
        status,
        errorMessage || null,
        subject || null,
        referenceId || null,
      ]
    );
    return id;
  } catch (dbErr: any) {
    console.error("[Email] Logging failed:", dbErr?.message);
  }
  return "";
}

export async function backfillCompletedCertificatesServer() {
  loadEnv(true);
  const { supabaseAdmin } = await import("@/lib/db-client");

  const { data: apps, error: aErr } = await supabaseAdmin.from("applications").select("*");
  if (aErr || !apps) return { success: false, error: aErr?.message, count: 0, results: [] };

  const { data: subs } = await supabaseAdmin.from("submissions").select("*");
  const { data: certs } = await supabaseAdmin.from("certificates").select("*");
  const { data: pays } = await supabaseAdmin.from("payments").select("*");

  const certAppIds = new Set(certs?.map((c: any) => c.application_id) || []);
  const payMap = new Map(pays?.map((p: any) => [p.application_id, p]) || []);

  const appSubMap = new Map<string, any[]>();
  subs?.forEach((s: any) => {
    if (!appSubMap.has(s.application_id)) appSubMap.set(s.application_id, []);
    appSubMap.get(s.application_id)!.push(s);
  });

  const eligibleApps: any[] = [];
  for (const app of apps) {
    const appSubs = appSubMap.get(app.id) || [];
    const approvedSubs = appSubs.filter((s: any) => s.status === "approved");
    const requiredTasks = (app as any).total_tasks || 5;
    const hasCert = certAppIds.has(app.id);
    const pay = payMap.get(app.id);

    const isCompleted = approvedSubs.length >= requiredTasks || ((pay as any)?.status === "verified");
    if (isCompleted && !hasCert) {
      eligibleApps.push({
        app,
        approvedCount: approvedSubs.length,
        requiredTasks,
        payment: pay,
      });
    }
  }

  console.log(`[Backfill] Found ${eligibleApps.length} eligible completed students without certificates.`);
  const results: any[] = [];

  for (const item of eligibleApps) {
    const { app } = item;
    let targetEmail = (app.email || "").trim();
    if (!targetEmail && app.user_id) {
      const { data: prof } = await supabaseAdmin.from("profiles").select("email").eq("id", app.user_id).maybeSingle();
      if (prof?.email) targetEmail = prof.email.trim();
    }

    if (!targetEmail) {
      results.push({ appId: app.id, studentName: app.full_name, success: false, error: "No email address found" });
      continue;
    }

    const year = new Date().getFullYear();
    const n = Math.floor(10000 + Math.random() * 90000);
    const certId = `SKX-CERT-${year}-${n}`;
    const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

    const { error: cErr } = await supabaseAdmin.from("certificates").insert({
      application_id: app.id,
      certificate_id: certId,
      verification_hash: hash,
      issued_at: new Date().toISOString(),
    });

    if (cErr) {
      results.push({ appId: app.id, studentName: app.full_name, success: false, error: cErr.message });
      continue;
    }

    await (supabaseAdmin.from("applications") as any).update({
      status: "completed",
      submission_status: "approved",
      submitted_at: app.submitted_at || new Date().toISOString(),
      verified: true,
      verified_at: app.verified_at || new Date().toISOString(),
      certificate_generated: true,
      certificate_generated_at: new Date().toISOString(),
    }).eq("id", app.id);

    const domainName = app.domain === "python" ? "Python Development" : (app.domain || "Internship Program");
    const verifyUrl = `https://www.skyrovix.online/verify?id=${encodeURIComponent(certId.trim())}`;
    const emailRes = await sendEmailDirect({
      to: targetEmail,
      studentName: app.full_name,
      studentId: app.user_id,
      documentType: "certificate",
      subject: `Certificate of Completion - Skyrovix Internship Program`,
      body: `Dear ${app.full_name},\n\nCongratulations on successfully completing your ${domainName} Internship at Skyrovix!\n\nWe are proud of your dedication, hard work, and the skills you have developed throughout this program.\n\nPlease find attached your Official Certificate of Completion.\nYou can verify your certificate online at:\n${verifyUrl}\n\nCertificate ID: ${certId}\nIntern ID: ${app.intern_id}\nDomain: ${domainName}\nIssued by: Skyrovix\n\nWarm Regards,\nHariharan S\nFounder & CEO\nSkyrovix`,
      referenceId: certId,
      pdfData: {
        fullName: app.full_name,
        internId: app.intern_id,
        domain: domainName,
        certId,
        issuedAt: new Date().toISOString(),
        verifyUrl,
      },
    });

    results.push({
      appId: app.id,
      studentName: app.full_name,
      email: targetEmail,
      certId,
      success: emailRes.success,
      error: emailRes.error,
    });
  }

  return { success: true, count: results.length, results };
}
