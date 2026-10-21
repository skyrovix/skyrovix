import { createFileRoute } from "@tanstack/react-router";
import { VerificationView } from "@/components/VerificationView";

export const Route = createFileRoute("/verify-certificate")({
  validateSearch: (search: Record<string, unknown>): { id?: string; cert?: string; intern?: string } => ({
    id: (search.id as string) || (search.cert as string) || (search.intern as string) || "",
    cert: (search.cert as string) || "",
    intern: (search.intern as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Verify Skyrovix Certificate & Offer Letter — Instant Online Verification" },
      { name: "description", content: "Verify the authenticity of a Skyrovix internship offer letter, certificate, or intern ID online. Enter your ID to confirm authenticity instantly. QR-verified credentials for all domains." },
      { name: "keywords", content: "verify certificate, offer letter verification, certificate verification, skyrovix certificate check, internship certificate verify, online certificate verification, QR verified certificate, skyrovix intern ID" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Verify Skyrovix Certificate & Offer Letter — Instant Online Verification" },
      { property: "og:description", content: "Verify your Skyrovix internship offer letter or certificate online. Enter your Offer Letter ID, certificate ID, or intern ID for instant QR-verified authenticity confirmation." },
      { property: "og:url", content: "https://skyrovix.online/verify-certificate" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Skyrovix Certificate & Offer Letter Verification" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:title", content: "Verify Skyrovix Certificate & Offer Letter — Instant Online Verification" },
      { name: "twitter:description", content: "Verify your Skyrovix internship offer letter or certificate online. Enter ID for instant authenticity check." },
      { name: "twitter:image", content: "https://skyrovix.online/og-default.png" },
      { name: "twitter:image:alt", content: "Skyrovix Certificate Verification" },
      { rel: "canonical", href: "https://skyrovix.online/verify-certificate" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const search = Route.useSearch();
  const initialId = search.id || search.cert || search.intern || "";
  return <VerificationView initialId={initialId} canonicalPath="/verify-certificate" />;
}
