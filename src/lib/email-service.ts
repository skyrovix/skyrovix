import { createServerFn } from "@tanstack/react-start";
import { loadEnv } from "./env.server";

type SendEmailInput = {
  to: string;
  studentName: string;
  studentId: string;
  documentType: "offer_letter" | "certificate";
  subject: string;
  body: string;
  referenceId?: string;
  pdfData: {
    fullName: string;
    internId: string;
    domain: string;
    issuedAt: string;
    duration?: number;
    certId?: string;
    verifyUrl?: string;
  };
};

type EmailResult = {
  success: boolean;
  logId: string;
  error?: string;
};

/**
 * Normalizes Google App Password safely:
 * - trims whitespace
 * - keeps original characters intact
 */
function normalizeAppPassword(pass: string): string {
  if (!pass) return "";
  return pass.trim();
}

/**
 * Formats errors safely according to security guidelines without leaking credentials.
 */
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

  // Mask any 16-character patterns to prevent accidental leak
  return msg.replace(/[a-z0-9]{4}\s?[a-z0-9]{4}\s?[a-z0-9]{4}\s?[a-z0-9]{4}/gi, "••••••••••••••••");
}

/**
 * Retrieves current SMTP configuration without ever exposing the raw password.
 */
export const getSmtpConfig = createServerFn({ method: "GET" }).handler(async () => {
  loadEnv(true);
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const from = process.env.SMTP_FROM || `Skyrovix <${user || "noreply@skyrovix.online"}>`;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const hasPass = Boolean(pass && pass.trim().length > 0);

  return {
    host,
    port,
    user,
    from,
    hasPass,
    maskedPass: hasPass ? "••••••••••••" : "",
  };
});

/**
 * Saves SMTP configuration safely to server-side .env file and reloads environment.
 */
export const saveSmtpConfig = createServerFn({ method: "POST" })
  .validator((d: { host: string; port: number; user: string; pass?: string; from?: string }) => d)
  .handler(async ({ data }) => {
    loadEnv(true);
    const fs = await import("node:fs");
    const path = await import("node:path");
    const envPath = path.resolve(process.cwd(), ".env");

    let currentContent = "";
    if (fs.existsSync(envPath)) {
      currentContent = fs.readFileSync(envPath, "utf-8");
    }

    const host = data.host.trim() || "smtp.gmail.com";
    const port = String(data.port || 465);
    const user = data.user.trim();
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
  });

/**
 * Tests the SMTP connection and sends a test email if requested.
 */
export const testSmtpConnection = createServerFn({ method: "POST" })
  .validator((d: { host?: string; port?: number; user?: string; pass?: string; testEmail?: string }) => d)
  .handler(async ({ data }) => {
    loadEnv(true);
    const host = data.host?.trim() || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = data.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465);
    const user = data.user?.trim() || process.env.SMTP_USER || process.env.GMAIL_USER || "";
    let rawPass = data.pass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
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
  });

/**
 * Secure server-side email dispatch function with PDF attachment generation and logging.
 */
