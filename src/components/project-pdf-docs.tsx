import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import { QRCodeSVG } from "qrcode.react";
import { renderToString } from "react-dom/server";
import { COMPANY } from "@/lib/constants";
import logo from "@/assets/sk-logo-transparent.png";
import seal from "@/assets/seal.jpg";
import msme from "@/assets/msme.png";
import sigFounder from "@/assets/hari sig.jpeg";
import sigCofounder from "@/assets/mahesh sig.jpeg";
import yrTech from "@/assets/yr-tech logo.png";
import vinix from "@/assets/vinix.png";
import { EMAIL_ASSETS } from "@/lib/email-assets";

const logoImg = EMAIL_ASSETS?.logo || logo;
const sealImg = EMAIL_ASSETS?.seal || seal;
const msmeImg = EMAIL_ASSETS?.msme || msme;
const sigFounderImg = EMAIL_ASSETS?.sigFounder || sigFounder;
const sigCofounderImg = EMAIL_ASSETS?.sigCofounder || sigCofounder;
const yrTechImg = EMAIL_ASSETS?.yrTech || yrTech;
const vinixImg = EMAIL_ASSETS?.vinix || vinix;

const C = { brand: "#181619", coral: "#f95c4b", ink: "#181619", muted: "#64748b", border: "#e2e8f0", light: "#faf8f2" };

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 9, color: C.ink, fontFamily: "Helvetica", position: "relative" },
  bold: { fontWeight: 700 },
  small: { fontSize: 6.5, color: C.muted },
  sigBlock: { alignItems: "center", width: 130 },
  sigImg: { height: 24, marginBottom: 2 },
  sigLine: { borderTopWidth: 0.5, borderTopColor: C.ink, width: "100%", marginBottom: 2 },
});

