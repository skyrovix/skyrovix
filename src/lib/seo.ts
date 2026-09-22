import { COMPANY, DOMAINS } from "./constants";

export const SITE_URL = "https://skyrovix.online";
export const SITE_NAME = "Skyrovix";
export const SITE_TITLE = "Skyrovix | Virtual Internship with Certificate & Real Projects";
export const SITE_DESCRIPTION =
  "Skyrovix is a virtual internship platform offering hands-on projects, offer letters, certificates, and mentor support in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX, and more.";

// ─── Primary Keywords ───────────────────────────────────────────────────────
export const PRIMARY_KEYWORDS = [
  "Skyrovix Internship",
  "Skyrovix Virtual Internship",
  "Skyrovix IT Solutions Internship",
  "online internship India",
  "virtual internship with certificate",
  "remote internship for students",
  "project based internship",
  "full stack development internship",
  "Python internship",
  "Java internship",
  "AI internship",
  "machine learning internship",
  "data science internship",
  "cyber security internship",
  "cloud computing internship",
  "React internship",
  "MERN stack internship",
  "UI UX internship",
  "graphic design internship",
  "internship with offer letter",
  "internship with certificate",
  "internship with real projects",
  "internship for college students",
  "engineering internship",
  "computer science internship",
  "free internship",
  "paid internship",
  "work from home internship",
  "summer internship 2026",
  "internship program India",
];

// ─── Long-Tail Keywords ──────────────────────────────────────────────────────
export const LONG_TAIL_KEYWORDS = [
  "best virtual internship for engineering students",
  "online internship with certificate and offer letter",
  "full stack internship with real projects",
  "AI internship for beginners",
  "Python internship for college students",
  "remote internship with mentor support",
  "internship with QR verified certificate",
  "internship with Letter of Recommendation",
  "skill based internship platform",
  "project based internship online",
  "internship for final year students",
  "internship for CSE students",
  "internship for IT students",
  "software development internship online",
  "web development internship India",
  "internship with AI features",
  "task based internship online",
  "project based learning internship",
  "internship for beginners with certificate",
  "online training with internship certificate",
  "skill development internship India",
  "internship for freshers 2026",
  "internship for BCA MCA students",
  "internship for BSc CS students",
  "intern with certificate of completion",
];

// ─── Combined Keywords ───────────────────────────────────────────────────────
export const SITE_KEYWORDS = [...PRIMARY_KEYWORDS, ...LONG_TAIL_KEYWORDS];

export const OG_IMAGE = `${SITE_URL}/og-default.png`;
export const LOGO_URL = `${SITE_URL}/logo.png`;

// ─── Per-Route SEO ───────────────────────────────────────────────────────────
export const ROUTE_SEO: Record<
  string,
  {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    keywords?: string[];
    noindex?: boolean;
  }
