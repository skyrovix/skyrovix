import { createServerFn } from "@tanstack/react-start";
import type {
  AdvancedDocType,
  AdvancedDocMetadata,
  AdvancedDocData,
} from "@/components/advanced-pdf-docs";
import type {
  StudentAdvancedDocsSummary,
  DocumentItemStatus,
} from "./advanced-docs-service.server";

export type {
  AdvancedDocType,
  AdvancedDocMetadata,
  AdvancedDocData,
  StudentAdvancedDocsSummary,
  DocumentItemStatus,
};

export const getStudentAdvancedDocsFn = createServerFn({ method: "POST" })
  .validator((d: { applicationId: string; userId?: string }) => d)
  .handler(async ({ data }) => {
    const { getStudentAdvancedDocsDataServer } = await import("./advanced-docs-service.server");
    return getStudentAdvancedDocsDataServer(data.applicationId, data.userId);
  });

export const studentRequestDocumentFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      applicationId: string;
      userId: string;
      documentType: AdvancedDocType;
      studentNote?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const { studentRequestDocumentServer } = await import("./advanced-docs-service.server");
    return studentRequestDocumentServer(
      data.applicationId,
      data.userId,
      data.documentType,
      data.studentNote
    );
  });

export const getAdminAdvancedDocsDataFn = createServerFn({ method: "POST" })
  .validator((d: { domain?: string; plan?: string; search?: string } | undefined) => d)
  .handler(async ({ data }) => {
    const { getAdminAdvancedDocsDataServer } = await import("./advanced-docs-service.server");
    return getAdminAdvancedDocsDataServer(data);
  });

export const saveStudentEvaluationFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
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
    }) => d
  )
  .handler(async ({ data }) => {
    const { saveStudentEvaluationServer } = await import("./advanced-docs-service.server");
    return saveStudentEvaluationServer(data);
  });

export const adminGenerateDocumentFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      applicationId: string;
      documentType: AdvancedDocType;
      customMetadata?: AdvancedDocMetadata;
      generatedBy?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const { adminGenerateDocumentServer } = await import("./advanced-docs-service.server");
    return adminGenerateDocumentServer(data);
  });

export const adminReviewRequestFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      requestId: string;
      status: "approved" | "rejected";
      adminNote?: string;
      reviewedBy?: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const { adminReviewRequestServer } = await import("./advanced-docs-service.server");
    return adminReviewRequestServer(data);
  });

export const getDocumentDataByIdFn = createServerFn({ method: "POST" })
  .validator((d: { documentId: string }) => d)
  .handler(async ({ data }) => {
    const { getDocumentDataByIdServer } = await import("./advanced-docs-service.server");
    return getDocumentDataByIdServer(data.documentId);
  });
