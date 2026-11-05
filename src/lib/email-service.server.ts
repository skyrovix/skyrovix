import { loadEnv } from "./env.server";
import { EMAIL_ASSETS } from "./email-assets";
import QRCode from "qrcode";

export type SendEmailInput = {
  to: string;
  studentName: string;
  studentId: string;
  documentType: "offer_letter" | "certificate" | "offer_coupon" | "promotional";
  subject: string;
  body: string;
  html?: string;
  referenceId?: string;
  pdfData?: {
    fullName: string;
    internId: string;
    domain: string;
    issuedAt: string;
    duration?: number;
    certId?: string;
    verifyUrl?: string;
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

  // 1. Generate PDF Attachment if applicable
  let pdfBuffer: Buffer | null = null;
  let attachmentFilename = `${documentType === "offer_letter" ? "Offer_Letter" : "Certificate"}_Skyrovix.pdf`;

  if (pdfData && (documentType === "offer_letter" || documentType === "certificate")) {
    try {
      if (documentType === "offer_letter") {
        try {
          const { renderOfferLetterBuffer } = await import("@/components/pdf-docs");
          pdfBuffer = await renderOfferLetterBuffer(pdfData as any);
        } catch (offerErr: any) {
          console.warn("[Email] renderOfferLetterBuffer fallback to jsPDF:", offerErr?.message);
          const { jsPDF } = await import("jspdf");
          pdfBuffer = await buildOfferLetterPdf(jsPDF, pdfData);
        }
        attachmentFilename = `Skyrovix_Offer_Letter_${(pdfData.fullName || "Student").replace(/\s+/g, "_")}.pdf`;
      } else {
        try {
          const { renderCertificateBuffer } = await import("@/components/pdf-docs");
          pdfBuffer = await renderCertificateBuffer(pdfData as any);
        } catch (certErr: any) {
          console.warn("[Email] renderCertificateBuffer fallback to jsPDF:", certErr?.message);
          const { jsPDF } = await import("jspdf");
          pdfBuffer = await buildCertificatePdf(jsPDF, pdfData);
        }
        attachmentFilename = `Skyrovix_Certificate_${(pdfData.fullName || "Student").replace(/\s+/g, "_")}.pdf`;
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

async function buildOfferLetterPdf(jsPDF: any, data: any): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SKYROVIX", 40, 44);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Virtual Internship & Skill Acceleration", 160, 44);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INTERNSHIP OFFER LETTER", 40, 115);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Date of Issue: ${new Date(data.issuedAt || Date.now()).toLocaleDateString("en-IN")}`, 40, 140);
  doc.text(`Internship ID: ${data.internId || "SKX-INT"}`, 40, 155);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dear ${data.fullName || "Candidate"},`, 40, 190);

  const text = `We are pleased to extend this official offer for the position of Virtual Intern in ${data.domain || "Software Engineering"} at Skyrovix. During your ${data.duration || 3}-month tenure, you will work on production tasks, build real-world modules, and collaborate closely with our technical mentors.\n\nUpon successful completion and approval of all scheduled milestones, you will receive your verified Skyrovix Certificate of Completion along with comprehensive performance credentials.\n\nWe look forward to your contributions and wish you a highly enriching learning experience.`;
  const splitText = doc.splitTextToSize(text, 515);
  doc.text(splitText, 40, 215);

  doc.setFont("helvetica", "bold");
  doc.text("Hariharan S", 40, 420);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Founder & CEO, Skyrovix", 40, 435);
  doc.text("Registered under MSME, Govt. of India (UDYAM-TN-17-0076606)", 40, 448);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

async function buildCertificatePdf(jsPDF: any, data: any): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = 841.89;
  const pageHeight = 595.28;

  const date = new Date(data.issuedAt || Date.now());
  const formattedDate = !isNaN(date.getTime())
    ? date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  // 1. Imperial Ivory & Gold Parchment Canvas
  doc.setFillColor(250, 248, 242); // #FAF8F2 Imperial Ivory
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Double Ornamental Gold Borders & Corner Accents
  doc.setDrawColor(180, 83, 9); // #B45309 deep gold
  doc.setLineWidth(3);
  doc.rect(18, 18, pageWidth - 36, pageHeight - 36);

  doc.setDrawColor(217, 119, 6); // #D97706 primary gold
  doc.setLineWidth(1);
  doc.rect(24, 24, pageWidth - 48, pageHeight - 48);

  // Four-corner regal filigree brackets
  const corners = [
    [24, 24],
    [pageWidth - 24, 24],
    [24, pageHeight - 24],
    [pageWidth - 24, pageHeight - 24],
  ];
  doc.setLineWidth(2);
  corners.forEach(([cx, cy]) => {
    const dx = cx < 100 ? 1 : -1;
    const dy = cy < 100 ? 1 : -1;
    doc.line(cx, cy, cx + dx * 24, cy);
    doc.line(cx, cy, cx, cy + dy * 24);
  });

  // 3. Official Corporate & Government Recognition Logos
  try {
    if (EMAIL_ASSETS?.logo) {
      doc.addImage(EMAIL_ASSETS.logo, "PNG", 40, 36, 44, 44);
    }
    if (EMAIL_ASSETS?.vinix) {
      doc.addImage(EMAIL_ASSETS.vinix, "PNG", 92, 42, 60, 28);
    }
    if (EMAIL_ASSETS?.yrTech) {
      doc.addImage(EMAIL_ASSETS.yrTech, "PNG", pageWidth - 165, 42, 46, 28);
    }
    if (EMAIL_ASSETS?.msme) {
      doc.addImage(EMAIL_ASSETS.msme, "PNG", pageWidth - 105, 36, 65, 34);
    }
  } catch (err: any) {
    console.warn("[Email] Logo render note:", err?.message);
  }

  // 4. Header Titles (Perfect Center Alignment)
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SKYROVIX", pageWidth / 2, 54, { align: "center" });

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Skill Development & Future Tech Innovations • MSME Certified",
    pageWidth / 2,
    68,
    { align: "center" }
  );
  doc.setTextColor(180, 83, 9);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)",
    pageWidth / 2,
    79,
    { align: "center" }
  );

  // Ornamental separator bar
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(160, 88, pageWidth - 160, 88);

  // 5. Main Certificate Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(21);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE OF EXCELLENCE", pageWidth / 2, 118, { align: "center" });

  doc.setTextColor(180, 83, 9);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("VIRTUAL INTERNSHIP & SKILL DEVELOPMENT", pageWidth / 2, 134, { align: "center" });

  // Accent line under title
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.2);
  doc.line(pageWidth / 2 - 40, 140, pageWidth / 2 + 40, 140);

  // 6. Presentation Citation
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.text("This certificate is proudly awarded to", pageWidth / 2, 168, { align: "center" });

  // Recipient Full Name (Auto-scaled to prevent overflowing)
  const recipientName = (data.fullName || "Intern").toUpperCase();
  let nameFontSize = 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(nameFontSize);
  while (doc.getTextWidth(recipientName) > 540 && nameFontSize > 18) {
    nameFontSize -= 1;
    doc.setFontSize(nameFontSize);
  }
  doc.setTextColor(15, 23, 42);
  doc.text(recipientName, pageWidth / 2, 206, { align: "center" });

  // Decorative name underline
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1.5);
  const nameWidth = doc.getTextWidth(recipientName);
  const underLineWidth = Math.max(160, Math.min(nameWidth + 36, 480));
  doc.line(pageWidth / 2 - underLineWidth / 2, 215, pageWidth / 2 + underLineWidth / 2, 215);

  // Citation text
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const domainTitle = data.domain || "Technology & Software Engineering";
  const certText = `In recognition of outstanding performance and successful completion of the industry-oriented virtual internship program in ${domainTitle}, demonstrating technical proficiency, professional dedication, and successful completion of the assigned capstone project.`;
  const splitText = doc.splitTextToSize(certText, 600);
  doc.text(splitText, pageWidth / 2, 238, { align: "center" });

  // 7. Metadata Pill Box: Proportional 620pt box with 4 dynamically centered, non-overlapping columns
  const pillWidth = 620;
  const pillHeight = 32;
  const pillX = pageWidth / 2 - pillWidth / 2;
  const pillY = 296;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 16, 16, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 16, 16, "S");

  const colWidth = pillWidth / 4;
  const textY = pillY + 20;

  const pillItems = [
    { label: "CERT ID:", val: data.certId || "SKX-CERT", valColor: [15, 23, 42], labelColor: [180, 83, 9] },
    { label: "INTERN ID:", val: data.internId || "SKX-INT", valColor: [15, 23, 42], labelColor: [180, 83, 9] },
    { label: "GRADE:", val: data.grade || "A+ (OUTSTANDING)", valColor: [5, 150, 105], labelColor: [180, 83, 9] },
    { label: "ISSUED:", val: formattedDate, valColor: [15, 23, 42], labelColor: [100, 116, 139] },
  ];

  doc.setFontSize(8);
  pillItems.forEach((item, idx) => {
    const colLeft = pillX + idx * colWidth;
    const colCenter = colLeft + colWidth / 2;

    doc.setFont("helvetica", "bold");
    const labelW = doc.getTextWidth(item.label + " ");
    const valW = doc.getTextWidth(item.val);
    const totalW = labelW + valW;
    const startX = colCenter - totalW / 2;

    // Draw Label
    doc.setTextColor(item.labelColor[0], item.labelColor[1], item.labelColor[2]);
    doc.text(item.label, startX, textY);

    // Draw Value
    doc.setTextColor(item.valColor[0], item.valColor[1], item.valColor[2]);
    doc.text(item.val, startX + labelW, textY);

    // Divider line between columns
    if (idx < 3) {
      const divX = colLeft + colWidth;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.8);
      doc.line(divX, pillY + 7, divX, pillY + pillHeight - 7);
    }
  });

  // 8. Signatures, Official Embossed Seal & QR Code: Perfectly Symmetrical 4 Columns
  // Centers: 145, 329, 513, 697 (equal 184pt spacing across page, symmetric around center 421)
  const col1Center = 145;
  const col2Center = 329;
  const col3Center = 513;
  const col4Center = pageWidth - 145;

  const sigBaseY = 444;

  try {
    // Col 1 (Left): Founder Signature
    if (EMAIL_ASSETS?.sigFounder) {
      doc.addImage(EMAIL_ASSETS.sigFounder, "PNG", col1Center - 50, sigBaseY - 50, 100, 44);
    }
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.8);
    doc.line(col1Center - 60, sigBaseY, col1Center + 60, sigBaseY);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("Hariharan S", col1Center, sigBaseY + 14, { align: "center" });
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.text("Founder & CEO, Skyrovix", col1Center, sigBaseY + 26, { align: "center" });

    // Col 2 (Center-Left): Official Seal
    if (EMAIL_ASSETS?.seal) {
      doc.addImage(EMAIL_ASSETS.seal, "PNG", col2Center - 30, sigBaseY - 60, 60, 60);
    }
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Official Verified Seal", col2Center, sigBaseY + 14, { align: "center" });
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    doc.text("SKYROVIX • MSME", col2Center, sigBaseY + 26, { align: "center" });

    // Col 3 (Center-Right): QR Code
    const verifyLink = data.verifyUrl || `https://skyrovix.in/verify-certificate`;
    try {
      const qrDataUri = await QRCode.toDataURL(verifyLink, {
        width: 200,
        margin: 1,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
      doc.addImage(qrDataUri, "PNG", col3Center - 25, sigBaseY - 55, 50, 50);
    } catch (qrErr: any) {
      console.warn("[Email] QR render note:", qrErr?.message);
    }
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Digitally Verified Certificate", col3Center, sigBaseY + 14, { align: "center" });
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    doc.text("Scan to verify online", col3Center, sigBaseY + 26, { align: "center" });

    // Col 4 (Right): Co-Founder Signature
    if (EMAIL_ASSETS?.sigCofounder) {
      doc.addImage(EMAIL_ASSETS.sigCofounder, "PNG", col4Center - 50, sigBaseY - 50, 100, 44);
    }
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.8);
    doc.line(col4Center - 60, sigBaseY, col4Center + 60, sigBaseY);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("Maheshwaran S", col4Center, sigBaseY + 14, { align: "center" });
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(7.2);
    doc.setFont("helvetica", "bold");
    doc.text("Co-Founder, Skyrovix", col4Center, sigBaseY + 26, { align: "center" });
  } catch (sigErr: any) {
    console.warn("[Email] Signature render note:", sigErr?.message);
  }

  // 9. Bottom Security Strip
  doc.setFillColor(241, 245, 249);
  doc.rect(24, pageHeight - 48, pageWidth - 48, 24, "F");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.2);
  doc.setFont("helvetica", "normal");
  doc.text(
    "A digitally verifiable credential issued by SKYROVIX IT Solutions (Udyam Registered – Ministry of MSME, Government of India). Official verification portal: https://skyrovix.in/verify-certificate",
    pageWidth / 2,
    pageHeight - 33,
    { align: "center" }
  );

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
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
