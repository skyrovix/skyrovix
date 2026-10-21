export type TaskData = {
  taskNumber: number;
  title: string;
  description: string;
  features: string[];
  outcome: string;
};

export type DomainTasks = {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  tasks: TaskData[];
};

export const ALL_DOMAINS_TASKS: DomainTasks[] = [
  {
    "slug": "fullstack",
    "name": "Full Stack Development",
    "icon": "FS",
    "color": "from-fuchsia-500 to-[#181619]",
    "description": "End-to-end web apps with frontend, backend, databases, and APIs.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Personal Portfolio Website",
        "description": "Build a responsive personal portfolio website with About, Skills, Projects, and Contact sections using modern web fundamentals.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, Git, GitHub, Vercel",
          "Semantic HTML, Flexbox/Grid, and responsive design breakpoints",
          "DOM basics, interactive sections, and contact form validation",
          "Git & GitHub version control with clear commits and README documentation",
          "Live deployment on Vercel with responsive mobile-first testing"
        ],
        "outcome": "Responsive portfolio with About, Skills, Projects and Contact sections deployed online."
      },
      {
        "taskNumber": 2,
        "title": "Responsive Landing Page",
        "description": "Design and implement a high-conversion, modern responsive product or service landing page.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, GitHub, Vercel",
          "UI layout, mobile-first responsive breakpoints, and reusable sections",
          "Hero banner, feature showcases, customer testimonials, and CTA design",
          "Clean component/file structure and cross-browser responsiveness",
          "Production deployment with live URL and GitHub repository"
        ],
        "outcome": "Modern responsive landing page deployed online."
      },
      {
        "taskNumber": 3,
        "title": "To-Do List Application",
        "description": "Develop a persistent task manager application with comprehensive CRUD operations and LocalStorage.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, LocalStorage, GitHub, Vercel",
          "DOM manipulation, dynamic event listeners, and state handling",
          "Create, read, update, delete (CRUD) tasks with completed toggling",
          "Browser LocalStorage integration for offline data persistence",
          "Filter tasks by status (All, Active, Completed) and search input"
        ],
        "outcome": "Persistent task manager with add/edit/delete/filter."
      },
      {
        "taskNumber": 4,
        "title": "Calculator Web App",
        "description": "Create an interactive, accessible calculator web app supporting standard arithmetic operations and keyboard input.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, GitHub, Vercel",
          "Modular functions, arithmetic operators, and expression evaluation",
          "Keyboard navigation support and click event handling",
          "Error handling for division by zero and invalid syntax",
          "Clean responsive layout mimicking modern physical and digital calculators"
        ],
        "outcome": "Functional calculator with keyboard support and error handling."
      },
      {
        "taskNumber": 5,
        "title": "Weather Dashboard",
        "description": "Build an asynchronous weather dashboard fetching live meteorological data from a RESTful weather API.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, Fetch API, Weather API, Vercel",
          "Asynchronous API integration with async/await and JSON parsing",
          "Search cities with real-time temperature, humidity, wind, and forecast",
          "Graceful handling of loading spinners, empty states, and invalid city errors",
          "Secure environment variable management for API keys without committing credentials"
        ],
        "outcome": "Searchable weather dashboard using live API data."
      },
      {
        "taskNumber": 6,
        "title": "Expense Tracker",
        "description": "Construct a personal finance expense and income tracker with interactive charts and category summaries.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, LocalStorage, Chart.js, Vercel",
          "Form validation, dynamic array/object manipulation, and total calculations",
          "Visual expense breakdown with interactive Chart.js doughnut and bar charts",
          "Filter by income vs. expense and categorization (Food, Rent, Travel, etc.)",
          "Persistent LocalStorage sync with import/export capabilities"
        ],
        "outcome": "Expense/income tracker with category summaries and charts."
      },
      {
        "taskNumber": 7,
        "title": "Quiz Application",
        "description": "Build a timed interactive quiz platform with category selection, dynamic question rendering, and real-time score calculation.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, JSON, LocalStorage",
          "Countdown timers, interval handling, and state-driven question progression",
          "Score calculation, answer review breakdown, and high score tracking",
          "Dynamic question rendering from JSON dataset with multiple question types",
          "Responsive UI with progress indicators and immediate feedback"
        ],
        "outcome": "Timed quiz with score and result screen."
      },
      {
        "taskNumber": 8,
        "title": "Notes Management App",
        "description": "Develop a searchable, tag-based notes management application with persistent local storage and rich UI patterns.",
        "features": [
          "Tech Stack: HTML5, CSS3, JavaScript, LocalStorage, Vercel",
          "Full CRUD for notes with instant search and category tag filtering",
          "Color coding, pinned notes, and timestamp tracking (created/edited)",
          "Reusable UI patterns, responsive grid/list view toggling",
          "LocalStorage persistence with empty state and delete confirmations"
        ],
        "outcome": "Searchable notes application with persistent storage."
      },
      {
        "taskNumber": 9,
        "title": "Recipe Finder",
        "description": "Create a modern React recipe discovery application that interfaces with a third-party culinary REST API.",
        "features": [
          "Tech Stack: React, JavaScript, REST API, CSS, Vercel",
          "React component hierarchy, props, useState, and useEffect hooks",
          "API integration with keyword search, dietary filters, and meal types",
          "Recipe detail view with ingredients list, prep time, and instructions",
          "Favorites bookmarking system stored in browser storage"
        ],
        "outcome": "Recipe search app with details and favorites."
      },
      {
        "taskNumber": 10,
        "title": "Movie Explorer",
        "description": "Develop a React movie browsing and discovery application featuring pagination, search, and dynamic routing.",
        "features": [
          "Tech Stack: React, REST API, JavaScript, CSS, Vercel",
          "Reusable card components, loading skeletons, and error boundaries",
          "Pagination and infinite scroll for trending and genre-filtered movies",
          "Detailed modal or route showing cast, trailer embed, and ratings",
          "Debounced search bar for smooth API queries and optimized performance"
        ],
        "outcome": "Movie discovery application with search and details."
      },
      {
        "taskNumber": 11,
        "title": "React To-Do App",
        "description": "Build a scalable, component-based task management application using React, Vite, and custom hooks.",
        "features": [
          "Tech Stack: React, Vite, JavaScript, CSS, GitHub, Vercel",
          "Modern functional components, props, state, and controlled form inputs",
          "Task categories, priority tagging (Low, Medium, High), and due dates",
          "Custom useLocalStorage hook for decoupled state persistence",
          "Clean folder architecture with modular components and styling"
        ],
        "outcome": "Component-based task manager."
      },
      {
        "taskNumber": 12,
        "title": "React Expense Dashboard",
        "description": "Build an interactive financial analytics dashboard using React, Vite, and Recharts or Chart.js.",
        "features": [
          "Tech Stack: React, Vite, Chart.js/Recharts, JavaScript, CSS",
          "Derived state calculations, useMemo and useCallback performance optimizations",
          "Dynamic bar, line, and pie charts reflecting monthly expenditure trends",
          "Multi-currency support and date-range filtering (Weekly, Monthly, Yearly)",
          "Responsive layout with quick-add transaction modal and summary cards"
        ],
        "outcome": "Responsive financial dashboard."
      },
      {
        "taskNumber": 13,
        "title": "React E-Commerce UI",
        "description": "Develop a comprehensive e-commerce storefront frontend with catalog browsing, shopping cart, and client-side routing.",
        "features": [
          "Tech Stack: React, Vite, React Router, CSS/Tailwind, Fake Store API",
          "React Router DOM multi-page navigation (Home, Products, Product Details, Cart)",
          "Global cart state using React Context API with quantity adjustment and subtotal",
          "Product filtering by category, price slider, and sorting by rating",
          "Responsive product grids with quick preview and toast notifications"
        ],
        "outcome": "Complete e-commerce frontend ready for backend integration."
      },
      {
        "taskNumber": 14,
        "title": "React Authentication UI",
        "description": "Construct a production-grade authentication flow UI featuring login, registration, password reset, and protected routes.",
        "features": [
          "Tech Stack: React, React Router, JavaScript, CSS/Tailwind",
          "Form validation with real-time regex checks and accessible error messages",
          "Protected route wrappers checking simulated authentication tokens",
          "Login, registration, forgot password, and reset password screens",
          "Loading indicators, password visibility toggle, and social login buttons"
        ],
        "outcome": "Production-style login, registration and reset screens."
      },
      {
        "taskNumber": 15,
        "title": "React Admin Dashboard",
        "description": "Design and implement a responsive administrative analytics dashboard with data tables, charts, and navigation sidebar.",
        "features": [
          "Tech Stack: React, Vite, React Router, Recharts, Tailwind CSS",
          "Collapsible responsive sidebar navigation and dark/light theme toggle",
          "KPI statistics cards with percentage growth badges and sparklines",
          "Sortable, searchable, and paginated data table for user/order management",
          "Multi-chart analytics section depicting revenue and active user metrics"
        ],
        "outcome": "Reusable admin dashboard UI."
      },
      {
        "taskNumber": 16,
        "title": "Node.js REST API",
        "description": "Create a structured, production-ready RESTful API backend using Node.js and Express with controller architecture.",
        "features": [
          "Tech Stack: Node.js, Express.js, JavaScript, Postman, GitHub",
          "HTTP methods (GET, POST, PUT, DELETE) and standard HTTP status codes",
          "Layered architecture: routes, controllers, middleware, and services",
          "Centralized error handling middleware and structured JSON responses",
          "Postman test collection documenting endpoints and response schemas"
        ],
        "outcome": "Structured REST API tested with Postman."
      },
      {
        "taskNumber": 17,
        "title": "User Management API",
        "description": "Build a robust User Management micro-service with MongoDB and Mongoose handling full CRUD and pagination.",
        "features": [
          "Tech Stack: Node.js, Express.js, MongoDB, Mongoose, Postman",
          "Mongoose schema definitions with strict data types and validators",
          "Full CRUD endpoints with query parameter pagination, sorting, and field limiting",
          "Input validation and sanitization middleware to prevent NoSQL injection",
          "Comprehensive error response formats and Postman documentation"
        ],
        "outcome": "Documented user CRUD API."
      },
      {
        "taskNumber": 18,
        "title": "Authentication API",
        "description": "Implement a secure authentication and authorization backend system using bcrypt password hashing and JWT.",
        "features": [
          "Tech Stack: Node.js, Express.js, MongoDB, Mongoose, bcrypt, JWT",
          "User registration with salted bcrypt password hashing and email uniqueness",
          "Login route issuing signed JSON Web Tokens (JWT) with configurable expiry",
          "Auth verification middleware protecting private endpoints via Bearer tokens",
          "Role-Based Access Control (RBAC) middleware verifying student vs. admin access"
        ],
        "outcome": "Secure login/register API with protected routes."
      },
      {
        "taskNumber": 19,
        "title": "File Upload API",
        "description": "Build a resilient file upload and media management API utilizing Multer and cloud storage integration.",
        "features": [
          "Tech Stack: Node.js, Express.js, Multer, MongoDB, Cloudinary/S3-compatible storage",
          "Multipart form-data parsing with Multer and file type/size validation",
          "Direct upload to Cloudinary or S3-compatible cloud bucket with URL retrieval",
          "File metadata (size, mimetype, URL, uploadedBy) saved to database",
          "Download and delete endpoints with proper access control verification"
        ],
        "outcome": "File upload/download management API."
      },
      {
        "taskNumber": 20,
        "title": "Contact Management API",
        "description": "Develop a high-performance contact and CRM management REST backend with search, filtering, and pagination.",
        "features": [
          "Tech Stack: Node.js, Express.js, MongoDB, Mongoose, Postman",
          "Search contacts by name, email, or company using regex and indexed fields",
          "Pagination, sorting, and tag grouping for enterprise address books",
          "Request validation using Joi or Express-validator middleware",
          "Standardized REST response envelopes with status, data, and error objects"
        ],
        "outcome": "Reusable contact-management backend."
      },
      {
        "taskNumber": 21,
        "title": "MySQL User Database",
        "description": "Architect a relational user database service utilizing MySQL, raw SQL queries, and connection pooling.",
        "features": [
          "Tech Stack: Node.js, Express.js, MySQL, mysql2, Postman",
          "Relational schema design with primary keys, foreign keys, and indexes",
          "SQL CRUD operations with parameterized queries preventing SQL injection",
          "Table JOINs connecting users with profiles, roles, and activity records",
          "Connection pooling and transaction support for database performance"
        ],
        "outcome": "Database-backed user API."
      },
      {
        "taskNumber": 22,
        "title": "PostgreSQL Task Manager",
        "description": "Build a relational task and workflow backend leveraging PostgreSQL and the Prisma ORM.",
        "features": [
          "Tech Stack: Node.js, Express.js, PostgreSQL, Prisma ORM, Postman",
          "Prisma schema definition with 1-to-many and many-to-many relations",
          "Database migrations workflow (prisma migrate) and seed data automation",
          "Atomic database transactions for multi-step task assignments",
          "Query filtering, nested relation loading, and Postman API collection"
        ],
        "outcome": "Task API with relational database."
      },
      {
        "taskNumber": 23,
        "title": "MongoDB Product API",
        "description": "Build an enterprise product catalog service using MongoDB and Mongoose featuring aggregation pipelines.",
        "features": [
          "Tech Stack: Node.js, Express.js, MongoDB, Mongoose",
          "NoSQL document modeling with embedded sub-documents and referenced categories",
          "MongoDB aggregation pipelines for category counts and price statistics",
          "Compound indexes on title, category, and price for sub-millisecond queries",
          "Inventory stock decrementing logic with validation guards"
        ],
        "outcome": "Production-style product service."
      },
      {
        "taskNumber": 24,
        "title": "Full-Stack Blog",
        "description": "Deliver a full-stack multi-user publishing platform with React frontend, Express backend, and PostgreSQL database.",
        "features": [
          "Tech Stack: React, Vite, Node.js, Express.js, PostgreSQL/Prisma, JWT, Vercel/Render",
          "Full-stack end-to-end integration: React client calling authenticated REST API",
          "Article creation with rich text / markdown, publishing status, and tags",
          "Author authorization checks: only post authors or admins can edit/delete",
          "Full deployment with frontend on Vercel and backend database on Render/Railway"
        ],
        "outcome": "Multi-user blog with admin/editor workflow."
      },
      {
        "taskNumber": 25,
        "title": "Full-Stack Notes App",
        "description": "Construct a secure, multi-tenant cloud notes web application with authenticated CRUD and real-time search.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, MongoDB, JWT, Tailwind, Vercel/Render",
          "JWT authentication with automatic session persistence and logout",
          "Strict user-ownership scoping: users can only view and manage their own notes",
          "Instant debounced search, color tagging, and archive/trash functionality",
          "Deployed full-stack app with comprehensive README and environment variables setup"
        ],
        "outcome": "Secure multi-user cloud notes platform."
      },
      {
        "taskNumber": 26,
        "title": "Student Management System",
        "description": "Develop a relational database-driven academic portal for student enrollment, courses, and grade management.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, MySQL, Prisma/SQL, JWT",
          "Relational schema linking students, courses, instructors, and enrollments",
          "Admin management portal with student search, course assignment, and GPA calculation",
          "Protected portal for students to view course schedules and academic progress",
          "Export student rosters to CSV/PDF and input validation across all forms"
        ],
        "outcome": "Database-driven student management system."
      },
      {
        "taskNumber": 27,
        "title": "Employee Management System",
        "description": "Build an enterprise employee administration platform featuring role-based workflows and department analytics.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT",
          "Multi-role permissions: HR Admin, Department Manager, and Employee",
          "Department hierarchies, salary tracking, and leave request approval flow",
          "Interactive executive dashboard showing headcount and department distribution",
          "Audit log capturing employee status changes and promotion history"
        ],
        "outcome": "Employee administration platform."
      },
      {
        "taskNumber": 28,
        "title": "Inventory Management System",
        "description": "Create a commercial inventory management application with stock transactions, low-stock alerts, and trend reports.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL/MySQL, Prisma, Recharts",
          "Stock intake, transfer, and dispatch transaction logs with audit trails",
          "Automated low-stock warning banners and supplier reorder triggers",
          "Visual stock level analytics with Recharts area and bar graphs",
          "Barcode/SKU search and relational supplier-item association"
        ],
        "outcome": "Business-oriented inventory platform."
      },
      {
        "taskNumber": 29,
        "title": "E-Commerce Store",
        "description": "Architect and build an end-to-end full-stack e-commerce platform with cart, checkout, payment sandbox, and orders.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Cloudinary, payment sandbox",
          "Full customer journey: product filtering, detail view, cart, and address checkout",
          "Payment gateway sandbox integration (Cashfree / Razorpay) with order verification",
          "Order tracking dashboard with statuses (Pending, Paid, Shipped, Delivered)",
          "Admin product management portal with Cloudinary image upload and stock control"
        ],
        "outcome": "End-to-end e-commerce application."
      },
      {
        "taskNumber": 30,
        "title": "Job Portal",
        "description": "Construct a dual-role candidate and recruiter job portal with resume uploads, listings, and applications.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Cloudinary",
          "Dual-role authentication and onboarding: Job Seeker vs. Employer/Recruiter",
          "Job posting management with salary ranges, experience, and requirement tags",
          "Candidate application flow with resume PDF upload and cover letter submission",
          "Recruiter applicant tracking dashboard to review, shortlist, or reject candidates"
        ],
        "outcome": "Candidate/recruiter job platform."
      },
      {
        "taskNumber": 31,
        "title": "Learning Management System",
        "description": "Develop an interactive LMS platform supporting courses, structured modules, video lessons, and student progress.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Cloudinary",
          "Course creation studio for instructors with lesson video links and resources",
          "Student enrollment, video lesson player, and sequential lesson progress tracking",
          "Quiz completion gates before marking modules completed",
          "Automated course completion certificate preview upon 100% progress"
        ],
        "outcome": "Online learning management platform."
      },
      {
        "taskNumber": 32,
        "title": "Internship Management Portal",
        "description": "Engineer an internship management system with task milestones, submission reviews, mentor feedback, and certificates.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Cloudinary",
          "Intern onboarding workflow with offer letter generation and task progression",
          "Task submission portal accepting GitHub links, live URLs, and screenshots",
          "Mentor review interface with approval, rejection, and constructive feedback loops",
          "Dynamic credential generation with unique verification IDs and QR codes"
        ],
        "outcome": "Realistic internship-management platform."
      },
      {
        "taskNumber": 33,
        "title": "Hospital Appointment System",
        "description": "Build a clinical appointment scheduling platform with doctor availability, patient bookings, and triage records.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT",
          "Doctor specialty schedules with configurable working hours and time slots",
          "Patient booking flow preventing double-booking with atomic database locks",
          "Doctor consultation notes, prescription entry, and appointment history",
          "Email/SMS notification simulation for booking confirmation and reminders"
        ],
        "outcome": "Appointment and administration system."
      },
      {
        "taskNumber": 34,
        "title": "Restaurant Ordering System",
        "description": "Create an online dining and delivery ordering platform with dynamic menus, live cart, and kitchen order tickets.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT",
          "Menu categorization with dietary tags (Veg, Non-Veg, Gluten-Free) and add-ons",
          "Interactive cart with tax calculation, discount coupons, and delivery address",
          "Kitchen display screen (KDS) updating order status: Received, Cooking, Out for Delivery",
          "Admin menu management with item pricing and instant out-of-stock toggling"
        ],
        "outcome": "Online ordering platform."
      },
      {
        "taskNumber": 35,
        "title": "Event Management Platform",
        "description": "Develop an event registration and ticketing system with digital passes and QR code check-in validation.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, QR code library",
          "Event creation with banner upload, date/time, venue, and seat limits",
          "Attendee registration generating a unique verifiable ticket with dynamic QR code",
          "Staff QR code scanner interface to validate passes and record attendance",
          "Real-time attendee capacity counter and registration export"
        ],
        "outcome": "Event registration and management platform."
      },
      {
        "taskNumber": 36,
        "title": "Real-Time Chat Application",
        "description": "Build a multi-room real-time messaging application using Socket.IO, WebSockets, and database persistence.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, Socket.IO, MongoDB/PostgreSQL, JWT",
          "Bidirectional WebSocket communication with low-latency messaging",
          "Public channels, private direct messages, and user online presence detection",
          "Typing indicators, message read receipts, and timestamp formatting",
          "Persistent chat history stored in database and loaded upon room entry"
        ],
        "outcome": "Real-time multi-user chat system."
      },
      {
        "taskNumber": 37,
        "title": "Real-Time Collaboration Board",
        "description": "Develop a collaborative Kanban board with drag-and-drop task synchronization and live team updates.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, Socket.IO, PostgreSQL, Prisma",
          "Drag-and-drop card movement across columns (To Do, In Progress, Review, Done)",
          "Real-time WebSocket broadcasting of board changes across active team members",
          "Activity audit log capturing user movements, edits, and timestamps",
          "Conflict resolution avoiding simultaneous overwrite anomalies"
        ],
        "outcome": "Collaborative Kanban/workspace application."
      },
      {
        "taskNumber": 38,
        "title": "Payment-Enabled E-Commerce",
        "description": "Implement a secure payment workflow with Cashfree/Razorpay sandbox, webhook signature verification, and idempotency.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Cashfree/Razorpay sandbox",
          "Server-side order creation with currency validation and secure session IDs",
          "Client-side payment modal SDK integration with failure and retry handling",
          "Secure webhook listener with HMAC SHA256 cryptographic signature verification",
          "Idempotent order status updates preventing double-crediting or duplicate processing"
        ],
        "outcome": "Secure sandbox payment workflow."
      },
      {
        "taskNumber": 39,
        "title": "Cloud File Storage App",
        "description": "Build an AWS S3 / Cloudflare R2 cloud file storage platform with signed upload URLs and access permission controls.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, S3-compatible storage, JWT",
          "Direct-to-cloud file uploads via presigned S3 URLs minimizing server load",
          "Folder hierarchy organization, file sharing links, and permission flags (Public/Private)",
          "Storage quota tracking per user with visual progress bar and alerts",
          "Temporary download signed URLs with expiring access credentials"
        ],
        "outcome": "Working cloud storage application with documented deployment."
      },
      {
        "taskNumber": 40,
        "title": "SaaS Subscription Dashboard",
        "description": "Construct a multi-tiered software subscription SaaS prototype with billing tiers, feature gates, and usage limits.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, payment sandbox",
          "Pricing tiers (Free, Pro, Enterprise) with distinct feature allowances",
          "Subscription renewal logic, billing history invoice generation, and status tracking",
          "Client-side and server-side feature flagging based on current plan status",
          "Subscription upgrade, downgrade, and cancellation workflows"
        ],
        "outcome": "Subscription-management SaaS prototype."
      },
      {
        "taskNumber": 41,
        "title": "Microservices E-Commerce Platform",
        "description": "Decompose an e-commerce backend into independent microservices with an API Gateway, Redis cache, and Docker.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Redis, Docker, API Gateway",
          "Decoupled service boundaries: Auth Service, Catalog Service, Order Service",
          "Centralized API Gateway routing requests and handling authentication tokens",
          "Redis caching layer for catalog queries yielding under 10ms response times",
          "Graceful service degradation and circuit breaker pattern simulation"
        ],
        "outcome": "Multi-service e-commerce architecture."
      },
      {
        "taskNumber": 42,
        "title": "Advanced RBAC Admin System",
        "description": "Engineer an enterprise-grade Role-Based Access Control system with granular permissions, policy guards, and audit logs.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, JWT, Redis",
          "Granular permissions matrix (e.g., users:read, users:write, billing:manage)",
          "Declarative authorization middleware validating permission scopes on every route",
          "Redis token revocation blacklist for immediate session invalidation on logout",
          "Comprehensive tamper-evident security audit log with IP and user-agent logging"
        ],
        "outcome": "Enterprise-style authorization system."
      },
      {
        "taskNumber": 43,
        "title": "DevOps CI/CD Full-Stack App",
        "description": "Establish an automated continuous integration and continuous deployment pipeline using GitHub Actions and cloud hosts.",
        "features": [
          "Tech Stack: React, Node.js, PostgreSQL, Docker, GitHub Actions, Vercel/Render/AWS",
          "Automated GitHub Actions workflow triggering on pull requests and main branch merges",
          "Automated linting, unit testing, and production build validation steps",
          "Secure cloud secrets injection and zero-downtime automated deployment",
          "Build status badges and deployment notifications with rollback procedures"
        ],
        "outcome": "CI/CD-enabled full-stack application."
      },
      {
        "taskNumber": 44,
        "title": "AWS Cloud Full-Stack Deployment",
        "description": "Deploy a production-ready full-stack architecture on AWS using EC2, RDS PostgreSQL, S3, CloudFront, and Route 53.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, AWS EC2/S3/RDS, CloudFront, Route 53",
          "Cloud infrastructure provisioning: EC2 compute instance and managed RDS PostgreSQL",
          "Static React frontend hosting on S3 with global CloudFront CDN distribution",
          "Nginx reverse proxy with automated Let's Encrypt SSL/HTTPS certificates",
          "Complete architecture diagram and infrastructure setup documentation"
        ],
        "outcome": "Production-style AWS deployment with architecture documentation."
      },
      {
        "taskNumber": 45,
        "title": "Dockerized Full-Stack Application",
        "description": "Containerize a multi-tier full-stack application using Docker, Docker Compose, and Nginx reverse proxy.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Docker, Docker Compose, Nginx",
          "Multi-stage Dockerfiles for optimized, minimal production image sizes",
          "Docker Compose orchestration connecting frontend, backend, and PostgreSQL containers",
          "Persistent Docker volumes for database data and isolated internal networks",
          "Nginx container acting as front reverse proxy routing /api to the Node backend"
        ],
        "outcome": "Containerized full-stack application."
      },
      {
        "taskNumber": 46,
        "title": "Monitoring & Logging Platform",
        "description": "Implement observability for a Node.js backend using Prometheus metrics, Grafana dashboards, and structured logging.",
        "features": [
          "Tech Stack: Node.js, Express.js, PostgreSQL, Docker, Prometheus, Grafana, structured logging",
          "Structured JSON logging with Winston/Pino including correlation request IDs",
          "Prometheus metrics endpoint collecting response latency, HTTP codes, and memory usage",
          "Grafana dashboard visualising requests-per-second, error rates, and CPU load",
          "Health check endpoints (/health/live, /health/ready) for container liveness probes"
        ],
        "outcome": "Observable application with monitoring dashboard."
      },
      {
        "taskNumber": 47,
        "title": "AI-Powered Full-Stack Assistant",
        "description": "Build an AI-augmented full-stack web application integrating Large Language Model APIs with conversation memory.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, AI API/Ollama, JWT",
          "AI API integration (OpenAI/Anthropic/Ollama) with streaming response tokens",
          "Persistent conversation history and contextual prompt construction",
          "Client-side typewriter rendering and markdown code-block syntax highlighting",
          "Rate limiting and token usage monitoring per user to prevent abuse"
        ],
        "outcome": "AI-assisted web product with persistent conversations."
      },
      {
        "taskNumber": 48,
        "title": "Scalable Social Media Platform",
        "description": "Develop a scalable social media web product featuring feeds, follower relations, notifications, and media uploads.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Redis, Socket.IO, Cloudinary, JWT",
          "Follow/unfollow relationship graph with personalized timeline feed generation",
          "Redis caching for active user feeds and fast fan-out message distribution",
          "Real-time notifications via WebSockets when users like, comment, or follow",
          "Optimized media pipeline with Cloudinary transformations and responsive delivery"
        ],
        "outcome": "Feature-rich social platform with scalable patterns."
      },
      {
        "taskNumber": 49,
        "title": "Full-Stack Project Management SaaS",
        "description": "Construct a collaborative project management SaaS platform featuring workspaces, real-time board sync, and team RBAC.",
        "features": [
          "Tech Stack: React, Node.js, Express.js, PostgreSQL, Prisma, Redis, Socket.IO, Docker, JWT",
          "Multi-workspace architecture with organization members and invite links",
          "Real-time task boards, sprints, custom statuses, and deadline reminders",
          "Comprehensive audit trail of board updates with user attribution",
          "Dockerized production deployment with PostgreSQL and Redis containers"
        ],
        "outcome": "Multi-user project-management SaaS."
      },
      {
        "taskNumber": 50,
        "title": "Capstone: Production-Ready Full-Stack Platform",
        "description": "Deliver a production-ready enterprise full-stack web platform combining modern UI, scalable API, databases, cloud, and CI/CD.",
        "features": [
          "Tech Stack: React/Next.js, Node.js/NestJS or Express, PostgreSQL, Redis, Docker, GitHub Actions, AWS/Vercel, S3, JWT",
          "Comprehensive full-stack architecture adhering to modern clean code standards",
          "End-to-end security: input validation, JWT auth, RBAC, SSL, and rate limiting",
          "Automated CI/CD deployment pipelines with automated unit and integration tests",
          "Complete deliverables: live production URL, public GitHub repo, architecture diagram, API documentation, and presentation walkthrough"
        ],
        "outcome": "Production-style capstone with live URL, GitHub, architecture, API docs, tests and final presentation."
      }
    ]
  },
  {
    "slug": "python",
    "name": "Python Development",
    "icon": "Py",
    "color": "from-emerald-500 to-teal-600",
    "description": "Versatile Python development for web apps, automation, and backend APIs.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library Automation Tool",
        "description": "Build a library automation tool as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working library automation tool with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Student Result Analyzer",
        "description": "Build a student result analyzer as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working student result analyzer with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "File Management Utility",
        "description": "Build a file management utility as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working file management utility with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Weather Dashboard",
        "description": "Build a weather dashboard as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working weather dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Expense Tracker",
        "description": "Build a expense tracker as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working expense tracker with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "QR Code Generator",
        "description": "Build a qr code generator as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working qr code generator with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Password Manager Demo",
        "description": "Build a password manager demo as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working password manager demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Web Scraping Dashboard",
        "description": "Build a web scraping dashboard as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working web scraping dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Invoice Generator",
        "description": "Build a invoice generator as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working invoice generator with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Email Automation Tool",
        "description": "Build a email automation tool as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working email automation tool with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Employee Management System",
        "description": "Build a employee management system as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working employee management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Python REST API",
        "description": "Build a python rest api as a practical virtual internship project using python development concepts.",
        "features": [
          "Python modules",
          "input validation",
          "data processing",
          "error handling"
        ],
        "outcome": "Complete a working python rest api with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "java",
    "name": "Java Development",
    "icon": "Jv",
    "color": "from-red-500 to-orange-600",
    "description": "Enterprise-grade software and backend systems with Java and Spring Boot.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library Management System",
        "description": "Build a library management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working library management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Banking Management System",
        "description": "Build a banking management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working banking management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Student Management System",
        "description": "Build a student management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working student management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Employee Payroll System",
        "description": "Build a employee payroll system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working employee payroll system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Inventory Management System",
        "description": "Build a inventory management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working inventory management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Online Examination System",
        "description": "Build a online examination system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working online examination system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Hospital Management System",
        "description": "Build a hospital management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working hospital management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Hotel Booking System",
        "description": "Build a hotel booking system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working hotel booking system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Vehicle Rental System",
        "description": "Build a vehicle rental system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working vehicle rental system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Ticket Booking System",
        "description": "Build a ticket booking system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working ticket booking system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Complaint Management System",
        "description": "Build a complaint management system as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working complaint management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Java REST API",
        "description": "Build a java rest api as a practical virtual internship project using java development concepts.",
        "features": [
          "OOP structure",
          "database connectivity",
          "validation",
          "exception handling"
        ],
        "outcome": "Complete a working java rest api with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "mernstack",
    "name": "MERN Stack Development",
    "icon": "ME",
    "color": "from-teal-500 to-cyan-600",
    "description": "Full-stack JavaScript applications with MongoDB, Express, React, and Node.js.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library Management System",
        "description": "Build a library management system as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working library management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "E-Commerce Platform",
        "description": "Build a e-commerce platform as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working e-commerce platform with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Student Portal",
        "description": "Build a student portal as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working student portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Job Portal",
        "description": "Build a job portal as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working job portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Food Ordering Platform",
        "description": "Build a food ordering platform as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working food ordering platform with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Event Booking System",
        "description": "Build a event booking system as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working event booking system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Expense Management App",
        "description": "Build a expense management app as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working expense management app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Hospital Appointment System",
        "description": "Build a hospital appointment system as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working hospital appointment system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Real Estate Portal",
        "description": "Build a real estate portal as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working real estate portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Inventory Dashboard",
        "description": "Build a inventory dashboard as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working inventory dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Learning Management System",
        "description": "Build a learning management system as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working learning management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Car Rental Platform",
        "description": "Build a car rental platform as a practical virtual internship project using mern stack development concepts.",
        "features": [
          "React UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working car rental platform with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "meanstack",
    "name": "MEAN Stack Development",
    "icon": "MA",
    "color": "from-red-500 to-rose-600",
    "description": "Modern web development with MongoDB, Express, Angular, and Node.js.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library Management System",
        "description": "Build a library management system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working library management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "E-Commerce Platform",
        "description": "Build a e-commerce platform as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working e-commerce platform with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Student Management Portal",
        "description": "Build a student management portal as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working student management portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Employee Management System",
        "description": "Build a employee management system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working employee management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Online Course Platform",
        "description": "Build a online course platform as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working online course platform with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Hospital Management System",
        "description": "Build a hospital management system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working hospital management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Event Management Platform",
        "description": "Build a event management platform as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working event management platform with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Inventory Management System",
        "description": "Build a inventory management system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working inventory management system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Job Recruitment Portal",
        "description": "Build a job recruitment portal as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working job recruitment portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Hotel Booking System",
        "description": "Build a hotel booking system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working hotel booking system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Vehicle Rental System",
        "description": "Build a vehicle rental system as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working vehicle rental system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Service Booking Platform",
        "description": "Build a service booking platform as a practical virtual internship project using mean stack development concepts.",
        "features": [
          "Angular UI",
          "Node/Express API",
          "MongoDB",
          "CRUD and validation"
        ],
        "outcome": "Complete a working service booking platform with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "aiml",
    "name": "AI & Machine Learning",
    "icon": "AI",
    "color": "from-violet-500 to-[#07284a]",
    "description": "Build intelligent systems with machine learning models and predictive algorithms.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "House Price Prediction",
        "description": "Build a house price prediction as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working house price prediction with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Student Performance Prediction",
        "description": "Build a student performance prediction as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working student performance prediction with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Spam Detection System",
        "description": "Build a spam detection system as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working spam detection system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Customer Churn Prediction",
        "description": "Build a customer churn prediction as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working customer churn prediction with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Sentiment Analysis App",
        "description": "Build a sentiment analysis app as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working sentiment analysis app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Movie Recommendation System",
        "description": "Build a movie recommendation system as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working movie recommendation system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Disease Risk Prediction Demo",
        "description": "Build a disease risk prediction demo as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working disease risk prediction demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Credit Risk Prediction",
        "description": "Build a credit risk prediction as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working credit risk prediction with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Sales Forecasting System",
        "description": "Build a sales forecasting system as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working sales forecasting system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Image Classification App",
        "description": "Build a image classification app as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working image classification app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Customer Segmentation",
        "description": "Build a customer segmentation as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working customer segmentation with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Fraud Detection Demo",
        "description": "Build a fraud detection demo as a practical virtual internship project using ai & machine learning concepts.",
        "features": [
          "Data preprocessing",
          "model training",
          "evaluation",
          "prediction interface"
        ],
        "outcome": "Complete a working fraud detection demo with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "genai",
    "name": "Generative AI & Prompt Engineering",
    "icon": "GA",
    "color": "from-purple-500 to-indigo-600",
    "description": "Harness LLMs, generative AI workflows, and advanced prompt engineering.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "AI Chatbot",
        "description": "Build a ai chatbot as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai chatbot with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "AI Resume Assistant",
        "description": "Build a ai resume assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai resume assistant with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "AI Study Assistant",
        "description": "Build a ai study assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai study assistant with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "AI Content Generator",
        "description": "Build a ai content generator as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai content generator with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "AI Email Writer",
        "description": "Build a ai email writer as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai email writer with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "AI Code Assistant",
        "description": "Build a ai code assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai code assistant with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "AI FAQ Generator",
        "description": "Build a ai faq generator as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai faq generator with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "AI Interview Assistant",
        "description": "Build a ai interview assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai interview assistant with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "AI Summarization Tool",
        "description": "Build a ai summarization tool as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai summarization tool with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "AI Presentation Assistant",
        "description": "Build a ai presentation assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai presentation assistant with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "AI Prompt Library",
        "description": "Build a ai prompt library as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai prompt library with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "AI Document Q&A Assistant",
        "description": "Build a ai document q&a assistant as a practical virtual internship project using generative ai & prompt engineering concepts.",
        "features": [
          "Prompt design",
          "AI API integration",
          "context handling",
          "response generation"
        ],
        "outcome": "Complete a working ai document q&a assistant with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "datascience",
    "name": "Data Science",
    "icon": "DS",
    "color": "from-cyan-500 to-blue-600",
    "description": "Transform raw datasets into actionable insights, data stories, and analytical models.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Sales Data Analysis",
        "description": "Build a sales data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working sales data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Customer Behavior Analysis",
        "description": "Build a customer behavior analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working customer behavior analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Student Performance Analysis",
        "description": "Build a student performance analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working student performance analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Retail Analytics",
        "description": "Build a retail analytics as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working retail analytics with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Movie Dataset Analysis",
        "description": "Build a movie dataset analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working movie dataset analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "E-Commerce Data Analysis",
        "description": "Build a e-commerce data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working e-commerce data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Healthcare Data Analysis",
        "description": "Build a healthcare data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working healthcare data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Financial Data Analysis",
        "description": "Build a financial data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working financial data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Social Media Analytics",
        "description": "Build a social media analytics as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working social media analytics with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Weather Data Analysis",
        "description": "Build a weather data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working weather data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Sports Data Analysis",
        "description": "Build a sports data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working sports data analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Survey Data Analysis",
        "description": "Build a survey data analysis as a practical virtual internship project using data science concepts.",
        "features": [
          "Data cleaning",
          "analysis",
          "charts",
          "insights",
          "report generation"
        ],
        "outcome": "Complete a working survey data analysis with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "dataanalytics",
    "name": "Data Analytics",
    "icon": "DA",
    "color": "from-blue-500 to-indigo-600",
    "description": "Analyze business metrics, build KPI dashboards, and drive data-informed decisions.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Sales Dashboard",
        "description": "Build a sales dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working sales dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Customer Analytics Dashboard",
        "description": "Build a customer analytics dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working customer analytics dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Inventory Analytics",
        "description": "Build a inventory analytics as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working inventory analytics with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "HR Analytics Dashboard",
        "description": "Build a hr analytics dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working hr analytics dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Marketing Campaign Analysis",
        "description": "Build a marketing campaign analysis as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working marketing campaign analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Website Traffic Analysis",
        "description": "Build a website traffic analysis as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working website traffic analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Financial KPI Dashboard",
        "description": "Build a financial kpi dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working financial kpi dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Student Analytics Dashboard",
        "description": "Build a student analytics dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working student analytics dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Retail Performance Dashboard",
        "description": "Build a retail performance dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working retail performance dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Support Ticket Analysis",
        "description": "Build a support ticket analysis as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working support ticket analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Delivery Performance Analysis",
        "description": "Build a delivery performance analysis as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working delivery performance analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Business KPI Dashboard",
        "description": "Build a business kpi dashboard as a practical virtual internship project using data analytics concepts.",
        "features": [
          "Data preparation",
          "KPIs",
          "filters",
          "charts",
          "actionable insights"
        ],
        "outcome": "Complete a working business kpi dashboard with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "powerbi",
    "name": "Power BI & Business Intelligence",
    "icon": "BI",
    "color": "from-amber-500 to-yellow-600",
    "description": "Interactive dashboards, DAX modeling, and enterprise business intelligence.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Sales Performance Dashboard",
        "description": "Build a sales performance dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working sales performance dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "HR Analytics Dashboard",
        "description": "Build a hr analytics dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working hr analytics dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Finance Dashboard",
        "description": "Build a finance dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working finance dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Inventory Dashboard",
        "description": "Build a inventory dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working inventory dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Marketing Dashboard",
        "description": "Build a marketing dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working marketing dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Customer Insights Dashboard",
        "description": "Build a customer insights dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working customer insights dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Hospital KPI Dashboard",
        "description": "Build a hospital kpi dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working hospital kpi dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Education Dashboard",
        "description": "Build a education dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working education dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Retail Dashboard",
        "description": "Build a retail dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working retail dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Project Performance Dashboard",
        "description": "Build a project performance dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working project performance dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Supply Chain Dashboard",
        "description": "Build a supply chain dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working supply chain dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Executive KPI Dashboard",
        "description": "Build a executive kpi dashboard as a practical virtual internship project using power bi & business intelligence concepts.",
        "features": [
          "Interactive dashboard",
          "KPIs",
          "slicers",
          "charts",
          "business insights"
        ],
        "outcome": "Complete a working executive kpi dashboard with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "uiux",
    "name": "UI/UX Design",
    "icon": "UX",
    "color": "from-pink-500 to-purple-600",
    "description": "Human-centered digital product design, wireframes, and interactive prototypes.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library App UI",
        "description": "Build a library app ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working library app ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "E-Commerce App UI",
        "description": "Build a e-commerce app ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working e-commerce app ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Food Delivery UI",
        "description": "Build a food delivery ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working food delivery ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Banking App UI",
        "description": "Build a banking app ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working banking app ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Travel Booking UI",
        "description": "Build a travel booking ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working travel booking ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Education Platform UI",
        "description": "Build a education platform ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working education platform ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Healthcare App UI",
        "description": "Build a healthcare app ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working healthcare app ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Job Portal UI",
        "description": "Build a job portal ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working job portal ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Car Rental UI",
        "description": "Build a car rental ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working car rental ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Fitness App UI",
        "description": "Build a fitness app ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working fitness app ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Event Booking UI",
        "description": "Build a event booking ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working event booking ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Portfolio Website UI",
        "description": "Build a portfolio website ui as a practical virtual internship project using ui/ux design concepts.",
        "features": [
          "Wireframes",
          "component design",
          "responsive screens",
          "prototype flow"
        ],
        "outcome": "Complete a working portfolio website ui with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "graphicdesign",
    "name": "Graphic Design",
    "icon": "GD",
    "color": "from-rose-500 to-orange-500",
    "description": "Brand identities, digital visual assets, marketing creatives, and layouts.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Brand Identity Kit",
        "description": "Build a brand identity kit as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working brand identity kit with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Social Media Post Set",
        "description": "Build a social media post set as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working social media post set with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Internship Poster",
        "description": "Build a internship poster as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working internship poster with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Business Flyer",
        "description": "Build a business flyer as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working business flyer with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Certificate Design",
        "description": "Build a certificate design as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working certificate design with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Event Poster",
        "description": "Build a event poster as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working event poster with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Product Advertisement",
        "description": "Build a product advertisement as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working product advertisement with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "YouTube Thumbnail Set",
        "description": "Build a youtube thumbnail set as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working youtube thumbnail set with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Instagram Campaign Kit",
        "description": "Build a instagram campaign kit as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working instagram campaign kit with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Company Brochure",
        "description": "Build a company brochure as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working company brochure with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Business Card Design",
        "description": "Build a business card design as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working business card design with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Presentation Design",
        "description": "Build a presentation design as a practical virtual internship project using graphic design concepts.",
        "features": [
          "Layout",
          "typography",
          "branding",
          "visual hierarchy",
          "export-ready assets"
        ],
        "outcome": "Complete a working presentation design with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "cybersecurity",
    "name": "Cyber Security",
    "icon": "CS",
    "color": "from-green-500 to-emerald-600",
    "description": "Security auditing, vulnerability analysis, secure coding, and threat mitigation.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Secure Login System",
        "description": "Build a secure login system as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working secure login system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Password Strength Analyzer",
        "description": "Build a password strength analyzer as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working password strength analyzer with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Phishing Awareness Page",
        "description": "Build a phishing awareness page as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working phishing awareness page with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Security Audit Checklist",
        "description": "Build a security audit checklist as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working security audit checklist with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Web Vulnerability Demo",
        "description": "Build a web vulnerability demo as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working web vulnerability demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "File Integrity Checker",
        "description": "Build a file integrity checker as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working file integrity checker with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Network Monitoring Dashboard",
        "description": "Build a network monitoring dashboard as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working network monitoring dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Secure API Demo",
        "description": "Build a secure api demo as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working secure api demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Role-Based Access Control",
        "description": "Build a role-based access control as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working role-based access control with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Security Log Analyzer",
        "description": "Build a security log analyzer as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working security log analyzer with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Cyber Awareness Portal",
        "description": "Build a cyber awareness portal as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working cyber awareness portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Incident Reporting System",
        "description": "Build a incident reporting system as a practical virtual internship project using cyber security concepts.",
        "features": [
          "Authentication concepts",
          "input validation",
          "security checks",
          "logging",
          "awareness"
        ],
        "outcome": "Complete a working incident reporting system with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "cloudcomputing",
    "name": "Cloud Computing",
    "icon": "CC",
    "color": "from-sky-500 to-blue-600",
    "description": "Cloud infrastructure, serverless architectures, storage, and cloud deployments.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Cloud File Storage App",
        "description": "Build a cloud file storage app as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud file storage app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Static Website Deployment",
        "description": "Build a static website deployment as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working static website deployment with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Cloud Database App",
        "description": "Build a cloud database app as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud database app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Serverless API",
        "description": "Build a serverless api as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working serverless api with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Cloud Monitoring Dashboard",
        "description": "Build a cloud monitoring dashboard as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud monitoring dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Cloud Backup System",
        "description": "Build a cloud backup system as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud backup system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Scalable Web App",
        "description": "Build a scalable web app as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working scalable web app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Cloud Authentication System",
        "description": "Build a cloud authentication system as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud authentication system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Containerized Web App",
        "description": "Build a containerized web app as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working containerized web app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Cloud Image Storage",
        "description": "Build a cloud image storage as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud image storage with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Cloud Notification Service",
        "description": "Build a cloud notification service as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud notification service with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Cloud Cost Dashboard",
        "description": "Build a cloud cost dashboard as a practical virtual internship project using cloud computing concepts.",
        "features": [
          "Cloud deployment",
          "storage/database integration",
          "access control",
          "monitoring"
        ],
        "outcome": "Complete a working cloud cost dashboard with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "devops",
    "name": "DevOps",
    "icon": "DO",
    "color": "from-orange-500 to-amber-600",
    "description": "CI/CD pipelines, containerization, automated deployments, and infrastructure monitoring.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Git Workflow Project",
        "description": "Build a git workflow project as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working git workflow project with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "CI/CD Pipeline",
        "description": "Build a ci/cd pipeline as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working ci/cd pipeline with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Dockerized Web App",
        "description": "Build a dockerized web app as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working dockerized web app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Automated Testing Pipeline",
        "description": "Build a automated testing pipeline as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working automated testing pipeline with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Deployment Automation",
        "description": "Build a deployment automation as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working deployment automation with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Infrastructure Monitoring",
        "description": "Build a infrastructure monitoring as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working infrastructure monitoring with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Log Management Setup",
        "description": "Build a log management setup as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working log management setup with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Container Orchestration Demo",
        "description": "Build a container orchestration demo as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working container orchestration demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Release Management Pipeline",
        "description": "Build a release management pipeline as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working release management pipeline with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Environment Configuration System",
        "description": "Build a environment configuration system as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working environment configuration system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "DevOps Dashboard",
        "description": "Build a devops dashboard as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working devops dashboard with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Automated Backup Pipeline",
        "description": "Build a automated backup pipeline as a practical virtual internship project using devops concepts.",
        "features": [
          "Git workflow",
          "automation",
          "CI/CD",
          "deployment",
          "monitoring"
        ],
        "outcome": "Complete a working automated backup pipeline with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "softwaretesting",
    "name": "Software Testing & QA",
    "icon": "QA",
    "color": "from-lime-500 to-green-600",
    "description": "Manual and automated testing, test suites, bug tracking, and quality assurance.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Test Plan for E-Commerce",
        "description": "Build a test plan for e-commerce as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working test plan for e-commerce with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Library System Test Suite",
        "description": "Build a library system test suite as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working library system test suite with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "API Testing Project",
        "description": "Build a api testing project as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working api testing project with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Login Testing Suite",
        "description": "Build a login testing suite as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working login testing suite with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Payment Flow Testing",
        "description": "Build a payment flow testing as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working payment flow testing with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Form Validation Testing",
        "description": "Build a form validation testing as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working form validation testing with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Mobile App Test Plan",
        "description": "Build a mobile app test plan as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working mobile app test plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Regression Testing Project",
        "description": "Build a regression testing project as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working regression testing project with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Bug Tracking System",
        "description": "Build a bug tracking system as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working bug tracking system with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Performance Testing Demo",
        "description": "Build a performance testing demo as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working performance testing demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Cross-Browser Testing Plan",
        "description": "Build a cross-browser testing plan as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working cross-browser testing plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Test Automation Demo",
        "description": "Build a test automation demo as a practical virtual internship project using software testing & qa concepts.",
        "features": [
          "Test cases",
          "test execution",
          "defect reporting",
          "regression",
          "test summary"
        ],
        "outcome": "Complete a working test automation demo with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "mobileapp",
    "name": "Mobile App Development",
    "icon": "MB",
    "color": "from-indigo-500 to-blue-600",
    "description": "Native and cross-platform mobile applications with responsive mobile interfaces.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Student Management App",
        "description": "Build a student management app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working student management app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Expense Tracker App",
        "description": "Build a expense tracker app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working expense tracker app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Notes App",
        "description": "Build a notes app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working notes app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Weather App",
        "description": "Build a weather app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working weather app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Food Ordering App",
        "description": "Build a food ordering app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working food ordering app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Event Booking App",
        "description": "Build a event booking app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working event booking app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Library App",
        "description": "Build a library app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working library app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Task Management App",
        "description": "Build a task management app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working task management app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Car Rental App",
        "description": "Build a car rental app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working car rental app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "News Reader App",
        "description": "Build a news reader app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working news reader app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Quiz App",
        "description": "Build a quiz app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working quiz app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Appointment Booking App",
        "description": "Build a appointment booking app as a practical virtual internship project using mobile app development concepts.",
        "features": [
          "Responsive mobile screens",
          "navigation",
          "local/API data",
          "validation"
        ],
        "outcome": "Complete a working appointment booking app with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "flutter",
    "name": "Flutter Development",
    "icon": "FL",
    "color": "from-cyan-500 to-teal-600",
    "description": "High-performance multi-platform applications using Dart and Flutter framework.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Flutter Expense Tracker",
        "description": "Build a flutter expense tracker as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter expense tracker with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Flutter Notes App",
        "description": "Build a flutter notes app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter notes app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Flutter Weather App",
        "description": "Build a flutter weather app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter weather app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Flutter Quiz App",
        "description": "Build a flutter quiz app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter quiz app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Flutter E-Commerce UI",
        "description": "Build a flutter e-commerce ui as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter e-commerce ui with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Flutter Food Ordering App",
        "description": "Build a flutter food ordering app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter food ordering app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Flutter Library App",
        "description": "Build a flutter library app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter library app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Flutter Event Booking App",
        "description": "Build a flutter event booking app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter event booking app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Flutter Task Manager",
        "description": "Build a flutter task manager as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter task manager with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Flutter Car Rental App",
        "description": "Build a flutter car rental app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter car rental app with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Flutter Student Portal",
        "description": "Build a flutter student portal as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter student portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Flutter Appointment App",
        "description": "Build a flutter appointment app as a practical virtual internship project using flutter development concepts.",
        "features": [
          "Flutter widgets",
          "navigation",
          "state handling",
          "responsive UI"
        ],
        "outcome": "Complete a working flutter appointment app with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "digitalmarketing",
    "name": "Digital Marketing",
    "icon": "DM",
    "color": "from-violet-500 to-fuchsia-600",
    "description": "SEO optimization, performance marketing, content strategy, and digital campaigns.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "SEO Audit Project",
        "description": "Build a seo audit project as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working seo audit project with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Social Media Campaign",
        "description": "Build a social media campaign as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working social media campaign with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Content Marketing Plan",
        "description": "Build a content marketing plan as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working content marketing plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Google Ads Campaign Plan",
        "description": "Build a google ads campaign plan as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working google ads campaign plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Email Marketing Campaign",
        "description": "Build a email marketing campaign as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working email marketing campaign with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Brand Awareness Campaign",
        "description": "Build a brand awareness campaign as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working brand awareness campaign with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Competitor Analysis",
        "description": "Build a competitor analysis as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working competitor analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Keyword Research Project",
        "description": "Build a keyword research project as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working keyword research project with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Influencer Campaign Plan",
        "description": "Build a influencer campaign plan as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working influencer campaign plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Website Conversion Analysis",
        "description": "Build a website conversion analysis as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working website conversion analysis with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Digital Marketing Report",
        "description": "Build a digital marketing report as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working digital marketing report with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "30-Day Content Calendar",
        "description": "Build a 30-day content calendar as a practical virtual internship project using digital marketing concepts.",
        "features": [
          "Research",
          "campaign planning",
          "SEO/social strategy",
          "analytics report"
        ],
        "outcome": "Complete a working 30-day content calendar with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "socialmedia",
    "name": "Social Media Management",
    "icon": "SM",
    "color": "from-pink-500 to-rose-500",
    "description": "Social media strategies, content scheduling, audience growth, and engagement analytics.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Instagram Content Calendar",
        "description": "Build a instagram content calendar as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working instagram content calendar with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "LinkedIn Content Strategy",
        "description": "Build a linkedin content strategy as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working linkedin content strategy with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "YouTube Content Plan",
        "description": "Build a youtube content plan as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working youtube content plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Facebook Campaign Plan",
        "description": "Build a facebook campaign plan as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working facebook campaign plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Social Media Audit",
        "description": "Build a social media audit as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working social media audit with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Hashtag Strategy",
        "description": "Build a hashtag strategy as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working hashtag strategy with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Engagement Growth Plan",
        "description": "Build a engagement growth plan as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working engagement growth plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Brand Page Setup",
        "description": "Build a brand page setup as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working brand page setup with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Social Media Analytics Report",
        "description": "Build a social media analytics report as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working social media analytics report with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Reels Content Plan",
        "description": "Build a reels content plan as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working reels content plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Community Management Plan",
        "description": "Build a community management plan as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working community management plan with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Monthly Social Media Report",
        "description": "Build a monthly social media report as a practical virtual internship project using social media management concepts.",
        "features": [
          "Content planning",
          "publishing strategy",
          "engagement tracking",
          "analytics"
        ],
        "outcome": "Complete a working monthly social media report with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "contentwriting",
    "name": "Content Writing",
    "icon": "CW",
    "color": "from-amber-500 to-orange-600",
    "description": "SEO blogging, copywriting, technical documentation, and professional writing.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Company Website Content",
        "description": "Build a company website content as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working company website content with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Technology Blog Series",
        "description": "Build a technology blog series as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working technology blog series with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Product Descriptions",
        "description": "Build a product descriptions as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working product descriptions with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "SEO Blog Article",
        "description": "Build a seo blog article as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working seo blog article with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Internship Landing Page Copy",
        "description": "Build a internship landing page copy as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working internship landing page copy with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Social Media Content Pack",
        "description": "Build a social media content pack as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working social media content pack with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Email Newsletter",
        "description": "Build a email newsletter as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working email newsletter with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Press Release Draft",
        "description": "Build a press release draft as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working press release draft with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Technical Documentation",
        "description": "Build a technical documentation as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working technical documentation with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "FAQ Content",
        "description": "Build a faq content as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working faq content with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Case Study Article",
        "description": "Build a case study article as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working case study article with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Portfolio Content",
        "description": "Build a portfolio content as a practical virtual internship project using content writing concepts.",
        "features": [
          "Research",
          "structured writing",
          "SEO basics",
          "editing",
          "publishing"
        ],
        "outcome": "Complete a working portfolio content with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "videoediting",
    "name": "Video Editing",
    "icon": "VE",
    "color": "from-red-500 to-pink-600",
    "description": "Cinematic editing, reels production, motion graphics, and audio-video mastering.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Short-Form Reel",
        "description": "Build a short-form reel as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working short-form reel with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "YouTube Intro Video",
        "description": "Build a youtube intro video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working youtube intro video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Product Promo Video",
        "description": "Build a product promo video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working product promo video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Company Introduction Video",
        "description": "Build a company introduction video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working company introduction video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Internship Promo Video",
        "description": "Build a internship promo video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working internship promo video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Educational Video",
        "description": "Build a educational video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working educational video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Social Media Ad Video",
        "description": "Build a social media ad video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working social media ad video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Event Highlight Video",
        "description": "Build a event highlight video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working event highlight video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Tutorial Video",
        "description": "Build a tutorial video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working tutorial video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "YouTube Thumbnail + Video Package",
        "description": "Build a youtube thumbnail + video package as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working youtube thumbnail + video package with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Brand Motion Video",
        "description": "Build a brand motion video as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working brand motion video with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Short Documentary Edit",
        "description": "Build a short documentary edit as a practical virtual internship project using video editing concepts.",
        "features": [
          "Editing timeline",
          "transitions",
          "captions",
          "audio cleanup",
          "export"
        ],
        "outcome": "Complete a working short documentary edit with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "wordpress",
    "name": "WordPress Development",
    "icon": "WP",
    "color": "from-blue-600 to-indigo-700",
    "description": "Custom themes, plugin integrations, CMS customization, and e-commerce setups.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Business Website",
        "description": "Build a business website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working business website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Portfolio Website",
        "description": "Build a portfolio website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working portfolio website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Blog Website",
        "description": "Build a blog website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working blog website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Restaurant Website",
        "description": "Build a restaurant website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working restaurant website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "College Website",
        "description": "Build a college website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working college website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "E-Commerce Website",
        "description": "Build a e-commerce website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working e-commerce website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Agency Website",
        "description": "Build a agency website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working agency website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "News Website",
        "description": "Build a news website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working news website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Internship Portal",
        "description": "Build a internship portal as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working internship portal with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Real Estate Website",
        "description": "Build a real estate website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working real estate website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Event Website",
        "description": "Build a event website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working event website with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Service Booking Website",
        "description": "Build a service booking website as a practical virtual internship project using wordpress development concepts.",
        "features": [
          "Theme customization",
          "pages",
          "forms",
          "responsive layout",
          "SEO basics"
        ],
        "outcome": "Complete a working service booking website with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "databasemanagement",
    "name": "Database Management",
    "icon": "DB",
    "color": "from-emerald-600 to-cyan-700",
    "description": "Relational schema design, SQL optimization, data integrity, and backup workflows.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "Library Database",
        "description": "Build a library database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working library database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Student Database",
        "description": "Build a student database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working student database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Employee Database",
        "description": "Build a employee database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working employee database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Inventory Database",
        "description": "Build a inventory database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working inventory database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Hospital Database",
        "description": "Build a hospital database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working hospital database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "E-Commerce Database",
        "description": "Build a e-commerce database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working e-commerce database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Hotel Booking Database",
        "description": "Build a hotel booking database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working hotel booking database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Vehicle Rental Database",
        "description": "Build a vehicle rental database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working vehicle rental database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Course Management Database",
        "description": "Build a course management database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working course management database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Customer Database",
        "description": "Build a customer database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working customer database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Sales Database",
        "description": "Build a sales database as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working sales database with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Database Backup & Reporting System",
        "description": "Build a database backup & reporting system as a practical virtual internship project using database management concepts.",
        "features": [
          "Schema design",
          "relationships",
          "queries",
          "CRUD operations",
          "backup/reporting"
        ],
        "outcome": "Complete a working database backup & reporting system with documented workflow, testing, and project submission."
      }
    ]
  },
  {
    "slug": "gamedevelopment",
    "name": "Game Development",
    "icon": "GM",
    "color": "from-purple-600 to-pink-600",
    "description": "2D and 3D game mechanics, physics engines, user interaction, and gameplay design.",
    "tasks": [
      {
        "taskNumber": 1,
        "title": "2D Platform Game",
        "description": "Build a 2d platform game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working 2d platform game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 2,
        "title": "Quiz Game",
        "description": "Build a quiz game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working quiz game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 3,
        "title": "Memory Game",
        "description": "Build a memory game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working memory game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 4,
        "title": "Tic-Tac-Toe Game",
        "description": "Build a tic-tac-toe game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working tic-tac-toe game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 5,
        "title": "Snake Game",
        "description": "Build a snake game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working snake game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 6,
        "title": "Puzzle Game",
        "description": "Build a puzzle game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working puzzle game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 7,
        "title": "Space Shooter Demo",
        "description": "Build a space shooter demo as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working space shooter demo with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 8,
        "title": "Car Racing Game",
        "description": "Build a car racing game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working car racing game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 9,
        "title": "Endless Runner",
        "description": "Build a endless runner as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working endless runner with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 10,
        "title": "Maze Game",
        "description": "Build a maze game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working maze game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 11,
        "title": "Chess Game",
        "description": "Build a chess game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working chess game with documented workflow, testing, and project submission."
      },
      {
        "taskNumber": 12,
        "title": "Educational Game",
        "description": "Build a educational game as a practical virtual internship project using game development concepts.",
        "features": [
          "Game mechanics",
          "UI",
          "scoring",
          "controls",
          "testing"
        ],
        "outcome": "Complete a working educational game with documented workflow, testing, and project submission."
      }
    ]
  }
];

