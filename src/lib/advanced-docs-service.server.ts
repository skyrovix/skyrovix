import crypto from "crypto";
import { dbQuery } from "./db.server";
import type { AdvancedDocType, AdvancedDocMetadata, AdvancedDocData } from "@/components/advanced-pdf-docs";

export const ADVANCED_DOC_DOMAINS = ["fullstack", "mernstack", "meanstack"] as const;

export function normalizeDomain(domain?: string | null): string {
  if (!domain) return "";
  const d = domain.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (d === "fullstack" || d === "fullstackdevelopment") return "fullstack";
  if (d === "mern" || d === "mernstack" || d === "mernstackdevelopment") return "mernstack";
  if (d === "mean" || d === "meanstack" || d === "meanstackdevelopment") return "meanstack";
  return domain.trim().toLowerCase();
}

export function isAdvancedDocDomain(domain?: string | null): boolean {
  const norm = normalizeDomain(domain);
  return norm === "fullstack" || norm === "mernstack" || norm === "meanstack";
}

export function getFullDomainName(slugOrName?: string | null): string {
  const norm = normalizeDomain(slugOrName);
  if (norm === "fullstack") return "Full Stack Development";
  if (norm === "mernstack") return "MERN Stack Development";
  if (norm === "meanstack") return "MEAN Stack Development";
  return slugOrName || "Full Stack Development";
}

export function generateAdvancedDocId(type: AdvancedDocType): string {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  const typeMap: Record<AdvancedDocType, string> = {
    lor: "LOR",
    experience_letter: "EXP",
    project_certificate: "PRJ",
    evaluation_report: "PERF",
    appreciation_certificate: "APR",
    skill_certificate: "SKL",
  };
  const prefix = typeMap[type] || "DOC";
  return `SKX-${prefix}-${year}-${n}`;
}

export interface DocumentItemStatus {
  documentType: AdvancedDocType;
  title: string;
  description: string;
  status: "not_eligible" | "locked" | "eligible" | "pending_approval" | "approved" | "rejected";
  statusReason: string;
  isAvailableForDownload: boolean;
  documentRecord?: {
    id: string;
    document_id: string;
    issue_date: string;
    verification_hash: string;
    metadata?: any;
    status: string;
  } | null;
  requestRecord?: {
    id: string;
    status: string;
    student_note?: string;
    admin_note?: string;
    created_at: string;
    reviewed_at?: string;
  } | null;
}

export interface StudentAdvancedDocsSummary {
  applicationId: string;
  fullName: string;
  internId: string;
  domain: string;
  domainName: string;
  isDomainSupported: boolean;
  planType: "standard" | "premium";
  durationMonths: number;
  totalTasks: number;
  approvedTasks: number;
  isCompleted: boolean;
  isHighPerformer: boolean;
  evaluation?: {
    codeQuality: number;
    technicalSkills: number;
    problemSolving: number;
    teamwork: number;
    projectPerformance: number;
    finalRating: string;
    mentorRemarks?: string;
    evaluatedAt?: string;
  } | null;
  documents: DocumentItemStatus[];
}

export const ADVANCED_DOCUMENT_DEFINITIONS: {
  type: AdvancedDocType;
  title: string;
  description: string;
}[] = [
  {
    type: "lor",
    title: "Letter of Recommendation (LOR)",
    description: "Official executive endorsement signed by leadership detailing candidate proficiency, system architecture acumen, and professional diligence. (Exclusively for Premium scholars upon completion)",
  },
  {
    type: "experience_letter",
    title: "Experience & Relieving Letter",
    description: "Corporate service certificate verifying internship role, dates of tenure, engineering responsibilities, and successful completion.",
  },
  {
    type: "project_certificate",
    title: "Project Completion Certificate",
    description: "Prestigious engineering credential recognizing the successful design, testing, and production deployment of the capstone project.",
  },
  {
    type: "evaluation_report",
    title: "Performance Evaluation Report",
    description: "Comprehensive quantitative audit covering code quality, technical architecture, problem-solving, and mentor feedback with a 100% completion audit.",
  },
  {
    type: "appreciation_certificate",
    title: "Certificate of Appreciation",
    description: "Distinguished honor recognizing outstanding engineering performance, technical initiative, and exemplary dedication throughout the internship.",
  },
  {
    type: "skill_certificate",
    title: "Skill Achievement Certificate",
    description: "Skill mastery validation recognizing specialized full-stack system design, API engineering, and verified assessment scores.",
  },
];

