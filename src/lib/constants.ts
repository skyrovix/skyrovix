export const COMPANY = {
  name: "Skyrovix",
  shortName: "Skyrovix",
  tagline: "Empowering Future Innovators",
  email: "skyrovix@gmail.com",
  website: "www.skyrovix.online",
  websiteIn: "www.skyrovix.in",
  websites: ["www.skyrovix.online", "www.skyrovix.in"],
  founder: { name: "Hariharan S", title: "Founder & CEO" },
  cofounder: { name: "Maheshwaran S", title: "Co-Founder" },
};

export const SITE_URL = "https://skyrovix.in";

export const PRODUCTION_DOMAINS = {
  IN: "https://skyrovix.in",
  ONLINE: "https://skyrovix.online",
} as const;

/**
 * Resolves the production redirect URL for password recovery.
 *
 * Supported production domains:
 * 1. https://skyrovix.in (Primary)
 * 2. https://skyrovix.online (Secondary)
 * Supported www domains:
 * - https://www.skyrovix.in
 * - https://www.skyrovix.online
 *
 * Development / unknown environment:
 * - Returns primary production recovery URL (https://skyrovix.in/reset-password).
 * - NEVER returns localhost or 127.0.0.1 under any circumstances.
 */
export function getProductionResetPasswordRedirectUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname === "skyrovix.in" ||
      hostname === "www.skyrovix.in"
    ) {
      return "https://skyrovix.in/reset-password";
    }
    if (
      hostname === "skyrovix.online" ||
      hostname === "www.skyrovix.online"
    ) {
      return "https://skyrovix.online/reset-password";
    }
  }

  // Development / unknown environment:
  // Use the primary production recovery URL.
  return "https://skyrovix.in/reset-password";
}

/**
 * Resolves the production redirect URL for authentication and email confirmation.
 * Supported production domains:
 * 1. https://skyrovix.in
 * 2. https://skyrovix.online
 *
 * NEVER returns localhost or 127.0.0.1 under any circumstances.
 */
export function getProductionAuthRedirectUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "skyrovix.in" || hostname === "www.skyrovix.in") {
      return "https://skyrovix.in/auth";
    }
    if (hostname === "skyrovix.online" || hostname === "www.skyrovix.online") {
      return "https://skyrovix.online/auth";
    }
  }

  return "https://skyrovix.in/auth";
}

/**
 * Returns the current public website origin, guaranteeing it never falls back to localhost.
 */
export function getPublicSiteUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (hostname === "skyrovix.in" || hostname === "www.skyrovix.in") {
      return "https://skyrovix.in";
    }
    if (hostname === "skyrovix.online" || hostname === "www.skyrovix.online") {
      return "https://skyrovix.online";
    }
  }

  return SITE_URL;
}

/**
 * Detects if the current environment is running on localhost or a local development IP.
 */
export function isLocalhost(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.endsWith(".local")
  );
}

/**
 * Returns the URL for Forgot Password.
 * Stays within current domain when in the browser.
 */
export function getForgotPasswordUrl(): string {
  if (typeof window !== "undefined") {
    return "/forgot-password";
  }
  return "https://skyrovix.online/forgot-password";
}

export const PAYMENT = {
  upiId: "hariharanmahesh34@oksbi",
  payeeName: "Hariharan Mahesh",
  amount: 100,
  currency: "INR",
};

