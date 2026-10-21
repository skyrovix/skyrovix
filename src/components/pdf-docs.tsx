import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import { COMPANY, durationConfig, getPublicSiteUrl } from "@/lib/constants";
import { EMAIL_ASSETS } from "@/lib/email-assets";

const logoImg = EMAIL_ASSETS?.logo || "";
const topNavLogoImg = EMAIL_ASSETS?.topNavLogo || "";
const sealImg = EMAIL_ASSETS?.seal || "";
const msmeImg = EMAIL_ASSETS?.msme || "";
const sigFounderImg = EMAIL_ASSETS?.sigFounder || "";
const sigCofounderImg = EMAIL_ASSETS?.sigCofounder || "";
const yrTechImg = EMAIL_ASSETS?.yrTech || "";
const vinixImg = EMAIL_ASSETS?.vinix || "";

const C = {
  brand: "#181619",
  primary: "#f95c4b",
  coral: "#f95c4b",
  coralSoft: "#ee9590",
  gold: "#d97706",
  ink: "#181619",
  muted: "#64748b",
  border: "#e2e8f0",
  light: "#faf8f2",
};

export type ImageAssets = {
  logo?: string;
  seal?: string;
  msme?: string;
  sigFounder?: string;
  sigCofounder?: string;
  yrTech?: string;
  vinix?: string;
};

const s = StyleSheet.create({
  page: { padding: 24, fontSize: 9, color: C.ink, fontFamily: "Helvetica", position: "relative" },

  frameOuter: { position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderWidth: 1.5, borderColor: C.brand, borderRadius: 4 },
  frameInner: { position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderWidth: 0.5, borderColor: C.primary, opacity: 0.25 },

  watermark: { position: "absolute", top: 120, left: 0, right: 0, alignItems: "center", opacity: 0.015 },

  topBand: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: C.primary },
  bottomBand: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: C.brand, opacity: 0.6 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: C.primary },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 15, fontWeight: 700, color: C.brand, letterSpacing: 0.8 },
  headerSmall: { fontSize: 6.5, color: C.muted, marginTop: 1 },
  small: { fontSize: 6.5, color: C.muted },
  refBox: { alignItems: "flex-end" },
  refLabel: { fontSize: 6, color: C.muted, marginBottom: 1, letterSpacing: 1.2, textTransform: "uppercase" },
  refValue: { fontSize: 8.5, fontWeight: 700, color: C.primary },

  dateLine: { fontSize: 8.5, color: C.ink, marginBottom: 6 },

  title: { fontSize: 20, fontWeight: 700, color: C.brand, marginBottom: 4, letterSpacing: 2 },
  titleAccent: { width: 40, height: 2.5, backgroundColor: C.primary, marginBottom: 10, borderRadius: 2 },

  greeting: { fontSize: 9.5, marginBottom: 6, color: C.ink },
  p: { lineHeight: 1.5, marginBottom: 6, color: "#334155", fontSize: 8.5 },
  bold: { fontWeight: 700 },

  sectionHeading: { fontSize: 10.5, fontWeight: 700, color: C.primary, marginBottom: 5, marginTop: 8, letterSpacing: 0.4 },

  table: { marginBottom: 5, borderWidth: 0.5, borderColor: C.border, borderRadius: 3, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: C.brand },
  th: { fontSize: 7.5, fontWeight: 700, color: "#ffffff", paddingVertical: 3, paddingHorizontal: 8 },
  thKey: { width: 100, paddingHorizontal: 8 },
  thVal: { flex: 1, paddingHorizontal: 8 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: "#ffffff" },
  rowAlt: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: "#f8fafc" },
  rowLast: { flexDirection: "row", backgroundColor: "#f8fafc" },
  key: { width: 100, fontSize: 7.5, color: C.muted, paddingVertical: 3, paddingHorizontal: 8, borderRightWidth: 0.5, borderRightColor: C.border, backgroundColor: "#faf8f2" },
  val: { flex: 1, fontSize: 8, fontWeight: 700, paddingVertical: 3, paddingHorizontal: 8 },

  overviewBullet: { flexDirection: "row", marginBottom: 2 },
  overviewDot: { width: 14, fontSize: 8, color: C.primary, fontFamily: "Helvetica-Bold", lineHeight: 1.5 },
  overviewText: { flex: 1, fontSize: 8, color: "#334155", lineHeight: 1.5 },

  termsBullet: { flexDirection: "row", marginBottom: 2 },
  termsDot: { width: 14, fontSize: 8, color: C.primary, fontFamily: "Helvetica-Bold" },
  termsText: { flex: 1, fontSize: 8, color: "#475569", lineHeight: 1.45 },

  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  sigBlock: { alignItems: "center", width: 130 },
  sigImg: { height: 24, marginBottom: 2 },
  sigLine: { borderTopWidth: 0.5, borderTopColor: C.ink, width: "100%", marginBottom: 2 },

  footer: { position: "absolute", bottom: 10, left: 24, right: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 5 },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { fontSize: 6.5, color: C.muted },
  footerRight: { alignItems: "flex-end", gap: 1 },
});