/**
 * Retrieves the comprehensive Advanced Documents status for a student.
 */
export async function getStudentAdvancedDocsDataServer(
  applicationId: string,
  userId?: string
): Promise<StudentAdvancedDocsSummary | { isDomainSupported: false; reason: string }> {
  // 1. Fetch application
  const appQuery = await dbQuery(
    `SELECT 
       id, user_id, full_name, email, domain, intern_id, status, duration,
       plan_type, total_tasks, all_tasks_verified
     FROM applications
     WHERE id = $1
     LIMIT 1`,
    [applicationId]
  );

  if (!appQuery.rows || appQuery.rows.length === 0) {
    throw new Error("Application not found.");
  }

  const app = appQuery.rows[0];
  const domainNorm = normalizeDomain(app.domain);

  if (!isAdvancedDocDomain(domainNorm)) {
    return {
      isDomainSupported: false,
      reason: "Advanced Internship Documents are exclusively available for Full Stack, MERN Stack, and MEAN Stack Development domains.",
    };
  }

  const domainName = getFullDomainName(domainNorm);
  const planType: "standard" | "premium" = app.plan_type?.trim().toLowerCase() === "premium" ? "premium" : "standard";
  const durationMonths = Number(app.duration) || 1;

  // 2. Fetch approved tasks count
  const subQuery = await dbQuery(
    `SELECT COUNT(*) as approved_count 
     FROM submissions 
     WHERE application_id = $1 AND status = 'approved'`,
    [applicationId]
  );
  const approvedTasks = Number(subQuery.rows?.[0]?.approved_count) || 0;
  const totalTasks = Number(app.total_tasks) || (planType === "premium" && domainNorm === "fullstack" ? (durationMonths === 6 ? 50 : (durationMonths === 3 ? 25 : 5)) : 5);

  const isCompleted =
    app.status === "completed" ||
    app.all_tasks_verified === 1 ||
    (approvedTasks >= totalTasks && totalTasks > 0);

  // 3. Fetch evaluation
  const evalQuery = await dbQuery(
    `SELECT * FROM student_performance_evaluations WHERE application_id = $1 LIMIT 1`,
    [applicationId]
  );
  const evalRow = evalQuery.rows?.[0] || null;
  const isHighPerformer = evalRow ? Boolean(evalRow.is_high_performer) : false;

  // 4. Fetch existing generated documents
  const docsQuery = await dbQuery(
    `SELECT id, document_id, document_type, title, status, issue_date, verification_hash, metadata
     FROM internship_documents
     WHERE application_id = $1`,
    [applicationId]
  );
  const docsMap = new Map<string, any>();
  for (const doc of docsQuery.rows || []) {
    let meta = doc.metadata;
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = null;
      }
    }
    docsMap.set(doc.document_type, {
      ...doc,
      metadata: meta,
    });
  }

  // 5. Fetch student requests
  const reqQuery = await dbQuery(
    `SELECT id, document_type, status, student_note, admin_note, created_at, reviewed_at
     FROM internship_document_requests
     WHERE application_id = $1`,
    [applicationId]
  );
  const reqMap = new Map<string, any>();
  for (const req of reqQuery.rows || []) {
    reqMap.set(req.document_type, req);
  }

  // 6. Build status for each of the 6 documents
  const documentItems: DocumentItemStatus[] = ADVANCED_DOCUMENT_DEFINITIONS.map((def) => {
    const existingDoc = docsMap.get(def.type) || null;
    const existingReq = reqMap.get(def.type) || null;

    let status: DocumentItemStatus["status"] = "locked";
    let statusReason = "";

    if (existingDoc && existingDoc.status === "issued") {
      status = "approved";
      statusReason = "Issued and available for official download.";
    } else if (existingReq && existingReq.status === "pending") {
      status = "pending_approval";
      statusReason = "Request is currently pending mentor/admin review.";
    } else if (existingReq && existingReq.status === "rejected") {
      status = "rejected";
      statusReason = existingReq.admin_note || "Request was declined by administration.";
    } else {
      // Evaluate based on rules
      if (def.type === "lor") {
        if (planType !== "premium") {
          status = "not_eligible";
          statusReason = "Letter of Recommendation is exclusively available for Premium Internship scholars.";
        } else if (!isCompleted) {
          status = "locked";
          statusReason = "Complete and verify all internship tasks to unlock your Letter of Recommendation.";
        } else {
          status = "eligible";
          statusReason = "Unlocked! You can submit a generation request for admin verification.";
        }
      } else {
        // High performer documents (both Standard and Premium)
        if (!isCompleted) {
          status = "locked";
          statusReason = "Complete and verify all internship tasks to qualify for performance evaluation.";
        } else if (!isHighPerformer) {
          status = "not_eligible";
          statusReason = "Available to high-performing scholars following mentor performance evaluation.";
        } else {
          status = "eligible";
          statusReason = "Unlocked! Verified as a High Performer. You may request this document.";
        }
      }
    }

    return {
      documentType: def.type,
      title: def.title,
      description: def.description,
      status,
      statusReason,
      isAvailableForDownload: status === "approved" && Boolean(existingDoc),
      documentRecord: existingDoc
        ? {
            id: existingDoc.id,
            document_id: existingDoc.document_id,
            issue_date: existingDoc.issue_date,
            verification_hash: existingDoc.verification_hash,
            metadata: existingDoc.metadata,
            status: existingDoc.status,
          }
        : null,
      requestRecord: existingReq
        ? {
            id: existingReq.id,
            status: existingReq.status,
            student_note: existingReq.student_note,
            admin_note: existingReq.admin_note,
            created_at: existingReq.created_at,
            reviewed_at: existingReq.reviewed_at,
          }
        : null,
    };
  });

  return {
    applicationId,
    fullName: app.full_name,
    internId: app.intern_id,
    domain: domainNorm,
    domainName,
    isDomainSupported: true,
    planType,
    durationMonths,
    totalTasks,
    approvedTasks,
    isCompleted,
    isHighPerformer,
    evaluation: evalRow
      ? {
          codeQuality: Number(evalRow.code_quality),
          technicalSkills: Number(evalRow.technical_skills),
          problemSolving: Number(evalRow.problem_solving),
          teamwork: Number(evalRow.teamwork),
          projectPerformance: Number(evalRow.project_performance),
          finalRating: evalRow.final_rating,
          mentorRemarks: evalRow.mentor_remarks,
          evaluatedAt: evalRow.evaluated_at,
        }
      : null,
    documents: documentItems,
  };
}