export const DOMAINS = [
  { slug: "fullstack", name: "Full Stack Development", icon: "FS", description: "End-to-end web apps with frontend, backend, databases, and APIs.", color: "from-fuchsia-500 to-[#181619]" },
  { slug: "python", name: "Python Development", icon: "Py", description: "Versatile Python development for web apps, automation, and backend APIs.", color: "from-emerald-500 to-teal-600" },
  { slug: "java", name: "Java Development", icon: "Jv", description: "Enterprise-grade software and backend systems with Java and Spring Boot.", color: "from-red-500 to-orange-600" },
  { slug: "mernstack", name: "MERN Stack Development", icon: "ME", description: "Full-stack JavaScript applications with MongoDB, Express, React, and Node.js.", color: "from-teal-500 to-cyan-600" },
  { slug: "meanstack", name: "MEAN Stack Development", icon: "MA", description: "Modern web development with MongoDB, Express, Angular, and Node.js.", color: "from-red-500 to-rose-600" },
  { slug: "aiml", name: "AI & Machine Learning", icon: "AI", description: "Build intelligent systems with machine learning models and predictive algorithms.", color: "from-violet-500 to-[#181619]" },
  { slug: "genai", name: "Generative AI & Prompt Engineering", icon: "GA", description: "Harness LLMs, generative AI workflows, and advanced prompt engineering.", color: "from-purple-500 to-indigo-600" },
  { slug: "datascience", name: "Data Science", icon: "DS", description: "Transform raw datasets into actionable insights, data stories, and analytical models.", color: "from-cyan-500 to-blue-600" },
  { slug: "dataanalytics", name: "Data Analytics", icon: "DA", description: "Analyze business metrics, build KPI dashboards, and drive data-informed decisions.", color: "from-blue-500 to-indigo-600" },
  { slug: "powerbi", name: "Power BI & Business Intelligence", icon: "BI", description: "Interactive dashboards, DAX modeling, and enterprise business intelligence.", color: "from-amber-500 to-yellow-600" },
  { slug: "uiux", name: "UI/UX Design", icon: "UX", description: "Human-centered digital product design, wireframes, and interactive prototypes.", color: "from-pink-500 to-purple-600" },
  { slug: "graphicdesign", name: "Graphic Design", icon: "GD", description: "Brand identities, digital visual assets, marketing creatives, and layouts.", color: "from-rose-500 to-orange-500" },
  { slug: "cybersecurity", name: "Cyber Security", icon: "CS", description: "Security auditing, vulnerability analysis, secure coding, and threat mitigation.", color: "from-green-500 to-emerald-600" },
  { slug: "cloudcomputing", name: "Cloud Computing", icon: "CC", description: "Cloud infrastructure, serverless architectures, storage, and cloud deployments.", color: "from-sky-500 to-blue-600" },
  { slug: "devops", name: "DevOps", icon: "DO", description: "CI/CD pipelines, containerization, automated deployments, and infrastructure monitoring.", color: "from-orange-500 to-amber-600" },
  { slug: "softwaretesting", name: "Software Testing & QA", icon: "QA", description: "Manual and automated testing, test suites, bug tracking, and quality assurance.", color: "from-lime-500 to-green-600" },
  { slug: "mobileapp", name: "Mobile App Development", icon: "MB", description: "Native and cross-platform mobile applications with responsive mobile interfaces.", color: "from-indigo-500 to-blue-600" },
  { slug: "flutter", name: "Flutter Development", icon: "FL", description: "High-performance multi-platform applications using Dart and Flutter framework.", color: "from-cyan-500 to-teal-600" },
  { slug: "digitalmarketing", name: "Digital Marketing", icon: "DM", description: "SEO optimization, performance marketing, content strategy, and digital campaigns.", color: "from-violet-500 to-fuchsia-600" },
  { slug: "socialmedia", name: "Social Media Management", icon: "SM", description: "Social media strategies, content scheduling, audience growth, and engagement analytics.", color: "from-pink-500 to-rose-500" },
  { slug: "contentwriting", name: "Content Writing", icon: "CW", description: "SEO blogging, copywriting, technical documentation, and professional writing.", color: "from-amber-500 to-orange-600" },
  { slug: "videoediting", name: "Video Editing", icon: "VE", description: "Cinematic editing, reels production, motion graphics, and audio-video mastering.", color: "from-red-500 to-pink-600" },
  { slug: "wordpress", name: "WordPress Development", icon: "WP", description: "Custom themes, plugin integrations, CMS customization, and e-commerce setups.", color: "from-blue-600 to-indigo-700" },
  { slug: "databasemanagement", name: "Database Management", icon: "DB", description: "Relational schema design, SQL optimization, data integrity, and backup workflows.", color: "from-emerald-600 to-cyan-700" },
  { slug: "gamedevelopment", name: "Game Development", icon: "GM", description: "2D and 3D game mechanics, physics engines, user interaction, and gameplay design.", color: "from-purple-600 to-pink-600" },
] as const;

export const DOMAIN_ALIASES: Record<string, string> = {
  generativeai: "genai",
  promptengineering: "genai",
  flutterdevelopment: "flutter",
  androiddevelopment: "mobileapp",
  reactnative: "mobileapp",
  frontend: "fullstack",
  backend: "fullstack",
  cprogramming: "fullstack",
  cppprogramming: "fullstack",
};

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.slug, d]));

export function getDomain(slug: string) {
  if (!slug) return undefined;
  const direct = DOMAIN_MAP[slug];
  if (direct) return direct;
  const aliased = DOMAIN_ALIASES[slug.toLowerCase()];
  if (aliased) return DOMAIN_MAP[aliased];
  return undefined;
}

export const DURATIONS = [
  { value: 1, label: "1 Month", tasks: 5, desc: "5 tasks — foundational hands-on curriculum" },
  { value: 2, label: "2 Months", tasks: 8, desc: "8 tasks — intermediate real-world practice" },
  { value: 3, label: "3 Months", tasks: 10, desc: "10 tasks (25 for Full Stack with Real-World Deployment & LOR)" },
  { value: 6, label: "6 Months", tasks: 12, desc: "12 tasks (50 for Full Stack with Real-World Deployment & LOR)" },
] as const;

