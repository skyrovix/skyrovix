import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import logo from "@/assets/logo.png";
import topNavLogo from "@/assets/top nav bar logo.png";
import seal from "@/assets/seal.jpg";
import msme from "@/assets/msme.png";
import sigFounder from "@/assets/hari sig.jpeg";
import sigCofounder from "@/assets/mahesh sig.jpeg";
import yrTech from "@/assets/yr-tech logo.png";
import vinix from "@/assets/vinix.png";
import { COMPANY, durationConfig, getPublicSiteUrl } from "@/lib/constants";
import { EMAIL_ASSETS } from "@/lib/email-assets";

const logoImg = EMAIL_ASSETS?.logo || logo;
const topNavLogoImg = EMAIL_ASSETS?.topNavLogo || topNavLogo;
const sealImg = EMAIL_ASSETS?.seal || seal;
const msmeImg = EMAIL_ASSETS?.msme || msme;
const sigFounderImg = EMAIL_ASSETS?.sigFounder || sigFounder;
const sigCofounderImg = EMAIL_ASSETS?.sigCofounder || sigCofounder;
const yrTechImg = EMAIL_ASSETS?.yrTech || yrTech;
const vinixImg = EMAIL_ASSETS?.vinix || vinix;

const C = { brand: "#07284a", ink: "#1e293b", muted: "#64748b", border: "#e2e8f0", light: "#f8fafc" };

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
  frameInner: { position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderWidth: 0.5, borderColor: C.brand, opacity: 0.1 },

  watermark: { position: "absolute", top: 120, left: 0, right: 0, alignItems: "center", opacity: 0.015 },

  topBand: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: C.brand },
  bottomBand: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: C.brand, opacity: 0.6 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1.5, borderBottomColor: C.brand },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { fontSize: 15, fontWeight: 700, color: C.brand, letterSpacing: 0.8 },
  headerSmall: { fontSize: 6.5, color: C.muted, marginTop: 1 },
  small: { fontSize: 6.5, color: C.muted },
  refBox: { alignItems: "flex-end" },
  refLabel: { fontSize: 6, color: C.muted, marginBottom: 1, letterSpacing: 1.2, textTransform: "uppercase" },
  refValue: { fontSize: 8.5, fontWeight: 700, color: C.brand },

  dateLine: { fontSize: 8.5, color: C.ink, marginBottom: 6 },

  title: { fontSize: 20, fontWeight: 700, color: C.brand, marginBottom: 4, letterSpacing: 2 },
  titleAccent: { width: 40, height: 2.5, backgroundColor: C.brand, marginBottom: 10, borderRadius: 2 },

  greeting: { fontSize: 9.5, marginBottom: 6, color: C.ink },
  p: { lineHeight: 1.5, marginBottom: 6, color: "#334155", fontSize: 8.5 },
  bold: { fontWeight: 700 },

  sectionHeading: { fontSize: 10.5, fontWeight: 700, color: C.brand, marginBottom: 5, marginTop: 8, letterSpacing: 0.4 },

  table: { marginBottom: 5, borderWidth: 0.5, borderColor: C.border, borderRadius: 3, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: C.brand },
  th: { fontSize: 7.5, fontWeight: 700, color: "#ffffff", paddingVertical: 3, paddingHorizontal: 8 },
  thKey: { width: 100, paddingHorizontal: 8 },
  thVal: { flex: 1, paddingHorizontal: 8 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: "#ffffff" },
  rowAlt: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.border, backgroundColor: "#f8fafc" },
  rowLast: { flexDirection: "row", backgroundColor: "#f8fafc" },
  key: { width: 100, fontSize: 7.5, color: C.muted, paddingVertical: 3, paddingHorizontal: 8, borderRightWidth: 0.5, borderRightColor: C.border, backgroundColor: "#f1f5f9" },
  val: { flex: 1, fontSize: 8, fontWeight: 700, paddingVertical: 3, paddingHorizontal: 8 },

  overviewBullet: { flexDirection: "row", marginBottom: 2 },
  overviewDot: { width: 14, fontSize: 8, color: C.brand, fontFamily: "Helvetica-Bold", lineHeight: 1.5 },
  overviewText: { flex: 1, fontSize: 8, color: "#334155", lineHeight: 1.5 },

  termsBullet: { flexDirection: "row", marginBottom: 2 },
  termsDot: { width: 14, fontSize: 8, color: C.brand, fontFamily: "Helvetica-Bold" },
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