export const sendEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }): Promise<EmailResult> => {
    console.log("[Email] ===== sendEmail handler invoked =====");
    loadEnv(true);

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpPass = rawPass ? normalizeAppPassword(rawPass) : "";
    const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `Skyrovix <${smtpUser}>` : "noreply@skyrovix.online");

    let status: "sent" | "failed" = "failed";
    let errorMessage: string | undefined;
    let logId = "";

    if (!data) {
      errorMessage = "No data received in handler";
      return { success: false, logId: "", error: errorMessage };
    }

    const { to, studentName, studentId, documentType, subject, body, referenceId, pdfData } = data as SendEmailInput;

    if (!smtpHost || !smtpUser || !smtpPass) {
      errorMessage = "Email delivery is not configured. Please configure Gmail in Admin Settings.";
      console.error("[Email] " + errorMessage);
      logId = await logToDb(studentId, to, studentName, documentType, status, subject, referenceId, errorMessage);
      await updateApplicationEmailStatus(studentId, referenceId, status, errorMessage, documentType);
      return { success: false, logId, error: errorMessage };
    }

    const { default: nodemailer } = await import("nodemailer");
    const isSecure = smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      ...(isSecure ? {} : { requireTLS: true }),
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
    });

    console.log("[Email] Step 1: Verifying SMTP connection...");
    try {
      await transporter.verify();
      console.log("[Email] Step 1: SMTP Connected Successfully");
    } catch (verifyErr: any) {
      errorMessage = formatSafeEmailError(verifyErr);
      console.error("[Email] Step 1 FAILED:", errorMessage);
      logId = await logToDb(studentId, to, studentName, documentType, status, subject, referenceId, errorMessage);
      await updateApplicationEmailStatus(studentId, referenceId, status, errorMessage, documentType);
      return { success: false, logId, error: errorMessage };
    }

    console.log("[Email] Step 2: Loading assets for PDF...");
    const imageAssets: Record<string, string> = {};
    try {
      const { EMAIL_ASSETS } = await import("./email-assets");
      for (const [key, dataUri] of Object.entries(EMAIL_ASSETS)) {
        imageAssets[key] = dataUri;
      }
    } catch (assetErr: any) {
      console.warn("[Email] Build-time email assets not available:", assetErr?.message);
    }

    console.log("[Email] Step 3: Generating QR code...");
    let qrCodeDataUri: string | undefined;
    const verifyUrl = pdfData.verifyUrl;
    if (verifyUrl) {
      try {
        const QRCode = await import("qrcode");
        qrCodeDataUri = await QRCode.toDataURL(verifyUrl, {
          width: 140,
          margin: 1,
          color: { dark: "#07284a", light: "#ffffff" },
        });
      } catch (qrErr: any) {
        console.warn("[Email] QR generation failed, skipping:", qrErr?.message);
      }
    }

    console.log("[Email] Step 4: Generating PDF...");
    let pdfBuffer: Buffer | null = null;
    try {
      const ReactPdf = await import("@react-pdf/renderer");
      const React = await import("react");
      const PdfDocs = await import("@/components/pdf-docs");

      const docEl =
        documentType === "offer_letter"
          ? React.createElement(PdfDocs.OfferLetterDoc, {
              fullName: pdfData.fullName,
              internId: pdfData.internId,
              domain: pdfData.domain,
              issuedAt: pdfData.issuedAt,
              duration: pdfData.duration ?? 1,
              verifyUrl,
              qrCodeDataUri,
              imageAssets,
            })
          : React.createElement(PdfDocs.CertificateDoc, {
              fullName: pdfData.fullName,
              internId: pdfData.internId,
              domain: pdfData.domain,
              certId: pdfData.certId ?? referenceId ?? "",
              issuedAt: pdfData.issuedAt,
              verifyUrl: verifyUrl ?? "",
              qrCodeDataUri,
              imageAssets,
            });

      const blob = await ReactPdf.pdf(docEl as any).toBlob();
      const arrayBuffer = await blob.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      console.log("[Email] PDF generated:", pdfBuffer.length, "bytes");
    } catch (pdfErr: any) {
      errorMessage = `PDF generation failed: ${pdfErr?.message ?? pdfErr}`;
      console.error("[Email] Step 4 FAILED:", errorMessage);
      logId = await logToDb(studentId, to, studentName, documentType, status, subject, referenceId, errorMessage);
      await updateApplicationEmailStatus(studentId, referenceId, status, errorMessage, documentType);
      return { success: false, logId, error: errorMessage };
    }

    const filename =
      documentType === "offer_letter"
        ? `Offer_Letter_${studentId}.pdf`
        : `Certificate_${referenceId ?? studentId}.pdf`;

    console.log("[Email] Step 5: Sending email via sendMail to:", to);

    try {
      const info = await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        text: body,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      console.log("[Email] Step 5: sendMail succeeded with messageId:", info.messageId);
      status = "sent";
      errorMessage = undefined;
    } catch (sendErr: any) {
      status = "failed";
      errorMessage = formatSafeEmailError(sendErr);
      console.error("[Email] Step 5 FAILED:", errorMessage);
    }

    logId = await logToDb(studentId, to, studentName, documentType, status, subject, referenceId, errorMessage);
    await updateApplicationEmailStatus(studentId, referenceId, status, errorMessage, documentType);

    return { success: status === "sent", logId, error: errorMessage };
  });

