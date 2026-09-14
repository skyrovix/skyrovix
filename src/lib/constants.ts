export const COMPANY = {
  name: "Skyrovix",
  shortName: "Skyrovix",
  tagline: "Empowering Future Innovators",
  email: "skyrovix@gmail.com",
  website: "www.skyrovix.online",
  founder: { name: "Hariharan S", title: "Founder & CEO" },
  cofounder: { name: "Maheshwaran S", title: "Co-Founder" },
};

export const SITE_URL = "https://www.skyrovix.online";

/**
 * Returns the public website origin, guaranteeing it never falls back to localhost.
 */
export function getPublicSiteUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1") && !origin.includes("0.0.0.0")) {
      return origin;
    }
  }
  return SITE_URL;
}

export const PAYMENT = {
  upiId: "hariharanmahesh34@oksbi",
  payeeName: "Hariharan Mahesh",
  amount: 100,
  currency: "INR",
};

export const DOMAINS = [
  { slug: "fullstack", name: "Full Stack Development", icon: "FS", description: "End-to-end web apps with React, Node.js, and databases.", color: "from-fuchsia-500 to-[#07284a]" },
  { slug: "python", name: "Python Development", icon: "Py", description: "Versatile Python for web, automation, and data.", color: "from-emerald-500 to-teal-600" },
  { slug: "java", name: "Java Development", icon: "Jv", description: "Enterprise-grade backends with Spring Boot.", color: "from-red-500 to-orange-600" },
  { slug: "mernstack", name: "MERN Stack Development", icon: "ME", description: "MongoDB, Express, React, Node.js full-stack apps.", color: "from-teal-500 to-cyan-600" },
  { slug: "meanstack", name: "MEAN Stack Development", icon: "MA", description: "MongoDB, Express, Angular, Node.js web apps.", color: "from-red-500 to-rose-600" },
  { slug: "aiml", name: "AI & Machine Learning", icon: "AI", description: "Build intelligent systems with ML and LLMs.", color: "from-violet-500 to-[#07284a]" },
  { slug: "datascience", name: "Data Science", icon: "DS", description: "Turn raw data into actionable insights.", color: "from-cyan-500 to-blue-600" },
  { slug: "uiux", name: "UI UX Designer", icon: "UX", description: "Human-centered design that delights users.", color: "from-amber-500 to-orange-600" },
  { slug: "cybersecurity", name: "Cyber Security", icon: "CS", description: "Defend systems, hunt vulnerabilities.", color: "from-green-500 to-emerald-600" },
] as const;

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.slug, d]));

export function getDomain(slug: string) {
  return DOMAIN_MAP[slug];
}

export const DURATIONS = [
  { value: 1, label: "1 Month", tasks: 5, desc: "5 tasks — perfect for a quick start" },
  { value: 2, label: "2 Months", tasks: 8, desc: "8 tasks — more depth and practice" },
  { value: 3, label: "3 Months", tasks: 10, desc: "10 tasks — build a solid portfolio" },
  { value: 6, label: "6 Months", tasks: 12, desc: "12 tasks — master the domain" },
] as const;

export function durationConfig(months?: number) {
  return DURATIONS.find((d) => d.value === months) ?? DURATIONS[0];
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
