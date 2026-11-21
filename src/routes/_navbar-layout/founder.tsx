import { createFileRoute } from "@tanstack/react-router";
import { FounderProfileView } from "@/components/FounderProfileView";
import { LeadershipJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";

export const Route = createFileRoute("/_navbar-layout/founder")({
  head: () => ({
    meta: [
      { title: "Hariharan S & Maheshwaran S | Founder & Co-Founder of Skyrovix | Leadership Profile" },
      { name: "description", content: "Meet Hariharan S (Founder & CEO) and Maheshwaran S (Co-Founder & Lead Architect), leaders of Skyrovix (skyrovix.in) — an MSME-registered virtual internship and skill development platform providing hands-on task-based engineering internships across India." },
      { name: "keywords", content: "Hariharan S, Maheshwaran S, Skyrovix Founder, Skyrovix Co-Founder, Hariharan Skyrovix, Maheshwaran Skyrovix, Hariharan S CEO, Maheshwaran S Lead Architect, Skyrovix leadership, skyrovix.in founder, virtual internship founder India, MSME skill development leadership" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { property: "og:type", content: "profile" },
      { property: "og:site_name", content: "Skyrovix" },
      { property: "og:title", content: "Hariharan S & Maheshwaran S — Founder & Co-Founder of Skyrovix" },
      { property: "og:description", content: "Leading MSME-registered virtual internships, sequential task evaluation, and developer sandboxes at skyrovix.in." },
      { property: "og:url", content: "https://skyrovix.in/founder" },
      { property: "og:image", content: "https://skyrovix.in/founder.jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Hariharan S — Founder & CEO of Skyrovix" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@skyrovix" },
      { name: "twitter:title", content: "Hariharan S & Maheshwaran S — Skyrovix Founders" },
      { name: "twitter:description", content: "Leading MSME-registered virtual internships, sequential task evaluation, and developer sandboxes at skyrovix.in." },
      { name: "twitter:image", content: "https://skyrovix.in/founder.jpeg" },
      { rel: "canonical", href: "https://skyrovix.in/founder" },
    ],
  }),
  component: FounderPage,
});

function FounderPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://skyrovix.in/" },
          { name: "Leadership & Founders", url: "https://skyrovix.in/founder" },
        ]}
      />
      <LeadershipJsonLd />
      <FounderProfileView />
    </>
  );
}
