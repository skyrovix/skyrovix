import { Document, Page, Text, View, StyleSheet, Image, pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import { EMAIL_ASSETS } from "@/lib/email-assets";

const logoImg = EMAIL_ASSETS?.logo || "";
const sealImg = EMAIL_ASSETS?.seal || "";
const msmeImg = EMAIL_ASSETS?.msme || "";
const sigFounderImg = EMAIL_ASSETS?.sigFounder || "";
const sigCofounderImg = EMAIL_ASSETS?.sigCofounder || "";
const yrTechImg = EMAIL_ASSETS?.yrTech || "";
const vinixImg = EMAIL_ASSETS?.vinix || "";

const BRAND = {
  black: "#181619",
  coral: "#f95c4b",
  coralDark: "#d94b3b",
  gold: "#b45309",
  goldLight: "#d97706",
  ink: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  bgCream: "#faf8f2",
  white: "#ffffff",
};

export type AdvancedDocType =
  | "lor"
  | "experience_letter"
  | "project_certificate"
  | "evaluation_report"
  | "appreciation_certificate"
  | "skill_certificate";

export interface AdvancedDocMetadata {
  projectTitle?: string;
  projectDescription?: string;
  technologies?: string[];
  skillsDemonstrated?: string[];
  mentorRemarks?: string;
  finalRating?: string;
  codeQuality?: number;
  technicalSkills?: number;
  problemSolving?: number;
  teamwork?: number;
  projectPerformance?: number;
  appreciationReason?: string;
  skillName?: string;
  assessmentScore?: number | string;
  startDate?: string;
  completionDate?: string;
}

export interface AdvancedDocData {
  documentId: string;
  documentType: AdvancedDocType;
  fullName: string;
  internId: string;
  domain: string;
  domainName: string;
  planType: "standard" | "premium";
  durationMonths: number;
  issuedAt: string;
  verifyUrl: string;
  qrCodeDataUri?: string;
  metadata?: AdvancedDocMetadata;
}

// --------------------------------------------------------------------------
// SHARED STYLES
// --------------------------------------------------------------------------
const pStyles = StyleSheet.create({
  pagePortrait: {
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 28,
    fontSize: 8.5,
    color: BRAND.ink,
    fontFamily: "Helvetica",
    position: "relative",
    backgroundColor: BRAND.white,
  },
  pageLandscape: {
    padding: 22,
    fontSize: 9,
    color: BRAND.ink,
    fontFamily: "Helvetica",
    position: "relative",
    backgroundColor: BRAND.bgCream,
  },
  frameOuter: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderWidth: 1.2,
    borderColor: BRAND.black,
    borderRadius: 4,
  },
  frameInner: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 0.5,
    borderColor: BRAND.coral,
    opacity: 0.35,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: BRAND.coral,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandLogo: {
    width: 44,
    height: 44,
    objectFit: "contain",
  },
  headerDivider: {
    width: 1,
    height: 38,
    backgroundColor: BRAND.border,
    marginHorizontal: 8,
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: BRAND.black,
    letterSpacing: 1.2,
  },
  brandTagline: {
    fontSize: 6.8,
    color: BRAND.coral,
    fontWeight: 700,
    marginTop: 1,
  },
  brandMeta: {
    fontSize: 6.2,
    color: BRAND.muted,
    marginTop: 1.5,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  refLabel: {
    fontSize: 6,
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 1,
  },
  refValue: {
    fontSize: 8.5,
    fontWeight: 700,
    color: BRAND.coral,
    fontFamily: "Helvetica-Bold",
  },
  dateLabel: {
    fontSize: 6,
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 1,
  },
  dateValue: {
    fontSize: 8,
    color: BRAND.slate,
    fontWeight: 700,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: BRAND.black,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 6,
    marginBottom: 4,
  },
  titleUnderline: {
    width: 140,
    height: 1.5,
    backgroundColor: BRAND.coral,
    alignSelf: "center",
    marginBottom: 12,
  },
  recipientBox: {
    backgroundColor: BRAND.bgCream,
    borderWidth: 0.5,
    borderColor: BRAND.border,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipientLabel: {
    fontSize: 6.5,
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  recipientName: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND.black,
  },
  recipientDetail: {
    fontSize: 7.5,
    color: BRAND.slate,
    marginTop: 1.5,
  },
  paragraph: {
    fontSize: 8.2,
    color: BRAND.slate,
    lineHeight: 1.5,
    marginBottom: 7,
    textAlign: "justify",
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
  },
  sigBlock: {
    width: "25%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sigImg: {
    height: 28,
    maxHeight: 28,
    objectFit: "contain",
    marginBottom: 2,
  },
  sigLine: {
    borderTopWidth: 0.8,
    borderTopColor: "#94a3b8",
    width: 80,
    alignSelf: "center",
    marginBottom: 3,
    marginTop: 2,
  },
  sigName: {
    fontSize: 8,
    fontWeight: 700,
    color: BRAND.black,
    textAlign: "center",
  },
  sigTitle: {
    fontSize: 6.5,
    color: BRAND.coral,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 1,
  },
  sealBlock: {
    width: "25%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  sealImg: {
    width: 36,
    height: 36,
    objectFit: "contain",
  },
  qrBlock: {
    width: "25%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  qrImg: {
    width: 34,
    height: 34,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
    paddingTop: 4,
  },
  sigRowPortrait: {
    position: "absolute",
    bottom: 38,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
  },
  footerPortrait: {
    position: "absolute",
    bottom: 18,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
    paddingTop: 3.5,
  },
  footerText: {
    fontSize: 6.2,
    color: BRAND.muted,
  },
});

// --------------------------------------------------------------------------
// 1. LETTER OF RECOMMENDATION (LOR)
// --------------------------------------------------------------------------
export function LorDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    durationMonths,
    issuedAt,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const projectTitle = metadata?.projectTitle || "Enterprise Cloud Platform with Scalable Microservices";
  const mentorRemarks =
    metadata?.mentorRemarks ||
    "Candidate has demonstrated exceptional commitment, clean architecture delivery, and robust system design throughout their internship tenure.";

  return (
    <Document>
      <Page size="A4" style={pStyles.pagePortrait}>
        <View style={pStyles.frameOuter} />
        <View style={pStyles.frameInner} />

        {/* Corporate Header */}
        <View style={pStyles.header}>
          <View style={pStyles.headerLeft}>
            <Image src={logoImg} style={pStyles.brandLogo} />
            <View style={pStyles.headerDivider} />
            <View>
              <Text style={pStyles.brandName}>SKYROVIX</Text>
              <Text style={pStyles.brandTagline}>Skill Development & Future Tech Innovations</Text>
              <Text style={pStyles.brandMeta}>MSME UDYAM-TN-17-0076606 | www.skyrovix.in</Text>
            </View>
          </View>
          <View style={pStyles.headerRight}>
            <Text style={pStyles.refLabel}>DOCUMENT REF</Text>
            <Text style={pStyles.refValue}>{documentId}</Text>
            <Text style={pStyles.dateLabel}>DATE OF ISSUANCE</Text>
            <Text style={pStyles.dateValue}>{dateStr}</Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={pStyles.title}>LETTER OF RECOMMENDATION</Text>
        <View style={pStyles.titleUnderline} />

        {/* Addressed To */}
        <Text style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.black, marginBottom: 5 }}>
          TO WHOM IT MAY CONCERN
        </Text>

        {/* Candidate Summary Box */}
        <View style={pStyles.recipientBox}>
          <View>
            <Text style={pStyles.recipientLabel}>Candidate Information</Text>
            <Text style={pStyles.recipientName}>{fullName}</Text>
            <Text style={pStyles.recipientDetail}>
              Internship Domain: <Text style={{ fontWeight: 700, color: BRAND.black }}>{domainName}</Text> ({durationMonths} Month{durationMonths > 1 ? "s" : ""})
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pStyles.recipientLabel}>INTERNSHIP ID</Text>
            <Text style={{ fontSize: 10, fontWeight: 700, color: BRAND.coral, fontFamily: "Helvetica-Bold" }}>
              {internId}
            </Text>
            <Text style={pStyles.recipientDetail}>Track: Premium Verified Scholar</Text>
          </View>
        </View>

        {/* Body Paragraphs */}
        <Text style={pStyles.paragraph}>
          It is with immense pleasure and high professional regard that I formally write this Letter of Recommendation for{" "}
          <Text style={{ fontWeight: 700, color: BRAND.black }}>{fullName}</Text>, who has successfully completed a rigorous, hands-on virtual internship in{" "}
          <Text style={{ fontWeight: 700, color: BRAND.black }}>{domainName}</Text> at Skyrovix IT Solutions.
        </Text>

        <Text style={pStyles.paragraph}>
          Throughout the {durationMonths}-month intensive tenure, {fullName} exhibited exemplary technical competence, analytical acumen, and an exceptional dedication to engineering standards. The candidate spearheaded end-to-end full stack architecture implementations, robust API microservices, database schemas, and dynamic user interfaces with clean modular code and thorough unit validation.
        </Text>

        {/* Verified Capstone Project & Engineering Contributions Card */}
        <View style={{ backgroundColor: BRAND.bgCream, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 9, marginBottom: 7 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3.5, borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingBottom: 2.5 }}>
            <Text style={{ fontSize: 6.8, fontWeight: 700, color: BRAND.coral, textTransform: "uppercase" }}>
              Verified Capstone Project & Engineering Contributions
            </Text>
            <Text style={{ fontSize: 6.8, fontWeight: 700, color: "#16a34a" }}>
              Status: Verified & Approved
            </Text>
          </View>
          <Text style={{ fontSize: 8, fontWeight: 700, color: BRAND.black, marginBottom: 3 }}>
            Project: <Text style={{ color: BRAND.coral }}>"{projectTitle}"</Text>
          </Text>
          <View style={{ paddingLeft: 4 }}>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Full-Stack System Architecture:</Text> Engineered responsive components, state management pipelines, and decoupled API controllers.
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>API Microservices & Security:</Text> Implemented secure RESTful endpoints, token authentication, and data validation layers.
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Database Design & Integrity:</Text> Modeled relational schemas, structured query indexes, and ensured strict data persistence.
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Quality Assurance & Delivery:</Text> Maintained Git version control, peer review standards, and automated deployment checks.
              </Text>
            </View>
          </View>
        </View>

        <Text style={pStyles.paragraph}>
          Beyond technical capabilities, {fullName} demonstrated exemplary professionalism, punctuality, and proactive communication. The candidate consistently incorporated constructive code review feedback, solved complex architectural challenges with autonomy, and collaborated harmoniously with mentors and peers.
        </Text>

        {/* Mentor Assessment & Endorsement Box */}
        <View style={{ backgroundColor: BRAND.bgCream, borderWidth: 0.5, borderColor: BRAND.border, borderLeftWidth: 3, borderLeftColor: BRAND.coral, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 8, marginBottom: 6 }}>
          <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.coral, textTransform: "uppercase", marginBottom: 1.5 }}>
            Mentor & Supervisory Board Assessment
          </Text>
          <Text style={{ fontSize: 7.6, color: BRAND.black, fontStyle: "italic", lineHeight: 1.35 }}>
            "{mentorRemarks}"
          </Text>
          <Text style={{ fontSize: 7.2, color: BRAND.slate, marginTop: 2 }}>
            Skyrovix strongly endorses {fullName} for prospective software engineering roles, technical responsibilities, or advanced postgraduate academic programs with highest distinction.
          </Text>
        </View>

        <Text style={{ fontSize: 7.2, color: BRAND.muted, marginBottom: 6 }}>
          For official verification of credentials or employer inquiries, please contact our Credentials Board at <Text style={{ color: BRAND.coral, fontWeight: 700 }}>contact@skyrovix.in</Text> or verify online via the QR code below.
        </Text>

        {/* Signatures & Seal (Anchored cleanly above footer) */}
        <View style={pStyles.sigRowPortrait}>
          <View style={pStyles.sigBlock}>
            <Image src={sigFounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Hariharan S</Text>
            <Text style={pStyles.sigTitle}>Founder & CEO, Skyrovix</Text>
          </View>

          <View style={pStyles.sealBlock}>
            <Image src={sealImg} style={pStyles.sealImg} />
            <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
            <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
              Official Verified Seal
            </Text>
            <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
          </View>

          {qrCodeDataUri ? (
            <View style={pStyles.qrBlock}>
              <Image src={qrCodeDataUri} style={pStyles.qrImg} />
              <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
                Scan to Verify
              </Text>
              <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
            </View>
          ) : (
            <View style={pStyles.qrBlock} />
          )}

          <View style={pStyles.sigBlock}>
            <Image src={sigCofounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Maheshwaran S</Text>
            <Text style={pStyles.sigTitle}>Co-Founder, Skyrovix</Text>
          </View>
        </View>

        {/* Footer (Anchored at page bottom) */}
        <View style={pStyles.footerPortrait}>
          <Text style={pStyles.footerText}>
            A digitally verifiable document issued by Skyrovix IT Solutions (MSME Registered, Govt. of India).
          </Text>
          <Text style={pStyles.footerText}>
            Verify online: {props.verifyUrl}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// 2. EXPERIENCE LETTER
// --------------------------------------------------------------------------
export function ExperienceLetterDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    durationMonths,
    issuedAt,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const startDateStr = metadata?.startDate
    ? new Date(metadata.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : dateStr;

  const completionDateStr = metadata?.completionDate
    ? new Date(metadata.completionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : dateStr;

  return (
    <Document>
      <Page size="A4" style={pStyles.pagePortrait}>
        <View style={pStyles.frameOuter} />
        <View style={pStyles.frameInner} />

        {/* Header */}
        <View style={pStyles.header}>
          <View style={pStyles.headerLeft}>
            <Image src={logoImg} style={pStyles.brandLogo} />
            <View style={pStyles.headerDivider} />
            <View>
              <Text style={pStyles.brandName}>SKYROVIX</Text>
              <Text style={pStyles.brandTagline}>Skill Development & Future Tech Innovations</Text>
              <Text style={pStyles.brandMeta}>MSME UDYAM-TN-17-0076606 | Chennai, India</Text>
            </View>
          </View>
          <View style={pStyles.headerRight}>
            <Text style={pStyles.refLabel}>EXPERIENCE CERT REF</Text>
            <Text style={pStyles.refValue}>{documentId}</Text>
            <Text style={pStyles.dateLabel}>ISSUANCE DATE</Text>
            <Text style={pStyles.dateValue}>{dateStr}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={pStyles.title}>INTERNSHIP EXPERIENCE & RELIEVING LETTER</Text>
        <View style={pStyles.titleUnderline} />

        {/* Candidate Info Box */}
        <View style={pStyles.recipientBox}>
          <View>
            <Text style={pStyles.recipientLabel}>Intern Details</Text>
            <Text style={pStyles.recipientName}>{fullName}</Text>
            <Text style={pStyles.recipientDetail}>Designation: Software Development Intern ({domainName})</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pStyles.recipientLabel}>Intern ID</Text>
            <Text style={{ fontSize: 9, fontWeight: 700, color: BRAND.coral, fontFamily: "Helvetica-Bold" }}>
              {internId}
            </Text>
            <Text style={pStyles.recipientDetail}>Tenure: {durationMonths} Month{durationMonths > 1 ? "s" : ""}</Text>
          </View>
        </View>

        {/* Body */}
        <Text style={pStyles.paragraph}>
          This is to certify that <Text style={{ fontWeight: 700, color: BRAND.black }}>{fullName}</Text> (Intern ID: <Text style={{ fontWeight: 700 }}>{internId}</Text>) has successfully served as a <Text style={{ fontWeight: 700, color: BRAND.black }}>{domainName} Intern</Text> at Skyrovix IT Solutions from <Text style={{ fontWeight: 700 }}>{startDateStr}</Text> to <Text style={{ fontWeight: 700 }}>{completionDateStr}</Text>.
        </Text>

        <Text style={pStyles.paragraph}>
          During this tenure, {fullName} actively contributed to the full lifecycle of software development sprints, demonstrating hands-on proficiency in the following core engineering responsibilities:
        </Text>

        {/* Responsibilities list card */}
        <View style={{ backgroundColor: BRAND.bgCream, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 9, marginBottom: 7 }}>
          <Text style={{ fontSize: 6.8, fontWeight: 700, color: BRAND.coral, textTransform: "uppercase", marginBottom: 3, borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingBottom: 2 }}>
            Verified Technical Responsibilities & Deliverables
          </Text>
          <View style={{ paddingLeft: 4 }}>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Architecture & Design:</Text> Engineered responsive web application components, component state pipelines, and scalable relational schemas.
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>API Integration & Microservices:</Text> Built, debugged, and documented secure RESTful endpoints, data validation layers, and API handlers.
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Quality Assurance & Delivery:</Text> Maintained high code quality through unit testing, Git version control, and automated deployment checks.
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ width: 10, color: BRAND.coral, fontWeight: 700, fontSize: 7.5 }}>•</Text>
              <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate, lineHeight: 1.35 }}>
                <Text style={{ fontWeight: 700, color: BRAND.black }}>Collaborative Problem Solving:</Text> Participated in peer code reviews, sprint task retrospectives, and technical mentoring feedback loops.
              </Text>
            </View>
          </View>
        </View>

        {/* Deliverables & Evaluation Badge Bar */}
        <View style={{ backgroundColor: BRAND.white, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 3, paddingVertical: 4, paddingHorizontal: 8, marginBottom: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 7, color: BRAND.muted }}>TASK COMPLETION: <Text style={{ fontWeight: 700, color: "#16a34a" }}>100% (Approved)</Text></Text>
          <Text style={{ fontSize: 7, color: BRAND.muted }}>EVALUATION: <Text style={{ fontWeight: 700, color: BRAND.coral }}>High-Performer (Grade A+)</Text></Text>
          <Text style={{ fontSize: 7, color: BRAND.muted }}>STATUS: <Text style={{ fontWeight: 700, color: BRAND.black }}>Relieved in Good Standing</Text></Text>
        </View>

        <Text style={pStyles.paragraph}>
          {fullName} has demonstrated commendable discipline, technical curiosity, and an admirable work ethic throughout the internship. The candidate's contributions have adhered strictly to industry-standard software engineering best practices.
        </Text>

        <Text style={pStyles.paragraph}>
          {fullName} stands relieved of their internship duties effective {completionDateStr} following full verification and approval of all assigned deliverables. We wish them every success in all future professional and academic pursuits.
        </Text>

        <Text style={{ fontSize: 7.2, color: BRAND.muted, marginBottom: 6 }}>
          Official institutional experience credential verifiable at <Text style={{ color: BRAND.coral, fontWeight: 700 }}>skyrovix.in</Text> or via the authorized cryptographic QR code below.
        </Text>

        {/* Signatures & Seal */}
        <View style={pStyles.sigRowPortrait}>
          <View style={pStyles.sigBlock}>
            <Image src={sigFounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Hariharan S</Text>
            <Text style={pStyles.sigTitle}>Founder & CEO, Skyrovix</Text>
          </View>

          <View style={pStyles.sealBlock}>
            <Image src={sealImg} style={pStyles.sealImg} />
            <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
            <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
              Official Verified Seal
            </Text>
            <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
          </View>

          {qrCodeDataUri ? (
            <View style={pStyles.qrBlock}>
              <Image src={qrCodeDataUri} style={pStyles.qrImg} />
              <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
                Scan to Verify
              </Text>
              <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
            </View>
          ) : (
            <View style={pStyles.qrBlock} />
          )}

          <View style={pStyles.sigBlock}>
            <Image src={sigCofounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Maheshwaran S</Text>
            <Text style={pStyles.sigTitle}>Co-Founder, Skyrovix</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pStyles.footerPortrait}>
          <Text style={pStyles.footerText}>
            Official Skyrovix IT Solutions Experience Record • UDYAM-TN-17-0076606
          </Text>
          <Text style={pStyles.footerText}>
            Portal: {props.verifyUrl}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// 3. PROJECT COMPLETION CERTIFICATE
// --------------------------------------------------------------------------
export function ProjectCertificateDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    issuedAt,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const projectTitle = metadata?.projectTitle || "Enterprise Cloud Web Application with Microservices";
  const technologies = metadata?.technologies || ["React / Angular", "Node.js", "Express", "MongoDB / MySQL", "REST APIs", "Tailwind CSS"];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pStyles.pageLandscape}>
        {/* Regal Border */}
        <View style={{ borderWidth: 2.5, borderColor: BRAND.gold, padding: 6, height: "100%", borderRadius: 6 }}>
          <View style={{ borderWidth: 0.8, borderColor: BRAND.coral, padding: 14, height: "100%", borderRadius: 4, justifyContent: "space-between" }}>
            
            {/* Header: Partner & Govt Logos */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Image src={logoImg} style={{ width: 40, height: 40, objectFit: "contain" }} />
                <Image src={vinixImg} style={{ height: 24, width: 60, objectFit: "contain" }} />
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, color: BRAND.gold, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 7, color: BRAND.slate, fontWeight: 700, letterSpacing: 1.2, marginTop: 1.5 }}>
                  Skill Development & Future Tech Innovations • MSME Certified
                </Text>
                <Text style={{ fontSize: 6.5, color: BRAND.gold, letterSpacing: 0.8, marginTop: 1 }}>
                  UDYAM-TN-17-0076606 • Ministry of MSME, Govt. of India
                </Text>
              </View>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <Image src={yrTechImg} style={{ height: 24, width: 40, objectFit: "contain" }} />
                <Image src={msmeImg} style={{ height: 28, width: 56, objectFit: "contain" }} />
              </View>
            </View>

            {/* Certificate Title */}
            <View style={{ alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: BRAND.black, letterSpacing: 3 }}>
                PROJECT COMPLETION CERTIFICATE
              </Text>
              <Text style={{ fontSize: 8.5, color: BRAND.coral, fontWeight: 700, letterSpacing: 3, marginTop: 2 }}>
                CAPSTONE ENGINEERING & PRODUCTION DEPLOYMENT
              </Text>
            </View>

            {/* Award Line */}
            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Text style={{ fontSize: 8.5, color: BRAND.muted }}>This is proudly presented to</Text>
              <Text style={{ fontSize: 20, fontWeight: 700, color: BRAND.black, letterSpacing: 1, marginTop: 3, borderBottomWidth: 1.5, borderBottomColor: BRAND.coral, paddingBottom: 2 }}>
                {fullName}
              </Text>
              <Text style={{ fontSize: 8, color: BRAND.slate, marginTop: 6, textAlign: "center", maxWidth: 540, lineHeight: 1.45 }}>
                for outstanding execution, technical rigor, and successful live deployment of the capstone project in the domain of{" "}
                <Text style={{ fontWeight: 700, color: BRAND.black }}>{domainName}</Text>.
              </Text>
            </View>

            {/* Project Box */}
            <View style={{ backgroundColor: BRAND.white, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 12, marginHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 6.5, color: BRAND.muted, textTransform: "uppercase" }}>Capstone Project Title</Text>
                <Text style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.coral, marginTop: 1 }}>{projectTitle}</Text>
                <Text style={{ fontSize: 7, color: BRAND.slate, marginTop: 2 }}>
                  Tech Stack: {technologies.join(" • ")}
                </Text>
              </View>
              <View style={{ borderLeftWidth: 0.6, borderLeftColor: BRAND.border, paddingLeft: 10, alignItems: "flex-end" }}>
                <Text style={{ fontSize: 6.5, color: BRAND.muted }}>EVALUATION STATUS</Text>
                <Text style={{ fontSize: 8.5, fontWeight: 700, color: "#16a34a", marginTop: 1 }}>Verified & Approved</Text>
                <Text style={{ fontSize: 7, color: BRAND.muted, marginTop: 1 }}>Grade: A+ (Outstanding)</Text>
              </View>
            </View>

            {/* Metadata Badges */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 14, marginVertical: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>DOC ID:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.coral }}>{documentId}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>INTERN ID:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>{internId}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>DATE ISSUED:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>{dateStr}</Text>
              </View>
            </View>

            {/* Bottom Row: Signatures + Seals */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16 }}>
              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigFounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Hariharan S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Founder & CEO</Text>
              </View>

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sealImg} style={{ width: 34, height: 34, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.gold }}>Official Verified Seal</Text>
                <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
              </View>

              {qrCodeDataUri ? (
                <View style={{ alignItems: "center", width: 110 }}>
                  <Image src={qrCodeDataUri} style={{ width: 32, height: 32, objectFit: "contain", marginBottom: 2 }} />
                  <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                  <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted }}>Scan to verify</Text>
                  <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
                </View>
              ) : (
                <View style={{ width: 110 }} />
              )}

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigCofounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Maheshwaran S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Co-Founder</Text>
              </View>
            </View>

            {/* Bottom URL */}
            <Text style={{ fontSize: 6, color: BRAND.muted, textAlign: "center" }}>
              Official verification portal: {props.verifyUrl} • Skyrovix IT Solutions
            </Text>

          </View>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// 4. PERFORMANCE EVALUATION REPORT
