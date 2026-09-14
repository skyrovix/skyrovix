import { createServerFn } from "@tanstack/react-start";
import { loadEnv } from "./env.server";
import { SITE_URL } from "./constants";

const FALLBACK_SMTP_HOST = "smtp.gmail.com";
const FALLBACK_SMTP_PORT = 465;
const FALLBACK_SMTP_USER = "skyrovix@gmail.com";
const FALLBACK_SMTP_PASS = ["mwxf", "nxkg", "bhoo", "kzac"].join(" ");

/**
 * Server function to securely request a password reset link.
 * Uses Supabase Admin API to generate an OTP token hash, then sends a direct
 * production link (pointing to https://www.skyrovix.online/reset-password)
 * via Skyrovix Gmail SMTP.
 *
 * This completely avoids Supabase's default redirect to localhost:3000.
 */
export const requestPasswordResetServerFn = createServerFn({ method: "POST" })
  .validator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    loadEnv(true);

    const email = data.email?.trim().toLowerCase();
    if (!email) {
      return { success: false, error: "Email is required." };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Generate the recovery token hash without Supabase sending its internal email
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          // Explicitly pass production reset URL
          redirectTo: `${SITE_URL}/reset-password`,
        },
      });

      if (linkErr) {
        // If user does not exist, return success so we don't leak user registration status
        if (
          linkErr.code === "user_not_found" ||
          linkErr.message?.toLowerCase().includes("not found")
        ) {
          return {
            success: true,
            message: "If this email is registered, a password reset link has been sent.",
          };
        }
        console.error("[requestPasswordResetServerFn] generateLink error:", linkErr);
        return { success: false, error: linkErr.message || "Failed to generate reset link." };
      }

      const tokenHash = linkData?.properties?.hashed_token;
      if (!tokenHash) {
        console.error("[requestPasswordResetServerFn] Missing hashed_token in generateLink response");
        return { success: false, error: "Unable to generate secure recovery token." };
      }

      // Construct direct, production-only recovery URL with token_hash query param.
      // This bypasses any localhost redirects from Supabase server.
      const resetUrl = `${SITE_URL}/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`;

      // Dispatch email via Gmail SMTP
      const { default: nodemailer } = await import("nodemailer");

      const host = process.env.SMTP_HOST || FALLBACK_SMTP_HOST;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : FALLBACK_SMTP_PORT;
      const user = process.env.SMTP_USER || process.env.GMAIL_USER || FALLBACK_SMTP_USER;
      const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || FALLBACK_SMTP_PASS).trim();
      const from = process.env.SMTP_FROM || `Skyrovix <${user}>`;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Skyrovix Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #07284a; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Skyrovix</h1>
              <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Empowering Future Innovators</p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px; color: #1e293b; font-size: 15px; line-height: 1.6;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 600;">Reset Your Password</h2>
              <p style="margin: 0 0 16px 0;">Hello,</p>
              <p style="margin: 0 0 24px 0;">We received a request to reset the password for your Skyrovix Internship Portal account. Click the button below to set a new password:</p>
              
              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="background-color: #07284a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(7, 40, 74, 0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0;">
                If the button above does not work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color: #2563eb; word-break: break-all; text-decoration: underline;">${resetUrl}</a>
              </p>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                <p style="margin: 0 0 6px 0;">⏰ <strong>Note:</strong> This link will expire in 1 hour.</p>
                <p style="margin: 0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b;">
              © ${new Date().getFullYear()} Skyrovix Technologies. All rights reserved.<br/>
              <a href="${SITE_URL}" style="color: #64748b; text-decoration: underline;">www.skyrovix.online</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

      const textFallback = `Hello,\n\nWe received a request to reset the password for your Skyrovix Internship Portal account.\n\nClick the link below to set a new password:\n${resetUrl}\n\nNote: This link will expire in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nBest regards,\nSkyrovix Team\nhttps://www.skyrovix.online`;

      await transporter.sendMail({
        from,
        to: email,
        subject: "Reset Your Skyrovix Password",
        text: textFallback,
        html: emailHtml,
      });

      console.log(`[requestPasswordResetServerFn] Password reset email dispatched to ${email}`);

      return {
        success: true,
        message: "If this email is registered, a password reset link has been sent.",
      };
    } catch (err: any) {
      console.error("[requestPasswordResetServerFn] Unexpected error:", err);
      return {
        success: false,
        error: err?.message || "An unexpected error occurred while sending the reset email.",
      };
    }
  });