> = {
  "/": {
    title: "Skyrovix Internship | Virtual Internship with Certificate & Real Projects",
    description: SITE_DESCRIPTION,
    keywords: PRIMARY_KEYWORDS,
  },
  "/about": {
    title: "About Skyrovix — MSME-Registered Virtual Internship Platform India",
    description:
      "Skyrovix is an MSME-registered virtual internship and training platform helping college students, engineering students, CSE/IT students, and job seekers gain real-world skills through project-based internships.",
    keywords: [
      "about skyrovix",
      "skyrovix internship platform",
      "virtual internship company India",
      "MSME registered training",
      "project based internship platform",
      "internship for college students India",
      "skill development platform India",
    ],
  },
  "/domains": {
    title: "Internship Domains — Full Stack, AI, Python, Data Science, Cyber Security | Skyrovix",
    description:
      "Explore 10+ internship domains at Skyrovix: Full Stack Development, AI & Machine Learning, Data Science, UI/UX Design, Cyber Security, Python, Java, Cloud Computing, MERN Stack, and more. Apply online with offer letter.",
    keywords: [
      "internship domains",
      "full stack internship",
      "AI ML internship",
      "data science internship",
      "cyber security internship",
      "Python internship",
      "Java internship",
      "cloud computing internship",
      "MERN stack internship",
      "UI UX internship",
      "virtual internship domains India",
    ],
  },
  "/contact": {
    title: "Contact Skyrovix — Get Internship Support | Help Center",
    description:
      "Have questions about Skyrovix internships? Contact our team for support with applications, payments, certificates, offer letters, and general inquiries. We respond within 1–2 business days.",
    keywords: ["contact skyrovix", "internship support", "help skyrovix", "skyrovix contact", "certificate support"],
  },
  "/privacy": {
    title: "Privacy Policy — Student Data Protection | Skyrovix",
    description:
      "Skyrovix student privacy policy. Understand how we collect, use, and securely store student personal data, task submissions, and payment records.",
    keywords: ["skyrovix privacy policy", "student data collection", "student data storage", "internship data protection"],
  },
  "/terms": {
    title: "Terms & Conditions — Skyrovix Internship & Course Platform",
    description:
      "Skyrovix terms of service. Review our comprehensive rules governing account usage, course access, internship program guidelines, and student responsibilities.",
    keywords: ["skyrovix terms", "account usage", "course access", "internship rules", "user responsibilities"],
  },
  "/refund": {
    title: "Refund & Cancellation Policy — Skyrovix",
    description:
      "Skyrovix refund and cancellation policy. Learn about course refund eligibility, cancellation periods, internship fee refund rules, and refund processing timelines.",
    keywords: ["skyrovix refund policy", "cancellation policy", "course refund", "internship refund", "refund timeline"],
  },
  "/verify-certificate": {
    title: "Verify Skyrovix Certificate — Instant Online Certificate Verification",
    description:
      "Verify the authenticity of a Skyrovix internship certificate online. Enter your certificate ID or intern ID to confirm authenticity instantly. QR-verified certificates for all domains.",
    keywords: [
      "verify certificate",
      "certificate verification",
      "skyrovix certificate check",
      "internship certificate verify",
      "QR verified certificate",
      "online certificate verification India",
    ],
  },
  "/auth": {
    title: "Sign In / Sign Up — Skyrovix",
    description: "Create your Skyrovix account or sign in to access your internship dashboard, certificates, and more.",
    noindex: true,
  },
  "/admin": {
    title: "Admin Dashboard — Skyrovix",
    description: "Skyrovix admin dashboard for managing applications, certificates, and platform operations.",
    noindex: true,
  },
  "/dashboard": {
    title: "My Dashboard — Skyrovix",
    description: "Your Skyrovix dashboard. Track internship progress, certificates, and profile.",
    noindex: true,
  },
};

