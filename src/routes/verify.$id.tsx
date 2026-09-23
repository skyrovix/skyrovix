import { createFileRoute } from "@tanstack/react-router";
import { VerificationView } from "@/components/VerificationView";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verify Credential ${params.id} — Skyrovix Online Verification` },
      { name: "description", content: `Verify the authenticity of Skyrovix credential ${params.id}. Instant QR-verified confirmation.` },
      { name: "robots", content: "noindex, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: `Verify Skyrovix Credential ${params.id}` },
      { rel: "canonical", href: `https://skyrovix.online/verify/${params.id}` },
    ],
  }),
  component: VerifyByIdRoute,
});

function VerifyByIdRoute() {
  const { id } = Route.useParams();
  return <VerificationView initialId={id} canonicalPath={`/verify/${id}`} />;
}