/**
 * Student requests a document.
 */
export async function studentRequestDocumentServer(
  applicationId: string,
  userId: string,
  documentType: AdvancedDocType,
  studentNote?: string
): Promise<{ success: boolean; message: string }> {
  const summary = await getStudentAdvancedDocsDataServer(applicationId, userId);
  if (!summary.isDomainSupported) {
    throw new Error("Domain not eligible for advanced documents.");
  }

  const docItem = summary.documents.find((d) => d.documentType === documentType);
  if (!docItem) {
    throw new Error("Invalid document type.");
  }

  if (docItem.status !== "eligible" && docItem.status !== "rejected") {
    throw new Error(`Cannot request document at this time (${docItem.statusReason}).`);
  }

  const requestId = crypto.randomUUID();
  await dbQuery(
    `INSERT INTO internship_document_requests 
       (id, application_id, user_id, document_type, status, student_note, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'pending', $5, NOW(), NOW())
     ON DUPLICATE KEY UPDATE 
       status = 'pending',
       student_note = VALUES(student_note),
       updated_at = NOW()`,
    [requestId, applicationId, userId, documentType, studentNote || null]
  );

  // Audit log
  await dbQuery(
    `INSERT INTO document_approval_history
       (id, application_id, document_type, action, actor_email, remarks, created_at)
     VALUES ($1, $2, $3, 'requested', $4, $5, NOW())`,
    [crypto.randomUUID(), applicationId, documentType, "student", studentNote || "Student submitted request"]
  );

  return { success: true, message: "Document request submitted successfully for mentor review." };
}