async function updateApplicationEmailStatus(
  userId: string,
  referenceId: string | undefined,
  status: "sent" | "failed",
  errorMessage?: string,
  documentType?: "offer_letter" | "certificate"
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: Record<string, any> = {
      email_status: status,
      email_error: errorMessage || null,
    };
    if (status === "sent") {
      payload.email_sent_at = new Date().toISOString();
      if (documentType === "offer_letter") {
        payload.offer_issued_at = new Date().toISOString();
      } else {
        payload.certificate_generated = true;
        payload.certificate_generated_at = new Date().toISOString();
      }
    }

    if (referenceId) {
      if (referenceId.startsWith("SKX-CERT")) {
        const { data: certRow } = await supabaseAdmin.from("certificates").select("application_id").eq("certificate_id", referenceId).maybeSingle();
        if (certRow?.application_id) {
          await (supabaseAdmin.from("applications") as any).update(payload).eq("id", certRow.application_id);
          return;
        }
      }
      await (supabaseAdmin.from("applications") as any).update(payload).eq("intern_id", referenceId);
    } else if (userId) {
      await (supabaseAdmin.from("applications") as any).update(payload).eq("user_id", userId);
    }
  } catch (err: any) {
    console.warn("[Email] Failed to update application email status:", err?.message);
  }
}

async function logToDb(
  userId: string,
  emailTo: string,
  studentName: string,
  documentType: string,
  status: string,
  subject: string,
  referenceId: string | undefined,
  errorMessage: string | undefined,
): Promise<string> {
  console.log("[Email] Logging to email_logs table...");
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: logRow, error: logError } = await (supabaseAdmin
      .from("email_logs" as any) as any)
      .insert({
        user_id: userId,
        email_to: emailTo,
        student_name: studentName,
        document_type: documentType,
        status,
        subject,
        reference_id: referenceId,
        error_message: errorMessage,
        sent_at: status === "sent" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (logError) {
      console.error("[Email] DB insert error:", logError);
    } else {
      const id = (logRow as any)?.id ?? "";
      console.log("[Email] Logged with id:", id);
      return id;
    }
  } catch (dbErr: any) {
    console.error("[Email] Logging failed:", dbErr?.message);
  }
  return "";
}

/**
 * Server function to backfill certificates and email delivery for existing completed students.
 * Finds all applications where:
 * - all required tasks are approved, OR
 * - certification payment is verified,
 * and no certificate has been generated yet.
 */
export const backfillCompletedCertificates = createServerFn({ method: "POST" })
  .handler(async () => {
    loadEnv(true);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

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
      const requiredTasks = app.total_tasks || 5;
      const hasCert = certAppIds.has(app.id);
      const pay = payMap.get(app.id);

      // Student is completed if all required tasks are approved, OR payment is verified
      const isCompleted = approvedSubs.length >= requiredTasks || (pay && pay.status === "verified");
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

      // Generate certificate ID
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

      // Update application
      await (supabaseAdmin.from("applications") as any).update({
        status: "completed",
        submission_status: "approved",
        submitted_at: app.submitted_at || new Date().toISOString(),
        verified: true,
        verified_at: app.verified_at || new Date().toISOString(),
        certificate_generated: true,
        certificate_generated_at: new Date().toISOString(),
      }).eq("id", app.id);

      // Send Certificate Email with PDF attachment via Gmail SMTP
      const domainName = app.domain === "python" ? "Python Development" : (app.domain || "Internship Program");
      const verifyUrl = `https://www.skyrovix.online/verify-certificate`;
      const emailRes = await sendEmail({
        data: {
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
  });

