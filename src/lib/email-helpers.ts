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
  const dashboardUrl = "https://www.skyrovix.in/dashboard";
  const whatsappUrl = "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyrovix Internship Offer Letter - ${studentName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #181619;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(24, 22, 25, 0.08), 0 8px 10px -6px rgba(24, 22, 25, 0.04); border: 1px solid #e5e7eb;">
          
          <!-- Top Header Banner in Skyrovix Signature Obsidian & Coral -->
          <tr>
            <td style="background: linear-gradient(135deg, #181619 0%, #29242b 55%, #f95c4b 100%); padding: 38px 32px 32px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); color: #ffd8c8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                      Official Document · Offer Letter
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                      SKYROVIX
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #ffd8c8; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                      Empowering Future Innovators
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
              <h2 style="margin: 0 0 12px 0; color: #181619; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Congratulations, ${studentName}! 🎓
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                We are delighted to congratulate you on your successful selection for the <strong style="color: #f95c4b;">${domainName} Internship Program</strong> at <strong>Skyrovix</strong>.
              </p>
              <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your official <strong>Internship Offer Letter</strong> is attached to this email in PDF format. Please review the internship details, terms, and curriculum milestones below.
              </p>
            </td>
          </tr>

          <!-- Summary Particulars Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #181619; padding: 12px 20px;">
                    <span style="color: #ffffff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      📋 Internship Particulars
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px; width: 40%;">Intern ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 14px; font-weight: 700; font-family: monospace;">
                    <span style="background-color: #fff1f0; color: #f95c4b; padding: 3px 8px; border-radius: 6px; border: 1px solid #ffd8c8;">${internId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Domain / Track</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 13px; font-weight: 600;">${domainName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Program Duration</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 13px; font-weight: 600;">${durLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Work Mode</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 13px; font-weight: 600;">Virtual / Remote (100% Online)</td>
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
                    <a href="${dashboardUrl}" target="_blank" style="display: block; width: 85%; max-width: 380px; background: linear-gradient(135deg, #f95c4b 0%, #ee9590 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 24px; border-radius: 10px; box-shadow: 0 4px 14px rgba(249, 92, 75, 0.35); text-align: center;">
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
              <div style="background-color: #faf8f2; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #181619; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  📌 What to do next:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.7;">
                  <li><strong>Download & Save PDF:</strong> Keep your attached official Offer Letter safe for your academic records.</li>
                  <li><strong>Access Tasks & Curriculum:</strong> Log in to your <a href="${dashboardUrl}" style="color: #f95c4b; text-decoration: underline; font-weight: 600;">Student Dashboard</a> to view your tasks, digital ID card, and project milestones.</li>
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
                    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">💼</div>
                      <div style="font-size: 12px; font-weight: 700; color: #181619;">Real Projects</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Portfolio-ready tasks</div>
                    </div>
                  </td>
                  <td width="33%" style="padding: 6px; text-align: center;">
                    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">🤝</div>
                      <div style="font-size: 12px; font-weight: 700; color: #181619;">Mentorship</div>
                      <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Continuous guidance</div>
                    </div>
                  </td>
                  <td width="33%" style="padding: 6px; text-align: center;">
                    <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 6px;">
                      <div style="font-size: 22px; margin-bottom: 4px;">📜</div>
                      <div style="font-size: 12px; font-weight: 700; color: #181619;">Verified Credential</div>
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
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #475569; font-size: 13px;">Warm Regards,</p>
                    <p style="margin: 0; color: #181619; font-size: 16px; font-weight: 700;">Hariharan S</p>
                    <p style="margin: 2px 0 0 0; color: #f95c4b; font-size: 12px; font-weight: 600;">Founder & CEO · Skyrovix</p>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                      Empowering Future Innovators<br>
                      <a href="https://www.skyrovix.in" style="color: #f95c4b; text-decoration: none;">www.skyrovix.in</a> · <a href="mailto:skyrovix@gmail.com" style="color: #f95c4b; text-decoration: none;">skyrovix@gmail.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal & Disclaimer -->
          <tr>
            <td style="background-color: #181619; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #ee9590; font-size: 11px; font-weight: 600;">
                Registered under MSME, Government of India (UDYAM-TN-17-0076606)
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                This is an official automated notification regarding your internship enrollment with Skyrovix. If you need assistance, please contact <a href="mailto:skyrovix@gmail.com" style="color: #ffd8c8; text-decoration: underline;">skyrovix@gmail.com</a>.<br>
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
  const dashboardUrl = "https://www.skyrovix.in/dashboard";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - ${studentName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #181619;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(24, 22, 25, 0.08), 0 8px 10px -6px rgba(24, 22, 25, 0.04); border: 1px solid #e5e7eb;">
          
          <!-- Top Header in Skyrovix Obsidian & Coral -->
          <tr>
            <td style="background: linear-gradient(135deg, #181619 0%, #29242b 55%, #f95c4b 100%); padding: 38px 32px 32px 32px; text-align: center;">
              <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); color: #ffd8c8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                Verified Credential · Completion Certificate
              </span>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                SKYROVIX
              </h1>
              <p style="margin: 6px 0 0 0; color: #ffd8c8; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                Certificate of Internship Completion
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 12px 32px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 6px 12px; margin-bottom: 16px;">
                <span style="color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">
                  🏆 PROGRAM COMPLETED SUCCESSFULLY
                </span>
              </div>
              <h2 style="margin: 0 0 12px 0; color: #181619; font-size: 22px; font-weight: 700;">
                Congratulations, ${studentName}! 🌟
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                We are proud to award you this official <strong>Certificate of Completion</strong> for successfully finishing the <strong style="color: #f95c4b;">${domainName} Internship Program</strong> at <strong>Skyrovix</strong>.
              </p>
              <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Your dedication to high-quality code, problem-solving, and practical deliverables has been truly commendable. Your official Certificate is attached to this email as a verified PDF.
              </p>
            </td>
          </tr>

          <!-- Particulars -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #181619; padding: 12px 20px;">
                    <span style="color: #ffffff; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      📜 Certificate Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px; width: 40%;">Certificate ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 14px; font-weight: 700; font-family: monospace;">
                    <span style="background-color: #fff1f0; color: #f95c4b; padding: 3px 8px; border-radius: 6px; border: 1px solid #ffd8c8;">${certId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Intern ID</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 13px; font-family: monospace; font-weight: 600;">${internId}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #64748b; font-size: 13px;">Domain</td>
                  <td style="padding: 12px 20px; border-bottom: 1px solid #e5e7eb; color: #181619; font-size: 13px; font-weight: 600;">${domainName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #64748b; font-size: 13px;">Online Verification</td>
                  <td style="padding: 12px 20px; font-size: 13px;">
                    <a href="${verifyUrl}" target="_blank" style="color: #f95c4b; text-decoration: underline; font-weight: 600;">Verify Certificate Online</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 0 32px 24px 32px; text-align: center;">
              <a href="${verifyUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f95c4b 0%, #ee9590 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(249, 92, 75, 0.35); text-align: center;">
                🔍 Verify Your Credential Online
              </a>
            </td>
          </tr>

          <!-- Sign-Off -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #475569; font-size: 13px;">Warm Regards,</p>
                    <p style="margin: 0; color: #181619; font-size: 16px; font-weight: 700;">Hariharan S</p>
                    <p style="margin: 2px 0 0 0; color: #f95c4b; font-size: 12px; font-weight: 600;">Founder & CEO · Skyrovix</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal -->
          <tr>
            <td style="background-color: #181619; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #ee9590; font-size: 11px; font-weight: 600;">
                Registered under MSME, Government of India
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} Skyrovix. All rights reserved. · <a href="https://www.skyrovix.in" style="color: #ffd8c8; text-decoration: none;">www.skyrovix.in</a>
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

  const verifyUrl = `https://www.skyrovix.in/verify?id=${encodeURIComponent(params.internId.trim())}`;

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
2. Access your student dashboard at https://www.skyrovix.in/dashboard to review your assigned tasks.
3. Join our Official WhatsApp Community: https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f

If you have any questions or require assistance at any stage, please contact our support team.
Email: support@skyrovix.in
Website: www.skyrovix.in

Warm Regards,
Hariharan S
Founder & CEO, Skyrovix
Empowering Future Professionals Through Industry-Ready Learning
www.skyrovix.in | support@skyrovix.in

---
Note: This is an automated email from Skyrovix. Please do not reply directly to this message.`;

  const html = getOfferLetterEmailHtml({
    studentName: params.studentName,
    domainName: params.domainName,
    durLabel,
    internId: params.internId,
    verifyUrl,
  });

  const payload = {
    to: params.to,
    studentName: params.studentName,
    studentId: params.studentId,
    documentType: "offer_letter" as const,
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
  };

  return sendEmail({ data: payload });
}

export async function sendCertificateEmail(params: {
  to: string;
  studentName: string;
  studentId: string;
  certId: string;
  domainName: string;
  internId: string;
}) {
  const verifyUrl = `https://www.skyrovix.in/verify?id=${encodeURIComponent(params.certId.trim())}`;

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
www.skyrovix.in | support@skyrovix.in

---
Note: This is an automated email from Skyrovix. Please do not reply directly to this message.`;

  const html = getCertificateEmailHtml({
    studentName: params.studentName,
    domainName: params.domainName,
    certId: params.certId,
    internId: params.internId,
    verifyUrl,
  });

  const payload = {
    to: params.to,
    studentName: params.studentName,
    studentId: params.studentId,
    documentType: "certificate" as const,
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
  };

  return sendEmail({ data: payload });
}

/**
 * Builds a responsive, modern HTML email template for Verification Queue Special Offers & Coupons.
 */
export function getOfferCouponEmailHtml(params: {
  studentName: string;
  domainName: string;
  internId: string;
  couponCode: string;
  discountType: "percentage" | "fixed" | "free";
  discountValue: number;
  expiresAt?: string | null;
  customMessage?: string;
  dashboardUrl?: string;
}): string {
  const { studentName, domainName, internId, couponCode, discountType, discountValue, expiresAt, customMessage } = params;
  const dashboardUrl = params.dashboardUrl || "https://www.skyrovix.in/dashboard";
  
  const discountLabel = discountType === "free" || (discountType === "percentage" && discountValue >= 100)
    ? "100% FREE WAIVER"
    : discountType === "percentage"
      ? `${discountValue}% FLAT DISCOUNT`
      : `₹${discountValue} FLAT DISCOUNT`;

  const expiryText = expiresAt
    ? `Valid until: ${new Date(expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
    : "Limited time verification queue offer";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skyrovix Verification Queue Special Offer - ${studentName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #181619;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(24, 22, 25, 0.08), 0 8px 10px -6px rgba(24, 22, 25, 0.04); border: 1px solid #e5e7eb;">
          
          <!-- Top Header Banner in Skyrovix Signature Obsidian & Purple Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #181619 0%, #2e1065 50%, #7c3aed 100%); padding: 36px 32px 30px 32px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.28); color: #e9d5ff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                      🎁 Verification Queue · Exclusive Offer
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                      SKYROVIX
                    </h1>
                    <p style="margin: 6px 0 0 0; color: #e9d5ff; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">
                      Empowering Future Innovators
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome / Congratulations Hero -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <div style="display: inline-block; background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px; padding: 6px 12px; margin-bottom: 16px;">
                <span style="color: #7c3aed; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;">
                  ⚡ FAST-TRACK YOUR CERTIFICATE
                </span>
              </div>
              <h2 style="margin: 0 0 12px 0; color: #181619; font-size: 22px; font-weight: 700; line-height: 1.3;">
                Special Offer for You, ${studentName}! 🎓
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 15px; line-height: 1.6;">
                Great news! Your project deliverables for the <strong style="color: #7c3aed;">${domainName} Internship</strong> (ID: <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${internId}</code>) have been verified and are currently in our <strong>Verification Queue</strong>.
              </p>
              <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                ${customMessage || `We appreciate your patience while waiting in the verification queue. To reward your hard work and help you finalize your credentials immediately, we're granting you an exclusive <strong>${discountLabel}</strong> discount on your Official Certificate of Completion!`}
              </p>
            </td>
          </tr>

          <!-- Highlight Coupon Voucher Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px dashed #a855f7; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 15px -2px rgba(168, 85, 247, 0.12);">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <span style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
                      ${discountLabel}
                    </span>
                    <p style="margin: 0 0 6px 0; color: #6b21a8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      Use Coupon Code At Checkout
                    </p>
                    <div style="display: inline-block; background-color: #ffffff; border: 2px solid #7c3aed; border-radius: 10px; padding: 12px 28px; margin: 8px 0; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 900; color: #581c87; letter-spacing: 3px;">
                        ${couponCode}
                      </span>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #6b21a8; font-size: 12px; font-weight: 600;">
                      ${expiryText}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call to Action Button -->
          <tr>
            <td style="padding: 0 32px 28px 32px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px;">
                      Claim 50% Offer on Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px;">
                Direct link: <a href="${dashboardUrl}" style="color: #7c3aed; text-decoration: underline;">${dashboardUrl}</a>
              </p>
            </td>
          </tr>

          <!-- How to Redeem Steps Card -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="background-color: #181619; padding: 12px 20px;">
                    <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                      📋 How to Claim Your Offer
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; font-size: 13px; line-height: 1.7; color: #334155;">
                    <div style="margin-bottom: 8px;">
                      <strong>Step 1:</strong> Click the button above or visit <a href="${dashboardUrl}" style="color: #7c3aed; font-weight: 600;">skyrovix.in/dashboard</a>.
                    </div>
                    <div style="margin-bottom: 8px;">
                      <strong>Step 2:</strong> Scroll down to the Certificate Issuance / Fee section.
                    </div>
                    <div style="margin-bottom: 8px;">
                      <strong>Step 3:</strong> Enter coupon code <strong style="font-family: monospace; color: #7c3aed; background: #ede9fe; padding: 2px 6px; border-radius: 4px;">${couponCode}</strong> (or it will be automatically applied for you!).
                    </div>
                    <div>
                      <strong>Step 4:</strong> Complete the discounted checkout to instantly have your certificate issued with permanent online QR verification.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support & Trust Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
                Hariharan S
              </p>
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px;">
                Founder & CEO, Skyrovix
              </p>
              <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 11px;">
                Registered under MSME, Govt. of India (UDYAM-TN-17-0076606)
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Need assistance? Reach us at <a href="mailto:support@skyrovix.in" style="color: #7c3aed; text-decoration: none;">support@skyrovix.in</a> or visit <a href="https://www.skyrovix.in" style="color: #7c3aed; text-decoration: none;">www.skyrovix.in</a>
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
 * Dispatches an exclusive Verification Queue Offer Email containing a coupon code.
 */
export async function sendOfferCouponEmail(params: {
  to: string;
  studentName: string;
  studentId: string;
  internId: string;
  domainName: string;
  couponCode: string;
  discountType: "percentage" | "fixed" | "free";
  discountValue: number;
  expiresAt?: string | null;
  customSubject?: string;
  customMessage?: string;
  dashboardUrl?: string;
}) {
  const discountLabel = params.discountType === "free" || (params.discountType === "percentage" && params.discountValue >= 100)
    ? "100% FREE"
    : params.discountType === "percentage"
      ? `${params.discountValue}% OFF`
      : `₹${params.discountValue} OFF`;

  const dashboardUrl = params.dashboardUrl || "https://www.skyrovix.in/dashboard";
  const subject = params.customSubject || `Special ${discountLabel} Offer on your Skyrovix Internship Certificate! 🎓`;

  const body = `Dear ${params.studentName},

Congratulations! You have successfully submitted all tasks for your ${params.domainName} Internship (${params.internId}) and your submission is currently in our Verification Queue.

To reward your hard work and help you finalize your credentials, we are offering you an exclusive ${discountLabel} discount on your Certificate of Completion!

YOUR EXCLUSIVE COUPON CODE: ${params.couponCode}
Discount: ${discountLabel}
${params.expiresAt ? `Valid Until: ${new Date(params.expiresAt).toLocaleDateString("en-IN")}` : "Limited Time Offer"}

How to Redeem:
1. Log in to your Student Dashboard: ${dashboardUrl}
2. Go to the Certificate section.
3. Enter coupon code: ${params.couponCode}
4. Complete checkout and unlock your verified certificate with QR verification.

Warm Regards,
Hariharan S
Founder & CEO, Skyrovix
www.skyrovix.in | support@skyrovix.in

---
Note: This is an automated notification from Skyrovix. Please do not reply directly to this message.`;

  const html = getOfferCouponEmailHtml({
    studentName: params.studentName,
    domainName: params.domainName,
    internId: params.internId,
    couponCode: params.couponCode,
    discountType: params.discountType,
    discountValue: params.discountValue,
    expiresAt: params.expiresAt,
    customMessage: params.customMessage,
    dashboardUrl,
  });

  const payload = {
    to: params.to,
    studentName: params.studentName,
    studentId: params.studentId,
    documentType: "offer_coupon" as const,
    subject,
    body,
    html,
    referenceId: params.internId,
  };

  return sendEmail({ data: payload });
}