/**
 * Admin view: Fetch all students in the 3 applicable domains.
 */
export async function getAdminAdvancedDocsDataServer(filters?: {
  domain?: string;
  plan?: string;
  search?: string;
}) {
  let query = `
    SELECT 
      a.id,
      a.user_id,
      a.full_name,
      a.email,
      a.domain,
      a.intern_id,
      a.duration,
      a.status,
      a.plan_type,
      a.total_tasks,
      a.all_tasks_verified,
      a.created_at,
      p.email as profile_email,
      p.college,
      COUNT(DISTINCT s.id) as approved_tasks
    FROM applications a
    LEFT JOIN profiles p ON p.id = a.user_id
    LEFT JOIN submissions s ON s.application_id = a.id AND s.status = 'approved'
    WHERE LOWER(REPLACE(REPLACE(a.domain, ' ', ''), '_', '')) IN ('fullstack', 'fullstackdevelopment', 'mern', 'mernstack', 'mean', 'meanstack')
  `;

  const params: any[] = [];
  let paramIdx = 1;

  if (filters?.domain && filters.domain !== "all") {
    const norm = normalizeDomain(filters.domain);
    query += ` AND LOWER(REPLACE(REPLACE(a.domain, ' ', ''), '_', '')) = $${paramIdx++}`;
    params.push(norm);
  }

  if (filters?.plan && filters.plan !== "all") {
    query += ` AND a.plan_type = $${paramIdx++}`;
    params.push(filters.plan);
  }

  if (filters?.search && filters.search.trim()) {
    const s = `%${filters.search.trim()}%`;
    query += ` AND (a.full_name LIKE $${paramIdx} OR a.intern_id LIKE $${paramIdx} OR a.email LIKE $${paramIdx})`;
    params.push(s);
    paramIdx++;
  }

  query += ` GROUP BY a.id ORDER BY a.created_at DESC`;

  const res = await dbQuery(query, params);
  const rows = res.rows || [];

  if (rows.length === 0) {
    return [];
  }

  const appIds = rows.map((r: any) => r.id);

  // Fetch evaluations
  const evalsQuery = await dbQuery(
    `SELECT * FROM student_performance_evaluations WHERE application_id IN (${appIds.map(() => "?").join(",")})`,
    appIds
  );
  const evalsMap = new Map<string, any>();
  for (const ev of evalsQuery.rows || []) {
    evalsMap.set(ev.application_id, ev);
  }

  // Fetch existing documents
  const docsQuery = await dbQuery(
    `SELECT * FROM internship_documents WHERE application_id IN (${appIds.map(() => "?").join(",")})`,
    appIds
  );
  const docsByApp = new Map<string, any[]>();
  for (const doc of docsQuery.rows || []) {
    let arr = docsByApp.get(doc.application_id);
    if (!arr) {
      arr = [];
      docsByApp.set(doc.application_id, arr);
    }
    let meta = doc.metadata;
    if (typeof meta === "string") {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = null;
      }
    }
    arr.push({ ...doc, metadata: meta });
  }

  // Fetch requests
  const reqsQuery = await dbQuery(
    `SELECT * FROM internship_document_requests WHERE application_id IN (${appIds.map(() => "?").join(",")})`,
    appIds
  );
  const reqsByApp = new Map<string, any[]>();
  for (const req of reqsQuery.rows || []) {
    let arr = reqsByApp.get(req.application_id);
    if (!arr) {
      arr = [];
      reqsByApp.set(req.application_id, arr);
    }
    arr.push(req);
  }

  return rows.map((r: any) => {
    const domainNorm = normalizeDomain(r.domain);
    const domainName = getFullDomainName(domainNorm);
    const approvedTasks = Number(r.approved_tasks) || 0;
    const planType = r.plan_type?.trim().toLowerCase() === "premium" ? "premium" : "standard";
    const totalTasks = Number(r.total_tasks) || (planType === "premium" && domainNorm === "fullstack" ? (Number(r.duration) === 6 ? 50 : (Number(r.duration) === 3 ? 25 : 5)) : 5);
    const isCompleted =
      r.status === "completed" ||
      r.all_tasks_verified === 1 ||
      (approvedTasks >= totalTasks && totalTasks > 0);

    const evaluation = evalsMap.get(r.id) || null;
    const isHighPerformer = evaluation ? Boolean(evaluation.is_high_performer) : false;

    return {
      id: r.id,
      userId: r.user_id,
      fullName: r.full_name,
      email: r.email || r.profile_email || "",
      internId: r.intern_id,
      domain: domainNorm,
      domainName,
      planType: (r.plan_type === "premium" ? "premium" : "standard") as "standard" | "premium",
      durationMonths: Number(r.duration) || 1,
      totalTasks,
      approvedTasks,
      isCompleted,
      college: r.college || "",
      createdAt: r.created_at,
      evaluation: evaluation
        ? {
            id: evaluation.id,
            isHighPerformer,
            codeQuality: Number(evaluation.code_quality),
            technicalSkills: Number(evaluation.technical_skills),
            problemSolving: Number(evaluation.problem_solving),
            teamwork: Number(evaluation.teamwork),
            projectPerformance: Number(evaluation.project_performance),
            finalRating: evaluation.final_rating,
            mentorRemarks: evaluation.mentor_remarks,
            evaluatedBy: evaluation.evaluated_by,
            evaluatedAt: evaluation.evaluated_at,
          }
        : null,
      generatedDocuments: docsByApp.get(r.id) || [],
      requests: reqsByApp.get(r.id) || [],
    };
  });
}