export const LINKEDIN_TASK: TaskData = {
  taskNumber: 0,
  title: "Share Your Offer Letter on LinkedIn",
  description: "Post your Skyrovix offer letter on LinkedIn to celebrate your internship and inspire others.",
  features: [
    "Download your offer letter from the Onboarding tab",
    "Take a screenshot or share as PDF",
    "Post on LinkedIn with a professional caption",
    "Tag @Skyrovix and use #SkyrovixInternship",
  ],
  outcome: "Build your professional brand on LinkedIn and showcase your internship journey with your network.",
};

const DOMAIN_TASK_ALIASES: Record<string, string> = {
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

export function getDomainTasks(slug: string): DomainTasks | undefined {
  if (!slug) return undefined;
  const direct = ALL_DOMAINS_TASKS.find((d) => d.slug === slug);
  if (direct) return direct;
  const aliased = DOMAIN_TASK_ALIASES[slug.toLowerCase()];
  if (aliased) return ALL_DOMAINS_TASKS.find((d) => d.slug === aliased);
  return undefined;
}

export function getTasksByDuration(
  slug: string,
  durationMonths: number,
  planTypeOrLimit?: string | number
): TaskData[] {
  const domain = getDomainTasks(slug);
  if (!domain) return [];
  const normalizedSlug = domain.slug;

  if (typeof planTypeOrLimit === "number" && planTypeOrLimit > 0) {
    return domain.tasks.filter((t) => t.taskNumber <= planTypeOrLimit);
  }

  const isPremium = planTypeOrLimit === "premium";

  if (normalizedSlug === "fullstack") {
    if (isPremium) {
      const fullstackLimits: Record<number, number> = { 1: 5, 2: 8, 3: 25, 6: 50 };
      const limit = fullstackLimits[durationMonths] ?? 5;
      return domain.tasks.filter((t) => t.taskNumber <= limit);
    }
    // Standard Track for Full Stack (₹100): 10 tasks for 3M, 12 tasks for 6M
    const standardLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
    const limit = standardLimits[durationMonths] ?? 5;
    return domain.tasks.filter((t) => t.taskNumber <= limit);
  }
  const taskLimits: Record<number, number> = { 1: 5, 2: 8, 3: 10, 6: 12 };
  const limit = taskLimits[durationMonths] ?? 5;
  return domain.tasks.filter((t) => t.taskNumber <= limit);
}


