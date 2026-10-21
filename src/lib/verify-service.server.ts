import { dbQuery } from "./db.server";

export interface VerificationResultData {
  idType: "offer_letter" | "certificate" | "course" | "project";
  full_name: string;
  domain: string;
  status: string;
  intern_id?: string;
  cert_id?: string;
  issued_at?: string;
  duration?: number;
  course_name?: string;
  score?: number;
  project_title?: string;
  verification_hash?: string;
}

export type VerificationResponse =
  | { state: "found"; type: "offer_letter" | "certificate" | "course" | "project"; data: VerificationResultData }
  | { state: "notfound" }
  | { state: "error"; message: string };

/**
 * Normalizes input ID:
 * - Trims whitespace
 * - Strips any surrounding quotes
 */
export function normalizeVerificationId(rawId?: string | null): string {
  if (!rawId) return "";
  let id = rawId.trim();
  // Remove wrapping quotes if present
  if ((id.startsWith('"') && id.endsWith('"')) || (id.startsWith("'") && id.endsWith("'"))) {
    id = id.slice(1, -1).trim();
  }
  return id;
}

/**
 * Server-side verification function.
 * Connects directly to PostgreSQL via dbQuery pool (bypassing client RLS securely).
 * Strictly returns ONLY public verification fields, keeping sensitive student data secure.
 */
