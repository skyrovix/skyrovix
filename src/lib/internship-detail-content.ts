export type Project = {
  title: string;
  description: string;
  difficulty?: string;
  tasks?: string[];
};

export type Faq = {
  question: string;
  answer: string;
};

export type InternshipDetail = {
  tagline: string;
  longDescription: string;
  responsibilities: string[];
  deliverables: string[];
  toolsAndTechnologies: string[];
  certificateEligibility: string[];
  achievements: string[];
  learningOutcomes: string[];
  realWorldApplications: string[];
  careerOpportunities: string[];
  projects: Project[];
  skills: string[];
  prerequisites: string[];
  benefits: string[];
  faqs: Faq[];
  mentors: { name: string; title: string }[];
  language: string;
  mode: string;
  duration: string;
};

const SHARED_BENEFITS = [
  "Internship completion certificate from Skyrovix",
  "Hands-on experience with real-world projects",
  "Industry-standard tools and workflows",
  "Dedicated mentor guidance and feedback",
  "Offer letter and experience letter",
  "Resume and LinkedIn profile enhancement",
  "Portfolio development with live projects",
  "Placement preparation and career guidance",
];

function detail(
  o: Pick<InternshipDetail, "tagline" | "longDescription" | "projects" | "skills"> & {
    responsibilities?: string[];
    deliverables?: string[];
    toolsAndTechnologies?: string[];
    certificateEligibility?: string[];
    achievements?: string[];
    learningOutcomes?: string[];
    faqs?: Faq[];
    mentors?: { name: string; title: string }[];
    duration?: string;
  },
): InternshipDetail {
  return {
    responsibilities: o.responsibilities ?? [
      "Complete assigned tasks and projects within deadlines",
      "Follow industry best practices and coding standards",
      "Collaborate with mentors and peers through discussions",
      "Document your work and maintain progress reports",
      "Participate in code reviews and feedback sessions",
      "Build and submit portfolio-ready projects",
    ],
    deliverables: o.deliverables ?? [
      "Completed task assignments with source code",
      "Project documentation and README files",
      "Progress reports and weekly updates",
      "Portfolio-ready project submissions",
      "Final presentation or demo recording",
    ],
    toolsAndTechnologies: o.toolsAndTechnologies ?? ["Git & GitHub", "VS Code", "Slack/Discord", "Project Management Tools"],
    certificateEligibility: o.certificateEligibility ?? [
      "Complete all assigned tasks and projects",
      "Maintain at least 80% attendance in sessions",
      "Submit projects before the deadline",
      "Adhere to the internship code of conduct",
    ],
    achievements: o.achievements ?? [
      "Build real-world projects from scratch",
      "Understand industry-standard workflows",
      "Master modern tools and frameworks",
      "Gain hands-on practical experience",
      "Create a professional portfolio",
      "Prepare for interviews and placements",
    ],
    learningOutcomes: o.learningOutcomes ?? [
      "Understand core concepts and best practices",
      "Build complete projects with modern tooling",
      "Write clean, maintainable code",
      "Debug and optimize applications",
      "Deploy and manage production applications",
    ],
    realWorldApplications: [
      "Build production-grade applications",
      "Solve real business problems",
      "Create portfolio-worthy projects",
      "Collaborate using industry-standard tools",
    ],
    careerOpportunities: [
      "Freelance Developer",
      "Junior Developer / Engineer",
      "Full-time roles at startups and enterprises",
      "Open-source contributor",
    ],
    benefits: SHARED_BENEFITS,
    prerequisites: ["Basic computer knowledge", "Internet connection", "Eagerness to learn and build", "No prior experience required"],
    faqs: o.faqs ?? [
      { question: "Is certification provided?", answer: "Yes, you will receive an internship completion certificate along with an experience letter upon successful completion." },
      { question: "Is prior experience required?", answer: "No prior experience is required. The internship is designed to take you from basics to advanced concepts." },
      { question: "How long does the internship last?", answer: "You can choose from 1 to 6 months depending on your availability and learning goals." },
      { question: "Is this a remote internship?", answer: "Yes, the internship is fully remote with flexible timings. You can work from anywhere." },
      { question: "Will I get mentor support?", answer: "Yes, you will be assigned a dedicated mentor who will guide you throughout the internship." },
      { question: "Do I need to pay for the internship?", answer: "A nominal application processing fee applies at the time of application. The certificate is provided 100% FREE of charge after successful completion and admin verification of all tasks." },
    ],
    mentors: o.mentors ?? [
      { name: "Hariharan S", title: "Founder & Lead Mentor" },
      { name: "Maheshwaran S", title: "Co-Founder & Technical Mentor" },
    ],
    tagline: o.tagline,
    longDescription: o.longDescription,
    projects: o.projects,
    skills: o.skills,
    language: "English",
    mode: "Remote — Flexible Timings",
    duration: o.duration ?? "1-6 Months",
  };
}

