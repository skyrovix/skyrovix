import { COMPANY, DOMAINS } from "./constants";

export const SITE_URL = "https://skyrovix.in";
export const SITE_NAME = "Skyrovix";
export const SITE_TITLE = "Skyrovix | Virtual Internship with Certificate & Real Projects";
export const SITE_DESCRIPTION =
  "Skyrovix (skyrovix.in) is an MSME-registered virtual internship platform founded by Hariharan S and co-founded by Maheshwaran S, offering hands-on projects, instant offer letters, digital ID cards, mentor support, and QR-verified certificates in Full Stack, AI, Python, Data Science, Cyber Security, Cloud, UI/UX, and 25+ domains.";

// ─── Primary Keywords ───────────────────────────────────────────────────────
export const PRIMARY_KEYWORDS = [
  "Skyrovix",
  "skyrovix.in",
  "Skyrovix Internship",
  "Skyrovix Virtual Internship",
  "Skyrovix IT Solutions Internship",
  "Hariharan S",
  "Hariharan S Skyrovix",
  "Hariharan Skyrovix Founder",
  "Hariharan S CEO",
  "Maheshwaran S",
  "Maheshwaran S Skyrovix",
  "Maheshwaran S Co-Founder",
  "Maheshwaran Skyrovix",
  "Skyrovix Founder",
  "Skyrovix Co-Founder",
  "Skyrovix Founder and Co-Founder",
  "Skyrovix leadership team",
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
  "MSME registered internship India",
  "UDYAM-TN-17-0076606",
];

