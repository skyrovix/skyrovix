import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import React from "react";
import {
  CertificateDoc,
  OfferLetterDoc,
  IDCardDoc,
  type ImageAssets,
} from "@/components/pdf-docs";
import {
  LorDoc,
  ExperienceLetterDoc,
  ProjectCertificateDoc,
  PerformanceReportDoc,
  AppreciationCertificateDoc,
  SkillCertificateDoc,
  type AdvancedDocData,
  type AdvancedDocType,
} from "@/components/advanced-pdf-docs";
import { getPublicSiteUrl, DOMAINS } from "@/lib/constants";
import { EMAIL_ASSETS } from "@/lib/email-assets";

export interface RenderCertificateParams {
  fullName: string;
  internId: string;
  domain: string;
  certId: string;
  issuedAt: string;
  verifyUrl?: string;
  grade?: string;
  imageAssets?: ImageAssets;
}

export interface RenderOfferLetterParams {
  fullName: string;
  internId: string;
  domain: string;
  issuedAt: string;
  duration?: number;
  verifyUrl?: string;
  qrCodeDataUri?: string;
  imageAssets?: ImageAssets;
}

export interface RenderIdCardParams {
  fullName: string;
  internId: string;
  domain: string;
  issuedAt: string;
  photoUrl?: string | null;
  email?: string | null;
  validUpto?: string | null;
  barcodeDataUri?: string;
  qrCodeDataUri?: string;
}

/**
 * Server-side renderer for the official Skyrovix Certificate of Excellence.
 * Uses the exact same @react-pdf/renderer template (CertificateDoc) as student downloads.
 */
export async function renderCertificateBufferServer(
  params: RenderCertificateParams
): Promise<Buffer> {
  const verifyUrl =
    params.verifyUrl ||
    `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(params.certId.trim())}`;

  let qrCodeDataUri: string | undefined;
  try {
    qrCodeDataUri = await QRCode.toDataURL(verifyUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#181619",
        light: "#ffffff",
      },
    });
  } catch (qrErr) {
    console.warn("[PDF Service] QR generation warning:", qrErr);
  }

  const element = React.createElement(CertificateDoc, {
    fullName: params.fullName || "Student Intern",
    internId: params.internId || "SKX-INT",
    domain: params.domain || "Technology & Software Engineering",
    certId: params.certId || "SKX-CERT",
    issuedAt: params.issuedAt || new Date().toISOString(),
    verifyUrl,
    qrCodeDataUri,
    grade: params.grade || "A+ (Outstanding)",
    imageAssets: params.imageAssets || EMAIL_ASSETS,
  });

  const pdfBuf = await renderToBuffer(element as any);
  return Buffer.isBuffer(pdfBuf) ? pdfBuf : Buffer.from(pdfBuf);
}

/**
 * Server-side renderer for the official Skyrovix Internship Offer Letter.
 * Uses the exact same @react-pdf/renderer template (OfferLetterDoc) as student downloads.
 */
export async function renderOfferLetterBufferServer(
  params: RenderOfferLetterParams
): Promise<Buffer> {
  const verifyUrl =
    params.verifyUrl ||
    `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(params.internId.trim())}`;

  let qrCodeDataUri = params.qrCodeDataUri;
  if (!qrCodeDataUri) {
    try {
      qrCodeDataUri = await QRCode.toDataURL(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: "#181619",
          light: "#ffffff",
        },
      });
    } catch (qrErr) {
      console.warn("[PDF Service] QR generation warning:", qrErr);
    }
  }

  const element = React.createElement(OfferLetterDoc, {
    fullName: params.fullName || "Student Intern",
    internId: params.internId || "SKX-INT",
    domain: params.domain || "Software Engineering",
    issuedAt: params.issuedAt || new Date().toISOString(),
    duration: params.duration || 1,
    verifyUrl,
    qrCodeDataUri,
    imageAssets: params.imageAssets || EMAIL_ASSETS,
  });

  const pdfBuf = await renderToBuffer(element as any);
  return Buffer.isBuffer(pdfBuf) ? pdfBuf : Buffer.from(pdfBuf);
}

/**
 * Server-side renderer for the official Skyrovix Smart ID Card.
 * Uses the exact same @react-pdf/renderer template (IDCardDoc) as student downloads.
 */
export async function renderIdCardBufferServer(
  params: RenderIdCardParams
): Promise<Buffer> {
  const verifyUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(
    params.internId.trim()
  )}`;

  let qrCodeDataUri = params.qrCodeDataUri;
  if (!qrCodeDataUri) {
    try {
      qrCodeDataUri = await QRCode.toDataURL(verifyUrl, {
        width: 160,
        margin: 1,
      });
    } catch (qrErr) {
      console.warn("[PDF Service] ID QR warning:", qrErr);
    }
  }

  const element = React.createElement(IDCardDoc, {
    fullName: params.fullName || "Student Intern",
    internId: params.internId || "SKX-INT",
    domain: params.domain || "Technology",
    issuedAt: params.issuedAt || new Date().toISOString(),
    photoUrl: params.photoUrl,
    email: params.email,
    validUpto: params.validUpto,
    barcodeDataUri: params.barcodeDataUri,
    qrCodeDataUri,
  });

  const pdfBuf = await renderToBuffer(element as any);
  return Buffer.isBuffer(pdfBuf) ? pdfBuf : Buffer.from(pdfBuf);
}

/**
 * Server-side renderer for all 6 Advanced Internship Documents:
 * - Letter of Recommendation (LOR)
 * - Experience Letter
 * - Project Completion Certificate
 * - Performance Evaluation Report
 * - Certificate of Appreciation
 * - Skill Achievement Certificate
 */
export async function renderAdvancedDocBufferServer(
  docData: AdvancedDocData
): Promise<Buffer> {
  let qrCodeDataUri: string | undefined;
  try {
    qrCodeDataUri = await QRCode.toDataURL(docData.verifyUrl, {
      width: 180,
      margin: 1,
    });
  } catch {
    /* continue without qr */
  }

  const props = { ...docData, qrCodeDataUri };
  let element: React.ReactElement;
  switch (docData.documentType) {
    case "lor":
      element = React.createElement(LorDoc, props);
      break;
    case "experience_letter":
      element = React.createElement(ExperienceLetterDoc, props);
      break;
    case "project_certificate":
      element = React.createElement(ProjectCertificateDoc, props);
      break;
    case "evaluation_report":
      element = React.createElement(PerformanceReportDoc, props);
      break;
    case "appreciation_certificate":
      element = React.createElement(AppreciationCertificateDoc, props);
      break;
    case "skill_certificate":
      element = React.createElement(SkillCertificateDoc, props);
      break;
    default:
      throw new Error(`Unsupported advanced document type: ${docData.documentType}`);
  }

  const pdfBuf = await renderToBuffer(element as any);
  return Buffer.isBuffer(pdfBuf) ? pdfBuf : Buffer.from(pdfBuf);
}