/**
 * Returns total sequential student tasks for a given domain, duration, and plan type.
 * Full Stack Premium (₹200): 1M=5, 2M=8, 3M=25, 6M=50 projects.
 * Full Stack Standard (₹100) & Other domains: 1M=5, 2M=8, 3M=10, 6M=12 tasks.
 */
export function getDomainTaskCount(
  domainSlug?: string,
  durationMonths: number = 1,
  planType?: string
): number {
  if (domainSlug === "fullstack") {
    if (planType === "premium") {
      if (durationMonths === 6) return 50;
      if (durationMonths === 3) return 25;
      if (durationMonths === 2) return 8;
      return 5;
    }
    // Standard track for full stack
    if (durationMonths === 6) return 12;
    if (durationMonths === 3) return 10;
    if (durationMonths === 2) return 8;
    return 5;
  }
  if (durationMonths === 6) return 12;
  if (durationMonths === 3) return 10;
  if (durationMonths === 2) return 8;
  return 5;
}

/**
 * Returns available internship durations for all domains.
 * All domains offer all 4 durations: 1, 2, 3, and 6 months.
 * Full Stack 3M (25 tasks) and 6M (50 tasks) include real-world live deployment,
 * LOR for selected top performers, and curated course & YouTube channel learning references.
 */
export function getAvailableDurations(_domainSlug?: string) {
  return DURATIONS;
}

export function durationConfig(months?: number, domainSlug?: string, planType?: string) {
  const base = DURATIONS.find((d) => d.value === months) ?? DURATIONS[0];
  const count = getDomainTaskCount(domainSlug, base.value, planType);
  let desc: string = base.desc;
  if (domainSlug === "fullstack") {
    if (planType === "premium") {
      if (base.value === 3) {
        desc = "25 Real-World Deployed Projects • LOR for Selected Top Performers";
      } else if (base.value === 6) {
        desc = "50 Real-World Deployed Projects • Capstone & LOR for Selected Top Performers";
      } else if (base.value === 2) {
        desc = "8 tasks — intermediate full stack web apps";
      } else {
        desc = "5 tasks — foundational web development";
      }
    } else {
      if (base.value === 3) {
        desc = "10 structured full stack projects • Standard Curriculum Track";
      } else if (base.value === 6) {
        desc = "12 structured full stack projects • Standard Curriculum Track";
      } else if (base.value === 2) {
        desc = "8 tasks — intermediate full stack web apps";
      } else {
        desc = "5 tasks — foundational web development";
      }
    }
  } else {
    if (base.value === 3) {
      desc = "10 structured industry tasks • Comprehensive domain depth";
    } else if (base.value === 6) {
      desc = "12 structured industry tasks • Capstone domain mastery";
    } else if (base.value === 2) {
      desc = "8 structured industry tasks • Practical project implementation";
    } else {
      desc = "5 structured industry tasks • Foundational start";
    }
  }
  return { ...base, tasks: count, desc };
}


export function generateInternId() {
  const year = new Date().getFullYear();
  const n = Math.floor(1000 + Math.random() * 9000);
  return `SKX-${year}-${n}`;
}

export function generateCertId() {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  return `SKX-CERT-${year}-${n}`;
}

export function generateProjectId() {
  const year = new Date().getFullYear();
  const n = Math.floor(100 + Math.random() * 900);
  return `PRJ-${year}-${n}`;
}

export function generateProjectCertId() {
  const year = new Date().getFullYear();
  const n = Math.floor(10000 + Math.random() * 90000);
  return `SKX-PCERT-${year}-${n}`;
}

export function generateAwardId() {
  const year = new Date().getFullYear();
  const n = Math.floor(100 + Math.random() * 900);
  return `SKX-AWARD-${year}-${n}`;
}

export const PROJECT_DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"] as const;

export const EVALUATION_CRITERIA = [
  { key: "problem_solving", label: "Problem Solving Approach", max: 10 },
  { key: "ui_ux_design", label: "UI/UX Design", max: 10 },
  { key: "functionality", label: "Functionality", max: 10 },
  { key: "code_quality", label: "Code Quality", max: 10 },
  { key: "architecture", label: "Application Architecture", max: 10 },
  { key: "database_design", label: "Database Design", max: 10 },
  { key: "performance", label: "Performance", max: 10 },
  { key: "security", label: "Security", max: 10 },
  { key: "scalability", label: "Scalability", max: 10 },
  { key: "documentation", label: "Documentation", max: 10 },
  { key: "innovation", label: "Innovation", max: 10 },
] as const;

export const AWARD_CATEGORIES = [
  "Top 1", "Top 3", "Top 5", "Top 10",
  "Highest Evaluation Score",
  "Innovation Award",
  "Best UI/UX",
  "Best Architecture",
  "Best Problem Solver",
  "Outstanding Performance",
] as const;