// ─── Long-Tail Keywords ──────────────────────────────────────────────────────
export const LONG_TAIL_KEYWORDS = [
  "Hariharan S Founder CEO Skyrovix IT Solutions",
  "Maheshwaran S Co-Founder Lead Architect Skyrovix",
  "who is the founder of skyrovix",
  "who is the co founder of skyrovix",
  "skyrovix.in official website",
  "skyrovix.in virtual internship application",
  "skyrovix.in offer letter download",
  "skyrovix.in verify certificate",
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
  "/internship": {
    title: "Virtual Internships — Full Stack, AI, Python, Data Science, Cyber Security | Skyrovix",
    description:
      "Explore 10+ virtual internship streams at Skyrovix: Full Stack Development, AI & Machine Learning, Data Science, UI/UX Design, Cyber Security, Python, Java, Cloud Computing, MERN Stack, and more. Apply online with offer letter.",
    keywords: [
      "virtual internships",
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
    question: "Who is the founder of Skyrovix?",
    answer:
      "Hariharan S is the Founder and Chief Executive Officer (CEO) of Skyrovix (skyrovix.in). He leads platform strategy, technical curriculum architecture, compiler sandbox development, and student mentorship across India.",
  },
  {
    question: "Who is the co-founder of Skyrovix?",
    answer:
      "Maheshwaran S is the Co-Founder and Lead Architect of Skyrovix (skyrovix.in). He directs technical infrastructure, server-side APIs, database security, code evaluation pipelines, and credential verification engines.",
  },
  {
    question: "What is the official website of Skyrovix?",
    answer:
      "The official website and virtual internship platform of Skyrovix is https://skyrovix.in. All official applications, offer letters, tasks, and certificate authentications are hosted exclusively on skyrovix.in.",
  },
  {
    question: "What is Skyrovix?",
    answer:
      "Skyrovix (skyrovix.in) is an MSME-registered (UDYAM-TN-17-0076606) virtual internship and practical skill development platform based in Tamil Nadu, India. It provides task-based remote internships in 25+ technical streams with instant offer letters, digital student ID cards, and QR-verifiable certificates.",
  },
  {
    question: "Is Skyrovix recognized by the Government of India as an MSME?",
    answer:
      "Yes. Skyrovix is an officially registered enterprise under the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India, with Udyam Registration Number UDYAM-TN-17-0076606.",
  },
  {
    question: "How do I apply for an internship at Skyrovix?",
    answer:
      "Visit skyrovix.in/internship, browse available internship domains, choose your preferred duration (1–6 months), complete the application form, and receive your instant offer letter and digital student ID card immediately with zero upfront fee.",
  },
  {
    question: "Is the Skyrovix internship certificate valid and verifiable?",
    answer:
      "Yes. Every Skyrovix certificate includes an encrypted QR code and can be verified online at https://skyrovix.in/verify. Employers, universities, and evaluators can verify student credentials and project details in real time.",
  },
  {
    question: "How much does the Skyrovix internship cost?",
    answer:
      "Applying and starting an internship on skyrovix.in has zero upfront fee. Students only pay a nominal certificate issuance fee upon successfully completing their tasks and receiving evaluation approval (Standard Plan ₹50 / Premium Track ₹200).",
  },
  {
    question: "Who can join Skyrovix internships?",
    answer:
      "Any college student, engineering student, CSE/IT student, fresh graduate, or career switcher interested in tech skills can join. There are no restrictive eligibility barriers; learning is 100% project-based.",
  },
  {
    question: "Does Skyrovix provide offer letters?",
    answer:
      "Yes. Every Skyrovix intern receives an official digital offer letter immediately after registration, delivered to their email and accessible in their student dashboard at skyrovix.in/dashboard.",
  },
  {
    question: "What is the duration of Skyrovix internships?",
    answer:
      "Skyrovix offers flexible internship durations: 1 Month (5 tasks), 2 Months (8 tasks), 3 Months (10 tasks), and 6 Months (12 tasks). All internships are 100% remote and self-paced.",
  },
  {
    question: "What domains are available for internship at Skyrovix?",
    answer:
      "Skyrovix offers 25+ internship domains including Full Stack Development, Frontend, Backend, MERN Stack, Python, Java, AI/ML, Data Science, Cyber Security, Cloud Computing, UI/UX Design, Graphic Design, Digital Marketing, and more.",
  },
  {
    question: "Is the Skyrovix internship work from home?",
    answer:
      "Yes. All Skyrovix internships are 100% online and work from home. You can complete your tasks at your own pace from anywhere in India on skyrovix.in.",
  },
  {
    question: "Does Skyrovix provide a Letter of Recommendation?",
    answer:
      "Yes. Top performers who complete all tasks with high quality submissions may receive a Letter of Recommendation (LOR) signed by the Founders in addition to their verified internship certificate.",
  },
];

// ─── Structured Data ─────────────────────────────────────────────────────────
export const STRUCTURED_DATA_ORG = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "Organization"],
  name: COMPANY.name,
  legalName: "Skyrovix IT Solutions",
  alternateName: ["Skyrovix Virtual Internship", "Skyrovix IT Solutions", "Skyrovix EdTech", "skyrovix.in"],
  url: SITE_URL,
  logo: LOGO_URL,
  description: SITE_DESCRIPTION,
  taxID: "UDYAM-TN-17-0076606",
  slogan: "Learn. Build. Experience. Grow.",
  email: `mailto:${COMPANY.email}`,
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Pudukkottai",
    addressCountry: "IN",
    addressRegion: "Tamil Nadu",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  sameAs: [
    "https://www.youtube.com/@skyrovix",
    "https://www.linkedin.com/company/skyrovix/",
    "https://www.instagram.com/skyrovix?igsh=ZXY2ZXdxZTM5czNr",
    "https://whatsapp.com/channel/0029VbD67bgEFeXexEbYGI1f",
    COMPANY.founder.linkedin,
  ],
  founder: [
    {
      "@type": "Person",
      name: COMPANY.founder.name,
      jobTitle: COMPANY.founder.title,
      url: `${SITE_URL}/founder`,
      sameAs: COMPANY.founder.linkedin,
    },
    {
      "@type": "Person",
      name: COMPANY.cofounder.name,
      jobTitle: COMPANY.cofounder.title,
      url: `${SITE_URL}/about`,
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
    availableLanguage: ["English", "Tamil", "Hindi"],
  },
  makesOffer: DOMAINS.map((d) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "EducationalOccupationalProgram",
      name: `${d.name} Virtual Internship`,
      description: d.description,
      url: `${SITE_URL}/internship/${d.slug}`,
      provider: {
        "@type": "EducationalOrganization",
        name: COMPANY.name,
        url: SITE_URL,
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