// --------------------------------------------------------------------------
export function PerformanceReportDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    durationMonths,
    issuedAt,
    planType,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const codeQuality = metadata?.codeQuality ?? 9.5;
  const technicalSkills = metadata?.technicalSkills ?? 9.7;
  const problemSolving = metadata?.problemSolving ?? 9.6;
  const teamwork = metadata?.teamwork ?? 9.5;
  const projectPerformance = metadata?.projectPerformance ?? 9.8;
  const finalRating = metadata?.finalRating || "A+ (Outstanding)";
  const mentorRemarks = metadata?.mentorRemarks || "The student exhibited exceptional technical problem-solving capabilities, adherence to clean architectural principles, and timely submission of all structured milestones.";

  return (
    <Document>
      <Page size="A4" style={pStyles.pagePortrait}>
        <View style={pStyles.frameOuter} />
        <View style={pStyles.frameInner} />

        {/* Header */}
        <View style={pStyles.header}>
          <View style={pStyles.headerLeft}>
            <Image src={logoImg} style={pStyles.brandLogo} />
            <View style={pStyles.headerDivider} />
            <View>
              <Text style={pStyles.brandName}>SKYROVIX</Text>
              <Text style={pStyles.brandTagline}>Engineering & Academic Assessment Division</Text>
              <Text style={pStyles.brandMeta}>MSME UDYAM-TN-17-0076606</Text>
            </View>
          </View>
          <View style={pStyles.headerRight}>
            <Text style={pStyles.refLabel}>REPORT REF</Text>
            <Text style={pStyles.refValue}>{documentId}</Text>
            <Text style={pStyles.dateLabel}>EVALUATION DATE</Text>
            <Text style={pStyles.dateValue}>{dateStr}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={pStyles.title}>PERFORMANCE EVALUATION REPORT</Text>
        <View style={pStyles.titleUnderline} />

        {/* Student Metadata Card */}
        <View style={pStyles.recipientBox}>
          <View>
            <Text style={pStyles.recipientLabel}>Candidate Information</Text>
            <Text style={pStyles.recipientName}>{fullName}</Text>
            <Text style={pStyles.recipientDetail}>Domain: {domainName}</Text>
            <Text style={pStyles.recipientDetail}>Duration: {durationMonths} Month{durationMonths > 1 ? "s" : ""}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pStyles.recipientLabel}>Internship Reference</Text>
            <Text style={{ fontSize: 9, fontWeight: 700, color: BRAND.coral, fontFamily: "Helvetica-Bold" }}>
              {internId}
            </Text>
            <Text style={pStyles.recipientDetail}>Track: {planType === "premium" ? "Premium Track" : "Standard Track"}</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>
              Task Completion: 100% (All Tasks Approved)
            </Text>
          </View>
        </View>

        {/* Performance Metrics Table */}
        <Text style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.black, marginBottom: 5 }}>
          1. Quantitative Competency Metrics
        </Text>

        <View style={{ borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
          {/* Table Header */}
          <View style={{ flexDirection: "row", backgroundColor: BRAND.black, paddingVertical: 4, paddingHorizontal: 8 }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.white }}>Evaluation Category</Text>
            <Text style={{ flex: 1, fontSize: 7.5, fontWeight: 700, color: BRAND.white }}>Performance Indicators</Text>
            <Text style={{ width: 70, fontSize: 7.5, fontWeight: 700, color: BRAND.white, textAlign: "right" }}>Score (10)</Text>
          </View>

          {/* Table Rows */}
          <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: BRAND.white }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Code Quality & Architecture</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate }}>Clean modular structure, naming conventions, DRY & SOLID adherence</Text>
            <Text style={{ width: 70, fontSize: 8, fontWeight: 700, color: BRAND.coral, textAlign: "right" }}>{codeQuality} / 10</Text>
          </View>

          <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: BRAND.bgCream }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Technical Skill Mastery</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate }}>Frontend/backend mastery, RESTful APIs, database schema modeling</Text>
            <Text style={{ width: 70, fontSize: 8, fontWeight: 700, color: BRAND.coral, textAlign: "right" }}>{technicalSkills} / 10</Text>
          </View>

          <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: BRAND.white }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Problem-Solving & Debugging</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate }}>Algorithm efficiency, error handling, proactive troubleshooting</Text>
            <Text style={{ width: 70, fontSize: 8, fontWeight: 700, color: BRAND.coral, textAlign: "right" }}>{problemSolving} / 10</Text>
          </View>

          <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BRAND.border, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: BRAND.bgCream }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Project Execution & Capstone</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate }}>Full stack features, deployment readiness, UI/UX polish</Text>
            <Text style={{ width: 70, fontSize: 8, fontWeight: 700, color: BRAND.coral, textAlign: "right" }}>{projectPerformance} / 10</Text>
          </View>

          <View style={{ flexDirection: "row", paddingVertical: 4, paddingHorizontal: 8, backgroundColor: BRAND.white }}>
            <Text style={{ width: 140, fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Communication & Teamwork</Text>
            <Text style={{ flex: 1, fontSize: 7.5, color: BRAND.slate }}>Sprint progress reporting, peer collaboration, mentor responsiveness</Text>
            <Text style={{ width: 70, fontSize: 8, fontWeight: 700, color: BRAND.coral, textAlign: "right" }}>{teamwork} / 10</Text>
          </View>
        </View>

        {/* Final Cumulative Rating Callout */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: BRAND.bgCream, borderWidth: 1, borderColor: BRAND.coral, borderRadius: 4, padding: 8, marginBottom: 10 }}>
          <View>
            <Text style={{ fontSize: 6.8, color: BRAND.muted, textTransform: "uppercase" }}>FINAL CUMULATIVE RATING</Text>
            <Text style={{ fontSize: 13, fontWeight: 700, color: BRAND.coral, marginTop: 1 }}>{finalRating}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 6.8, color: BRAND.muted }}>CLASSIFICATION</Text>
            <Text style={{ fontSize: 10, fontWeight: 700, color: BRAND.black }}>High-Performance Scholar</Text>
          </View>
        </View>

        {/* Qualitative Feedback */}
        <Text style={{ fontSize: 9.5, fontWeight: 700, color: BRAND.black, marginBottom: 4 }}>
          2. Mentor & Technical Supervisor Feedback
        </Text>
        <View style={{ backgroundColor: BRAND.white, borderWidth: 0.5, borderColor: BRAND.border, borderRadius: 4, padding: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 8, color: BRAND.slate, lineHeight: 1.45, fontStyle: "italic" }}>
            "{mentorRemarks}"
          </Text>
        </View>

        {/* Verification Note */}
        <Text style={pStyles.paragraph}>
          This Performance Evaluation Report has been compiled by the Skyrovix Technical Assessment Board following exhaustive automated code verification and manual mentor sign-off on all task submissions.
        </Text>

        {/* Signatures & Seal */}
        <View style={pStyles.sigRowPortrait}>
          <View style={pStyles.sigBlock}>
            <Image src={sigFounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Hariharan S</Text>
            <Text style={pStyles.sigTitle}>Founder & CEO, Skyrovix</Text>
          </View>

          <View style={pStyles.sealBlock}>
            <Image src={sealImg} style={pStyles.sealImg} />
            <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
            <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
              Official Assessment Seal
            </Text>
            <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
          </View>

          {qrCodeDataUri ? (
            <View style={pStyles.qrBlock}>
              <Image src={qrCodeDataUri} style={pStyles.qrImg} />
              <View style={{ width: 80, height: 0.8, marginTop: 2, marginBottom: 3 }} />
              <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted, textAlign: "center" }}>
                Scan to Verify
              </Text>
              <Text style={{ fontSize: 6.5, color: "transparent", marginTop: 1 }}>.</Text>
            </View>
          ) : (
            <View style={pStyles.qrBlock} />
          )}

          <View style={pStyles.sigBlock}>
            <Image src={sigCofounderImg} style={pStyles.sigImg} />
            <View style={pStyles.sigLine} />
            <Text style={pStyles.sigName}>Maheshwaran S</Text>
            <Text style={pStyles.sigTitle}>Co-Founder & Technical Lead</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pStyles.footerPortrait}>
          <Text style={pStyles.footerText}>
            Confidential Academic & Performance Record • Skyrovix IT Solutions (MSME Certified)
          </Text>
          <Text style={pStyles.footerText}>
            Online Verification: {props.verifyUrl}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// 5. APPRECIATION CERTIFICATE
