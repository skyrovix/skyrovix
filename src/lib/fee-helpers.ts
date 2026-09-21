/**
 * Dynamic Disclaimer & Fee Policy Helpers for Skyrovix Internship Portal
 * 
 * Implements exact disclaimers specified in the Master Prompt:
 * - Application Fee disclaimer (always separate from Certificate)
 * - Dynamic Certificate Fee disclaimer (Cases A, B, C, D)
 */

export const APPLICATION_FEE_DISCLAIMER =
  "Application processing fee only. This charge is applicable only to your internship application. It is NOT a certification fee.";

export const APPLICATION_FEE_BADGE =
  "Application Processing Fee — Not a Certification Fee";

export const APPLICATION_FEE_WAIVED_TEXT =
  "Application fee is not required for this application.";

export type CertificateDisclaimerCase = "A" | "B" | "C" | "D";

export interface CertificateDisclaimerInfo {
  caseType: CertificateDisclaimerCase;
  title: string;
  description: string;
}

/**
 * Dynamically resolves the certificate disclaimer based on the specific application's state:
 * - Case D: Tasks not yet approved
 * - Case B: Current application has a valid Certificate Free Offer entitlement
 * - Case C: Normal certificate fee configured as ₹0 or disabled
 * - Case A: Normal certificate fee enabled and > ₹0 (no promotional entitlement)
 */
export function getCertificateDisclaimer(params: {
  isTasksApproved: boolean;
  isOfferEligible: boolean;
  normalCertFee: number;
  isFeeEnabled?: boolean;
}): CertificateDisclaimerInfo {
  const { isTasksApproved, isOfferEligible, normalCertFee, isFeeEnabled = true } = params;

  if (!isTasksApproved) {
    return {
      caseType: "D",
      title: "CERTIFICATE STATUS",
      description:
        "Certificate payment/issue becomes available after all required internship tasks are completed and admin-verified.",
    };
  }

  if (isOfferEligible) {
    return {
      caseType: "B",
      title: "CERTIFICATE FREE OFFER",
      description:
        "Certificate is free for eligible applications submitted during the active promotional offer period.",
    };
  }

  if (!isFeeEnabled || normalCertFee === 0) {
    return {
      caseType: "C",
      title: "CERTIFICATE — FREE",
      description:
        "No certificate payment is required under the current fee configuration.",
    };
  }

  return {
    caseType: "A",
    title: "CERTIFICATE ISSUANCE FEE",
    description:
      "This fee applies to applications that are not covered by the active Certificate Free Offer.",
  };
}