// Executive styles matching the exact reference style (guaranteed 1 full A4 page)
const offerStyles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 26,
    fontSize: 8.5,
    color: "#0f172a",
    fontFamily: "Helvetica",
    position: "relative",
    backgroundColor: "#ffffff",
  },
  frameOuter: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 1.2,
    borderColor: "#181619",
    borderRadius: 4,
  },
  frameInner: {
    position: "absolute",
    top: 12.5,
    left: 12.5,
    right: 12.5,
    bottom: 12.5,
    borderWidth: 0.5,
    borderColor: "#f95c4b",
    opacity: 0.35,
    borderRadius: 3,
  },
  watermark: {
    position: "absolute",
    top: 320,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.02,
  },
  watermarkText: {
    fontSize: 60,
    color: "#181619",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 8,
  },

  // Header matching reference
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 9,
    borderBottomWidth: 0.75,
    borderBottomColor: "#cbd5e1",
    marginBottom: 11,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 45,
    height: 45,
    objectFit: "contain",
  },
  headerDivider: {
    width: 0.75,
    height: 36,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 11,
  },
  brandName: {
    fontSize: 16.5,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 8.8,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    marginTop: 0.8,
  },
  brandMeta: {
    fontSize: 7.4,
    color: "#64748b",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  refLabel: {
    fontSize: 7,
    color: "#64748b",
    letterSpacing: 0.8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  refValue: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    marginTop: 0.5,
  },
  dateLabel: {
    fontSize: 7,
    color: "#64748b",
    letterSpacing: 0.8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginTop: 2.5,
  },
  dateValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
    marginTop: 0.5,
  },

  // Title Block
  titleContainer: {
    marginBottom: 9,
  },
  titleText: {
    fontSize: 17.5,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  titleDate: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    marginTop: 2,
  },

  // Greeting & Intro
  greeting: {
    fontSize: 9.8,
    marginBottom: 5,
    color: "#0f172a",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  bodyP: {
    fontSize: 8.8,
    lineHeight: 1.5,
    color: "#334155",
    marginBottom: 6,
  },

  // Table (8 Rows)
  table: {
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderRadius: 3.5,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: "#181619",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  tableHeaderTitle: {
    color: "#ffffff",
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#faf8f2",
  },
  colKey: {
    width: 180,
    fontSize: 8.2,
    color: "#403b42",
    backgroundColor: "#faf8f2",
    paddingVertical: 4.2,
    paddingHorizontal: 10,
    borderRightWidth: 0.5,
    borderRightColor: "#e2e8f0",
  },
  colVal: {
    flex: 1,
    fontSize: 8.4,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
    paddingVertical: 4.2,
    paddingHorizontal: 10,
  },

  // Cards
  cardBox: {
    backgroundColor: "#faf8f2",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    paddingVertical: 7.5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  termItem: {
    fontSize: 7.8,
    color: "#475569",
    lineHeight: 1.4,
    marginBottom: 2.8,
  },
  cardText: {
    fontSize: 7.8,
    color: "#475569",
    lineHeight: 1.42,
  },

  // Acceptance Closing
  acceptanceText: {
    fontSize: 8.4,
    color: "#334155",
    lineHeight: 1.44,
    marginTop: 4,
    marginBottom: 12,
  },

  // Signatures & Seal Section: Hariharan S (Left), Seal (Center), Maheshwaran S (Right) - Anchored above footer with healthy bottom clearance
  authSection: {
    position: "absolute",
    bottom: 96,
    left: 26,
    right: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signBlockLeft: {
    alignItems: "flex-start",
    width: 175,
  },
  signBlockRight: {
    alignItems: "flex-end",
    width: 175,
  },
  centerSealBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sealImage: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  sealLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 2,
  },
  signImgContainer: {
    height: 46,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  signImgContainerRight: {
    height: 46,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  signImg: {
    height: 44,
    objectFit: "contain",
  },
  signLine: {
    borderTopWidth: 1.2,
    borderTopColor: "#181619",
    width: 165,
    marginTop: 2,
    marginBottom: 2.5,
  },
  signName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
  },
  signTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    textTransform: "uppercase",
    marginTop: 0.5,
  },
  signOrg: {
    fontSize: 6.2,
    color: "#94a3b8",
  },

  // Footer: MSME & Partner on Left, Company & UDYAM in Center, YR Tech on Right - Enlarged logos, reduced top padding, increased bottom padding
  footer: {
    position: "absolute",
    bottom: 28,
    left: 26,
    right: 26,
    borderTopWidth: 0.75,
    borderTopColor: "#cbd5e1",
    paddingTop: 4,
    paddingBottom: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    width: 155,
    flexDirection: "row",
    alignItems: "center",
  },
  footerMsme: {
    height: 36,
    width: 76,
    marginRight: 8,
    objectFit: "contain",
  },
  footerVinix: {
    height: 32,
    width: 66,
    objectFit: "contain",
  },
  footerCenter: {
    flex: 1,
    alignItems: "center",
  },
  footerCompanyName: {
    fontSize: 9.8,
    fontFamily: "Helvetica-Bold",
    color: "#181619",
    letterSpacing: 0.3,
  },
  footerRegistry: {
    fontSize: 8.2,
    color: "#334155",
    marginTop: 1.5,
  },
  footerContact: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#f95c4b",
    marginTop: 1.5,
  },
  footerRight: {
    width: 155,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  footerYrTech: {
    height: 32,
    width: 50,
    objectFit: "contain",
  },
});

export function OfferLetterDoc({ fullName, internId, domain, issuedAt, duration = 1, imageAssets }: {
  fullName: string; internId: string; domain: string; issuedAt: string; duration?: number;
  verifyUrl?: string; qrCodeDataUri?: string; imageAssets?: ImageAssets;
}) {
  const date = new Date(issuedAt);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
  const dur = durationConfig(duration);
  const durLabel = dur?.label ?? `${duration} Month${duration > 1 ? "s" : ""}`;

  const endDate = new Date(date);
  endDate.setMonth(endDate.getMonth() + duration);
  const endDateStr = endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={offerStyles.page}>
        <View style={offerStyles.frameOuter} />
        <View style={offerStyles.frameInner} />

        {/* Subtle background watermark */}
        <View style={offerStyles.watermark}>
          <Text style={offerStyles.watermarkText}>SKYROVIX</Text>
        </View>

        {/* Header: Left Logo + Title + Web; Right Intern ID + Issue Date */}
        <View style={offerStyles.header}>
          <View style={offerStyles.headerLeft}>
            <Image src={imageAssets?.logo ?? logoImg} style={offerStyles.brandLogo} />
            <View style={offerStyles.headerDivider} />
            <View>
              <Text style={offerStyles.brandName}>SKYROVIX</Text>
              <Text style={offerStyles.brandTagline}>Empowering Future Innovators</Text>
              <Text style={offerStyles.brandMeta}>www.skyrovix.in | skyrovix@gmail.com</Text>
            </View>
          </View>
          <View style={offerStyles.headerRight}>
            <Text style={offerStyles.refLabel}>INTERNSHIP ID</Text>
            <Text style={offerStyles.refValue}>{internId}</Text>
            <Text style={offerStyles.dateLabel}>ISSUE DATE</Text>
            <Text style={offerStyles.dateValue}>{dateStr}</Text>
          </View>
        </View>

        {/* Title Block */}
        <View style={offerStyles.titleContainer}>
          <Text style={offerStyles.titleText}>INTERNSHIP OFFER LETTER</Text>
          <Text style={offerStyles.titleDate}>Date: {dateStr}</Text>
        </View>

        {/* Salutation & Intro */}
        <Text style={offerStyles.greeting}>Dear <Text style={offerStyles.bold}>{fullName}</Text>,</Text>

        <Text style={offerStyles.bodyP}>
          We are delighted to offer you the position of <Text style={offerStyles.bold}>Virtual Intern – {domainName}</Text> at <Text style={offerStyles.bold}>Skyrovix</Text> (accessible at <Text style={offerStyles.bold}>skyrovix.in</Text>). After reviewing your application, technical aptitude, and enthusiasm, we are confident that your skills make you a valuable addition to our engineering cohort.
        </Text>
        <Text style={offerStyles.bodyP}>
          Your virtual internship details, work deliverables, and engagement particulars are finalized as follows:
        </Text>

        {/* Table: INTERNSHIP PROGRAM PARTICULARS (8 Rows) */}
        <View style={offerStyles.table}>
          <View style={offerStyles.tableHeader}>
            <Text style={offerStyles.tableHeaderTitle}>INTERNSHIP PROGRAM PARTICULARS</Text>
          </View>
          <View style={offerStyles.tableRow}>
            <Text style={offerStyles.colKey}>Internship Track</Text>
            <Text style={offerStyles.colVal}>{domainName}</Text>
          </View>
          <View style={offerStyles.tableRowAlt}>
            <Text style={offerStyles.colKey}>Intern ID</Text>
            <Text style={offerStyles.colVal}>{internId}</Text>
          </View>
          <View style={offerStyles.tableRow}>
            <Text style={offerStyles.colKey}>Program Duration</Text>
            <Text style={offerStyles.colVal}>{durLabel}</Text>
          </View>
          <View style={offerStyles.tableRowAlt}>
            <Text style={offerStyles.colKey}>Commencement Date</Text>
            <Text style={offerStyles.colVal}>{dateStr}</Text>
          </View>
          <View style={offerStyles.tableRow}>
            <Text style={offerStyles.colKey}>Estimated Completion</Text>
            <Text style={offerStyles.colVal}>{endDateStr}</Text>
          </View>
          <View style={offerStyles.tableRowAlt}>
            <Text style={offerStyles.colKey}>Stipend Specification</Text>
            <Text style={offerStyles.colVal}>Unpaid (Performance-Based Internship)</Text>
          </View>
          <View style={offerStyles.tableRow}>
            <Text style={offerStyles.colKey}>Location & Model</Text>
            <Text style={offerStyles.colVal}>Remote / Virtual (Task-Based, Flexible Hours)</Text>
          </View>
          <View style={offerStyles.tableRowAlt}>
            <Text style={offerStyles.colKey}>Official Domain Portal</Text>
            <Text style={offerStyles.colVal}>https://skyrovix.in</Text>
          </View>
        </View>

        {/* Card 1: GENERAL TERMS & CONDITIONS OF INTERNSHIP (5 terms) */}
        <View style={offerStyles.cardBox}>
          <Text style={offerStyles.cardTitle}>GENERAL TERMS & CONDITIONS OF INTERNSHIP:</Text>
          <Text style={offerStyles.termItem}>
            <Text style={offerStyles.bold}>1. Task Execution & Milestones: </Text>
            You will work on production-grade tasks and project modules aligned with {domainName}. Timely submission of weekly progress updates and milestone deliverables via skyrovix.in is mandatory.
          </Text>
          <Text style={offerStyles.termItem}>
            <Text style={offerStyles.bold}>2. Code of Conduct & Integrity: </Text>
            Plagiarism, unauthorized code dissemination, or any form of professional misconduct will lead to immediate cancellation of your internship program.
          </Text>
          <Text style={offerStyles.termItem}>
            <Text style={offerStyles.bold}>3. Confidentiality & Non-Disclosure: </Text>
            Any documentation, source code, architecture designs, or mock datasets shared during this program are strictly confidential and the intellectual property of Skyrovix.
          </Text>
          <Text style={offerStyles.termItem}>
            <Text style={offerStyles.bold}>4. Mentorship & Continuous Evaluation: </Text>
            You will receive structured technical guidance and feedback throughout your tenure to foster industry-standard development capabilities.
          </Text>
          <Text style={offerStyles.termItem}>
            <Text style={offerStyles.bold}>5. Certification: </Text>
            An official Certificate of Internship Completion will be issued only upon successful submission and mentor approval of all milestone tasks.
          </Text>
        </View>

        {/* Card 2: CERTIFICATE OF COMPLETION */}
        <View style={offerStyles.cardBox}>
          <Text style={offerStyles.cardTitle}>CERTIFICATE OF COMPLETION</Text>
          <Text style={offerStyles.cardText}>
            Upon successful completion of the internship tenure and fulfillment of all assigned tasks, you will receive an official Certificate of Internship from Skyrovix, verifiable on our official domain at skyrovix.in/verify-certificate.
          </Text>
        </View>

        {/* Formal Acceptance closing sentence matching Reference */}
        <Text style={offerStyles.acceptanceText}>
          Please return the signed copy of this letter as a token of your formal acceptance of this offer. We look forward to a mutually rewarding learning experience.
        </Text>

        {/* Signatures & Seal Section: Hariharan S (Founder & CEO), Seal (Center), Maheshwaran S (Co-Founder) */}
        <View style={offerStyles.authSection}>
          {/* Founder & CEO on Left */}
          <View style={offerStyles.signBlockLeft}>
            <View style={offerStyles.signImgContainer}>
              <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={offerStyles.signImg} />
            </View>
            <View style={offerStyles.signLine} />
            <Text style={offerStyles.signName}>Hariharan S</Text>
            <Text style={offerStyles.signTitle}>Founder & CEO</Text>
            <Text style={offerStyles.signOrg}>Skyrovix</Text>
          </View>

          {/* Company Seal in Center */}
          <View style={offerStyles.centerSealBlock}>
            <Image src={imageAssets?.seal ?? sealImg} style={offerStyles.sealImage} />
            <Text style={offerStyles.sealLabel}>COMPANY SEAL</Text>
          </View>

          {/* Co-Founder on Right */}
          <View style={offerStyles.signBlockRight}>
            <View style={offerStyles.signImgContainerRight}>
              <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={offerStyles.signImg} />
            </View>
            <View style={offerStyles.signLine} />
            <Text style={offerStyles.signName}>Maheshwaran S</Text>
            <Text style={offerStyles.signTitle}>Co-Founder</Text>
            <Text style={offerStyles.signOrg}>Skyrovix</Text>
          </View>
        </View>

        {/* Footer: MSME & Partner on Left, Company & UDYAM in Center, YR Tech on Right */}
        <View style={offerStyles.footer}>
          <View style={offerStyles.footerLeft}>
            <Image src={imageAssets?.msme ?? msmeImg} style={offerStyles.footerMsme} />
            <Image src={imageAssets?.vinix ?? vinixImg} style={offerStyles.footerVinix} />
          </View>
          <View style={offerStyles.footerCenter}>
            <Text style={offerStyles.footerCompanyName}>SKYROVIX</Text>
            <Text style={offerStyles.footerRegistry}>UDYAM Registry: UDYAM-TN-17-0076606</Text>
            <Text style={offerStyles.footerContact}>skyrovix@gmail.com | www.skyrovix.in</Text>
          </View>
          <View style={offerStyles.footerRight}>
            <Image src={imageAssets?.yrTech ?? yrTechImg} style={offerStyles.footerYrTech} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function downloadOfferLetter(params: {
  fullName: string;
  internId: string;
  domain: string;
  issuedAt: string;
  duration?: number;
  imageAssets?: ImageAssets;
  verifyUrl?: string;
  qrCodeDataUri?: string;
}) {
  const verifyUrl = params.verifyUrl || `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(params.internId.trim())}`;
  let qrCodeDataUri = params.qrCodeDataUri;
  if (!qrCodeDataUri) {
    try {
      qrCodeDataUri = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 });
    } catch { /* proceed */ }
  }

  await downloadPdf(
    <OfferLetterDoc {...params} verifyUrl={verifyUrl} qrCodeDataUri={qrCodeDataUri} />,
    `OfferLetter_${params.internId}.pdf`
  );
}




