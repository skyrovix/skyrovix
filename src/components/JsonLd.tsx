import { COMPANY, DOMAINS } from "@/lib/constants";

const SITE_URL = "https://skyrovix.online";
const LOGO_URL = `${SITE_URL}/logo.png`;

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: COMPANY.name,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: LOGO_URL,
          width: 512,
          height: 512,
        },
        description:
          "MSME-registered virtual internship and training platform offering task-based internships in Full Stack, AI/ML, Data Science, UI/UX, Cyber Security and more.",
        email: `mailto:${COMPANY.email}`,
        foundingDate: "2024",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
          addressRegion: "Tamil Nadu",
        },
        areaServed: { "@type": "Country", name: "India" },
        founder: [
          { "@type": "Person", name: COMPANY.founder.name, jobTitle: COMPANY.founder.title },
          { "@type": "Person", name: COMPANY.cofounder.name, jobTitle: COMPANY.cofounder.title },
        ],
        numberOfEmployees: {
          "@type": "QuantitativeValue",
          value: 10,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: COMPANY.email,
          availableLanguage: "English",
        },
        sameAs: [
          "https://www.youtube.com/@skyrovix",
          "https://www.linkedin.com/company/skyrovix/",
          "https://www.instagram.com/skyrovix?igsh=ZXY2ZXdxZTM5czNr",
          "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f",
        ],
        makesOffer: DOMAINS.map((d) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "EducationalOccupationalProgram",
            name: `${d.name} Virtual Internship`,
            description: d.description,
            url: `${SITE_URL}/domains/${d.slug}`,
            provider: {
              "@type": "EducationalOrganization",
              name: COMPANY.name,
            },
          },
        })),
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Skyrovix",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/domains?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        publisher: {
          "@type": "Organization",
          name: COMPANY.name,
          logo: LOGO_URL,
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function WebPageJsonLd({
  title,
  description,
  url,
  dateModified,
}: {
  title: string;
  description: string;
  url: string;
  dateModified?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url,
        dateModified: dateModified ?? "2026-07-15",
        inLanguage: "en-IN",
        isPartOf: {
          "@type": "WebSite",
          name: "Skyrovix",
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: COMPANY.name,
          logo: LOGO_URL,
        },
      }}
    />
  );
}

export function CourseJsonLd({
  name,
  description,
  url,
  durationWeeks = 4,
}: {
  name: string;
  description: string;
  url: string;
  durationWeeks?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name: name,
        description: description,
        url: url,
        inLanguage: "en-IN",
        provider: {
          "@type": "EducationalOrganization",
          name: COMPANY.name,
          sameAs: SITE_URL,
          logo: LOGO_URL,
        },
        offers: {
          "@type": "Offer",
          price: "100",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: url,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          duration: `P${durationWeeks}W`,
          courseWorkload: "Task-Based Project Submissions",
          name: `${name} Virtual Internship Program`,
          description: `Task-based remote virtual internship in ${name}. Complete 5+ practical developer syllabus tasks and earn a digital verified certificate.`,
          instructor: {
            "@type": "Person",
            name: COMPANY.founder.name,
            jobTitle: COMPANY.founder.title,
          },
        },
      }}
    />
  );
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "EducationalOrganization"],
        name: COMPANY.name,
        url: SITE_URL,
        logo: LOGO_URL,
        image: `${SITE_URL}/og-default.png`,
        description:
          "MSME-registered virtual internship and training platform for students across India.",
        email: COMPANY.email,
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
          addressRegion: "Tamil Nadu",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 11.1271,
          longitude: 78.6569,
        },
        openingHours: "Mo-Su 09:00-21:00",
        priceRange: "₹",
        sameAs: [
          "https://www.youtube.com/@skyrovix",
          "https://www.linkedin.com/company/skyrovix/",
          "https://www.instagram.com/skyrovix?igsh=ZXY2ZXdxZTM5czNr",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: COMPANY.email,
          availableLanguage: "English",
        },
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        url,
        datePublished,
        dateModified: dateModified ?? datePublished,
        inLanguage: "en-IN",
        author: {
          "@type": "Person",
          name: authorName ?? COMPANY.founder.name,
        },
        publisher: {
          "@type": "Organization",
          name: COMPANY.name,
          logo: {
            "@type": "ImageObject",
            url: LOGO_URL,
          },
        },
        image: `${SITE_URL}/og-default.png`,
      }}
    />
  );
}