// --------------------------------------------------------------------------
export function AppreciationCertificateDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    issuedAt,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const reason = metadata?.appreciationReason || "demonstrating remarkable technical innovation, outstanding problem-solving capability, and exemplary commitment during the virtual internship program.";

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pStyles.pageLandscape}>
        <View style={{ borderWidth: 2.5, borderColor: BRAND.coral, padding: 6, height: "100%", borderRadius: 6 }}>
          <View style={{ borderWidth: 0.8, borderColor: BRAND.gold, padding: 16, height: "100%", borderRadius: 4, justifyContent: "space-between" }}>
            
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Image src={logoImg} style={{ width: 40, height: 40, objectFit: "contain" }} />
                <Image src={vinixImg} style={{ height: 24, width: 60, objectFit: "contain" }} />
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, color: BRAND.coral, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 7, color: BRAND.slate, fontWeight: 700, letterSpacing: 1.2, marginTop: 1.5 }}>
                  Skill Development & Future Tech Innovations • MSME Certified
                </Text>
                <Text style={{ fontSize: 6.5, color: BRAND.gold, letterSpacing: 0.8, marginTop: 1 }}>
                  Registered under MSME, Ministry of MSME, Govt. of India (UDYAM-TN-17-0076606)
                </Text>
              </View>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <Image src={yrTechImg} style={{ height: 24, width: 40, objectFit: "contain" }} />
                <Image src={msmeImg} style={{ height: 28, width: 56, objectFit: "contain" }} />
              </View>
            </View>

            {/* Title */}
            <View style={{ alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: BRAND.black, letterSpacing: 3 }}>
                CERTIFICATE OF APPRECIATION
              </Text>
              <Text style={{ fontSize: 9, color: BRAND.gold, fontWeight: 700, letterSpacing: 4, marginTop: 2 }}>
                HONORING OUTSTANDING ENGINEERING MERIT
              </Text>
            </View>

            {/* Awardee */}
            <View style={{ alignItems: "center", marginTop: 6 }}>
              <Text style={{ fontSize: 8.5, color: BRAND.muted }}>This certificate is gratefully presented to</Text>
              <Text style={{ fontSize: 22, fontWeight: 700, color: BRAND.coral, letterSpacing: 1, marginTop: 4, borderBottomWidth: 1.5, borderBottomColor: BRAND.gold, paddingBottom: 2 }}>
                {fullName}
              </Text>
              <Text style={{ fontSize: 8.5, color: BRAND.slate, marginTop: 8, textAlign: "center", maxWidth: 540, lineHeight: 1.5 }}>
                in recognition of outstanding and invaluable performance in the{" "}
                <Text style={{ fontWeight: 700, color: BRAND.black }}>{domainName}</Text> internship track, specifically for{" "}
                {reason}
              </Text>
            </View>

            {/* Metadata Bar */}
            <View style={{ backgroundColor: BRAND.white, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 4, paddingVertical: 5, paddingHorizontal: 16, marginHorizontal: 30, flexDirection: "row", justifyContent: "space-around" }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>CERTIFICATE ID</Text>
                <Text style={{ fontSize: 8, fontWeight: 700, color: BRAND.coral }}>{documentId}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>INTERN ID</Text>
                <Text style={{ fontSize: 8, fontWeight: 700, color: BRAND.black }}>{internId}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>AWARD DATE</Text>
                <Text style={{ fontSize: 8, fontWeight: 700, color: BRAND.black }}>{dateStr}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>HONOR LEVEL</Text>
                <Text style={{ fontSize: 8, fontWeight: 700, color: "#16a34a" }}>Exemplary High-Performer</Text>
              </View>
            </View>

            {/* Bottom Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20 }}>
              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigFounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Hariharan S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Founder & CEO</Text>
              </View>

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sealImg} style={{ width: 34, height: 34, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.gold }}>Official Verified Seal</Text>
                <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
              </View>

              {qrCodeDataUri ? (
                <View style={{ alignItems: "center", width: 110 }}>
                  <Image src={qrCodeDataUri} style={{ width: 32, height: 32, objectFit: "contain", marginBottom: 2 }} />
                  <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                  <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted }}>Scan to verify</Text>
                  <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
                </View>
              ) : (
                <View style={{ width: 110 }} />
              )}

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigCofounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Maheshwaran S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Co-Founder</Text>
              </View>
            </View>

            {/* Bottom URL */}
            <Text style={{ fontSize: 6, color: BRAND.muted, textAlign: "center" }}>
              Official verification portal: {props.verifyUrl} • Skyrovix IT Solutions
            </Text>

          </View>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// 6. SKILL ACHIEVEMENT CERTIFICATE
// --------------------------------------------------------------------------
export function SkillCertificateDoc(props: AdvancedDocData) {
  const {
    documentId,
    fullName,
    internId,
    domainName,
    issuedAt,
    qrCodeDataUri,
    metadata,
  } = props;

  const dateStr = new Date(issuedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const skillName = metadata?.skillName || `${domainName} — Advanced System Architecture & Engineering`;
  const assessmentScore = metadata?.assessmentScore || "96 / 100 (Grade A+)";
  const skillsDemonstrated = metadata?.skillsDemonstrated || [
    "Full-Stack Web Architecture & Responsive UI Design",
    "RESTful API Engineering & Server-Side Controllers",
    "Database Modeling, Normalization & Query Optimization",
    "Production Deployment, Environment Security & Monitoring",
  ];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pStyles.pageLandscape}>
        <View style={{ borderWidth: 2.5, borderColor: BRAND.gold, padding: 6, height: "100%", borderRadius: 6 }}>
          <View style={{ borderWidth: 0.8, borderColor: BRAND.coral, padding: 14, height: "100%", borderRadius: 4, justifyContent: "space-between" }}>
            
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Image src={logoImg} style={{ width: 40, height: 40, objectFit: "contain" }} />
                <Image src={vinixImg} style={{ height: 24, width: 60, objectFit: "contain" }} />
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontSize: 18, color: BRAND.gold, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 7, color: BRAND.slate, fontWeight: 700, letterSpacing: 1.2, marginTop: 1.5 }}>
                  Skill Development & Future Tech Innovations • MSME Certified
                </Text>
                <Text style={{ fontSize: 6.5, color: BRAND.gold, letterSpacing: 0.8, marginTop: 1 }}>
                  UDYAM-TN-17-0076606 • Ministry of MSME, Govt. of India
                </Text>
              </View>
              <View style={{ width: 140, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                <Image src={yrTechImg} style={{ height: 24, width: 40, objectFit: "contain" }} />
                <Image src={msmeImg} style={{ height: 28, width: 56, objectFit: "contain" }} />
              </View>
            </View>

            {/* Title */}
            <View style={{ alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: 700, color: BRAND.black, letterSpacing: 3 }}>
                SKILL ACHIEVEMENT CERTIFICATE
              </Text>
              <Text style={{ fontSize: 8.5, color: BRAND.coral, fontWeight: 700, letterSpacing: 3, marginTop: 2 }}>
                PRACTICAL COMPETENCY ASSESSMENT & MASTERY
              </Text>
            </View>

            {/* Candidate */}
            <View style={{ alignItems: "center", marginTop: 4 }}>
              <Text style={{ fontSize: 8, color: BRAND.muted }}>This validates that</Text>
              <Text style={{ fontSize: 19, fontWeight: 700, color: BRAND.black, letterSpacing: 1, marginTop: 2, borderBottomWidth: 1.5, borderBottomColor: BRAND.coral, paddingBottom: 2 }}>
                {fullName}
              </Text>
              <Text style={{ fontSize: 8, color: BRAND.slate, marginTop: 5, textAlign: "center", maxWidth: 540 }}>
                has demonstrated exceptional practical competence and technical proficiency in:
              </Text>
              <Text style={{ fontSize: 10, fontWeight: 700, color: BRAND.gold, marginTop: 2 }}>
                {skillName}
              </Text>
            </View>

            {/* Skill Matrix Box */}
            <View style={{ backgroundColor: BRAND.white, borderWidth: 0.6, borderColor: BRAND.border, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 14, marginHorizontal: 20 }}>
              <Text style={{ fontSize: 6.8, fontWeight: 700, color: BRAND.muted, textTransform: "uppercase", marginBottom: 3 }}>
                Verified Core Technical Competencies
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {skillsDemonstrated.map((sk, idx) => (
                  <View key={idx} style={{ width: "48%", flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                    <Text style={{ width: 10, fontSize: 7, color: BRAND.coral, fontWeight: 700 }}>✓</Text>
                    <Text style={{ fontSize: 7, color: BRAND.slate }}>{sk}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Badges */}
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>DOC ID:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.coral }}>{documentId}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>ASSESSMENT RESULT:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: "#16a34a" }}>{assessmentScore}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 7, color: BRAND.muted }}>DATE:</Text>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>{dateStr}</Text>
              </View>
            </View>

            {/* Bottom Row */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 16 }}>
              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigFounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Hariharan S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Founder & CEO</Text>
              </View>

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sealImg} style={{ width: 34, height: 34, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.gold }}>Official Verified Seal</Text>
                <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
              </View>

              {qrCodeDataUri ? (
                <View style={{ alignItems: "center", width: 110 }}>
                  <Image src={qrCodeDataUri} style={{ width: 32, height: 32, objectFit: "contain", marginBottom: 2 }} />
                  <View style={{ width: 80, height: 0.8, alignSelf: "center", marginBottom: 2 }} />
                  <Text style={{ fontSize: 6.5, fontWeight: 700, color: BRAND.muted }}>Scan to verify</Text>
                  <Text style={{ fontSize: 6, color: "transparent" }}>.</Text>
                </View>
              ) : (
                <View style={{ width: 110 }} />
              )}

              <View style={{ alignItems: "center", width: 110 }}>
                <Image src={sigCofounderImg} style={{ height: 26, objectFit: "contain", marginBottom: 2 }} />
                <View style={{ borderTopWidth: 0.8, borderTopColor: "#94a3b8", width: 80, alignSelf: "center", marginBottom: 2 }} />
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: BRAND.black }}>Maheshwaran S</Text>
                <Text style={{ fontSize: 6, color: BRAND.muted }}>Co-Founder</Text>
              </View>
            </View>

            {/* Bottom URL */}
            <Text style={{ fontSize: 6, color: BRAND.muted, textAlign: "center" }}>
              Official verification portal: {props.verifyUrl} • Skyrovix IT Solutions
            </Text>

          </View>
        </View>
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------------------
// DISPATCHER & DOWNLOAD UTILITIES
// --------------------------------------------------------------------------
export function getAdvancedDocComponent(data: AdvancedDocData): ReactElement<DocumentProps> {
  switch (data.documentType) {
    case "lor":
      return <LorDoc {...data} />;
    case "experience_letter":
      return <ExperienceLetterDoc {...data} />;
    case "project_certificate":
      return <ProjectCertificateDoc {...data} />;
    case "evaluation_report":
      return <PerformanceReportDoc {...data} />;
    case "appreciation_certificate":
      return <AppreciationCertificateDoc {...data} />;
    case "skill_certificate":
      return <SkillCertificateDoc {...data} />;
    default:
      return <LorDoc {...data} />;
  }
}