/**
 * Admin evaluates a student (sets ratings, remarks, high performer status).
 */
export async function saveStudentEvaluationServer(input: {
  applicationId: string;
  isHighPerformer: boolean;
  codeQuality: number;
  technicalSkills: number;
  problemSolving: number;
  teamwork: number;
  projectPerformance: number;
  finalRating: string;
  mentorRemarks: string;
  evaluatedBy?: string;
}): Promise<{ success: boolean }> {
  const {
    applicationId,
    isHighPerformer,
    codeQuality,
    technicalSkills,
    problemSolving,
    teamwork,
    projectPerformance,
    finalRating,
    mentorRemarks,
    evaluatedBy = "admin@skyrovix.com",
  } = input;

  const appQuery = await dbQuery(`SELECT user_id, domain FROM applications WHERE id = $1 LIMIT 1`, [applicationId]);
  if (!appQuery.rows || appQuery.rows.length === 0) {
    throw new Error("Application not found.");
  }
  const app = appQuery.rows[0];
  if (!isAdvancedDocDomain(app.domain)) {
    throw new Error("Student's domain is not eligible for advanced performance evaluations.");
  }

  const evalId = crypto.randomUUID();
  await dbQuery(
    `INSERT INTO student_performance_evaluations
       (id, application_id, user_id, is_high_performer, code_quality, technical_skills, problem_solving, teamwork, project_performance, final_rating, mentor_remarks, evaluated_by, evaluated_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       is_high_performer = VALUES(is_high_performer),
       code_quality = VALUES(code_quality),
       technical_skills = VALUES(technical_skills),
       problem_solving = VALUES(problem_solving),
       teamwork = VALUES(teamwork),
       project_performance = VALUES(project_performance),
       final_rating = VALUES(final_rating),
       mentor_remarks = VALUES(mentor_remarks),
       evaluated_by = VALUES(evaluated_by),
       evaluated_at = NOW(),
       updated_at = NOW()`,
    [
      evalId,
      applicationId,
      app.user_id || null,
      isHighPerformer ? 1 : 0,
      codeQuality,
      technicalSkills,
      problemSolving,
      teamwork,
      projectPerformance,
      finalRating,
      mentorRemarks,
      evaluatedBy,
    ]
  );

  // Audit history
  await dbQuery(
    `INSERT INTO document_approval_history
       (id, application_id, document_type, action, actor_email, remarks, created_at)
     VALUES ($1, $2, 'all', 'evaluated', $3, $4, NOW())`,
    [
      crypto.randomUUID(),
      applicationId,
      evaluatedBy,
      `Updated evaluation. High Performer: ${isHighPerformer ? "YES" : "NO"}. Final Rating: ${finalRating}`,
    ]
  );

  return { success: true };
}

/**
 * Admin generates or regenerates an individual document.
 */
