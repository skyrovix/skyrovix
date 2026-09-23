import { createServerFn } from "@tanstack/react-start";
import type { VerificationResponse, VerificationResultData } from "./verify-service.server";

export type { VerificationResponse, VerificationResultData };

/**
 * Public Server Function to verify an Offer Letter ID, Intern ID, or Certificate ID.
 * Runs on the server and queries PostgreSQL directly without exposing private credentials
 * or being blocked by client-side Row Level Security (RLS).
 */
export const verifyCredentialServerFn = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<VerificationResponse> => {
    const { verifyCredentialServer } = await import("@/lib/verify-service.server");
    return verifyCredentialServer(data.id);
  });