export function CertificateDoc({ fullName, internId, domain, certId, issuedAt, verifyUrl, qrCodeDataUri, imageAssets }: {
  fullName: string; internId: string; domain: string; certId: string; issuedAt: string; verifyUrl: string;
  qrCodeDataUri?: string; imageAssets?: ImageAssets;
}) {
  const date = new Date(issuedAt);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 26, backgroundColor: "#ffffff" }}>
        {/* Skyrovix Regal Double Frame */}
        <View style={{ borderWidth: 4, borderColor: "#181619", padding: 8, height: "100%", borderRadius: 4 }}>
          <View style={{ borderWidth: 1.5, borderColor: "#f95c4b", padding: 20, height: "100%", borderRadius: 2 }}>
            
            {/* Header: Logos & Brand */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.logo ?? logoImg} style={{ width: 48, height: 48 }} />
                <Image src={imageAssets?.vinix ?? vinixImg} style={{ height: 32, width: 78 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 17, color: "#181619", fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 8.5, color: "#f95c4b", fontWeight: 700, letterSpacing: 1.5, marginTop: 1 }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.yrTech ?? yrTechImg} style={{ height: 32, width: 48 }} />
                <Image src={imageAssets?.msme ?? msmeImg} style={{ height: 32, width: 64 }} />
              </View>
            </View>

            {/* Title Block */}
            <View style={{ alignItems: "center", marginTop: 16 }}>
              <Text style={{ fontSize: 34, fontWeight: 700, color: "#181619", letterSpacing: 5 }}>CERTIFICATE</Text>
              <Text style={{ fontSize: 11, color: "#f95c4b", fontWeight: 700, letterSpacing: 7, marginTop: 3 }}>OF INTERNSHIP COMPLETION</Text>
              <View style={{ width: 56, height: 2.5, backgroundColor: "#f95c4b", marginTop: 7, borderRadius: 2 }} />
            </View>

            {/* Presentation Citation */}
            <View style={{ alignItems: "center", marginTop: 22 }}>
              <Text style={{ fontSize: 10.5, color: "#64748b", letterSpacing: 0.5 }}>This certificate is proudly presented to</Text>
              <Text style={{ fontSize: 29, fontWeight: 700, marginTop: 10, marginBottom: 10, color: "#181619", letterSpacing: 0.5 }}>{fullName}</Text>
              <Text style={{ fontSize: 10.5, color: "#334155", textAlign: "center", maxWidth: 620, lineHeight: 1.6 }}>
                for successfully completing the task-based virtual internship program in
                {" "}<Text style={{ fontWeight: 700, color: "#f95c4b" }}>{domain}</Text>{" "}
                at Skyrovix, demonstrating dedication, technical skill, and professional excellence throughout the program.
              </Text>
            </View>

            {/* QR Code Verification Badge */}
            {qrCodeDataUri && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                <Image src={qrCodeDataUri} style={{ width: 44, height: 44 }} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#f95c4b" }}>Digitally Verified Credential</Text>
                  <Text style={{ fontSize: 6.8, color: "#64748b" }}>Scan QR or verify at skyrovix.in/verify-certificate</Text>
                </View>
              </View>
            )}

            {/* Signatures & Seal Section */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28 }}>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={s.sigImg} />
                <View style={{ borderTopWidth: 1, borderTopColor: "#181619", width: "100%", marginBottom: 2 }} />
                <Text style={{ ...s.bold, color: "#181619" }}>{COMPANY.founder.name}</Text>
                <Text style={{ ...s.small, color: "#f95c4b", fontWeight: 700 }}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={imageAssets?.seal ?? sealImg} style={{ width: 84, height: 84, opacity: 0.95 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={s.sigImg} />
                <View style={{ borderTopWidth: 1, borderTopColor: "#181619", width: "100%", marginBottom: 2 }} />
                <Text style={{ ...s.bold, color: "#181619" }}>{COMPANY.cofounder.name}</Text>
                <Text style={{ ...s.small, color: "#f95c4b", fontWeight: 700 }}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            {/* Footer Metadata */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14, fontSize: 8, color: "#64748b" }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Certificate ID: <Text style={{ color: "#181619", fontWeight: 700 }}>{certId}</Text></Text>
                <Text>Intern ID: <Text style={{ color: "#f95c4b", fontWeight: 700 }}>{internId}</Text></Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <Text>Issued: <Text style={{ color: "#181619", fontWeight: 700 }}>{formattedDate}</Text></Text>
                <Text>Verify at: <Text style={{ color: "#f95c4b", fontWeight: 700 }}>www.skyrovix.in/verify-certificate</Text></Text>
              </View>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
}

export function CourseCertificateDoc({ fullName, courseName, score, total, certId, issuedAt, verifyUrl, qrCodeDataUri, imageAssets }: {
  fullName: string; courseName: string; score: number; total: number;
  certId: string; issuedAt: string; verifyUrl: string;
  qrCodeDataUri?: string; imageAssets?: ImageAssets;
}) {
  const date = new Date(issuedAt);
  const formattedDate = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 26, backgroundColor: "#ffffff" }}>
        {/* Skyrovix Regal Double Frame */}
        <View style={{ borderWidth: 4, borderColor: "#181619", padding: 8, height: "100%", borderRadius: 4 }}>
          <View style={{ borderWidth: 1.5, borderColor: "#f95c4b", padding: 20, height: "100%", borderRadius: 2 }}>
            
            {/* Header: Logos & Brand */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.logo ?? logoImg} style={{ width: 48, height: 48 }} />
                <Image src={imageAssets?.vinix ?? vinixImg} style={{ height: 32, width: 78 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 17, color: "#181619", fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 8.5, color: "#f95c4b", fontWeight: 700, letterSpacing: 1.5, marginTop: 1 }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.yrTech ?? yrTechImg} style={{ height: 32, width: 48 }} />
                <Image src={imageAssets?.msme ?? msmeImg} style={{ height: 32, width: 64 }} />
              </View>
            </View>

            {/* Title Block */}
            <View style={{ alignItems: "center", marginTop: 16 }}>
              <Text style={{ fontSize: 34, fontWeight: 700, color: "#181619", letterSpacing: 5 }}>COURSE CERTIFICATE</Text>
              <Text style={{ fontSize: 11, color: "#f95c4b", fontWeight: 700, letterSpacing: 7, marginTop: 3 }}>OF COMPLETION</Text>
              <View style={{ width: 56, height: 2.5, backgroundColor: "#f95c4b", marginTop: 7, borderRadius: 2 }} />
            </View>

            {/* Presentation Citation */}
            <View style={{ alignItems: "center", marginTop: 22 }}>
              <Text style={{ fontSize: 10.5, color: "#64748b", letterSpacing: 0.5 }}>This certificate is awarded to</Text>
              <Text style={{ fontSize: 29, fontWeight: 700, marginTop: 10, marginBottom: 10, color: "#181619", letterSpacing: 0.5 }}>{fullName}</Text>
              <Text style={{ fontSize: 10.5, color: "#334155", textAlign: "center", maxWidth: 620, lineHeight: 1.6 }}>
                for successfully completing the {" "}
                <Text style={{ fontWeight: 700, color: "#f95c4b" }}>{courseName}</Text>{" "}
                course with a score of <Text style={{ fontWeight: 700, color: "#181619" }}>{score}/{total}</Text>,
                demonstrating proficiency and commitment to learning.
              </Text>
            </View>

            {/* QR Code Verification Badge */}
            {qrCodeDataUri && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                <Image src={qrCodeDataUri} style={{ width: 44, height: 44 }} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: 700, color: "#f95c4b" }}>Digitally Verified Credential</Text>
                  <Text style={{ fontSize: 6.8, color: "#64748b" }}>Scan QR or verify at skyrovix.in/verify-certificate</Text>
                </View>
              </View>
            )}

            {/* Signatures & Seal Section */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28 }}>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={s.sigImg} />
                <View style={{ borderTopWidth: 1, borderTopColor: "#181619", width: "100%", marginBottom: 2 }} />
                <Text style={{ ...s.bold, color: "#181619" }}>{COMPANY.founder.name}</Text>
                <Text style={{ ...s.small, color: "#f95c4b", fontWeight: 700 }}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={imageAssets?.seal ?? sealImg} style={{ width: 84, height: 84, opacity: 0.95 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={s.sigImg} />
                <View style={{ borderTopWidth: 1, borderTopColor: "#181619", width: "100%", marginBottom: 2 }} />
                <Text style={{ ...s.bold, color: "#181619" }}>{COMPANY.cofounder.name}</Text>
                <Text style={{ ...s.small, color: "#f95c4b", fontWeight: 700 }}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            {/* Footer Metadata */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14, fontSize: 8, color: "#64748b" }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Certificate ID: <Text style={{ color: "#181619", fontWeight: 700 }}>{certId}</Text></Text>
                <Text>Score: <Text style={{ color: "#f95c4b", fontWeight: 700 }}>{score}/{total}</Text></Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <Text>Issued: <Text style={{ color: "#181619", fontWeight: 700 }}>{formattedDate}</Text></Text>
                <Text>Verify at: <Text style={{ color: "#f95c4b", fontWeight: 700 }}>www.skyrovix.in/verify-certificate</Text></Text>
              </View>
            </View>

          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── ID CARD PDF ───

const idCardS = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#181619",
    position: "relative",
  },
  cardContainer: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  header: {
    backgroundColor: "#181619",
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  lanyardSlot: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#0d0c0e",
    borderWidth: 0.5,
    borderColor: "#2c282e",
    alignSelf: "center",
    marginBottom: 6,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  logoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logo: {
    width: 20,
    height: 20,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 10.5,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    fontSize: 5,
    color: "#ee9590",
    marginTop: 0.5,
  },
  badge: {
    backgroundColor: "#181619",
    borderWidth: 0.75,
    borderColor: "#f95c4b",
    borderRadius: 8,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 5.5,
    fontWeight: 700,
    color: "#f95c4b",
    letterSpacing: 0.8,
  },
  photoSection: {
    alignItems: "center",
    marginTop: -16,
  },
  photoBox: {
    width: 62,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
    backgroundColor: "#faf8f2",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  photoImg: {
    width: 62,
    height: 70,
    objectFit: "cover",
  },
  photoInitialBox: {
    width: "100%",
    height: "100%",
    backgroundColor: "#181619",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInitial: {
    fontSize: 24,
    fontWeight: 700,
    color: "#f95c4b",
  },
  nameBlock: {
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 3,
  },
  name: {
    fontSize: 11,
    fontWeight: 700,
    color: "#181619",
    textAlign: "center",
    textTransform: "uppercase",
  },
  role: {
    fontSize: 6.5,
    fontWeight: 700,
    color: "#f95c4b",
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 1,
  },
  domainBadge: {
    backgroundColor: "#faf8f2",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#f95c4b",
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  domainText: {
    fontSize: 6,
    fontWeight: 700,
    color: "#181619",
    textAlign: "center",
  },
  detailsBlock: {
    marginHorizontal: 12,
    marginTop: 4,
    backgroundColor: "#faf8f2",
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 5,
  },
  detailRow2Col: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  detailCol: {
    flex: 1,
  },
  detailDivider: {
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 3,
    marginTop: 1,
  },
  label: {
    fontSize: 5.5,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 6.8,
    fontWeight: 700,
    color: "#181619",
    marginTop: 0.5,
  },
  barcodeBox: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 2,
  },
  barcodeImg: {
    width: 135,
    height: 18,
    objectFit: "contain",
  },
  barcodeText: {
    fontSize: 6.5,
    fontWeight: 700,
    color: "#475569",
    letterSpacing: 1.8,
    marginTop: 1,
    fontFamily: "Helvetica-Bold",
  },
  securityNotice: {
    fontSize: 4.6,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: 1.2,
    marginTop: 1.5,
    textTransform: "uppercase",
  },
  qrBox: {
    width: 32,
    height: 32,
    alignSelf: "center",
    marginBottom: 1,
  },
  footer: {
    backgroundColor: "#181619",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4.5,
    paddingHorizontal: 12,
  },
  footerLink: {
    fontSize: 6,
    fontWeight: 700,
    color: "#f95c4b",
  },
  footerMotto: {
    fontSize: 5.5,
    fontWeight: 700,
    color: "#ee9590",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

const CODE39_PATTERNS_PDF: Record<string, string> = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
  '$': '100100100101', '/': '100100101001', '+': '100101001001', '%': '100100100100'
};

function generateBarcodeDataUri(text: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const clean = '*' + (text || '').toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '') + '*';
    const bits: boolean[] = [];
    for (const char of clean) {
      const pattern = CODE39_PATTERNS_PDF[char] || CODE39_PATTERNS_PDF['-'];
      for (const bit of pattern) {
        bits.push(bit === '1');
      }
      bits.push(false);
    }
    const canvas = document.createElement("canvas");
    const barWidth = 2;
    const height = 45;
    canvas.width = bits.length * barWidth;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, height);
    ctx.fillStyle = "#061a33";
    bits.forEach((isBar, i) => {
      if (isBar) {
        ctx.fillRect(i * barWidth, 0, barWidth, height);
      }
    });
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

export function IDCardDoc({ fullName, internId, domain, issuedAt, photoUrl, email, validUpto, barcodeDataUri, qrCodeDataUri }: {
  fullName: string; internId: string; domain: string; issuedAt: string; photoUrl?: string | null; email?: string | null; validUpto?: string | null; barcodeDataUri?: string; qrCodeDataUri?: string;
}) {
  const computeValidUpto = () => {
    if (validUpto) return validUpto;
    const issueDate = new Date(issuedAt || Date.now());
    const year = isNaN(issueDate.getFullYear()) ? new Date().getFullYear() : issueDate.getFullYear();
    return `31 Dec ${year}`;
  };

  const validUntilStr = computeValidUpto();

  return (
    <Document>
      <Page size={[230, 360]} style={idCardS.page}>
        <View style={idCardS.cardContainer}>
          
          {/* 1. Executive Dark Navy Header */}
          <View style={idCardS.header}>
            <View style={idCardS.lanyardSlot} />
            <View style={idCardS.logoRow}>
              <View style={idCardS.logoBox}>
                <Image style={idCardS.logo} src={logoImg} />
                <View>
                  <Text style={idCardS.brandName}>SKYROVIX</Text>
                  <Text style={idCardS.brandSubtitle}>Skill Development & Future Tech</Text>
                </View>
              </View>
              <View style={idCardS.badge}>
                <Text style={idCardS.badgeText}>INTERN</Text>
              </View>
            </View>
          </View>

          {/* 2. Photo Section */}
          <View style={idCardS.photoSection}>
            <View style={idCardS.photoBox}>
              {photoUrl ? (
                <Image style={idCardS.photoImg} src={photoUrl} />
              ) : (
                <View style={idCardS.photoInitialBox}>
                  <Text style={idCardS.photoInitial}>{fullName ? fullName.charAt(0).toUpperCase() : "I"}</Text>
                </View>
              )}
            </View>
          </View>

          {/* 3. Name & Role Section */}
          <View style={idCardS.nameBlock}>
            <Text style={idCardS.name}>{fullName}</Text>
            <Text style={idCardS.role}>Virtual Intern</Text>
            <View style={idCardS.domainBadge}>
              <Text style={idCardS.domainText}>{domain}</Text>
            </View>
          </View>

          {/* 4. Details Table Grid */}
          <View style={idCardS.detailsBlock}>
            <View style={idCardS.detailRow2Col}>
              <View style={idCardS.detailCol}>
                <Text style={idCardS.label}>Intern ID</Text>
                <Text style={idCardS.value}>{internId}</Text>
              </View>
              <View style={idCardS.detailCol}>
                <Text style={idCardS.label}>Valid Thru</Text>
                <Text style={idCardS.value}>{validUntilStr}</Text>
              </View>
            </View>
            <View style={idCardS.detailDivider}>
              <Text style={idCardS.label}>Email Address</Text>
              <Text style={idCardS.value}>{email || "N/A"}</Text>
            </View>
          </View>

          {/* 5. Barcode / QR Code Section */}
          <View style={idCardS.barcodeBox}>
            {barcodeDataUri ? (
              <Image style={idCardS.barcodeImg} src={barcodeDataUri} />
            ) : (
              qrCodeDataUri ? <Image style={idCardS.qrBox} src={qrCodeDataUri} /> : null
            )}
            <Text style={idCardS.barcodeText}>{internId}</Text>
            <Text style={idCardS.securityNotice}>OFFICIAL AUTHENTICATED CREDENTIAL</Text>
          </View>

          {/* 6. Corporate Dark Navy Footer */}
          <View style={idCardS.footer}>
            <Text style={idCardS.footerLink}>skyrovix.online</Text>
            <Text style={idCardS.footerMotto}>Empower · Innovate</Text>
          </View>

        </View>
      </Page>
    </Document>
  );
}

export async function downloadIDCard(params: {
  fullName: string; internId: string; domain: string; issuedAt: string; photoUrl?: string | null; email?: string | null; validUpto?: string | null;
}) {
  const verifyUrl = `${getPublicSiteUrl()}/verify?id=${encodeURIComponent(params.internId.trim())}`;
  let qrDataUri: string | undefined;
  let barcodeDataUri: string | undefined;
  try {
    qrDataUri = await QRCode.toDataURL(verifyUrl, { width: 160, margin: 1 });
    barcodeDataUri = generateBarcodeDataUri(params.internId);
  } catch { /* proceed */ }
  await downloadPdf(
    <IDCardDoc {...params} qrCodeDataUri={qrDataUri} barcodeDataUri={barcodeDataUri} />,
    `IDCard_${params.internId}.pdf`
  );
}

export async function downloadPdf(doc: ReactElement<DocumentProps>, filename: string) {
  try {
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error("Failed to generate/download PDF:", error);
    if (typeof window !== "undefined") {
      alert("Could not generate the PDF file. Please check if your browser blocks downloads, or try again.");
    }
  }
}

export async function downloadPdfBlob(doc: ReactElement<DocumentProps>): Promise<Blob> {
  return pdf(doc).toBlob();
}