export async function verifyCredentialServer(rawId: string): Promise<VerificationResponse> {
  const normalized = normalizeVerificationId(rawId);
  if (!normalized) {
    return { state: "notfound" };
  }

  try {
    // 0. Try fast single-query RPC if available
    try {
      const rpcRes = await dbQuery("SELECT public.verify_credential($1) AS res", [normalized]);
      if (rpcRes?.rows?.[0]?.res?.state) {
        return rpcRes.rows[0].res as VerificationResponse;
      }
    } catch (rpcErr) {
      console.warn("[verifyCredentialServer] Stored procedure fallback:", rpcErr);
    }

    // -------------------------------------------------------------
    // 1. OFFER LETTER / INTERN ID LOOKUP (public.applications)
    // -------------------------------------------------------------
    const appRes = await dbQuery(
      `SELECT 
         id,
         intern_id,
         full_name,
         domain,
         status,
         duration,
         offer_issued_at,
         created_at,
         certificate_generated,
         certificate_generated_at
       FROM public.applications
       WHERE intern_id ILIKE $1
       LIMIT 1`,
      [normalized]
    );

    if (appRes.rows && appRes.rows.length > 0) {
      const app = appRes.rows[0];

      // Check if a certificate was also issued for this application
      let certId: string | undefined;
      let certIssuedAt: string | undefined;
      let verificationHash: string | undefined;

      try {
        const certRes = await dbQuery(
          `SELECT certificate_id, issued_at, verification_hash
           FROM public.certificates
           WHERE application_id = $1
           LIMIT 1`,
          [app.id]
        );
        if (certRes.rows && certRes.rows.length > 0) {
          certId = certRes.rows[0].certificate_id;
          certIssuedAt = certRes.rows[0].issued_at ? new Date(certRes.rows[0].issued_at).toISOString() : undefined;
          verificationHash = certRes.rows[0].verification_hash || undefined;
        }
      } catch (certLookupErr) {
        console.warn("[verifyCredentialServer] Certificate lookup non-fatal error:", certLookupErr);
      }

      const issueDate = app.offer_issued_at || app.created_at;

      return {
        state: "found",
        type: "offer_letter",
        data: {
          idType: "offer_letter",
          intern_id: app.intern_id,
          full_name: app.full_name,
          domain: app.domain,
          status: app.status || "approved",
          duration: app.duration ? Number(app.duration) : undefined,
          issued_at: issueDate ? new Date(issueDate).toISOString() : undefined,
          cert_id: certId,
          verification_hash: verificationHash,
        },
      };
    }

    // -------------------------------------------------------------
    // 2. CERTIFICATE ID LOOKUP (public.certificates)
    // -------------------------------------------------------------
    const certRes = await dbQuery(
      `SELECT 
         c.certificate_id,
         c.issued_at,
         c.verification_hash,
         a.intern_id,
         a.full_name,
         a.domain,
         a.status,
         a.duration
       FROM public.certificates c
       LEFT JOIN public.applications a ON a.id = c.application_id
       WHERE c.certificate_id ILIKE $1
       LIMIT 1`,
      [normalized]
    );

    if (certRes.rows && certRes.rows.length > 0) {
      const row = certRes.rows[0];
      return {
        state: "found",
        type: "certificate",
        data: {
          idType: "certificate",
          cert_id: row.certificate_id,
          intern_id: row.intern_id || undefined,
          full_name: row.full_name || "Intern",
          domain: row.domain || "",
          status: row.status || "completed",
          duration: row.duration ? Number(row.duration) : undefined,
          issued_at: row.issued_at ? new Date(row.issued_at).toISOString() : undefined,
          verification_hash: row.verification_hash || undefined,
        },
      };
    }

    // -------------------------------------------------------------
    // 3. COURSE CERTIFICATE LOOKUP (public.course_certificates)
    // -------------------------------------------------------------
    const courseRes = await dbQuery(
      `SELECT 
         cc.certificate_id,
         cc.score,
         cc.issued_at,
         c.name AS course_name,
         c.domain,
         p.full_name
       FROM public.course_certificates cc
       JOIN public.enrollments e ON e.id = cc.enrollment_id
       JOIN public.courses c ON c.id = e.course_id
       LEFT JOIN public.profiles p ON p.id = e.user_id
       WHERE cc.certificate_id ILIKE $1
       LIMIT 1`,
      [normalized]
    );

    if (courseRes.rows && courseRes.rows.length > 0) {
      const row = courseRes.rows[0];
      return {
        state: "found",
        type: "course",
        data: {
          idType: "course",
          cert_id: row.certificate_id,
          full_name: row.full_name || "Student",
          course_name: row.course_name,
          domain: row.domain,
          score: row.score !== null && row.score !== undefined ? Number(row.score) : undefined,
          issued_at: row.issued_at ? new Date(row.issued_at).toISOString() : undefined,
          status: "completed",
        },
      };
    }

    // -------------------------------------------------------------
    // 4. PROJECT CERTIFICATE LOOKUP (public.project_certificates)
    // -------------------------------------------------------------
    const projRes = await dbQuery(
      `SELECT 
         cert_id,
         participant_name,
         project_title,
         industry,
         final_score,
         issued_at
       FROM public.project_certificates
       WHERE cert_id ILIKE $1
       LIMIT 1`,
      [normalized]
    );

    if (projRes.rows && projRes.rows.length > 0) {
      const row = projRes.rows[0];
      return {
        state: "found",
        type: "project",
        data: {
          idType: "project",
          cert_id: row.cert_id,
          full_name: row.participant_name,
          project_title: row.project_title,
          domain: row.industry,
          score: row.final_score !== null && row.final_score !== undefined ? Number(row.final_score) : undefined,
          issued_at: row.issued_at ? new Date(row.issued_at).toISOString() : undefined,
          status: "approved",
        },
      };
    }

    // -------------------------------------------------------------
    // 5. PROJECT AWARD LOOKUP (public.project_awards)
    // -------------------------------------------------------------
    const awardRes = await dbQuery(
      `SELECT 
         award_id,
         participant_name,
         award_title,
         project_title,
         issued_at
       FROM public.project_awards
       WHERE award_id ILIKE $1
       LIMIT 1`,
      [normalized]
    );

    if (awardRes.rows && awardRes.rows.length > 0) {
      const row = awardRes.rows[0];
      return {
        state: "found",
        type: "project",
        data: {
          idType: "project",
          cert_id: row.award_id,
          full_name: row.participant_name,
          project_title: `${row.award_title} — ${row.project_title}`,
          domain: "Award",
          issued_at: row.issued_at ? new Date(row.issued_at).toISOString() : undefined,
          status: "awarded",
        },
      };
    }

    // No matching credential found
    return { state: "notfound" };
  } catch (err: any) {
    console.error("[verifyCredentialServer] Database lookup failed:", err.message);
    return {
      state: "error",
      message: "An unexpected error occurred while verifying the credential. Please try again.",
    };
  }
}