export async function adminGenerateDocumentServer(input: {
  applicationId: string;
  documentType: AdvancedDocType;
  customMetadata?: AdvancedDocMetadata;
  generatedBy?: string;
}): Promise<{ success: boolean; documentId: string }> {
  const { applicationId, documentType, customMetadata, generatedBy = "admin@skyrovix.com" } = input;

  const appQuery = await dbQuery(
    `SELECT 
       id, user_id, full_name, domain, intern_id, plan_type, duration, status, all_tasks_verified, total_tasks
     FROM applications 
     WHERE id = $1 
     LIMIT 1`,
    [applicationId]
  );

  if (!appQuery.rows || appQuery.rows.length === 0) {
    throw new Error("Application not found.");
  }

  const app = appQuery.rows[0];
  const domainNorm = normalizeDomain(app.domain);

  if (!isAdvancedDocDomain(domainNorm)) {
    throw new Error("Document generation is only permitted for Full Stack, MERN Stack, and MEAN Stack domains.");
  }

  const planType = app.plan_type?.trim().toLowerCase() === "premium" ? "premium" : "standard";
  const durationMonths = Number(app.duration) || 1;

  // Check completion
  const subQuery = await dbQuery(
    `SELECT COUNT(*) as approved_count FROM submissions WHERE application_id = $1 AND status = 'approved'`,
    [applicationId]
  );
  const approvedTasks = Number(subQuery.rows?.[0]?.approved_count) || 0;
  const totalTasks = Number(app.total_tasks) || (planType === "premium" && domainNorm === "fullstack" ? (durationMonths === 6 ? 50 : (durationMonths === 3 ? 25 : 5)) : 5);
  const isCompleted =
    app.status === "completed" ||
    app.all_tasks_verified === 1 ||
    (approvedTasks >= totalTasks && totalTasks > 0);

  if (!isCompleted) {
    throw new Error("Internship is not completed yet. All tasks must be approved before issuing advanced documents.");
  }

  // Check LOR Policy
  if (documentType === "lor") {
    if (planType !== "premium") {
      throw new Error("Policy Violation: Standard plan students are not eligible for a Letter of Recommendation.");
    }
  } else {
    // Other 5 documents require high performer status
    const evalQuery = await dbQuery(
      `SELECT is_high_performer FROM student_performance_evaluations WHERE application_id = $1 LIMIT 1`,
      [applicationId]
    );
    const isHighPerformer = evalQuery.rows?.[0] ? Boolean(evalQuery.rows[0].is_high_performer) : false;
    if (!isHighPerformer) {
      throw new Error("Policy Violation: This document requires an approved High-Performer evaluation by administration.");
    }
  }

  // Check if document already exists (for regeneration)
  const existingDocQuery = await dbQuery(
    `SELECT id, document_id FROM internship_documents WHERE application_id = $1 AND document_type = $2 LIMIT 1`,
    [applicationId, documentType]
  );
  const existingDoc = existingDocQuery.rows?.[0] || null;

  const docId = existingDoc ? existingDoc.document_id : generateAdvancedDocId(documentType);
  const verificationHash = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

  const def = ADVANCED_DOCUMENT_DEFINITIONS.find((d) => d.type === documentType);
  const title = def ? def.title : "Internship Credential";

  // Merge evaluation remarks if not in custom metadata
  const evalRow = (await dbQuery(`SELECT * FROM student_performance_evaluations WHERE application_id = $1 LIMIT 1`, [applicationId])).rows?.[0];
  const mergedMetadata: AdvancedDocMetadata = {
    mentorRemarks: evalRow?.mentor_remarks || undefined,
    finalRating: evalRow?.final_rating || "A+ (Outstanding)",
    codeQuality: evalRow ? Number(evalRow.code_quality) : 9.5,
    technicalSkills: evalRow ? Number(evalRow.technical_skills) : 9.7,
    problemSolving: evalRow ? Number(evalRow.problem_solving) : 9.6,
    teamwork: evalRow ? Number(evalRow.teamwork) : 9.5,
    projectPerformance: evalRow ? Number(evalRow.project_performance) : 9.8,
    ...customMetadata,
  };

  const id = existingDoc ? existingDoc.id : crypto.randomUUID();

  await dbQuery(
    `INSERT INTO internship_documents
       (id, document_id, application_id, user_id, document_type, title, student_name, domain, plan_type, issue_date, status, verification_hash, metadata, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'issued', $10, $11, $12, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       verification_hash = VALUES(verification_hash),
       metadata = VALUES(metadata),
       status = 'issued',
       created_by = VALUES(created_by),
       updated_at = NOW()`,
    [
      id,
      docId,
      applicationId,
      app.user_id || null,
      documentType,
      title,
      app.full_name,
      domainNorm,
      planType,
      verificationHash,
      JSON.stringify(mergedMetadata),
      generatedBy,
    ]
  );

  // If a request was pending for this doc, mark it approved
  await dbQuery(
    `UPDATE internship_document_requests 
     SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
     WHERE application_id = $2 AND document_type = $3`,
    [generatedBy, applicationId, documentType]
  );

  // Audit history
  await dbQuery(
    `INSERT INTO document_approval_history
       (id, application_id, document_id, document_type, action, actor_email, remarks, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      crypto.randomUUID(),
      applicationId,
      docId,
      documentType,
      existingDoc ? "regenerated" : "generated",
      generatedBy,
      `${existingDoc ? "Regenerated" : "Generated"} document ${docId} for ${app.full_name}`,
    ]
  );

  return { success: true, documentId: docId };
}

/**
 * Admin approves or rejects student request.
 */
export async function adminReviewRequestServer(input: {
  requestId: string;
  status: "approved" | "rejected";
  adminNote?: string;
  reviewedBy?: string;
}): Promise<{ success: boolean }> {
  const { requestId, status, adminNote, reviewedBy = "admin@skyrovix.com" } = input;

  const reqQuery = await dbQuery(`SELECT * FROM internship_document_requests WHERE id = $1 LIMIT 1`, [requestId]);
  if (!reqQuery.rows || reqQuery.rows.length === 0) {
    throw new Error("Request not found.");
  }
  const req = reqQuery.rows[0];

  await dbQuery(
    `UPDATE internship_document_requests
     SET status = $1, admin_note = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
     WHERE id = $4`,
    [status, adminNote || null, reviewedBy, requestId]
  );

  // If approved, automatically trigger document generation
  if (status === "approved") {
    await adminGenerateDocumentServer({
      applicationId: req.application_id,
      documentType: req.document_type as AdvancedDocType,
      generatedBy: reviewedBy,
    });
  }

  // Audit history
  await dbQuery(
    `INSERT INTO document_approval_history
       (id, application_id, document_type, action, actor_email, remarks, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [crypto.randomUUID(), req.application_id, req.document_type, status, reviewedBy, adminNote || `Request ${status}`]
  );

  return { success: true };
}

/**
 * Retrieves full document data for client or server PDF rendering.
 */
export async function getDocumentDataByIdServer(documentId: string): Promise<AdvancedDocData | null> {
  const docQuery = await dbQuery(
    `SELECT 
       d.*, 
       a.intern_id, 
       a.duration, 
       a.full_name as app_full_name,
       a.domain as app_domain
     FROM internship_documents d
     LEFT JOIN applications a ON a.id = d.application_id
     WHERE d.document_id = $1
     LIMIT 1`,
    [documentId]
  );

  if (!docQuery.rows || docQuery.rows.length === 0) {
    return null;
  }

  const row = docQuery.rows[0];
  const domainNorm = normalizeDomain(row.domain || row.app_domain);
  const domainName = getFullDomainName(domainNorm);

  let meta: AdvancedDocMetadata = {};
  if (row.metadata) {
    try {
      meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata;
    } catch {
      meta = {};
    }
  }

  const verifyUrl = `https://skyrovix.in/verify/${row.document_id}`;

  return {
    documentId: row.document_id,
    documentType: row.document_type as AdvancedDocType,
    fullName: row.student_name || row.app_full_name || "Scholar",
    internId: row.intern_id || "SKX-INTERN",
    domain: domainNorm,
    domainName,
    planType: row.plan_type === "premium" ? "premium" : "standard",
    durationMonths: Number(row.duration) || 1,
    issuedAt: row.issue_date || row.created_at,
    verifyUrl,
    metadata: meta,
  };
}