export function OfferLetterDoc({ fullName, internId, domain, issuedAt, duration = 1, verifyUrl, qrCodeDataUri, imageAssets }: {
  fullName: string; internId: string; domain: string; issuedAt: string; duration?: number;
  verifyUrl?: string; qrCodeDataUri?: string; imageAssets?: ImageAssets;
}) {
  const date = new Date(issuedAt);
  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const domainName = domain.charAt(0).toUpperCase() + domain.slice(1);
  const dur = durationConfig(duration);
  const durLabel = dur?.label ?? "1 Month";

  const endDate = new Date(date);
  if (duration > 1) endDate.setMonth(endDate.getMonth() + duration);
  else endDate.setMonth(endDate.getMonth() + 1);
  const endDateStr = endDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.frameOuter} />
        <View style={s.frameInner} />

        <View style={s.watermark}>
          <Text style={{ fontSize: 64, color: C.brand, fontFamily: "Helvetica-Bold", letterSpacing: 8 }}>SKYROVIX</Text>
        </View>

        <View style={s.topBand} />
        <View style={s.bottomBand} />

        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src={imageAssets?.logo ?? logoImg} style={{ width: 32, height: 32 }} />
            <View style={{ marginLeft: 2 }}>
              <Text style={s.brand}>{COMPANY.name}</Text>
              <Text style={s.headerSmall}>{COMPANY.tagline} · {COMPANY.website}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image src={imageAssets?.vinix ?? vinixImg} style={{ height: 24, width: 58 }} />
            <Image src={imageAssets?.yrTech ?? yrTechImg} style={{ height: 22, width: 34 }} />
            <View style={s.refBox}>
              <Text style={s.refLabel}>INTERN ID</Text>
              <Text style={s.refValue}>{internId}</Text>
              <Text style={[s.refLabel, { marginTop: 2 }]}>ISSUE DATE</Text>
              <Text style={s.refValue}>{dateStr}</Text>
            </View>
          </View>
        </View>

        <Text style={s.title}>INTERNSHIP OFFER LETTER</Text>
        <View style={s.titleAccent} />

        <Text style={s.dateLine}>Date: {dateStr}</Text>

        <Text style={s.greeting}>Dear <Text style={s.bold}>{fullName}</Text>,</Text>

        <Text style={s.p}>
          We are delighted to offer you the position of <Text style={s.bold}>Virtual Intern – {domainName}</Text> at <Text style={s.bold}>Skyrovix</Text>.
        </Text>

        <Text style={s.p}>
          After reviewing your profile, we are confident that your skills and enthusiasm make you a valuable addition to our team. We look forward to supporting your professional growth through this internship opportunity.
        </Text>

        <Text style={s.sectionHeading}>Internship Details</Text>

        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.thKey]}>Particulars</Text>
            <Text style={[s.th, s.thVal]}>Details</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Full Name</Text>
            <Text style={s.val}>{fullName}</Text>
          </View>
          <View style={s.rowAlt}>
            <Text style={s.key}>Intern ID</Text>
            <Text style={s.val}>{internId}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Domain</Text>
            <Text style={s.val}>{domainName}</Text>
          </View>
          <View style={s.rowAlt}>
            <Text style={s.key}>Duration</Text>
            <Text style={s.val}>{durLabel}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Start Date</Text>
            <Text style={s.val}>{dateStr}</Text>
          </View>
          <View style={s.rowAlt}>
            <Text style={s.key}>End Date</Text>
            <Text style={s.val}>{endDateStr}</Text>
          </View>
          <View style={s.rowLast}>
            <Text style={s.key}>Mode of Internship</Text>
            <Text style={s.val}>Remote / Virtual</Text>
          </View>
        </View>

        <Text style={s.sectionHeading}>Internship Overview</Text>

        <Text style={s.p}>
          During this internship, you will have the opportunity to:
        </Text>

        <View>
          <View style={s.overviewBullet}>
            <Text style={s.overviewDot}>•</Text>
            <Text style={s.overviewText}>Work on practical, real-world <Text style={s.bold}>{domainName}</Text> projects.</Text>
          </View>
          <View style={s.overviewBullet}>
            <Text style={s.overviewDot}>•</Text>
            <Text style={s.overviewText}>Gain hands-on experience with modern development tools and technologies.</Text>
          </View>
          <View style={s.overviewBullet}>
            <Text style={s.overviewDot}>•</Text>
            <Text style={s.overviewText}>Receive mentorship and guidance from experienced professionals.</Text>
          </View>
          <View style={s.overviewBullet}>
            <Text style={s.overviewDot}>•</Text>
            <Text style={s.overviewText}>Enhance your technical and problem-solving skills through project-based learning.</Text>
          </View>
          <View style={s.overviewBullet}>
            <Text style={s.overviewDot}>•</Text>
            <Text style={s.overviewText}>Participate in periodic progress reviews and feedback sessions.</Text>
          </View>
        </View>

        <Text style={s.sectionHeading}>Certificate of Completion</Text>

        <Text style={s.p}>
          Upon successful completion of the internship and fulfillment of all assigned tasks, you will receive a <Text style={s.bold}>Certificate of Internship</Text> with QR-code verification for authenticity.
        </Text>

        <Text style={s.sectionHeading}>Terms & Conditions</Text>

        <View>
          <View style={s.termsBullet}>
            <Text style={s.termsDot}>•</Text>
            <Text style={s.termsText}>This internship is conducted remotely and offers flexible working hours.</Text>
          </View>
          <View style={s.termsBullet}>
            <Text style={s.termsDot}>•</Text>
            <Text style={s.termsText}>Interns are expected to maintain regular communication and submit assigned work within deadlines.</Text>
          </View>
          <View style={s.termsBullet}>
            <Text style={s.termsDot}>•</Text>
            <Text style={s.termsText}>Successful completion will be determined based on performance, project submission, and adherence to internship guidelines.</Text>
          </View>
        </View>

        <Text style={s.p}>
          We are excited to have you join our team and wish you a rewarding learning experience with Skyrovix.
        </Text>

        <Text style={[s.p, { marginTop: 1 }]}>
          <Text style={s.bold}>Congratulations and Welcome to the Team!</Text>
        </Text>

        {qrCodeDataUri && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 8 }}>
            <Image src={qrCodeDataUri} style={{ width: 60, height: 60 }} />
            <View>
              <Text style={{ fontSize: 8, fontWeight: 700, color: C.brand }}>Digitally Verified</Text>
              <Text style={{ fontSize: 7, color: C.muted }}>Scan QR to verify authenticity</Text>
              {verifyUrl && <Text style={{ fontSize: 6, color: C.muted, marginTop: 1 }}>{verifyUrl}</Text>}
            </View>
          </View>
        )}

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={s.sigImg} />
            <View style={s.sigLine} />
            <Text style={s.bold}>{COMPANY.founder.name}</Text>
            <Text style={{ fontSize: 6.5, color: C.muted }}>{COMPANY.founder.title}</Text>
          </View>
          <View style={s.sigBlock}>
            <Image src={imageAssets?.seal ?? sealImg} style={{ width: 44, height: 44, opacity: 0.7 }} />
            <Text style={{ fontSize: 6, color: C.muted, marginTop: 1 }}>Company Seal</Text>
          </View>
          <View style={s.sigBlock}>
            <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={s.sigImg} />
            <View style={s.sigLine} />
            <Text style={s.bold}>{COMPANY.cofounder.name}</Text>
            <Text style={{ fontSize: 6.5, color: C.muted }}>{COMPANY.cofounder.title}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <View style={s.footerLeft}>
            <Image src={imageAssets?.msme ?? msmeImg} style={{ width: 76, height: 30 }} />
            <Text style={s.footerText}>MSME: UDYAM-TN-17-0076606</Text>
          </View>
          <View style={s.footerRight}>
            <Text style={s.footerText}>{COMPANY.email} | {COMPANY.website}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}




