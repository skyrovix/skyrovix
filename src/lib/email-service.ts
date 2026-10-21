import { createServerFn } from "@tanstack/react-start";
import type { SendEmailInput, EmailResult } from "./email-service.server";

export type { SendEmailInput, EmailResult };

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

/**
 * Retrieves current SMTP configuration without ever exposing the raw password.
 */
export const getSmtpConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { getSmtpConfigServer } = await import("./email-service.server");
  return getSmtpConfigServer();
});

/**
 * Saves SMTP configuration safely to server-side .env file and reloads environment.
 */
export const saveSmtpConfig = createServerFn({ method: "POST" })
  .validator((d: { host: string; port: number; user: string; pass?: string; from?: string }) => d)
  .handler(async ({ data }) => {
    const { saveSmtpConfigServer } = await import("./email-service.server");
    return saveSmtpConfigServer(data);
  });

/**
 * Tests the SMTP connection and sends a test email if requested.
 */
export const testSmtpConnection = createServerFn({ method: "POST" })
  .validator((d: { host?: string; port?: number; user?: string; pass?: string; testEmail?: string }) => d)
  .handler(async ({ data }) => {
    const { testSmtpConnectionServer } = await import("./email-service.server");
    return testSmtpConnectionServer(data);
  });

/**
 * TanStack Start Server Function wrapper for client-to-server RPC email dispatch.
 */
export const sendEmail = createServerFn({ method: "POST" })
  .validator((d: any) => d as SendEmailInput)
  .handler(async ({ data }): Promise<EmailResult> => {
    const { sendEmailDirect } = await import("./email-service.server");
    return sendEmailDirect(data);
  });

export const sendDirectEmailFn = sendEmail;

/**
 * Server function to backfill certificates and email delivery for existing completed students.
 */
export const backfillCompletedCertificates = createServerFn({ method: "POST" })
  .handler(async () => {
    const { backfillCompletedCertificatesServer } = await import("./email-service.server");
    return backfillCompletedCertificatesServer();
  });
