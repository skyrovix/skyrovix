import { sendEmail } from "./email-service";
import { COMPANY, durationConfig } from "./constants";

/**
 * Builds a responsive, modern HTML email template for Skyrovix Internship Offer Letters.
 */
export function getOfferLetterEmailHtml(params: {
  studentName: string;
  domainName: string;
  durLabel: string;
  internId: string;
  verifyUrl: string;
}): string {
  const { studentName, domainName, durLabel, internId } = params;
  const dashboardUrl = "https://www.skyrovix.online/dashboard";
  const whatsappUrl = "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyrovix Internship Offer Letter - ${studentName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
          
          <!-- Top Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #07284a 0%, #0d4373 55%, #1e40af 100%); padding: 38px 32px 32px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); color: #bfdbfe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                      Official Document · Offer Letter
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                      SKYROVIX
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px; font-weight: 400; letter-spacing: 0.3px;">
                      Empowering Future Professionals Through Industry-Ready Learning
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome / Congratulations Hero -->
          <tr>
            <td style="padding: 32px 32px 12px 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 6px 12px; margin-bottom: 16px;">
                <span style="color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">
                  ✓ SELECTION CONFIRMED
                </span>
              </div>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Congratulations, ${studentName}! 🎓
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                We are delighted to congratulate you on your successful selection for the <strong style="color: #07284a;">${domainName} Internship Program</strong> at <strong>Skyrovix</strong>.
              </p>
              <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your official <strong>Internship Offer Letter</strong> is attached to this email in PDF format. Please review the internship details, terms, and curriculum milestones below.
              </p>
            </td>
          </tr>

          <!-- Summary Particulars Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #07284a; padding: 12px 20px;">
                    <span style="color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      📋 Internship Particulars
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; width: 40%;">Intern ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #07284a; font-size: 14px; font-weight: 700; font-family: monospace;">
                    <span style="background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; border: 1px solid #bae6fd;">${internId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Domain / Track</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600;">${domainName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Program Duration</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600;">${durLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Work Mode</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600;">Virtual / Remote (100% Online)</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748b; font-size: 13px;">Offer Letter Document</td>
                  <td style="padding: 12px 20px; color: #059669; font-size: 13px; font-weight: 600;">📎 Attached (Official PDF Document)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Action Buttons -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${dashboardUrl}" target="_blank" style="display: block; width: 85%; max-width: 380px; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 24px; border-radius: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); text-align: center;">
                      🚀 Open Student Dashboard
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" target="_blank" style="display: block; width: 85%; max-width: 380px; background-color: #25d366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 10px; text-align: center; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);">
                      💬 Join Official WhatsApp Community
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Next Steps Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📌 What to do next:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.7;">
                  <li><strong>Download & Save PDF:</strong> Keep your attached official Offer Letter safe for your academic records.</li>
                  <li><strong>Access Tasks & Curriculum:</strong> Log in to your <a href="${dashboardUrl}" style="color: #0284c7; text-decoration: underline; font-weight: 600;">Student Dashboard</a> to view your tasks, digital ID card, and project milestones.</li>
                  <li><strong>Join Community:</strong> Connect with fellow interns and mentors on the <a href="${whatsappUrl}" style="color: #059669; text-decoration: underline; font-weight: 600;">Official WhatsApp Channel</a> for live announcements and project assistance.</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- Program Highlights Grid -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="33%" style="padding: 6px; text-align: center;">
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">💼</div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Real Projects</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Portfolio-ready tasks</div>
                    </div>
                  </td>
                  <td width="33%" style="padding: 6px; text-align: center;">
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">🤝</div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Mentorship</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Continuous guidance</div>
                    </div>
                  </td>
                  <td width="33%" style="padding: 6px; text-align: center;">
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">📜</div>
                      <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Verified Credential</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">QR-verified Certificate</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-Off Section -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #475569; font-size: 13px;">Warm Regards,</p>
                    <p style="margin: 0; color: #07284a; font-size: 16px; font-weight: 700;">Hariharan S</p>
                    <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500;">Founder & CEO · Skyrovix</p>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                      Empowering Future Professionals Through Industry-Ready Learning<br>
                      <a href="https://www.skyrovix.online" style="color: #0284c7; text-decoration: none;">www.skyrovix.online</a> · <a href="mailto:support@skyrovix.online" style="color: #0284c7; text-decoration: none;">support@skyrovix.online</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal & Disclaimer -->
          <tr>
            <td style="background-color: #07284a; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #93c5fd; font-size: 11px; font-weight: 600;">
                Registered under MSME, Government of India
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                This is an official automated notification regarding your internship enrollment with Skyrovix. If you need assistance, please contact <a href="mailto:support@skyrovix.online" style="color: #38bdf8; text-decoration: underline;">support@skyrovix.online</a>.<br>
                © ${new Date().getFullYear()} Skyrovix. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds a responsive, modern HTML email template for Skyrovix Completion Certificates.
 */
export function getCertificateEmailHtml(params: {
  studentName: string;
  domainName: string;
  certId: string;
  internId: string;
  verifyUrl: string;
}): string {
  const { studentName, domainName, certId, internId, verifyUrl } = params;
  const dashboardUrl = "https://www.skyrovix.online/dashboard";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - ${studentName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #07284a 0%, #0d4373 55%, #b45309 100%); padding: 38px 32px 32px 32px; text-align: center;">
              <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); color: #fef08a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                Verified Credential · Completion Certificate
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">
                SKYROVIX
              </h1>
              <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px;">
                Certificate of Internship Completion
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 12px 32px;">
              <div style="display: inline-block; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 6px 12px; margin-bottom: 16px;">
                <span style="color: #b45309; font-size: 12px; font-weight: 700;">
                  🏆 PROGRAM COMPLETED SUCCESSFULLY
                </span>
              </div>
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
                Congratulations, ${studentName}! 🌟
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                We are proud to award you this official <strong>Certificate of Completion</strong> for successfully finishing the <strong>${domainName} Internship Program</strong> at Skyrovix.
              </p>
              <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your dedication to high-quality code, problem-solving, and practical deliverables has been truly commendable. Your official Certificate is attached to this email as a verified PDF.
              </p>
            </td>
          </tr>

          <!-- Particulars -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #07284a; padding: 12px 20px;">
                    <span style="color: #ffffff; font-size: 13px; font-weight: 700; text-transform: uppercase;">
                      📜 Certificate Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; width: 40%;">Certificate ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #07284a; font-size: 14px; font-weight: 700; font-family: monospace;">
                    <span style="background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; border: 1px solid #fde68a;">${certId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Intern ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-family: monospace;">${internId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Domain</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 13px; font-weight: 600;">${domainName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748b; font-size: 13px;">Online Verification</td>
                  <td style="padding: 12px 20px; font-size: 13px;">
                    <a href="${verifyUrl}" target="_blank" style="color: #0284c7; text-decoration: underline; font-weight: 600;">Verify Certificate Online</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center;">
              <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #b45309 0%, #d97706 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(180, 83, 9, 0.35); text-align: center;">
                🔍 Verify Your Credential Online
              </a>
            </td>
          </tr>

          <!-- Sign-Off -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #475569; font-size: 13px;">Warm Regards,</p>
                    <p style="margin: 0; color: #07284a; font-size: 16px; font-weight: 700;">Hariharan S</p>
                    <p style="margin: 2px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500;">Founder & CEO · Skyrovix</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal -->
          <tr>
            <td style="background-color: #07284a; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #93c5fd; font-size: 11px; font-weight: 600;">
                Registered under MSME, Government of India
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Skyrovix. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOfferLetterEmail(params: {
  to: string;
  studentName: string;
  studentId: string;
  internId: string;
  domainName: string;
  duration: number;
}) {
  const dur = durationConfig(params.duration);
  const durLabel = dur?.label ?? `${params.duration} Month(s)`;

  const verifyUrl = `https://www.skyrovix.online/verify?id=${encodeURIComponent(params.internId.trim())}`;

  const body = `Dear ${params.studentName},

We are delighted to congratulate you on your successful selection for the ${params.domainName} Internship Program at Skyrovix.

After carefully reviewing your application, we are pleased to confirm that you have been selected to join our internship program. This achievement reflects your potential, enthusiasm, and commitment to learning.

Your Official Internship Offer Letter is attached to this email in PDF format. Kindly download the document and review the internship details, terms, and guidelines carefully before commencing your internship.

Internship Summary:
* Domain: ${params.domainName}
* Duration: ${durLabel}
* Mode: Remote / Virtual (100% Online)
* Intern ID: ${params.internId}
* Organization: Skyrovix
* Offer Letter: Attached (PDF)

Next Steps:
1. Download and read your attached Offer Letter PDF.
2. Access your student dashboard at https://www.skyrovix.online/dashboard to review your assigned tasks.
3. Join our Official WhatsApp Community: https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f

If you have any questions or require assistance at any stage, please contact our support team.
Email: support@skyrovix.online
Website: www.skyrovix.online

Warm Regards,
Hariharan S
Founder & CEO, Skyrovix
Empowering Future Professionals Through Industry-Ready Learning
www.skyrovix.online | support@skyrovix.online

---
Note: This is an automated email from Skyrovix. Please do not reply directly to this message.`;

  const html = getOfferLetterEmailHtml({
    studentName: params.studentName,
    domainName: params.domainName,
    durLabel,
    internId: params.internId,
    verifyUrl,
  });

  return sendEmail({
    data: {
      to: params.to,
      studentName: params.studentName,
      studentId: params.studentId,
      documentType: "offer_letter",
      subject: `Dear ${params.studentName}, your Skyrovix Internship Offer Letter`,
      body,
      html,
      referenceId: params.internId,
      pdfData: {
        fullName: params.studentName,
        internId: params.internId,
        domain: params.domainName,
        issuedAt: new Date().toISOString(),
        duration: params.duration,
        verifyUrl,
      },
    },
  });
}

export async function sendCertificateEmail(params: {
  to: string;
  studentName: string;
  studentId: string;
  certId: string;
  domainName: string;
  internId: string;
}) {
  const verifyUrl = `https://www.skyrovix.online/verify?id=${encodeURIComponent(params.certId.trim())}`;

  const body = `Dear ${params.studentName},

Congratulations on successfully completing your ${params.domainName} Internship at Skyrovix!

We are proud of your dedication, hard work, and the skills you have developed throughout this program. Your commitment to professional growth and excellence has been truly commendable.

Please find attached your Official Certificate of Completion. You can verify your certificate online at:
${verifyUrl}

Certificate ID: ${params.certId}
Intern ID: ${params.internId}
Domain: ${params.domainName}
Issued by: Skyrovix

As you move forward in your career, we hope the knowledge and experience gained during this internship serve as a strong foundation for your future endeavors.

Warm Regards,
Hariharan S
Founder & CEO, Skyrovix
www.skyrovix.online | support@skyrovix.online

---
Note: This is an automated email from Skyrovix. Please do not reply directly to this message.`;

  const html = getCertificateEmailHtml({
    studentName: params.studentName,
    domainName: params.domainName,
    certId: params.certId,
    internId: params.internId,
    verifyUrl,
  });

  return sendEmail({
    data: {
      to: params.to,
      studentName: params.studentName,
      studentId: params.studentId,
      documentType: "certificate",
      subject: `Certificate of Completion - ${COMPANY.name} Internship Program`,
      body,
      html,
      referenceId: params.certId,
      pdfData: {
        fullName: params.studentName,
        internId: params.internId,
        domain: params.domainName,
        issuedAt: new Date().toISOString(),
        certId: params.certId,
        verifyUrl,
      },
    },
  });
}