// ─── Domain-Specific Keyword Map ─────────────────────────────────────────────
export const DOMAIN_KEYWORDS: Record<string, string[]> = {
  fullstack: [
    "full stack development internship",
    "full stack internship with real projects",
    "full stack internship with certificate",
    "MERN stack internship",
    "React Node.js internship",
    "web development internship India",
    "full stack developer internship for students",
  ],
  frontend: [
    "frontend development internship",
    "React internship",
    "React internship for beginners",
    "HTML CSS JavaScript internship",
    "UI development internship online",
    "frontend internship with certificate",
  ],
  backend: [
    "backend development internship",
    "Node.js internship",
    "REST API internship",
    "server side development internship",
    "backend internship with real projects",
  ],
  datascience: [
    "data science internship",
    "data science internship for students",
    "data science internship with certificate",
    "data science internship India",
    "Python data science internship",
  ],
  aiml: [
    "AI internship",
    "AI internship for beginners",
    "machine learning internship",
    "AI ML internship with certificate",
    "artificial intelligence internship India",
    "machine learning internship for students",
  ],
  uiux: [
    "UI UX internship",
    "UI UX design internship with certificate",
    "UX design internship online",
    "product design internship",
    "Figma internship",
    "UI design internship for students",
  ],
  python: [
    "Python internship",
    "Python internship for college students",
    "Python internship with certificate",
    "Python development internship India",
    "Python programming internship online",
  ],
  java: [
    "Java internship",
    "Java development internship",
    "Java internship with certificate",
    "Java Spring Boot internship",
    "Java programming internship for students",
  ],
  cybersecurity: [
    "cyber security internship",
    "ethical hacking internship",
    "cybersecurity internship with certificate",
    "network security internship",
    "cyber security internship India",
  ],
  digitalmarketing: [
    "digital marketing internship",
    "SEO internship",
    "social media marketing internship",
    "digital marketing internship with certificate",
    "online marketing internship India",
  ],
  cloudcomputing: [
    "cloud computing internship",
    "AWS internship",
    "cloud internship with certificate",
    "DevOps internship online",
    "cloud computing internship India",
  ],
  machinelearning: [
    "machine learning internship",
    "ML internship for students",
    "machine learning internship with certificate",
    "deep learning internship",
    "ML internship India",
  ],
  mernstack: [
    "MERN stack internship",
    "MERN stack internship with certificate",
    "MongoDB Express React Node internship",
    "full stack MERN internship",
  ],
  generativeai: [
    "generative AI internship",
    "LLM internship",
    "AI internship for beginners",
    "ChatGPT prompt engineering internship",
    "AI content generation internship",
  ],
  graphicdesign: [
    "graphic design internship",
    "graphic design internship with certificate",
    "visual design internship online",
    "graphic design internship India",
  ],
};

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
export const FAQ_DATA = [
  {
    question: "What is Skyrovix?",
    answer:
      "Skyrovix is an MSME-registered virtual internship and training platform offering project-based internships in Full Stack Development, AI & Machine Learning, Data Science, UI/UX Design, Cyber Security, Python, Java, Cloud Computing, and more. Students earn offer letters, digital ID cards, and QR-verified certificates.",
  },
  {
    question: "How do I apply for an internship at Skyrovix?",
    answer:
      "Visit skyrovix.online, browse available internship domains, select your preferred duration (1–6 months), complete the application form, and submit the one-time processing fee of ₹100 via UPI. You'll receive an instant offer letter and digital ID card.",
  },
  {
    question: "Is the Skyrovix internship certificate valid?",
    answer:
      "Yes. Skyrovix certificates are QR-verified and can be authenticated at skyrovix.online/verify-certificate. Each certificate has a unique certificate ID and intern ID for instant online verification.",
  },
  {
    question: "How much does the Skyrovix internship cost?",
    answer:
      "Skyrovix charges a one-time certification fee of ₹100 for internship registration. All learning materials, project guides, and mentor support are included.",
  },
  {
    question: "Who can join Skyrovix internships?",
    answer:
      "Any college student, engineering student, CSE or IT student, fresh graduate, or career switcher interested in tech skills can join. There are no specific eligibility requirements.",
  },
  {
    question: "Does Skyrovix provide offer letters?",
    answer:
      "Yes. Every Skyrovix intern receives a digital offer letter immediately after registration, along with a digital intern ID card.",
  },
  {
    question: "What is the duration of Skyrovix internships?",
    answer:
      "Skyrovix offers flexible internship durations: 1 Month (5 tasks), 2 Months (8 tasks), 3 Months (10 tasks), and 6 Months (12 tasks). All internships are 100% remote and work from home.",
  },
  {
    question: "What domains are available for internship at Skyrovix?",
    answer:
      "Skyrovix offers 29+ internship domains including Full Stack Development, Frontend, Backend, MERN Stack, Python, Java, AI/ML, Data Science, Cyber Security, Cloud Computing, UI/UX Design, Graphic Design, Digital Marketing, and more.",
  },
  {
    question: "Is the Skyrovix internship work from home?",
    answer:
      "Yes. All Skyrovix internships are 100% online and work from home. You can complete your tasks at your own pace from anywhere in India.",
  },
  {
    question: "Does Skyrovix provide a Letter of Recommendation?",
    answer:
      "Yes. Top performers who complete all tasks with high quality submissions may receive a Letter of Recommendation in addition to their internship certificate.",
  },
];

// ─── Structured Data ─────────────────────────────────────────────────────────
export const STRUCTURED_DATA_ORG = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: COMPANY.name,
  url: SITE_URL,
  logo: LOGO_URL,
  description: SITE_DESCRIPTION,
  email: `mailto:${COMPANY.email}`,
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
    addressRegion: "Tamil Nadu",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  sameAs: [
    "https://www.linkedin.com/company/skyrovix/",
    "https://www.instagram.com/skyrovix?igsh=ZXY2ZXdxZTM5czNr",
    "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f",
  ],
  founder: [
    {
      "@type": "Person",
      name: COMPANY.founder.name,
      jobTitle: COMPANY.founder.title,
    },
    {
      "@type": "Person",
      name: COMPANY.cofounder.name,
      jobTitle: COMPANY.cofounder.title,
    },
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
};

export const STRUCTURED_DATA_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
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
};