export function CertificateDoc({ fullName, internId, domain, certId, issuedAt, verifyUrl, qrCodeDataUri, imageAssets }: {
  fullName: string; internId: string; domain: string; certId: string; issuedAt: string; verifyUrl: string;
  qrCodeDataUri?: string; imageAssets?: ImageAssets;
}) {
  const date = new Date(issuedAt);
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 28 }}>
        <View style={{ borderWidth: 6, borderColor: C.brand, padding: 24, height: "100%" }}>
          <View style={{ borderWidth: 1, borderColor: C.border, padding: 24, height: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.logo ?? logoImg} style={{ width: 48, height: 48 }} />
                <Image src={imageAssets?.vinix ?? vinixImg} style={{ height: 34, width: 83 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: C.brand, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 9, color: C.muted }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.yrTech ?? yrTechImg} style={{ height: 34, width: 51 }} />
                <Image src={imageAssets?.msme ?? msmeImg} style={{ height: 34, width: 68 }} />
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <Text style={{ fontSize: 36, fontWeight: 700, color: C.brand, letterSpacing: 4 }}>CERTIFICATE</Text>
              <Text style={{ fontSize: 12, color: C.muted, letterSpacing: 8, marginTop: 2 }}>OF INTERNSHIP COMPLETION</Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 28 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>This certificate is proudly presented to</Text>
              <Text style={{ fontSize: 32, fontWeight: 700, marginTop: 12, marginBottom: 12, color: C.ink }}>{fullName}</Text>
              <Text style={{ fontSize: 11, color: C.muted, textAlign: "center", maxWidth: 600, lineHeight: 1.6 }}>
                for successfully completing the task-based virtual internship program in
                {" "}<Text style={{ fontWeight: 700, color: C.ink }}>{domain}</Text>{" "}
                at Skyrovix IT Solutions, demonstrating dedication, technical skill, and professional excellence throughout the program.
              </Text>
            </View>

            {qrCodeDataUri && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                <Image src={qrCodeDataUri} style={{ width: 48, height: 48 }} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: 700, color: C.brand }}>Digitally Verified</Text>
                  <Text style={{ fontSize: 7, color: C.muted }}>Scan QR to verify authenticity</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.founder.name}</Text>
                <Text style={s.small}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={imageAssets?.seal ?? sealImg} style={{ width: 90, height: 90, opacity: 0.9 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.cofounder.name}</Text>
                <Text style={s.small}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16, fontSize: 8.5, color: C.muted }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Certificate ID: {certId}</Text>
                <Text>Intern ID: {internId}</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <Text>Issued: {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                <Text>Verify at: www.skyrovix.online</Text>
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
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 28 }}>
        <View style={{ borderWidth: 6, borderColor: C.brand, padding: 24, height: "100%" }}>
          <View style={{ borderWidth: 1, borderColor: C.border, padding: 24, height: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.logo ?? logoImg} style={{ width: 48, height: 48 }} />
                <Image src={imageAssets?.vinix ?? vinixImg} style={{ height: 34, width: 83 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: C.brand, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 9, color: C.muted }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={imageAssets?.yrTech ?? yrTechImg} style={{ height: 34, width: 51 }} />
                <Image src={imageAssets?.msme ?? msmeImg} style={{ height: 34, width: 68 }} />
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <Text style={{ fontSize: 36, fontWeight: 700, color: C.brand, letterSpacing: 4 }}>COURSE CERTIFICATE</Text>
              <Text style={{ fontSize: 12, color: C.muted, letterSpacing: 8, marginTop: 2 }}>OF COMPLETION</Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 28 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>This certificate is awarded to</Text>
              <Text style={{ fontSize: 32, fontWeight: 700, marginTop: 12, marginBottom: 12, color: C.ink }}>{fullName}</Text>
              <Text style={{ fontSize: 11, color: C.muted, textAlign: "center", maxWidth: 600, lineHeight: 1.6 }}>
                for successfully completing the {" "}
                <Text style={{ fontWeight: 700, color: C.ink }}>{courseName}</Text>{" "}
                course with a score of <Text style={{ fontWeight: 700, color: C.ink }}>{score}/{total}</Text>,
                demonstrating proficiency and commitment to learning.
              </Text>
            </View>

            {qrCodeDataUri && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                <Image src={qrCodeDataUri} style={{ width: 48, height: 48 }} />
                <View>
                  <Text style={{ fontSize: 8, fontWeight: 700, color: C.brand }}>Digitally Verified</Text>
                  <Text style={{ fontSize: 7, color: C.muted }}>Scan QR to verify authenticity</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigFounder ?? sigFounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.founder.name}</Text>
                <Text style={s.small}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={imageAssets?.seal ?? sealImg} style={{ width: 90, height: 90, opacity: 0.9 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={imageAssets?.sigCofounder ?? sigCofounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.cofounder.name}</Text>
                <Text style={s.small}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16, fontSize: 8.5, color: C.muted }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Certificate ID: {certId}</Text>
                <Text>Score: {score}/{total}</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <Text>Issued: {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                <Text>Verify at: www.skyrovix.online</Text>
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
    color: "#061a33",
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
    backgroundColor: "#061a33",
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  lanyardSlot: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#020f1f",
    borderWidth: 0.5,
    borderColor: "#1e3a5f",
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
    color: "#93c5fd",
    marginTop: 0.5,
  },
  badge: {
    backgroundColor: "#064e3b",
    borderWidth: 0.5,
    borderColor: "#34d399",
    borderRadius: 8,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 5.5,
    fontWeight: 700,
    color: "#6ee7b7",
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
    backgroundColor: "#f1f5f9",
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
    backgroundColor: "#061a33",
    justifyContent: "center",
    alignItems: "center",
  },
  photoInitial: {
    fontSize: 24,
    fontWeight: 700,
    color: "#ffffff",
  },
  nameBlock: {
    alignItems: "center",
    paddingHorizontal: 8,
    marginTop: 3,
  },
  name: {
    fontSize: 11,
    fontWeight: 700,
    color: "#061a33",
    textAlign: "center",
    textTransform: "uppercase",
  },
  role: {
    fontSize: 6.5,
    fontWeight: 700,
    color: "#2563eb",
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 1,
  },
  domainBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#bfdbfe",
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    marginTop: 2,
  },
  domainText: {
    fontSize: 6,
    fontWeight: 700,
    color: "#061a33",
    textAlign: "center",
  },
  detailsBlock: {
    marginHorizontal: 12,
    marginTop: 4,
    backgroundColor: "#f8fafc",
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
    color: "#061a33",
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
    backgroundColor: "#061a33",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4.5,
    paddingHorizontal: 12,
  },
  footerLink: {
    fontSize: 6,
    fontWeight: 700,
    color: "#93c5fd",
  },
  footerMotto: {
    fontSize: 5.5,
    fontWeight: 700,
    color: "#cbd5e1",
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
  const verifyUrl = `${getPublicSiteUrl()}/verify-certificate?intern=${params.internId}`;
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
