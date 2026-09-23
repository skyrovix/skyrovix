import { createFileRoute } from "@tanstack/react-router";
import { VerificationView } from "@/components/VerificationView";

export const Route = createFileRoute("/verify")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || (search.cert as string) || (search.intern as string) || "",
    cert: (search.cert as string) || "",
    intern: (search.intern as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Verify Skyrovix Credential — Instant Online Verification" },
      { name: "description", content: "Verify the authenticity of a Skyrovix internship offer letter, certificate, or intern ID online. Enter your ID to confirm authenticity instantly." },
      { name: "keywords", content: "verify, verification, skyrovix verify, offer letter check, internship certificate verify, online certificate verification" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Verify Skyrovix Credential — Instant Online Verification" },
      { property: "og:description", content: "Verify your Skyrovix internship offer letter or certificate online. Enter ID for instant QR-verified authenticity confirmation." },
      { property: "og:url", content: "https://skyrovix.online/verify" },
      { property: "og:image", content: "https://skyrovix.online/og-default.png" },
      { rel: "canonical", href: "https://skyrovix.online/verify" },
    ],
  }),
  component: VerifyPageRoute,
});

function VerifyPageRoute() {
  const search = Route.useSearch();
  const initialId = search.id || search.cert || search.intern || "";
  return <VerificationView initialId={initialId} canonicalPath="/verify" />;
}