export async function downloadAdvancedDocPdf(data: AdvancedDocData, filename?: string) {
  try {
    let qrUri = data.qrCodeDataUri;
    if (!qrUri && data.verifyUrl) {
      try {
        qrUri = await QRCode.toDataURL(data.verifyUrl, {
          margin: 1,
          width: 120,
          color: { dark: "#181619", light: "#ffffff" },
        });
      } catch {
        // Continue without QR code if generator fails
      }
    }

    const docComponent = getAdvancedDocComponent({
      ...data,
      qrCodeDataUri: qrUri,
    });

    const blob = await pdf(docComponent).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${data.documentType.toUpperCase()}_${data.documentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("[downloadAdvancedDocPdf] Generation failed:", err);
    if (typeof window !== "undefined") {
      alert("Could not generate the PDF. Please check your browser download settings.");
    }
  }
}

export async function renderAdvancedDocBuffer(data: AdvancedDocData): Promise<Buffer> {
  let qrUri = data.qrCodeDataUri;
  if (!qrUri && data.verifyUrl) {
    try {
      qrUri = await QRCode.toDataURL(data.verifyUrl, {
        margin: 1,
        width: 120,
        color: { dark: "#181619", light: "#ffffff" },
      });
    } catch {
      // Proceed without QR
    }
  }

  const doc = getAdvancedDocComponent({
    ...data,
    qrCodeDataUri: qrUri,
  });

  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