export const INTERNSHIP_DETAILS: Record<string, InternshipDetail> = {
  fullstack: detail({
    tagline: "3 & 6-Month Full Stack Internship — 25 to 50 progressive projects from browser fundamentals to production cloud architectures.",
    longDescription: "The Skyrovix Full Stack roadmap intentionally moves from browser fundamentals to React, backend APIs, SQL/NoSQL databases, authentication, real-time systems, cloud storage, payments, AI, Docker, CI/CD, AWS and production architecture. 3-Month students master 25 sequential project milestones; 6-Month students master all 50 enterprise projects with clean folder structure, Git/GitHub commits, API docs, and live deployments.",
    projects: [
      { title: "Personal Portfolio & Landing Pages (Projects 01–02)", description: "Semantic HTML5, CSS3, Flexbox/Grid, and responsive design deployed on Vercel.", difficulty: "Beginner" },
      { title: "DOM & API Apps: Weather, Expenses & Notes (Projects 03–08)", description: "Local storage persistence, Fetch API, Chart.js financial dashboards, and async event handling.", difficulty: "Beginner+" },
      { title: "React Component Architecture & Node APIs (Projects 09–20)", description: "Vite, React Router, Tailwind, REST API architecture, Express middleware, MongoDB CRUD, Multer, and JWT authentication.", difficulty: "Intermediate" },
      { title: "SQL/NoSQL Systems, Blog & Notes Platform (Projects 21–25)", description: "MySQL connection pooling, PostgreSQL with Prisma ORM, MongoDB product aggregation, and full-stack multi-user cloud notes (End of 3-Month Track).", difficulty: "Full Stack" },
      { title: "Enterprise Systems: Management, LMS & Real-Time (Projects 26–40)", description: "Student/Employee systems, Cashfree payment gateway sandbox, Socket.IO real-time chat, collaborative boards, and S3 cloud storage.", difficulty: "Advanced Full Stack" },
      { title: "Microservices, Docker, DevOps, AI & Capstone (Projects 41–50)", description: "Redis caching, API Gateway, Docker Compose, GitHub Actions CI/CD, AWS EC2/S3/RDS/CloudFront, Prometheus/Grafana monitoring, and production-ready Capstone.", difficulty: "Expert Capstone" },
    ],
    toolsAndTechnologies: [
      "HTML5 & CSS3", "JavaScript (ES6+)", "React & Vite", "Tailwind CSS",
      "Node.js & Express.js", "MySQL & PostgreSQL", "MongoDB & Prisma",
      "JWT & bcrypt (RBAC)", "Postman / REST", "Socket.IO (Real-Time)",
      "Docker & Docker Compose", "AWS (EC2, S3, RDS, CloudFront)",
      "Prometheus & Grafana", "GitHub Actions CI/CD", "Cashfree Sandbox", "AI APIs"
    ],
    skills: [
      "Frontend UI/UX", "Component Architecture", "REST API Engineering",
      "Relational SQL Schema Design", "NoSQL Data Modeling", "JWT & Role-Based Access Control",
      "Real-Time WebSockets", "Cloud Object Storage", "Payment Gateway Integration",
      "Containerization & Microservices", "CI/CD Automation", "Production Cloud Deployment"
    ],
    duration: "3 or 6 Months (Full Stack Exclusive)",
  }),
  frontend: detail({
    tagline: "Create stunning, responsive user interfaces with modern React and Tailwind CSS.",
    longDescription: "Frontend development is about creating beautiful, functional user experiences. This internship covers HTML5, CSS3, JavaScript ES6+, React, state management, responsive design, and modern CSS frameworks. You will build multiple projects that showcase your frontend expertise.",
    projects: [
      { title: "Personal Portfolio Website", description: "Modern and responsive portfolio to showcase skills, projects, and resume.", difficulty: "Beginner" },
      { title: "Weather Dashboard", description: "Weather application using a public API with location search and forecast.", difficulty: "Intermediate" },
      { title: "E-Commerce UI", description: "Frontend interface for an online shopping platform with cart and product details.", difficulty: "Intermediate" },
      { title: "Enterprise SaaS Dashboard (Capstone)", description: "Production-ready enterprise SaaS analytics dashboard with state management.", difficulty: "Advanced" },
    ],
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript ES6+", "HTML5/CSS3", "Responsive Design", "Git", "REST APIs"],
  }),
  backend: detail({
    tagline: "Power the web with robust APIs, secure databases, and scalable server architecture.",
    longDescription: "Backend development is the engine behind every application. This internship covers Node.js, Express, database design, authentication, API development, and deployment. You will build production-ready backend systems and RESTful APIs.",
    projects: [
      { title: "REST API for Portfolio", description: "Backend API to manage portfolio projects, skills, contact messages, and resume.", difficulty: "Beginner" },
      { title: "Authentication & Authorization API", description: "Secure JWT-based authentication with role-based access control.", difficulty: "Intermediate" },
      { title: "E-Commerce Backend", description: "Scalable backend services for products, shopping cart, orders, and payments.", difficulty: "Intermediate" },
      { title: "Enterprise ERP Backend (Capstone)", description: "Production-ready ERP backend integrating HR, inventory, payroll, and audit logs.", difficulty: "Advanced" },
    ],
    skills: ["Node.js", "Express.js", "MongoDB", "PostgreSQL", "REST APIs", "JWT", "Docker", "Redis", "AWS"],
  }),
  datascience: detail({
    tagline: "Turn raw data into actionable insights — learn data analysis, visualization, and ML.",
    longDescription: "Data science is transforming how businesses make decisions. This internship covers data analysis, visualization, statistics, machine learning, and data storytelling using Python. You will work with real datasets and build a portfolio of data science projects.",
    projects: [
      { title: "Sales Data Analysis Dashboard", description: "Analyze sales data to identify trends, customer behavior, and business performance using Python.", difficulty: "Beginner" },
      { title: "Student Performance Analytics", description: "Analyze student academic performance and identify factors affecting results.", difficulty: "Intermediate" },
      { title: "Customer Segmentation", description: "Segment customers into different groups based on purchasing behavior using clustering.", difficulty: "Intermediate" },
      { title: "Enterprise Data Science Platform (Capstone)", description: "Build a complete enterprise-level data science platform for collecting, processing, analyzing, and visualizing business data to generate actionable insights.", difficulty: "Advanced" },
    ],
    skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn", "Jupyter", "SQL", "Statistics", "Tableau"],
  }),
  aiml: detail({
    tagline: "Build intelligent systems — from machine learning algorithms to neural networks and LLMs.",
    longDescription: "AI and machine learning are reshaping every industry. This internship covers ML algorithms, deep learning, NLP, computer vision, and large language models. You will build AI systems that solve real-world problems.",
    projects: [
      { title: "AI Chatbot", description: "Build an intelligent chatbot capable of answering user queries using NLP.", difficulty: "Beginner" },
      { title: "House Price Prediction", description: "Develop a machine learning model to predict house prices based on historical data.", difficulty: "Intermediate" },
      { title: "Object Detection System", description: "Create a real-time object detection application using deep learning.", difficulty: "Intermediate" },
      { title: "AI-Powered Business Intelligence Platform (Capstone)", description: "Develop an enterprise AI platform that predicts business trends and generates intelligent insights from large datasets.", difficulty: "Advanced" },
    ],
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP", "Computer Vision", "LLMs", "MLOps", "RAG"],
  }),
  uiux: detail({
    tagline: "Design delightful digital experiences — master UI/UX with Figma and design thinking.",
    longDescription: "User experience design is at the heart of every successful product. This internship covers design thinking, user research, wireframing, visual design, prototyping, and usability testing. You will create a complete UX portfolio including a full case study.",
    projects: [
      { title: "Mobile App Design", description: "Complete mobile app UI with wireframes, mockups, and prototypes.", difficulty: "Beginner" },
      { title: "Website Redesign", description: "Redesign an existing website with improved UX and modern aesthetics.", difficulty: "Intermediate" },
      { title: "Design System", description: "Comprehensive design system with components and usage guidelines.", difficulty: "Intermediate" },
      { title: "UX Case Study", description: "End-to-end case study from research to final prototype.", difficulty: "Advanced" },
    ],
    skills: ["Figma", "UX Research", "Wireframing", "Prototyping", "Visual Design", "Design Systems", "Usability Testing", "User Personas"],
  }),
  python: detail({
    tagline: "Master Python programming — from fundamentals to automation and web development.",
    longDescription: "Python is one of the most versatile programming languages. This internship covers Python fundamentals, data structures, file handling, web scraping, automation, and Flask web development. You will build real-world Python applications.",
    projects: [
      { title: "Calculator App", description: "Feature-rich CLI calculator with arithmetic operations and history.", difficulty: "Beginner" },
      { title: "Web Scraper", description: "Data extraction tool using BeautifulSoup with CSV export.", difficulty: "Intermediate" },
      { title: "Expense Tracker", description: "Personal expense tracker with SQLite database and spending insights.", difficulty: "Intermediate" },
      { title: "Flask Web Application", description: "Full CRUD web application using Flask with database integration.", difficulty: "Advanced" },
    ],
    skills: ["Python", "Flask", "BeautifulSoup", "SQLite", "REST APIs", "Git", "CLI Tools", "Data Structures"],
  }),
  java: detail({
    tagline: "Build enterprise-grade applications with Java, Spring Boot, and modern tools.",
    longDescription: "Java remains a cornerstone of enterprise software. This internship covers Java fundamentals, OOP, data structures, JDBC, and Spring Boot. You will build real-world applications that follow industry best practices.",
    projects: [
      { title: "Student Management System", description: "CRUD application with MySQL and JDBC connectivity.", difficulty: "Beginner" },
      { title: "Banking Application", description: "OOP-driven banking system with transactions and account management.", difficulty: "Intermediate" },
      { title: "REST API with Spring Boot", description: "Production-ready REST API with JPA and security.", difficulty: "Intermediate" },
      { title: "Library Management System", description: "Complete library system with book inventory and member management.", difficulty: "Advanced" },
    ],
    skills: ["Java", "Spring Boot", "JPA/Hibernate", "MySQL", "REST APIs", "JUnit", "Maven", "Git"],
  }),
  cybersecurity: detail({
    tagline: "Defend systems, hunt vulnerabilities, and master the art of cybersecurity.",
    longDescription: "Cybersecurity is critical for every organization. This internship covers network security, vulnerability assessment, web security, cryptography, and incident response. You will gain hands-on experience with security tools and techniques.",
    projects: [
      { title: "Password Strength Analyzer", description: "Develop a tool to evaluate password strength and recommend secure passwords.", difficulty: "Beginner" },
      { title: "Network Port Scanner", description: "Develop a network scanning tool to identify open ports and active services.", difficulty: "Intermediate" },
      { title: "Secure File Sharing System", description: "Develop a secure platform for encrypted file sharing between users.", difficulty: "Intermediate" },
      { title: "Enterprise Security Monitoring & Threat Intelligence Platform (Capstone)", description: "Develop a production-ready cybersecurity platform that monitors enterprise systems, detects security threats, analyzes vulnerabilities, and generates real-time security intelligence.", difficulty: "Advanced" },
    ],
    skills: ["Network Security", "Kali Linux", "Wireshark", "OWASP", "Cryptography", "Python", "Ethical Hacking", "Incident Response"],
  }),
  digitalmarketing: detail({
    tagline: "Drive growth with data-driven marketing — SEO, ads, social media, and analytics.",
    longDescription: "Digital marketing drives modern business growth. This internship covers SEO, paid advertising, social media marketing, content strategy, email marketing, and analytics. You will create and optimize campaigns that deliver measurable results.",
    projects: [
      { title: "SEO Audit", description: "Complete SEO audit of a website with optimization recommendations.", difficulty: "Beginner" },
      { title: "Social Media Campaign", description: "Full campaign strategy with content calendar and KPIs.", difficulty: "Intermediate" },
      { title: "Google Ads Campaign", description: "PPC campaign with keyword targeting and budget optimization.", difficulty: "Intermediate" },
      { title: "Analytics Dashboard", description: "Dashboard tracking traffic, conversions, and campaign performance.", difficulty: "Advanced" },
    ],
    skills: ["SEO", "Google Ads", "Social Media Marketing", "Content Marketing", "Email Marketing", "Google Analytics", "PPC", "Copywriting"],
  }),
  cprogramming: detail({
    tagline: "Master the foundation of modern programming with C — the language that built the world.",
    longDescription: "C is the foundation of modern programming languages. This internship covers C fundamentals, data structures, file handling, and systems programming. You will build real-world applications and gain deep understanding of memory management and low-level computing.",
    projects: [
      { title: "Basic Programs", description: "Fundamental C programs covering variables, operators, and I/O.", difficulty: "Beginner" },
      { title: "Pattern Printing", description: "Star, number, and character patterns using nested loops.", difficulty: "Beginner" },
      { title: "Linked List Implementation", description: "Singly, doubly, and circular linked lists from scratch.", difficulty: "Intermediate" },
      { title: "Mini Banking System", description: "Console-based banking system with file persistence.", difficulty: "Advanced" },
    ],
    skills: ["C Language", "Data Structures", "Algorithms", "File I/O", "Memory Management", "Pointers", "Structures", "Recursion"],
  }),
  cppprogramming: detail({
    tagline: "Master high-performance OOP and systems programming with C++.",
    longDescription: "C++ powers operating systems, game engines, and high-performance applications. This internship covers OOP, STL, file handling, and advanced C++ features. You will build complete applications demonstrating object-oriented design and performance optimization.",
    projects: [
      { title: "OOP Concepts", description: "Classes, objects, constructors, and destructors.", difficulty: "Beginner" },
      { title: "Banking System", description: "OOP-driven banking with inheritance and polymorphism.", difficulty: "Intermediate" },
      { title: "Inventory Management", description: "Real-time stock tracking with STL containers.", difficulty: "Intermediate" },
      { title: "Mini Game Development", description: "Console game using OOP and random number generation.", difficulty: "Advanced" },
    ],
    skills: ["C++", "OOP", "STL", "File Handling", "Data Structures", "Templates", "Exception Handling", "Memory Management"],
  }),
  mernstack: detail({
    tagline: "Build modern full-stack web apps with MongoDB, Express, React, and Node.js.",
    longDescription: "The MERN stack is the most popular JavaScript full-stack solution. This internship covers React frontend, Express.js backend, MongoDB database, and deployment. You will build complete full-stack applications from scratch.",
    projects: [
      { title: "MERN Portfolio Website", description: "Portfolio website with admin panel to manage projects, skills, blogs, and messages.", difficulty: "Beginner" },
      { title: "Authentication System", description: "Secure authentication system with registration, login, and profile management.", difficulty: "Intermediate" },
      { title: "Blog Management System", description: "Blogging platform with rich text editor, comments, and admin moderation.", difficulty: "Intermediate" },
      { title: "Enterprise Project Management System (Capstone)", description: "Enterprise-grade project management platform with real-time notifications and RBAC.", difficulty: "Advanced" },
    ],
    skills: ["React", "Node.js", "Express.js", "MongoDB", "Mongoose", "JWT", "Socket.io", "Redux", "REST APIs", "Docker"],
  }),
  meanstack: detail({
    tagline: "Build enterprise web apps with MongoDB, Express, Angular, and Node.js.",
    longDescription: "The MEAN stack provides a robust foundation for enterprise applications. This internship covers Angular's powerful framework, Express.js backend, MongoDB, and deployment. You will build structured, scalable applications.",
    projects: [
      { title: "MEAN Portfolio Website", description: "Professional portfolio website with Angular frontend and Express/MongoDB backend.", difficulty: "Beginner" },
      { title: "Inventory Management System", description: "Manage products, stock, suppliers, and inventory transactions.", difficulty: "Intermediate" },
      { title: "Hospital Management System", description: "Hospital portal for patients, doctors, appointments, and medical records.", difficulty: "Intermediate" },
      { title: "Enterprise Resource Planning (ERP) System (Capstone)", description: "Complete enterprise ERP platform integrating HR, inventory, sales, and analytics.", difficulty: "Advanced" },
    ],
    skills: ["Angular", "TypeScript", "Node.js", "Express.js", "MongoDB", "RxJS", "NgRx", "REST APIs", "Docker"],
  }),
  dataanalytics: detail({
    tagline: "Turn data into business intelligence — dashboards, KPIs, and actionable insights.",
    longDescription: "Data analytics drives modern business decisions. This internship covers Excel, SQL, Power BI, Tableau, and Python for data analysis. You will build dashboards and reports that drive business decisions.",
    projects: [
      { title: "Excel Dashboard", description: "Interactive dashboard with pivot tables and charts.", difficulty: "Beginner" },
      { title: "Power BI Dashboard", description: "Interactive BI dashboard with DAX measures.", difficulty: "Intermediate" },
      { title: "Customer Analysis", description: "RFM analysis, cohort analysis, and CLV calculation.", difficulty: "Intermediate" },
      { title: "Sales Report", description: "Comprehensive sales analysis with forecasting.", difficulty: "Advanced" },
    ],
    skills: ["Excel", "SQL", "Power BI", "Tableau", "Python", "Pandas", "Data Visualization", "Statistics", "KPI Design"],
  }),
  machinelearning: detail({
    tagline: "Build prediction models, classifiers, and clustering systems with machine learning.",
    longDescription: "Machine learning powers modern AI applications. This internship covers regression, classification, clustering, feature engineering, and model deployment. You will build ML models that solve real-world problems.",
    projects: [
      { title: "Data Preprocessing", description: "Clean and prepare datasets for ML pipelines.", difficulty: "Beginner" },
      { title: "Classification Model", description: "Decision trees, random forests, and logistic regression.", difficulty: "Intermediate" },
      { title: "Model Deployment", description: "Deploy ML models as REST APIs with Flask/FastAPI.", difficulty: "Intermediate" },
      { title: "ML Dashboard", description: "Visualize model performance and predictions.", difficulty: "Advanced" },
    ],
    skills: ["Python", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Regression", "Classification", "Clustering", "Model Evaluation"],
  }),
  deeplearning: detail({
    tagline: "Master neural networks, CNNs, RNNs, and transformers for deep learning applications.",
    longDescription: "Deep learning is at the forefront of AI innovation. This internship covers neural networks, CNNs, RNNs, LSTMs, transfer learning, and model optimization. You will build deep learning models for image, text, and sequence tasks.",
    projects: [
      { title: "Neural Networks", description: "Feedforward networks with Keras/TensorFlow.", difficulty: "Beginner" },
      { title: "CNN Model", description: "Image classification with convolutional neural networks.", difficulty: "Intermediate" },
      { title: "LSTM Project", description: "Text generation or time series with LSTM models.", difficulty: "Intermediate" },
      { title: "Object Detection", description: "Object detection using YOLO or pre-trained models.", difficulty: "Advanced" },
    ],
    skills: ["TensorFlow", "Keras", "PyTorch", "CNNs", "RNNs", "LSTMs", "Transfer Learning", "GPU Computing", "Model Optimization"],
  }),
  generativeai: detail({
    tagline: "Build AI-powered applications with LLMs, RAG, agents, and content generation.",
    longDescription: "Generative AI is transforming how we create content and interact with technology. This internship covers prompt engineering, OpenAI API, RAG, vector databases, and AI agent development. You will build production GenAI applications.",
    projects: [
      { title: "OpenAI API Integration", description: "GPT APIs with streaming and function calling.", difficulty: "Beginner" },
      { title: "AI Chatbot", description: "Intelligent chatbot with context memory and multi-turn conversations.", difficulty: "Intermediate" },
      { title: "RAG Basics", description: "Retrieval-Augmented Generation for accurate, grounded responses.", difficulty: "Intermediate" },
      { title: "AI Agent Development", description: "Autonomous agents with planning, reasoning, and tool use.", difficulty: "Advanced" },
    ],
    skills: ["OpenAI API", "LangChain", "Prompt Engineering", "RAG", "Vector Databases", "AI Agents", "FastAPI", "Docker", "Streamlit"],
  }),
  promptengineering: detail({
    tagline: "Master the art and science of crafting effective prompts for AI systems.",
    longDescription: "Prompt engineering is the key skill for working with AI. This internship covers zero-shot, few-shot, chain-of-thought prompting, and production prompt systems. You will build a portfolio of prompt engineering projects.",
    projects: [
      { title: "Prompt Fundamentals", description: "Core techniques — role, context, instruction, format.", difficulty: "Beginner" },
      { title: "AI Research Assistant", description: "Prompts for paper analysis and insight extraction.", difficulty: "Intermediate" },
      { title: "AI Coding Assistant", description: "Prompts for code generation, debugging, and review.", difficulty: "Intermediate" },
      { title: "AI Workflow Design", description: "Multi-step AI workflows combining prompts and tools.", difficulty: "Advanced" },
    ],
    skills: ["Prompt Design", "OpenAI API", "Chain-of-Thought", "Few-Shot Learning", "Evaluation Methods", "A/B Testing", "LLM Behavior"],
  }),
  cloudcomputing: detail({
    tagline: "Master cloud infrastructure — AWS, Azure, GCP, CI/CD, and DevOps.",
    longDescription: "Cloud computing is the backbone of modern applications. This internship covers VMs, storage, networking, IAM, databases, monitoring, and CI/CD on major cloud platforms. You will deploy and manage real cloud infrastructure.",
    projects: [
      { title: "Virtual Machine Setup", description: "Launch and configure EC2/VMs with networking.", difficulty: "Beginner" },
      { title: "Static Website Hosting", description: "Host a website on S3/CloudFront with SSL.", difficulty: "Beginner" },
      { title: "CI/CD Deployment", description: "Build pipelines with CodePipeline or GitHub Actions.", difficulty: "Intermediate" },
      { title: "Cloud Security", description: "WAF, encryption, VPC, and compliance implementation.", difficulty: "Advanced" },
    ],
    skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Networking", "Security"],
  }),
  ethicalhacking: detail({
    tagline: "Learn penetration testing, reconnaissance, and exploitation — the ethical way.",
    longDescription: "Ethical hacking protects organizations from cyber threats. This internship covers Kali Linux, Nmap, web app testing, SQL injection, XSS, and vulnerability reporting. You will practice on real lab environments.",
    projects: [
      { title: "Kali Linux Setup", description: "Set up a professional pentesting environment.", difficulty: "Beginner" },
      { title: "Nmap Scanning", description: "Network discovery and service detection.", difficulty: "Intermediate" },
      { title: "SQL Injection Lab", description: "Practice SQL injection attacks and defenses.", difficulty: "Intermediate" },
      { title: "Vulnerability Report", description: "Professional penetration test report with CVSS ratings.", difficulty: "Advanced" },
    ],
    skills: ["Kali Linux", "Nmap", "Burp Suite", "SQL Injection", "XSS", "OWASP", "Reconnaissance", "Vulnerability Assessment"],
  }),
  androiddevelopment: detail({
    tagline: "Build native Android apps with Kotlin, Jetpack, and the Android ecosystem.",
    longDescription: "Android dominates the mobile market. This internship covers Android Studio, UI design, navigation, databases, API integration, Firebase, and Play Store deployment. You will build and publish complete Android apps.",
    projects: [
      { title: "UI Design", description: "Material Design layouts with XML and ConstraintLayout.", difficulty: "Beginner" },
      { title: "API Integration", description: "REST API connectivity with Retrofit and coroutines.", difficulty: "Intermediate" },
      { title: "Firebase Integration", description: "Auth, Firestore, and push notifications.", difficulty: "Intermediate" },
      { title: "Play Store Preparation", description: "App signing, listing, and Play Store submission.", difficulty: "Advanced" },
    ],
    skills: ["Kotlin", "Android Studio", "Jetpack", "Material Design", "Retrofit", "Room", "Firebase", "Play Store"],
  }),
  flutterdevelopment: detail({
    tagline: "Build beautiful cross-platform mobile apps with Flutter and Dart.",
    longDescription: "Flutter enables building for iOS, Android, web, and desktop from a single codebase. This internship covers Dart, widgets, state management, Firebase integration, and app store deployment. You will build and deploy cross-platform apps.",
    projects: [
      { title: "Flutter Basics", description: "Dart fundamentals and first Flutter app.", difficulty: "Beginner" },
      { title: "CRUD Application", description: "Data-driven app with Firebase Firestore backend.", difficulty: "Intermediate" },
      { title: "Payment Integration", description: "Razorpay or Stripe payment processing.", difficulty: "Intermediate" },
      { title: "Final Flutter Project", description: "Complete app published to both app stores.", difficulty: "Advanced" },
    ],
    skills: ["Flutter", "Dart", "Firebase", "State Management", "REST APIs", "Material Design", "Widgets", "App Store Deploy"],
  }),
  reactnative: detail({
    tagline: "Build cross-platform mobile apps with React and native components.",
    longDescription: "React Native lets you build mobile apps using JavaScript and React. This internship covers React Native components, navigation, API integration, Firebase, and deployment to both app stores.",
    projects: [
      { title: "React Native Basics", description: "Core components and first cross-platform app.", difficulty: "Beginner" },
      { title: "API Integration", description: "REST API connectivity with fetch and Axios.", difficulty: "Intermediate" },
      { title: "Push Notifications", description: "Firebase Cloud Messaging integration.", difficulty: "Intermediate" },
      { title: "Final Mobile App", description: "Complete app published to App Store and Play Store.", difficulty: "Advanced" },
    ],
    skills: ["React Native", "JavaScript", "React", "Expo", "Firebase", "Navigation", "REST APIs", "App Store Deploy"],
  }),
  graphicdesign: detail({
    tagline: "Master visual storytelling through typography, color, imagery, and brand identity.",
    longDescription: "Graphic design communicates ideas visually. This internship covers typography, color theory, social media design, logo design, brand identity, and print production. You will build a complete design portfolio.",
    projects: [
      { title: "Social Media Post", description: "Eye-catching graphics for Instagram and LinkedIn.", difficulty: "Beginner" },
      { title: "Logo Design", description: "Memorable logos with concept development.", difficulty: "Intermediate" },
      { title: "Brand Identity Kit", description: "Complete brand identity with guidelines.", difficulty: "Advanced" },
      { title: "Final Branding Project", description: "Full branding project from research to deliverables.", difficulty: "Advanced" },
    ],
    skills: ["Adobe Photoshop", "Illustrator", "Figma", "Typography", "Color Theory", "Brand Identity", "Print Design", "Logo Design"],
  }),
  motiongraphics: detail({
    tagline: "Create animated visuals that captivate audiences across video and social media.",
    longDescription: "Motion graphics bring static designs to life. This internship covers After Effects, logo animation, kinetic typography, social media animation, and video production. You will create a professional motion reel.",
    projects: [
      { title: "Logo Animation", description: "Animated logos with reveal effects and energy.", difficulty: "Beginner" },
      { title: "Kinetic Typography", description: "Dynamic text animations with motion paths.", difficulty: "Intermediate" },
      { title: "Promo Video", description: "Promotional video with transitions and CTAs.", difficulty: "Intermediate" },
      { title: "Motion Reel", description: "Professional showreel of best motion work.", difficulty: "Advanced" },
    ],
    skills: ["After Effects", "Premiere Pro", "Animation Principles", "Kinetic Typography", "Motion Design", "Sound Design", "Compositing"],
  }),
  videoediting: detail({
    tagline: "Master professional video production — from raw footage to polished final cut.",
    longDescription: "Video editing is essential for content creation. This internship covers cutting, color correction, audio enhancement, green screen, motion effects, and multi-format production. You will build a professional editing portfolio.",
    projects: [
      { title: "YouTube Video Edit", description: "Complete YouTube video with intro, B-roll, and graphics.", difficulty: "Beginner" },
      { title: "Instagram Reel", description: "Engaging short-form vertical video.", difficulty: "Beginner" },
      { title: "Green Screen Editing", description: "Chroma keying and background compositing.", difficulty: "Intermediate" },
      { title: "Final Video Project", description: "Broadcast-quality video from raw footage to export.", difficulty: "Advanced" },
    ],
    skills: ["Premiere Pro", "DaVinci Resolve", "After Effects", "Color Correction", "Audio Mixing", "Green Screen", "Subtitles", "Multi-format Export"],
  }),
  animation: detail({
    tagline: "Bring characters and stories to life through the art of animation.",
    longDescription: "Animation combines art and technology to tell stories. This internship covers animation principles, character design, storyboarding, 2D animation, and film production. You will create a complete animated short.",
    projects: [
      { title: "Animation Principles", description: "12 principles — squash, stretch, timing, spacing.", difficulty: "Beginner" },
      { title: "Character Walk Cycle", description: "Realistic and stylized walk cycle animation.", difficulty: "Intermediate" },
      { title: "Explainer Video", description: "Animated explainer with narration and transitions.", difficulty: "Intermediate" },
      { title: "Short Animated Film", description: "Complete animated short from concept to render.", difficulty: "Advanced" },
    ],
    skills: ["After Effects", "Toon Boom", "Krita", "Character Design", "Storyboarding", "2D Animation", "Lip Sync", "Sound Design"],
  }),
  threeddesign: detail({
    tagline: "Master 3D modeling, texturing, lighting, and rendering with Blender.",
    longDescription: "3D design creates immersive visual experiences. This internship covers Blender fundamentals, modeling, texturing, lighting, camera animation, and rendering. You will create photorealistic 3D scenes and a professional portfolio.",
    projects: [
      { title: "Basic Modeling", description: "3D objects with mesh editing and modifiers.", difficulty: "Beginner" },
      { title: "Product Rendering", description: "Photorealistic product renders with studio lighting.", difficulty: "Intermediate" },
      { title: "Character Modeling", description: "Stylized characters with proper topology.", difficulty: "Intermediate" },
      { title: "Final 3D Project", description: "Full 3D project from concept to final render.", difficulty: "Advanced" },
    ],
    skills: ["Blender", "3D Modeling", "UV Unwrapping", "PBR Texturing", "Lighting", "Rendering", "Compositing", "Sculpting"],
  }),
  genai: detail({
    tagline: "Harness LLMs, OpenAI API, prompt engineering, and generative AI workflow development.",
    longDescription: "Generative AI is revolutionizing how software is built. In this internship, you will design advanced prompt architectures, integrate state-of-the-art LLM APIs, build autonomous AI assistants, implement retrieval-augmented generation (RAG), and create production-ready generative AI applications.",
    projects: [
      { title: "AI Chatbot", description: "Build an intelligent chatbot with context handling and prompt optimization.", difficulty: "Beginner" },
      { title: "AI Resume & Study Assistant", description: "AI-powered document and interview preparation tools.", difficulty: "Intermediate" },
      { title: "AI Code & Content Generator", description: "Multi-purpose generation platform with structured output validation.", difficulty: "Intermediate" },
      { title: "AI Document Q&A Assistant", description: "Enterprise RAG document question answering system.", difficulty: "Advanced" },
    ],
    skills: ["Prompt Engineering", "OpenAI API", "LangChain", "LLMs", "RAG", "Embeddings", "Python", "Vector Databases"],
  }),
  powerbi: detail({
    tagline: "Create interactive business intelligence dashboards, DAX measures, and enterprise analytics.",
    longDescription: "Power BI transforms fragmented data into rich visual stories that empower executive decision-making. Learn data ingestion with Power Query, complex DAX calculations, dimensional data modeling, custom KPI scorecards, and interactive dashboard publishing.",
    projects: [
      { title: "Sales Performance Dashboard", description: "Executive KPI sales dashboard with slicers, trend lines, and forecast views.", difficulty: "Beginner" },
      { title: "HR & Finance Analytics", description: "Departmental performance, headcount turnover, and financial cashflow dashboards.", difficulty: "Intermediate" },
      { title: "Hospital & Healthcare KPI Portal", description: "Patient admission, bed occupancy, and treatment outcome monitoring.", difficulty: "Intermediate" },
      { title: "Executive KPI Dashboard (Capstone)", description: "Cross-functional enterprise intelligence suite with automated drill-down reports.", difficulty: "Advanced" },
    ],
    skills: ["Power BI", "DAX", "Power Query", "Data Modeling", "Business Intelligence", "KPI Dashboards", "Excel", "SQL"],
  }),
  devops: detail({
    tagline: "Master CI/CD pipelines, Docker containerization, automated deployments, and infrastructure monitoring.",
    longDescription: "Bridge the gap between development and operations. Gain practical experience writing automated GitHub Actions / Jenkins CI/CD pipelines, containerizing multi-tier applications with Docker, managing releases, and configuring monitoring with Prometheus and Grafana.",
    projects: [
      { title: "Git Workflow & CI/CD Pipeline", description: "Automated linting, testing, and artifact building on code push.", difficulty: "Beginner" },
      { title: "Dockerized Web App", description: "Multi-container application packaging with Docker Compose.", difficulty: "Intermediate" },
      { title: "Infrastructure Monitoring System", description: "System metrics collection, health dashboards, and alert triggers.", difficulty: "Intermediate" },
      { title: "Automated Backup & Release Pipeline (Capstone)", description: "Zero-downtime deployment pipeline with automated database backups.", difficulty: "Advanced" },
    ],
    skills: ["Git & GitHub", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Linux", "Nginx", "Monitoring"],
  }),
  softwaretesting: detail({
    tagline: "Master manual testing, test automation, Selenium, API testing, and defect tracking.",
    longDescription: "Quality assurance is critical to shipping reliable software. Master test plan development, test case authoring, boundary value analysis, automated browser testing with Selenium/Cypress, Postman API verification, regression cycles, and bug lifecycle reporting.",
    projects: [
      { title: "Test Plan & Test Suite for E-Commerce", description: "Comprehensive test scenario catalog covering cart, checkout, and inventory.", difficulty: "Beginner" },
      { title: "API & Login Testing Suite", description: "Automated endpoint validation, payload checks, and authentication security tests.", difficulty: "Intermediate" },
      { title: "Cross-Browser & Performance Testing", description: "Multi-browser matrix test automation and load response profiling.", difficulty: "Intermediate" },
      { title: "End-to-End Test Automation Demo (Capstone)", description: "Automated test runner integrated with CI pipeline and defect reporting.", difficulty: "Advanced" },
    ],
    skills: ["Manual Testing", "Test Automation", "Selenium", "Postman", "API Testing", "Bug Tracking", "Regression Testing", "Test Reporting"],
  }),
  mobileapp: detail({
    tagline: "Build high-performance, responsive mobile apps with clean navigation and API integration.",
    longDescription: "Learn modern mobile application development from the ground up. Design fluid, responsive mobile interfaces, implement persistent local storage, connect to REST APIs, manage complex client state, and package apps for Android and iOS distribution.",
    projects: [
      { title: "Student Management App", description: "Mobile interface for student records, timetable, and attendance tracking.", difficulty: "Beginner" },
      { title: "Expense Tracker & Notes App", description: "Offline-first mobile utilities with local database storage and charts.", difficulty: "Intermediate" },
      { title: "Food Ordering & Event App", description: "Interactive product feeds, checkout workflows, and location services.", difficulty: "Intermediate" },
      { title: "Appointment Booking App (Capstone)", description: "Real-time service booking app with notifications and profile management.", difficulty: "Advanced" },
    ],
    skills: ["Mobile UI", "React Native / Android", "TypeScript", "REST APIs", "State Management", "Local Storage", "Push Notifications"],
  }),
  flutter: detail({
    tagline: "Build stunning, natively compiled cross-platform apps using Dart and the Flutter framework.",
    longDescription: "Flutter allows you to craft beautiful, natively compiled applications for mobile, web, and desktop from a single codebase. Master Flutter widgets, reactive state management, animations, HTTP networking, and Firebase backend integration.",
    projects: [
      { title: "Flutter Expense Tracker", description: "Cross-platform personal finance tracker with custom widgets and animations.", difficulty: "Beginner" },
      { title: "Flutter Quiz & Notes App", description: "Interactive quiz game and markdown note manager with local persistence.", difficulty: "Intermediate" },
      { title: "Flutter Food Ordering & E-Commerce UI", description: "Modern catalog navigation, cart management, and checkout flows.", difficulty: "Intermediate" },
      { title: "Flutter Appointment & Task Manager (Capstone)", description: "Production-grade multi-screen appointment scheduling application.", difficulty: "Advanced" },
    ],
    skills: ["Flutter", "Dart", "Widgets", "State Management", "Provider / Bloc", "Firebase Integration", "REST APIs", "Mobile UI"],
  }),
  socialmedia: detail({
    tagline: "Develop data-driven social media growth campaigns, publishing strategies, and engagement analytics.",
    longDescription: "Social media management is essential for modern business growth. Learn audience persona profiling, content calendar scheduling, hashtag optimization, engagement growth strategies, social media audits, and monthly analytics reporting across Instagram, LinkedIn, and YouTube.",
    projects: [
      { title: "Instagram Content Calendar & Hashtag Plan", description: "Structured 30-day posting schedule with targeted hashtag research.", difficulty: "Beginner" },
      { title: "LinkedIn & YouTube Strategy", description: "B2B thought leadership content matrix and video publishing roadmap.", difficulty: "Intermediate" },
      { title: "Brand Page Setup & Audit", description: "Comprehensive brand page optimization, bio copywriting, and competitor benchmark.", difficulty: "Intermediate" },
      { title: "Monthly Social Media Growth Report (Capstone)", description: "Full-funnel organic engagement analysis with ROI insights and recommendations.", difficulty: "Advanced" },
    ],
    skills: ["Social Media Strategy", "Content Calendars", "Audience Growth", "Analytics & Insights", "Copywriting", "Hashtag Research", "Campaign Management"],
  }),
  contentwriting: detail({
    tagline: "Master SEO content writing, technology blogging, copywriting, and technical documentation.",
    longDescription: "High-impact writing drives traffic, educates users, and converts prospects. Learn search-engine-optimized blogging, product storytelling, persuasive landing page copywriting, technical API documentation, email newsletters, and thought leadership articles.",
    projects: [
      { title: "SEO Blog Series & Technology Articles", description: "Keyword-researched, high-ranking long-form technical tutorials.", difficulty: "Beginner" },
      { title: "Landing Page Copy & Social Content Pack", description: "Conversion-optimized headline, value proposition, and CTA copywriting.", difficulty: "Intermediate" },
      { title: "Press Release & Technical Documentation", description: "Structured developer documentation and formal brand announcements.", difficulty: "Intermediate" },
      { title: "Comprehensive Case Study & Portfolio (Capstone)", description: "In-depth corporate case study showcasing problem, solution, and quantifiable results.", difficulty: "Advanced" },
    ],
    skills: ["SEO Writing", "Content Strategy", "Copywriting", "Technical Writing", "Keyword Research", "Editing & Proofreading", "Blogging"],
  }),
  wordpress: detail({
    tagline: "Design and customize responsive WordPress websites, WooCommerce stores, and custom themes.",
    longDescription: "Powering over 40% of the web, WordPress is a powerhouse CMS. Learn theme customization, visual page builders, dynamic custom post types, WooCommerce digital store configuration, contact form workflows, performance optimization, and search engine SEO.",
    projects: [
      { title: "Business & Portfolio Website", description: "Mobile-responsive company showcase with custom branding and inquiry forms.", difficulty: "Beginner" },
      { title: "Blog & Restaurant Portal", description: "Dynamic content categorization, table reservation system, and menu displays.", difficulty: "Intermediate" },
      { title: "E-Commerce Store (WooCommerce)", description: "Product catalog, shopping cart, coupon system, and payment gateway setup.", difficulty: "Intermediate" },
      { title: "Service Booking & Agency Platform (Capstone)", description: "Full-featured client booking and agency showcase with speed optimization.", difficulty: "Advanced" },
    ],
    skills: ["WordPress", "WooCommerce", "Theme Customization", "Elementor", "SEO Best Practices", "Speed Optimization", "Plugin Configuration"],
  }),
  databasemanagement: detail({
    tagline: "Master relational schema design, SQL query optimization, transaction integrity, and backups.",
    longDescription: "Databases form the backbone of every serious software application. Dive deep into third-normal-form relational schema design, entity relationship diagrams (ERDs), complex multi-table SQL joins, stored procedures, indexing for high performance, and backup disaster recovery.",
    projects: [
      { title: "Library & Student Database Schema", description: "Normalized relational schemas with primary/foreign keys and validation constraints.", difficulty: "Beginner" },
      { title: "E-Commerce & Hospital Database", description: "Multi-entity transactional database with order processing and inventory ledgers.", difficulty: "Intermediate" },
      { title: "Vehicle Rental & Hotel Booking System", description: "Availability checking queries, conflict resolution, and reporting views.", difficulty: "Intermediate" },
      { title: "Database Backup & Reporting Suite (Capstone)", description: "Automated scheduled backup procedures, data audit logs, and analytical reports.", difficulty: "Advanced" },
    ],
    skills: ["PostgreSQL", "MySQL", "SQL Queries", "Schema Design", "Normalization", "Indexing & Optimization", "Database Administration", "Data Integrity"],
  }),
  gamedevelopment: detail({
    tagline: "Build interactive 2D and 3D games with physics engines, sound effects, and gameplay loops.",
    longDescription: "Step into the exciting world of game engineering. Learn game loop architecture, sprite animation, player input handling, 2D physics and collision detection, audio soundscapes, high-score tracking, and level design across puzzle, arcade, and adventure genres.",
    projects: [
      { title: "2D Platformer & Arcade Game", description: "Classic physics-based jumping mechanics, tilemaps, collectibles, and enemy AI.", difficulty: "Beginner" },
      { title: "Snake, Memory & Puzzle Games", description: "Grid-based logic games with state saving, timers, and difficulty scaling.", difficulty: "Intermediate" },
      { title: "Space Shooter & Car Racing Demo", description: "Fast-paced action gameplay with particle explosions and scoreboards.", difficulty: "Intermediate" },
      { title: "Chess & Educational Game (Capstone)", description: "Strategic rule-based board game with move validation and polished UI.", difficulty: "Advanced" },
    ],
    skills: ["Game Mechanics", "Game Loop Architecture", "Physics & Collisions", "2D/3D Math", "UI & Controls", "Game Design", "Audio Integration"],
  }),
};

export function getInternshipDetail(slug: string): InternshipDetail | undefined {
  if (!slug) return undefined;
  const direct = INTERNSHIP_DETAILS[slug];
  if (direct) return direct;

  const aliases: Record<string, string> = {
    generativeai: "genai",
    promptengineering: "genai",
    flutterdevelopment: "flutter",
    androiddevelopment: "mobileapp",
    reactnative: "mobileapp",
  };
  const aliasedKey = aliases[slug.toLowerCase()];
  if (aliasedKey && INTERNSHIP_DETAILS[aliasedKey]) {
    return INTERNSHIP_DETAILS[aliasedKey];
  }

  return undefined;
}