// ─── Completion Certificate ───
export function ProjectCompletionCert({
  participantName, projectId, projectTitle, industry, technologies,
  finalScore, certId, completionDate, evaluationUrl,
}: {
  participantName: string; projectId: string; projectTitle: string; industry: string;
  technologies: string[]; finalScore: number; certId: string; completionDate: string; evaluationUrl: string;
}) {
  const qrSvg = renderToString(<QRCodeSVG value={evaluationUrl} size={64} />);
  const date = new Date(completionDate);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 28 }}>
        <View style={{ borderWidth: 6, borderColor: C.brand, padding: 24, height: "100%" }}>
          <View style={{ borderWidth: 1, borderColor: C.border, padding: 24, height: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={logoImg} style={{ width: 48, height: 48 }} />
                <Image src={vinixImg} style={{ height: 34, width: 83 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: C.brand, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 9, color: C.muted }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={yrTechImg} style={{ height: 34, width: 51 }} />
                <Image src={msmeImg} style={{ height: 34, width: 68 }} />
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={{ fontSize: 32, fontWeight: 700, color: C.brand, letterSpacing: 4 }}>CERTIFICATE</Text>
              <Text style={{ fontSize: 10, color: C.muted, letterSpacing: 8, marginTop: 2 }}>OF PROJECT COMPLETION</Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <Text style={{ fontSize: 10, color: C.muted }}>This certificate is proudly presented to</Text>
              <Text style={{ fontSize: 28, fontWeight: 700, marginTop: 8, marginBottom: 8, color: C.ink }}>{participantName}</Text>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: "center", maxWidth: 620, lineHeight: 1.5 }}>
                for successfully completing the real-world project challenge
                {" "}<Text style={{ fontWeight: 700, color: C.ink }}>{projectTitle}</Text>{" "}
                (Project ID: {projectId}, Industry: {industry}) with a score of{" "}
                <Text style={{ fontWeight: 700, color: C.ink }}>{finalScore}/100</Text>, demonstrating technical excellence, problem solving ability, and professional commitment.
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <Image src={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}` as any} style={{ width: 44, height: 44 }} />
              <View>
                <Text style={{ fontSize: 8, fontWeight: 700, color: C.brand }}>Digitally Verified</Text>
                <Text style={{ fontSize: 7, color: C.muted }}>Scan QR to verify authenticity</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
              <View style={s.sigBlock}>
                <Image src={sigFounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.founder.name}</Text>
                <Text style={s.small}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={sealImg} style={{ width: 80, height: 80, opacity: 0.9 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={sigCofounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.cofounder.name}</Text>
                <Text style={s.small}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, fontSize: 8.5, color: C.muted }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Certificate ID: {certId}</Text>
                <Text>Project ID: {projectId}</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                <Text>Completed: {date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                <Text>Verify at: www.skyrovix.online</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Best Performer Award ───
export function ProjectAwardCert({
  participantName, projectTitle, rank, finalScore, awardCategory, certId, issueDate, evaluationUrl,
}: {
  participantName: string; projectTitle: string; rank: string; finalScore: number;
  awardCategory: string; certId: string; issueDate: string; evaluationUrl: string;
}) {
  const qrSvg = renderToString(<QRCodeSVG value={evaluationUrl} size={64} />);
  const date = new Date(issueDate);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={{ ...s.page, padding: 28 }}>
        <View style={{ borderWidth: 6, borderColor: C.brand, padding: 24, height: "100%" }}>
          <View style={{ borderWidth: 1, borderColor: C.border, padding: 24, height: "100%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={logoImg} style={{ width: 48, height: 48 }} />
                <Image src={vinixImg} style={{ height: 34, width: 83 }} />
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: C.brand, fontWeight: 700, letterSpacing: 4 }}>SKYROVIX</Text>
                <Text style={{ fontSize: 9, color: C.muted }}>{COMPANY.tagline}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image src={yrTechImg} style={{ height: 34, width: 51 }} />
                <Image src={msmeImg} style={{ height: 34, width: 68 }} />
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={{ fontSize: 32, fontWeight: 700, color: C.brand, letterSpacing: 4 }}>BEST PERFORMER AWARD</Text>
              <Text style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 8, marginTop: 2 }}>REAL-WORLD PROJECT CHALLENGE</Text>
            </View>

            <View style={{ alignItems: "center", marginTop: 18 }}>
              <Text style={{ fontSize: 10, color: C.muted }}>This award is proudly presented to</Text>
              <Text style={{ fontSize: 28, fontWeight: 700, marginTop: 8, marginBottom: 8, color: C.ink }}>{participantName}</Text>
              <Text style={{ fontSize: 10, color: C.muted, textAlign: "center", maxWidth: 620, lineHeight: 1.5 }}>
                for outstanding performance and achieving <Text style={{ fontWeight: 700, color: C.ink }}>{rank}</Text> in the project challenge
                {" "}<Text style={{ fontWeight: 700, color: C.ink }}>{projectTitle}</Text>{" "}
                (Category: {awardCategory}) with an exceptional score of{" "}
                <Text style={{ fontWeight: 700, color: C.ink }}>{finalScore}/100</Text>.
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <Image src={`data:image/svg+xml;utf8,${encodeURIComponent(qrSvg)}` as any} style={{ width: 44, height: 44 }} />
              <View>
                <Text style={{ fontSize: 8, fontWeight: 700, color: C.brand }}>Digitally Verified</Text>
                <Text style={{ fontSize: 7, color: C.muted }}>Scan QR to verify authenticity</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
              <View style={s.sigBlock}>
                <Image src={sigFounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.founder.name}</Text>
                <Text style={s.small}>{COMPANY.founder.title}</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Image src={sealImg} style={{ width: 80, height: 80, opacity: 0.9 }} />
              </View>
              <View style={s.sigBlock}>
                <Image src={sigCofounderImg} style={s.sigImg} />
                <View style={s.sigLine} />
                <Text style={s.bold}>{COMPANY.cofounder.name}</Text>
                <Text style={s.small}>{COMPANY.cofounder.title}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, fontSize: 8.5, color: C.muted }}>
              <View style={{ flexDirection: "column", gap: 2 }}>
                <Text>Award ID: {certId}</Text>
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

export async function downloadPdfBlob(doc: React.ReactElement) {
  return pdf(doc as any).toBlob();
}

export async function downloadPdf(doc: React.ReactElement, filename: string) {
  const blob = await downloadPdfBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
