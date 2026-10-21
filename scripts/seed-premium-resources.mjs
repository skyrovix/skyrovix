import mysql from "mysql2/promise";
import crypto from "crypto";

const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "123Sk_hari@2006";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "skyrovix";

const DOMAINS_LIST = [
  "fullstack", "python", "java", "mernstack", "meanstack",
  "aiml", "datascience", "uiux", "cybersecurity", "cloudcomputing",
  "devops", "android", "flutter", "blockchain", "iot",
  "embedded", "digitalmarketing", "dataanalytics", "businessanalytics",
  "softwaretesting", "salesforce", "sap", "gamedevelopment",
  "arvr", "biomedical"
];

// 50 High-Value, Verified Real-World Projects
const PROJECTS_DATA = [
  // --- TIER 1: Available for 3-Month & 6-Month (Projects 1 to 25) ---
  {
    id: "proj-fs-01",
    project_id: "PRJ-FS-101",
    title: "E-Commerce Microservices Platform with Stripe & Inventory Lock",
    industry: "FinTech & Retail",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "Express", "PostgreSQL", "Redis", "Docker", "Stripe API"]),
    business_background: "Modern digital retail requires high-concurrency order placement and distributed inventory locks to prevent overselling during flash sales.",
    problem_statement: "Design an end-to-end e-commerce store with Redis-based distributed stock reservation, cart synchronization, and webhook-driven payment processing.",
    business_requirements: "Zero stock oversell guarantee, dynamic shipping rates, sub-200ms catalog search.",
    functional_requirements: "User authentication, product search with faceted filtering, multi-item checkout, automated order receipt emails.",
    technical_requirements: "ACID transaction safety, idempotency on payment webhooks, responsive mobile-first UI.",
    expected_deliverables: "Git repository, live demo link, Docker compose file, architecture diagram.",
    resources: JSON.stringify([
      { name: "System Architecture Guide", url: "https://github.com/skyrovix/ecommerce-architecture-spec" },
      { name: "Payment Idempotency Standard", url: "https://stripe.com/docs/api/idempotent_requests" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-ai-02",
    project_id: "PRJ-AI-102",
    title: "RAG-Powered AI Legal & Compliance Document Q&A Assistant",
    industry: "LegalTech & Enterprise AI",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "LangChain", "FastAPI", "ChromaDB", "OpenAI / HuggingFace", "React"]),
    business_background: "Legal and corporate compliance teams spend thousands of hours reviewing contracts and ISO policies.",
    problem_statement: "Build a Retrieval-Augmented Generation (RAG) assistant that indexes 100+ page policy PDFs and answers compliance questions with source paragraph citations.",
    business_requirements: "Hallucination mitigation, document confidentiality, granular permission scopes.",
    functional_requirements: "Drag-and-drop PDF upload, semantic chunking, vector embedding search, streaming answer generation with confidence score.",
    technical_requirements: "ChromaDB vector persistence, hybrid search (BM25 + Dense embeddings), FastAPI async endpoints.",
    expected_deliverables: "Python backend, React streaming chat UI, benchmark accuracy evaluation report.",
    resources: JSON.stringify([
      { name: "RAG Evaluation Framework", url: "https://github.com/explodinggradients/ragas" },
      { name: "LangChain VectorStores", url: "https://python.langchain.com/docs/modules/data_connection/vectorstores/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-ds-03",
    project_id: "PRJ-DS-103",
    title: "Predictive Customer Churn Intelligence & Retention Dashboard",
    industry: "SaaS & Telecommunications",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["Python", "Pandas", "Scikit-Learn", "XGBoost", "Streamlit", "SHAP"]),
    business_background: "Customer acquisition costs 5x more than retention. Identifying at-risk customers 30 days prior to cancellation allows proactive retention campaigns.",
    problem_statement: "Develop an end-to-end ML classification pipeline predicting user churn probability and explaining key risk factors using SHAP values.",
    business_requirements: "Model ROC-AUC > 0.88, automated feature importance generation, cohort analysis.",
    functional_requirements: "Upload subscriber telemetrics, generate churn risk score (High/Medium/Low), recommend retention offers.",
    technical_requirements: "Handling class imbalance via SMOTE, cross-validation, serialized model deployment via joblib.",
    expected_deliverables: "Jupyter EDA notebook, production inference script, interactive Streamlit analytics dashboard.",
    resources: JSON.stringify([
      { name: "Kaggle Telco Benchmark Dataset", url: "https://www.kaggle.com/datasets/blastchar/telco-customer-churn" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-sec-04",
    project_id: "PRJ-SEC-104",
    title: "Automated Web Vulnerability Scanner & OWASP Top 10 Auditor",
    industry: "Cybersecurity & DevSecOps",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Asyncio", "BeautifulSoup", "Docker", "OWASP ZAP API"]),
    business_background: "Continuous security testing ensures web applications identify critical misconfigurations before deployment into production.",
    problem_statement: "Create an automated crawler and penetration test runner detecting XSS, SQLi, missing security headers, and open CORS policies.",
    business_requirements: "Non-destructive scanning modes, actionable remediation guidance for developers.",
    functional_requirements: "URL target configuration, asynchronous crawling, payload injection testing, automated PDF audit report generation.",
    technical_requirements: "Rate limiting to prevent target DoS, structured vulnerability scoring (CVSS v3).",
    expected_deliverables: "CLI tool, automated HTML/PDF audit generator, sample vulnerable testbed.",
    resources: JSON.stringify([
      { name: "OWASP Top 10 Reference", url: "https://owasp.org/www-project-top-ten/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-mern-05",
    project_id: "PRJ-MERN-105",
    title: "Real-Time Collaborative Code Editor & Pair Programming IDE",
    industry: "Developer Tools & EdTech",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "Socket.io", "Monaco Editor", "Yjs / CRDT", "MongoDB"]),
    business_background: "Remote engineering teams and technical interviewers require lag-free concurrent code authoring with instant code compilation preview.",
    problem_statement: "Build a web-based IDE enabling 2+ developers to type in the same file simultaneously without merge conflicts using Conflict-Free Replicated Data Types (CRDT).",
    business_requirements: "Sub-50ms peer synchronization, active cursor indicators, syntax highlighting for 10+ languages.",
    functional_requirements: "Room creation via shareable code, live syntax highlight, integrated terminal output runner, voice/video chat integration.",
    technical_requirements: "Yjs WebSocket provider, Monaco editor binding, sandboxed code execution via Piston API.",
    expected_deliverables: "Full-stack code repository, Dockerized deployment, operational architecture documentation.",
    resources: JSON.stringify([
      { name: "Yjs CRDT Docs", url: "https://docs.yjs.dev/" },
      { name: "Monaco Editor React", url: "https://github.com/suren-atoyan/monaco-react" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-devops-06",
    project_id: "PRJ-DO-106",
    title: "Zero-Downtime Blue-Green Deployment Pipeline on Kubernetes",
    industry: "Cloud Infrastructure",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Kubernetes", "Docker", "GitHub Actions", "Nginx Ingress", "ArgoCD", "Prometheus"]),
    business_background: "Enterprise SaaS cannot afford maintenance windows. Blue-green deployment enables instant rollback and traffic switching without dropping connections.",
    problem_statement: "Construct a complete GitOps CI/CD delivery pipeline that automates testing, container image build, and instant ingress traffic shifting.",
    business_requirements: "99.99% service uptime during upgrades, automated rollback on error spikes.",
    functional_requirements: "GitHub pull request triggers lint & test, merge triggers Docker build and ArgoCD sync, live health probe evaluation.",
    technical_requirements: "K8s Deployment manifests, Ingress weighted routing, Prometheus alert rules.",
    expected_deliverables: "GitOps repository, Helm chart, CI/CD workflow YAMLs, demonstration recording.",
    resources: JSON.stringify([
      { name: "ArgoCD Getting Started", url: "https://argo-cd.readthedocs.io/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-uiux-07",
    project_id: "PRJ-UX-107",
    title: "Accessible FinTech Mobile Banking App Design System",
    industry: "Banking & Financial Services",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["Figma", "Tailwind CSS", "Storybook", "WCAG 2.1 AA", "Radix UI"]),
    business_background: "Modern banking apps must comply with strict accessibility standards while delivering smooth micro-interactions for transfers and investments.",
    problem_statement: "Design and implement a complete accessible UI design system including color tokens, typography scales, touch targets, and high-contrast modes.",
    business_requirements: "100% WCAG 2.1 AA compliance, zero color-alone status indications, 48px minimum touch targets.",
    functional_requirements: "Component library (Cards, Inputs, Sliders, Modals, Keypads), Dark/Light/High-Contrast themes, Storybook documentation.",
    technical_requirements: "Keyboard navigability, screen reader aria-labels, responsive design across mobile/tablet/desktop.",
    expected_deliverables: "Figma design system file, published Storybook component library, accessibility audit spreadsheet.",
    resources: JSON.stringify([
      { name: "WCAG 2.1 Guidelines", url: "https://www.w3.org/TR/WCAG21/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-py-08",
    project_id: "PRJ-PY-108",
    title: "High-Throughput Asynchronous Crypto & Stock Market Scraping Engine",
    industry: "Quantitative Finance",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Asyncio", "Aiohttp", "PostgreSQL", "TimescaleDB", "Grafana"]),
    business_background: "Trading algorithms require millisecond-accurate tick and order book data ingested from multiple public exchange endpoints.",
    problem_statement: "Build a non-blocking asynchronous streaming worker collecting 500+ ticker prices simultaneously and persisting into a time-series database.",
    business_requirements: "Zero dropped sockets, backpressure handling, sub-10ms insertion latency.",
    functional_requirements: "WebSocket stream connectors, automated reconnection, time-window aggregation (1m, 5m, 1h OHLCV bars).",
    technical_requirements: "TimescaleDB hypertable partitioning, connection pooling, Grafana dashboard visualization.",
    expected_deliverables: "Python data pipeline codebase, TimescaleDB schema migration, Grafana dashboard JSON export.",
    resources: JSON.stringify([
      { name: "TimescaleDB Architecture", url: "https://docs.timescale.com/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-mob-09",
    project_id: "PRJ-MOB-109",
    title: "Cross-Platform Food Delivery Tracker with Live GPS Map & Geofencing",
    industry: "Logistics & On-Demand Delivery",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React Native / Flutter", "Node.js", "Socket.io", "Mapbox API", "Firebase"]),
    business_background: "On-demand food delivery platforms rely heavily on live courier tracking, arrival estimates, and geofence notifications.",
    problem_statement: "Develop a mobile app featuring driver location broadcasting, customer map visualization with car movement animation, and geofence arrival alerts.",
    business_requirements: "Battery-efficient background GPS tracking, smooth map marker interpolation.",
    functional_requirements: "Order tracking screen, driver simulator, route polyline rendering, ETA calculation via Mapbox Directions API.",
    technical_requirements: "WebSocket real-time state, background geolocation permissions, offline fallback.",
    expected_deliverables: "Mobile codebase, backend location relay server, demo video demonstration.",
    resources: JSON.stringify([
      { name: "Mapbox Mobile SDK", url: "https://docs.mapbox.com/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-cloud-10",
    project_id: "PRJ-CL-110",
    title: "Serverless Event-Driven Video Transcoder & Streaming Pipeline",
    industry: "Media & Streaming",
    difficulty: "Advanced",
    technologies: JSON.stringify(["AWS Lambda", "S3", "FFmpeg", "CloudFront", "EventBridge", "Node.js"]),
    business_background: "Video platforms need automated multi-resolution HLS transcoding immediately after an MP4 upload.",
    problem_statement: "Build a serverless pipeline triggered on S3 video upload that slices video into 1080p, 720p, and 480p HLS stream chunks with an m3u8 playlist.",
    business_requirements: "Zero idle server costs, automatic scaling up to 100 concurrent uploads.",
    functional_requirements: "Secure signed upload URL generation, progress webhook callbacks, thumbnail generation.",
    technical_requirements: "FFmpeg compiled Lambda layer, CloudFront CDN distribution with signed cookies.",
    expected_deliverables: "Serverless / Terraform configuration, Lambda transcoder handlers, test video playback web page.",
    resources: JSON.stringify([
      { name: "AWS Serverless Video Spec", url: "https://aws.amazon.com/solutions/implementations/video-on-demand-on-aws/" }
    ]),
    min_duration: 3,
    tier: 1
  },
  // Projects 11 to 25
  {
    id: "proj-java-11",
    project_id: "PRJ-JV-111",
    title: "Enterprise Banking Transaction Ledger with Spring Boot & Kafka",
    industry: "Core Banking",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Java 21", "Spring Boot", "Apache Kafka", "PostgreSQL", "Docker", "JUnit 5"]),
    business_background: "Core banking requires double-entry accounting ledgers where money is neither created nor destroyed without an offsetting credit/debit pair.",
    problem_statement: "Construct a high-volume banking transaction processor utilizing Apache Kafka for event sourcing and idempotent ledger record updates.",
    business_requirements: "Strict balance invariant verification, audit logging, zero floating point rounding errors (BigDecimal).",
    functional_requirements: "Account creation, fund transfer endpoint, transaction history statement, event replay.",
    technical_requirements: "Distributed transaction isolation, Kafka consumer group rebalancing, Spring Data JPA optimistic locking.",
    expected_deliverables: "Spring Boot project, Kafka test producer scripts, comprehensive unit/integration test suite.",
    resources: JSON.stringify([{ name: "Martin Fowler Event Sourcing", url: "https://martinfowler.com/eaaDev/EventSourcing.html" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-iot-12",
    project_id: "PRJ-IOT-112",
    title: "Smart Industrial Environmental Monitoring with MQTT & InfluxDB",
    industry: "Industrial IoT",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["ESP32 / C++", "MQTT (Mosquitto)", "Node.js", "InfluxDB", "Grafana"]),
    business_background: "Factory floors require real-time humidity, temperature, and gas concentration tracking to avoid equipment overheating.",
    problem_statement: "Build an IoT telemetry collector ingesting sensor telemetry over MQTT, persisting time-series points, and triggering alert webhooks on threshold breach.",
    business_requirements: "Operates under intermittent WiFi connectivity with local buffer queue.",
    functional_requirements: "Device authentication, telemetry aggregation, automated alert notifications to Telegram/Email.",
    technical_requirements: "QoS 1 MQTT message delivery, InfluxDB bucket retention policies.",
    expected_deliverables: "ESP32 firmware code, broker bridge daemon, Grafana monitoring dashboard.",
    resources: JSON.stringify([{ name: "MQTT Essentials Guide", url: "https://www.hivemq.com/mqtt-essentials/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-qa-13",
    project_id: "PRJ-QA-113",
    title: "Comprehensive End-to-End Test Automation Suite with Playwright & Allure",
    industry: "Software Quality Assurance",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["TypeScript", "Playwright", "Allure Reports", "GitHub Actions", "Docker"]),
    business_background: "Manual regression testing slows release cycles. An automated test framework running in CI catches critical UI regressions before deployment.",
    problem_statement: "Build a cross-browser Page Object Model (POM) automated test suite covering authentication, cart, checkout, and admin verification flows.",
    business_requirements: "Parallel test execution under 3 minutes, automatic screenshot on failure.",
    functional_requirements: "Visual comparison testing, mock API responses, network failure simulation, Allure HTML reporting.",
    technical_requirements: "Dockerized execution container, retry strategies for flaky network calls.",
    expected_deliverables: "Playwright test framework repo, CI/CD pipeline integration, sample test run report.",
    resources: JSON.stringify([{ name: "Playwright POM Best Practices", url: "https://playwright.dev/docs/pom" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-block-14",
    project_id: "PRJ-BC-114",
    title: "Decentralized Escrow Smart Contract with Solidity & Hardhat",
    industry: "Web3 & Blockchain",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Solidity", "Hardhat", "Ethers.js", "Ethereum / Polygon", "Next.js"]),
    business_background: "Freelance platforms frequently suffer payment disputes. An on-chain escrow locks funds until work milestones are confirmed by the buyer or third-party arbiter.",
    problem_statement: "Write, test, and deploy a secure escrow smart contract preventing reentrancy attacks, allowing deposits, approvals, refunds, and dispute arbitration.",
    business_requirements: "Gas optimization, OpenZeppelin security standards, 100% test coverage.",
    functional_requirements: "Deposit funds into contract, release milestone payment upon buyer signature, dispute trigger.",
    technical_requirements: "ReentrancyGuard, modifier access controls, Hardhat fork testing.",
    expected_deliverables: "Solidity contracts, unit tests with Slither static analysis, web frontend DApp.",
    resources: JSON.stringify([{ name: "OpenZeppelin Contracts", url: "https://docs.openzeppelin.com/contracts/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-da-15",
    project_id: "PRJ-DA-115",
    title: "Executive Business KPI & Revenue Attribution Analytics Dashboard",
    industry: "Business Intelligence",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["SQL", "Power BI / Tableau", "Python", "Snowflake / BigQuery", "dbt"]),
    business_background: "C-suite executives need real-time clarity on Customer Lifetime Value (CLV), Monthly Recurring Revenue (MRR), and marketing CAC payback periods.",
    problem_statement: "Construct a Kimball-style dimensional data warehouse model (star schema) with facts and dimensions and connect it to a high-impact executive dashboard.",
    business_requirements: "Fast query responses under 1s for 5M+ row datasets, clear drill-down capabilities.",
    functional_requirements: "Cohort analysis, churn tracking, sales pipeline velocity, dynamic currency toggle.",
    technical_requirements: "dbt models with automated schema tests, star schema with surrogate keys.",
    expected_deliverables: "dbt project repository, SQL transformations, Power BI / Tableau dashboard file with interactive filters.",
    resources: JSON.stringify([{ name: "Kimball Dimensional Modeling", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/" }]),
    min_duration: 3,
    tier: 1
  },
  // Projects 16 to 25
  {
    id: "proj-fs-16",
    project_id: "PRJ-FS-116",
    title: "Multi-Tenant SaaS Project Management Tool with Role-Based Workspace Permissions",
    industry: "Enterprise Productivity",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "PostgreSQL", "Prisma", "Tailwind CSS", "Zod"]),
    business_background: "B2B SaaS requires strict tenant isolation to prevent data leaks between enterprise accounts.",
    problem_statement: "Develop a multi-tenant Kanban board application with organization workspaces, custom roles (Admin, Member, Viewer), and invite links.",
    business_requirements: "Row-level tenant isolation, audit log of all permission modifications.",
    functional_requirements: "Drag-and-drop task boards, member invitations, activity feed, workspace billing tiers.",
    technical_requirements: "PostgreSQL schema tenancy or tenant_id scoping on every table query.",
    expected_deliverables: "Full-stack web application, seed data generator, test suite verifying cross-tenant access denial.",
    resources: JSON.stringify([{ name: "Multi-Tenant DB Patterns", url: "https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-ai-17",
    project_id: "PRJ-AI-117",
    title: "Real-Time Object Detection & PPE Safety Compliance Monitor",
    industry: "Smart Manufacturing & OSHA",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "YOLOv8", "OpenCV", "FastAPI", "WebRTC", "PyTorch"]),
    business_background: "Industrial workplaces require construction workers to wear helmets and safety vests to prevent workplace fatalities.",
    problem_statement: "Train and deploy a computer vision pipeline running on live RTSP video feeds detecting personnel without required PPE in real-time.",
    business_requirements: "30+ FPS processing speed, zero false negatives on helmet detection within 15 meters.",
    functional_requirements: "Live video stream overlay with bounding boxes, snapshot saving on infraction, email alert with attached evidence.",
    technical_requirements: "YOLOv8 fine-tuning on custom PPE dataset, TensorRT inference optimization.",
    expected_deliverables: "Trained model weights, inference server script, detection demonstration video.",
    resources: JSON.stringify([{ name: "Ultralytics YOLOv8 Docs", url: "https://docs.ultralytics.com/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-cloud-18",
    project_id: "PRJ-CL-118",
    title: "Infrastructure as Code (IaC) AWS Multi-AZ High Availability Architecture",
    industry: "Cloud Architecture",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Terraform", "AWS VPC", "ALB", "AutoScaling", "RDS Multi-AZ", "Bastion"]),
    business_background: "Enterprises need repeatable, secure cloud infrastructure that withstands single availability zone outages automatically.",
    problem_statement: "Write modular Terraform code provisioning a complete production VPC with public/private subnets, NAT gateways, AutoScaling EC2 groups, and Multi-AZ RDS.",
    business_requirements: "Zero hardcoded credentials, state locking with S3 and DynamoDB, least privilege security groups.",
    functional_requirements: "Automated provisioning via 'terraform apply', health-check based instance replacement.",
    technical_requirements: "Terraform remote state, modular directory layout (dev/staging/prod).",
    expected_deliverables: "Terraform module repository, architecture diagram, security group rule audit report.",
    resources: JSON.stringify([{ name: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-sec-19",
    project_id: "PRJ-SEC-119",
    title: "SIEM Log Ingestion, Correlation Engine & Threat Detection System",
    industry: "Security Operations (SOC)",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Elasticsearch", "Logstash", "Kibana", "Sigma Rules"]),
    business_background: "Security Operation Centers must correlate SSH brute force attempts, sudo privilege escalations, and unusual outbound connections across 100+ servers.",
    problem_statement: "Build a centralized logging pipeline collecting auth logs, parsing events, and triggering alerts on brute force patterns matching Sigma detection rules.",
    business_requirements: "Real-time alert delivery within 10 seconds of attack onset.",
    functional_requirements: "Syslog forwarder, elasticsearch indexing, Kibana security dashboard, automated Slack/Telegram alert dispatch.",
    technical_requirements: "Elasticsearch index lifecycle management (ILM), optimized search queries.",
    expected_deliverables: "Log pipeline configuration, Sigma rule definitions, Kibana dashboard export.",
    resources: JSON.stringify([{ name: "Sigma Detection Rules", url: "https://github.com/SigmaHQ/sigma" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-mern-20",
    project_id: "PRJ-MERN-120",
    title: "Healthcare Teleconsultation & Electronic Medical Records (EMR) Portal",
    industry: "HealthTech & Telehealth",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "WebRTC", "Socket.io", "MongoDB", "Tailwind CSS"]),
    business_background: "Healthcare clinics require HIPAA-conscious virtual doctor-patient appointments with encrypted video consultations and digital prescription issuance.",
    problem_statement: "Develop a teleconsultation platform featuring appointment booking, peer-to-peer WebRTC video calls, chat, and digital prescription generation.",
    business_requirements: "Data privacy compliance, audio/video fallback for low bandwidth, digital signatures on prescriptions.",
    functional_requirements: "Doctor availability calendar, video consultation room, medical history records, PDF prescription generator.",
    technical_requirements: "WebRTC STUN/TURN configuration, socket signaling server, AES-256 data encryption at rest.",
    expected_deliverables: "Full-stack portal repository, deployment guide, end-to-end appointment walkthrough video.",
    resources: JSON.stringify([{ name: "WebRTC Standards", url: "https://webrtc.org/getting-started/overview" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-py-21",
    project_id: "PRJ-PY-121",
    title: "Automated Algorithmic Backtesting Engine with Vectorized Calculations",
    industry: "FinTech & Quant Trading",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Pandas", "NumPy", "Matplotlib", "QuantStats"]),
    business_background: "Quant traders require rigorous historical backtesting to calculate Sharpe ratios, max drawdowns, and CAGR before deploying capital into live markets.",
    problem_statement: "Build a modular, fast backtesting engine that simulates technical indicators (EMA, RSI, MACD) against 10 years of historical stock data accounting for slippage and commissions.",
    business_requirements: "Vectorized computation 50x faster than for-loops, comprehensive tear-sheet generation.",
    functional_requirements: "Custom strategy interface, position sizing rules, benchmark comparison against S&P500/Nifty50.",
    technical_requirements: "Pandas vectorization, QuantStats HTML report generation, unit tests for edge-case fills.",
    expected_deliverables: "Python package codebase, sample strategy backtest reports, performance benchmarks.",
    resources: JSON.stringify([{ name: "QuantStats Analytics", url: "https://github.com/ranaroussi/quantstats" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-ds-22",
    project_id: "PRJ-DS-122",
    title: "AI-Powered Medical Image Classification & Tumor Segmentation",
    industry: "Healthcare & MedTech",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "PyTorch", "Torchvision", "U-Net", "Grad-CAM", "Albumentations"]),
    business_background: "Radiologists benefit from automated computer-aided diagnosis tools highlighting regions of interest on MRI and X-ray scans.",
    problem_statement: "Develop a deep learning convolutional model segmenting lung abnormalities and generating Grad-CAM heatmaps showing model reasoning.",
    business_requirements: "Dice similarity coefficient > 0.85, explainable visual overlays for medical staff.",
    functional_requirements: "DICOM/PNG image loading, image augmentations, pixel-level mask prediction, heatmap overlay.",
    technical_requirements: "U-Net architecture with ResNet encoder, custom loss (BCE + Dice Loss).",
    expected_deliverables: "PyTorch model training pipeline, validation metrics report, visual segmentation comparison slides.",
    resources: JSON.stringify([{ name: "U-Net Architecture Paper", url: "https://arxiv.org/abs/1505.04597" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-devops-23",
    project_id: "PRJ-DO-123",
    title: "Automated Disaster Recovery & Cross-Region Database Replication",
    industry: "Cloud SRE & Operations",
    difficulty: "Advanced",
    technologies: JSON.stringify(["PostgreSQL", "MySQL", "AWS RDS", "Python", "Bash", "Terraform"]),
    business_background: "Enterprise mission-critical data must guarantee a Recovery Point Objective (RPO) < 5 minutes and Recovery Time Objective (RTO) < 15 minutes.",
    problem_statement: "Implement an automated cross-region replication and failover daemon that detects primary database heartbeat loss and orchestrates DNS switchover to the replica.",
    business_requirements: "Automated split-brain prevention, zero data loss on clean failover.",
    functional_requirements: "Continuous health check probe, automatic replica promotion, Route53 DNS record update, incident alert dispatch.",
    technical_requirements: "Asynchronous read replica configuration, automated snapshot lifecycles.",
    expected_deliverables: "Failover script repository, disaster recovery simulation runbook, test drill report.",
    resources: JSON.stringify([{ name: "AWS RDS Replication Architecture", url: "https://aws.amazon.com/rds/features/read-replicas/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-mob-24",
    project_id: "PRJ-MOB-124",
    title: "Offline-First Mobile Field Inspection App with SQLite Sync",
    industry: "Field Services & Utilities",
    difficulty: "Intermediate",
    technologies: JSON.stringify(["Flutter / React Native", "SQLite / WatermelonDB", "Node.js", "REST API"]),
    business_background: "Inspectors visiting remote wind turbines or construction sites work in subterranean zones without cellular service.",
    problem_statement: "Build an offline-first inspection app allowing inspectors to capture photos, fill questionnaires, and sync conflict-free once internet connectivity is restored.",
    business_requirements: "Local offline database persistence, two-way sync delta resolution.",
    functional_requirements: "Dynamic inspection form builder, photo annotations, automatic background sync queue.",
    technical_requirements: "Timestamp-based conflict resolution, local SQLite storage, delta sync endpoints.",
    expected_deliverables: "Mobile application code, sync backend API, sync conflict scenario test suite.",
    resources: JSON.stringify([{ name: "Offline-First Design Patterns", url: "https://offlinefirst.org/" }]),
    min_duration: 3,
    tier: 1
  },
  {
    id: "proj-fs-25",
    project_id: "PRJ-FS-125",
    title: "Full-Stack EdTech Learning Management System with Video DRM & Quizzes",
    industry: "EdTech & Education",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "TanStack Start", "Node.js", "MySQL", "Tailwind CSS", "PDF Generation"]),
    business_background: "Virtual learning platforms need integrated curriculum modules, timed assessments, automated certificate issuance, and payment gateways.",
    problem_statement: "Design a complete LMS portal featuring domain-specific module tracks, sequential task verification, automated offer letter PDFs, and tamper-proof verification QR codes.",
    business_requirements: "Anti-skip task verification, automated credential generation with unique verifiable hashes.",
    functional_requirements: "Student portal, admin review dashboard, Cashfree/UPI payments, certificate verification page.",
    technical_requirements: "Nitro SSR server, MySQL connection pooling, dynamic PDF rendering.",
    expected_deliverables: "Production web codebase, database schema migrations, end-to-end integration test documentation.",
    resources: JSON.stringify([{ name: "Skyrovix Architecture Reference", url: "https://skyrovix.online/verify" }]),
    min_duration: 3,
    tier: 1
  },

  // --- TIER 2: Additional Projects for 6-Month Premium (Projects 26 to 50) ---
  {
    id: "proj-ai-26",
    project_id: "PRJ-AI-201",
    title: "Autonomous Multi-Agent AI Workflow Orchestrator with AutoGen",
    industry: "Autonomous AI Systems",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Microsoft AutoGen", "FastAPI", "Docker", "React"]),
    business_background: "Complex engineering tasks require multiple specialized AI agents (Coder, Reviewer, Tester) collaborating autonomously to solve problems.",
    problem_statement: "Build a multi-agent system where a Product Manager agent breaks requirements, a Developer agent writes code, and a QA agent tests in a sandboxed Docker container.",
    business_requirements: "Execution loop safety limits, structured artifact output.",
    functional_requirements: "Chat interface showing agent conversations, code execution sandbox, terminal logs.",
    technical_requirements: "Docker container sandboxing, AutoGen agent configurations, WebSocket stream output.",
    expected_deliverables: "Multi-agent framework, web UI, test benchmarks.",
    resources: JSON.stringify([{ name: "Microsoft AutoGen Docs", url: "https://microsoft.github.io/autogen/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-cloud-27",
    project_id: "PRJ-CL-202",
    title: "Global CDN Edge Compute Function for Dynamic Geolocation Personalization",
    industry: "Cloud & Edge Computing",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Cloudflare Workers", "TypeScript", "KV Storage", "Wasm"]),
    business_background: "Global brands personalize pricing, currency, and language right at the network edge with sub-10ms response times.",
    problem_statement: "Implement an edge compute worker intercepting HTTP requests, resolving geo-IP headers, and rewriting HTML responses dynamically before caching.",
    business_requirements: "Sub-5ms execution time, zero origin server load for cached regions.",
    functional_requirements: "Geo-IP header extraction, dynamic currency substitution, A/B testing cookie allocation.",
    technical_requirements: "Cloudflare Workers runtime, HTMLRewriter API, edge KV storage.",
    expected_deliverables: "Worker script, unit tests, load-testing latency comparison report.",
    resources: JSON.stringify([{ name: "Cloudflare HTMLRewriter Docs", url: "https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-sec-28",
    project_id: "PRJ-SEC-203",
    title: "Zero-Trust Identity & Access Proxy with WireGuard & OAuth2",
    industry: "Enterprise Security",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Golang", "WireGuard", "OIDC / Google OAuth", "Linux iptables"]),
    business_background: "Modern enterprises are ditching legacy VPNs in favor of Zero-Trust Network Access (ZTNA) where identity and device health determine access.",
    problem_statement: "Build a lightweight reverse proxy authenticating users via Google OAuth before establishing ephemeral WireGuard VPN peer tunnels to private internal microservices.",
    business_requirements: "Session expiration enforcement, instant device revocation.",
    functional_requirements: "Web login portal, automated WireGuard peer config generation, iptables rule injection.",
    technical_requirements: "Go WireGuard user-space client, JWT verification, Linux networking.",
    expected_deliverables: "Go binary source code, deployment scripts, security posture verification guide.",
    resources: JSON.stringify([{ name: "WireGuard Architecture", url: "https://www.wireguard.com/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ds-29",
    project_id: "PRJ-DS-204",
    title: "Credit Risk Scoring & Default Prediction Pipeline with Feature Store",
    industry: "Banking & FinTech",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Feast", "LightGBM", "FastAPI", "Docker", "Great Expectations"]),
    business_background: "FinTech lending apps need millisecond risk scoring while avoiding train-serve feature skew.",
    problem_statement: "Implement a production machine learning pipeline featuring a Feast feature store, automated data quality validation with Great Expectations, and a LightGBM loan default classifier.",
    business_requirements: "Data drift detection, automated schema validation, sub-50ms API inference latency.",
    functional_requirements: "Feature ingestion from batch and streaming sources, online feature serving, prediction endpoint with loan decision (Approve/Reject).",
    technical_requirements: "Feast feature store with Redis online store, automated data validation suites.",
    expected_deliverables: "End-to-end ML repository, feature definition files, model performance monitoring notebook.",
    resources: JSON.stringify([{ name: "Feast Feature Store Docs", url: "https://feast.dev/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-mern-30",
    project_id: "PRJ-MERN-205",
    title: "High-Concurrency Real-Time Auction & Bidding Platform",
    industry: "E-Commerce & Auctions",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "Redis Pub/Sub", "Socket.io", "MongoDB"]),
    business_background: "Live auctions experience intense traffic spikes in the final 10 seconds of an item closing (bid snipers).",
    problem_statement: "Construct a real-time bidding engine with automated timer extension upon late bids, Redis atomic increment locks, and live socket broadcast to all connected bidders.",
    business_requirements: "Zero race conditions on concurrent bids, anti-sniping dynamic clock extensions.",
    functional_requirements: "Live countdown timer, real-time bid log, automated winning bid reconciliation, user wallet balance reserve.",
    technical_requirements: "Redis Lua scripts for atomic balance deduction and bid registration, WebSocket cluster synchronization.",
    expected_deliverables: "Full-stack application repo, artillery load test script demonstrating 1,000 concurrent bids/sec.",
    resources: JSON.stringify([{ name: "Redis Transactions & Lua", url: "https://redis.io/docs/interact/programmability/eval-intro/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-devops-31",
    project_id: "PRJ-DO-206",
    title: "Multi-Cloud Kubernetes Cost Optimization & Autoscaler with Karpenter",
    industry: "FinOps & Cloud Engineering",
    difficulty: "Advanced",
    technologies: JSON.stringify(["AWS EKS", "Karpenter", "Kubernetes", "Prometheus", "Grafana", "Kubecost"]),
    business_background: "Companies overspend on cloud compute by 30–40% due to slow cluster autoscaling and unutilized node capacity.",
    problem_statement: "Deploy and tune Karpenter on an EKS cluster to provision just-in-time spot instances matching pod resource requests, reducing monthly compute bills.",
    business_requirements: "Graceful spot instance interruption handling, minimum 35% cost reduction over standard ASG.",
    functional_requirements: "Provisioner configurations for mixed instance families, disruption budgets, Kubecost cost dashboard.",
    technical_requirements: "Karpenter CRDs, IAM roles for service accounts (IRSA), Prometheus cost exporter.",
    expected_deliverables: "Helm configuration, benchmark workload generator, cost comparison report.",
    resources: JSON.stringify([{ name: "Karpenter Documentation", url: "https://karpenter.sh/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-block-32",
    project_id: "PRJ-BC-207",
    title: "Cross-Chain Token Bridge & Liquidity Pool with Chainlink CCIP",
    industry: "DeFi & Web3",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Solidity", "Chainlink CCIP", "Hardhat", "Ethers.js", "Polygon / Arbitrum"]),
    business_background: "Decentralized finance users require seamless asset transfers between Layer 1 (Ethereum) and Layer 2 (Polygon/Arbitrum) ecosystems.",
    problem_statement: "Develop a cross-chain smart contract protocol utilizing Chainlink Cross-Chain Interoperability Protocol (CCIP) to lock tokens on source chain and mint wrapped representations on destination.",
    business_requirements: "Reentrancy protection, slippage bounds, cross-chain message verification.",
    functional_requirements: "Token deposit, cross-chain relay event listener, destination claim, proof verification.",
    technical_requirements: "Chainlink CCIP router integration, gas fee estimation in LINK or native token.",
    expected_deliverables: "Smart contracts, deployment scripts on Sepolia and Mumbai testnets, integration tests.",
    resources: JSON.stringify([{ name: "Chainlink CCIP Docs", url: "https://docs.chain.link/ccip" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ai-33",
    project_id: "PRJ-AI-208",
    title: "Voice-Activated Real-Time AI Phone Support Agent with Whisper & TTS",
    industry: "Voice AI & Customer Support",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "OpenAI Whisper", "ElevenLabs / Coqui TTS", "FastAPI", "WebSockets"]),
    business_background: "Customer support call centers are being augmented by ultra-low-latency conversational AI handlingTier 1 support calls.",
    problem_statement: "Build a bidirectional audio streaming agent that transcribes voice, feeds intent to an LLM, and streams back synthesized human speech with under 800ms end-to-end latency.",
    business_requirements: "Interruption detection (barge-in), contextual memory across multi-turn dialogues.",
    functional_requirements: "Microphone streaming in browser, server-side VAD (Voice Activity Detection), LLM response chunking, speech playback.",
    technical_requirements: "Binary WebSocket audio streaming, asynchronous audio decoding, buffer optimization.",
    expected_deliverables: "Voice AI backend, browser voice interface, latency profile analysis.",
    resources: JSON.stringify([{ name: "WebRTC Audio & VAD", url: "https://github.com/snakers4/silero-vad" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-fs-34",
    project_id: "PRJ-FS-209",
    title: "Enterprise Fleet Telematics & Predictive Maintenance Platform",
    industry: "Logistics & Transport",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "Node.js", "TimescaleDB", "Mapbox", "Kafka", "Docker"]),
    business_background: "Trucking fleets lose millions in unplanned vehicle downtime. Continuous engine sensor analysis forecasts alternator and brake failures weeks in advance.",
    problem_statement: "Develop a vehicle tracking and telematics dashboard displaying real-time speed, fuel consumption, diagnostic trouble codes (DTC), and maintenance schedules.",
    business_requirements: "Handle 10,000 sensor telemetry pings/min, automated alert generation on critical DTC codes.",
    functional_requirements: "Fleet live map, historical route playback, vehicle health score card, maintenance work order generator.",
    technical_requirements: "Time-series database schema, geospatial queries, event streaming.",
    expected_deliverables: "Full-stack application repo, simulated OBD-II sensor data generator, user manual.",
    resources: JSON.stringify([{ name: "OBD-II Standard PID Spec", url: "https://en.wikipedia.org/wiki/OBD-II_PIDs" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-py-35",
    project_id: "PRJ-PY-210",
    title: "Distributed Web Crawler & Knowledge Graph Construction Pipeline",
    industry: "Search & Data Engineering",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Scrapy", "Neo4j", "Celery", "Redis", "spaCy"]),
    business_background: "Market intelligence firms need to crawl corporate news and map relationships between companies, founders, acquisitions, and funding rounds.",
    problem_statement: "Build a distributed crawler extracting named entities (NER) from tech news and inserting nodes and relationship edges into a Neo4j knowledge graph.",
    business_requirements: "Respect robots.txt and rate limits, deduplicate entities using cosine similarity.",
    functional_requirements: "Distributed task workers, entity extraction pipeline, Cypher query interface, graph visualizer.",
    technical_requirements: "Celery distributed queue, Neo4j graph database, spaCy NLP pipeline.",
    expected_deliverables: "Crawler codebase, Neo4j schema, interactive graph visualization UI.",
    resources: JSON.stringify([{ name: "Neo4j Graph Database Docs", url: "https://neo4j.com/docs/" }]),
    min_duration: 6,
    tier: 2
  },
  // Projects 36 to 50
  {
    id: "proj-sec-36",
    project_id: "PRJ-SEC-211",
    title: "Automated Incident Response & Forensic Memory Dump Analyzer",
    industry: "Digital Forensics & Incident Response (DFIR)",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "Volatility 3", "YARA", "Flask", "Docker"]),
    business_background: "Following malware intrusions, incident responders must inspect raw memory RAM dumps to discover injected DLLs, unencrypted credentials, and command-and-control IPs.",
    problem_statement: "Construct an automated web tool where security analysts upload a memory dump and receive an automated report analyzing running processes, hidden network connections, and YARA malware matches.",
    business_requirements: "High-speed memory inspection, structured artifact output.",
    functional_requirements: "File upload, Volatility plugin execution (pslist, netscan, malfind), YARA rule matching, incident summary timeline.",
    technical_requirements: "Async worker execution, memory-efficient streaming, secure sandboxed execution.",
    expected_deliverables: "Python DFIR automation tool, sample infected memory test dumps, analysis reports.",
    resources: JSON.stringify([{ name: "Volatility 3 Framework", url: "https://github.com/volatilityfoundation/volatility3" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-uiux-37",
    project_id: "PRJ-UX-212",
    title: "Healthcare Clinical Decision Support (CDS) Tablet Interface Design",
    industry: "Health Informatics",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Figma", "Design Thinking", "Usability Testing", "React", "Tailwind CSS"]),
    business_background: "Intensive care unit (ICU) nurses experience alarm fatigue. Clean, unambiguous interface design saves lives by highlighting critical patient vital anomalies immediately.",
    problem_statement: "Design a touch-first hospital tablet UI showing multi-parameter vital signs, medication schedules, and clinical alerts with zero cognitive clutter.",
    business_requirements: "Color-blind safe palette, high visibility under bright hospital fluorescent lighting.",
    functional_requirements: "Patient overview dashboard, real-time vital waveforms, interactive medication checklist, one-tap emergency alert.",
    technical_requirements: "Component library, high-fidelity Figma prototype with interactive state variants.",
    expected_deliverables: "Figma project with design system, user research documentation, interactive prototype link.",
    resources: JSON.stringify([{ name: "NHS Digital Design Principles", url: "https://service-manual.nhs.uk/design-system" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ds-38",
    project_id: "PRJ-DS-213",
    title: "Scalable Recommendation System using Matrix Factorization & Two-Tower Neural Networks",
    industry: "E-Commerce & Media",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "TensorFlow / PyTorch", "Implicit", "Faiss", "FastAPI"]),
    business_background: "Recommendation systems drive over 35% of Amazon's sales and 70% of YouTube view time by matching user taste profiles to relevant catalogs.",
    problem_statement: "Build a two-stage recommendation pipeline: candidate generation using a two-tower neural network, followed by approximate nearest neighbor (ANN) retrieval via Facebook AI Similarity Search (Faiss).",
    business_requirements: "Sub-25ms retrieval latency across a 100,000-item catalog.",
    functional_requirements: "User-item interaction training pipeline, embedding generation, fast similarity search endpoint.",
    technical_requirements: "Faiss index optimization (IVFFlat), offline metrics evaluation (Precision@K, NDCG@K).",
    expected_deliverables: "Recommendation engine repository, evaluation notebook, live inference demo.",
    resources: JSON.stringify([{ name: "Facebook AI Similarity Search (Faiss)", url: "https://github.com/facebookresearch/faiss" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-cloud-39",
    project_id: "PRJ-CL-214",
    title: "Multi-Region Cloud Disaster Recovery with Active-Active CockroachDB",
    industry: "Global Cloud Engineering",
    difficulty: "Advanced",
    technologies: JSON.stringify(["CockroachDB", "Kubernetes", "AWS & GCP", "Terraform", "Envoy"]),
    business_background: "Financial networks operating globally require active-active transactional consistency across US, Europe, and Asia without downtime.",
    problem_statement: "Deploy a distributed multi-region CockroachDB cluster across two distinct cloud providers and demonstrate zero-data-loss survival during simulated cloud provider network partition.",
    business_requirements: "RPO = 0, RTO < 5 seconds for single-region outage.",
    functional_requirements: "Multi-region cluster deployment, geo-partitioned tables, automated health monitoring.",
    technical_requirements: "Raft consensus protocol, multi-cloud VPC peering, Envoy load balancing.",
    expected_deliverables: "Infrastructure configuration, partition drill demo video, technical architecture document.",
    resources: JSON.stringify([{ name: "CockroachDB Multi-Region Architecture", url: "https://www.cockroachlabs.com/docs/stable/multiregion-overview.html" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-devops-40",
    project_id: "PRJ-DO-215",
    title: "Production Chaos Engineering Framework with Chaos Mesh & LitmusChaos",
    industry: "Site Reliability Engineering (SRE)",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Chaos Mesh", "Kubernetes", "Prometheus", "Grafana", "Go / Python"]),
    business_background: "Reliability cannot be assumed; it must be proven. Injecting controlled network delays, pod kills, and disk failures reveals hidden cascading bottlenecks.",
    problem_statement: "Build a chaos experimentation suite executing automated fault injection experiments (network packet loss, CPU burn, DNS failure) during synthetic traffic testing.",
    business_requirements: "Safety abort triggers if error rate exceeds 2%, automated experiment reports.",
    functional_requirements: "Chaos experiment definitions (YAML), steady-state hypothesis validator, Slack alert notification.",
    technical_requirements: "Chaos Mesh CRDs, Prometheus query integration for automated rollback.",
    expected_deliverables: "Chaos experimentation repo, Grafana dashboards during failure, incident analysis post-mortem.",
    resources: JSON.stringify([{ name: "Principles of Chaos Engineering", url: "https://principlesofchaos.org/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ai-41",
    project_id: "PRJ-AI-216",
    title: "Edge AI Real-Time Driver Drowsiness & Distraction Detection System",
    industry: "Automotive & Fleet Safety",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "OpenCV", "MediaPipe / Dlib", "PyTorch", "Raspberry Pi"]),
    business_background: "Commercial vehicle crashes caused by microsleep and mobile phone distraction cost transportation companies over $100M annually.",
    problem_statement: "Construct an embedded computer vision application computing Eye Aspect Ratio (EAR) and Head Pose Estimation to sound an audible alert when eyes close for > 1.5 seconds.",
    business_requirements: "Runs at 25+ FPS on edge devices like Raspberry Pi 4 without cloud dependency.",
    functional_requirements: "Face mesh landmark tracking, eye closure timer, head rotation monitor, audio buzzer trigger.",
    technical_requirements: "MediaPipe FaceMesh, optimized EAR mathematical formula, multithreaded video capture.",
    expected_deliverables: "Python edge vision code, demo video with simulation, hardware setup guide.",
    resources: JSON.stringify([{ name: "MediaPipe Face Mesh Docs", url: "https://developers.google.com/mediapipe/solutions/vision/face_landmarker" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-fs-42",
    project_id: "PRJ-FS-217",
    title: "High-Volume Real-Time Analytics Event Tracking Engine (Segment / Mixpanel Alternative)",
    industry: "Marketing Tech & Analytics",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Golang / Node.js", "ClickHouse", "Kafka", "React", "Docker"]),
    business_background: "Third-party analytics tools are expensive and compromise user data privacy. A self-hosted event ingestion pipeline handles billions of events cost-effectively.",
    problem_statement: "Develop a lightweight JavaScript tracking snippet, an ingestion HTTP gateway handling 5,000 req/sec, and a ClickHouse columnar database for real-time funnel queries.",
    business_requirements: "Sub-100ms funnel query computation over 10M events, script size under 5KB.",
    functional_requirements: "Event tracking SDK, batch ingestion endpoint, funnel conversion analytics dashboard.",
    technical_requirements: "ClickHouse columnar storage engine, Kafka buffer queue, Go ingestion service.",
    expected_deliverables: "Client tracking script, backend ingestion code, ClickHouse schema, analytics UI.",
    resources: JSON.stringify([{ name: "ClickHouse Architecture", url: "https://clickhouse.com/docs/en/intro" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-sec-43",
    project_id: "PRJ-SEC-218",
    title: "Hardware Security Token & FIDO2 / WebAuthn Passwordless Authentication Server",
    industry: "Identity & Cryptography",
    difficulty: "Advanced",
    technologies: JSON.stringify(["TypeScript", "SimpleWebAuthn", "Node.js", "PostgreSQL", "React"]),
    business_background: "Passwords are the primary vector for data breaches. WebAuthn enables phishing-resistant biometrics (TouchID, FaceID, YubiKey) natively in the browser.",
    problem_statement: "Build a complete FIDO2 passwordless authentication server implementing challenge generation, attestation validation, and credential public key verification.",
    business_requirements: "Zero passwords stored in database, protection against credential stuffing and phishing.",
    functional_requirements: "Biometric registration, biometric login, management of multiple hardware security keys.",
    technical_requirements: "WebAuthn ceremony implementation, cryptographic signature verification (ECDSA/RSA), session tokens.",
    expected_deliverables: "Authentication server repository, React frontend demo, security audit checklist.",
    resources: JSON.stringify([{ name: "WebAuthn Guide", url: "https://webauthn.guide/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-block-44",
    project_id: "PRJ-BC-219",
    title: "Automated DeFi Yield Aggregator & Vault Protocol (Yearn Finance Model)",
    industry: "Decentralized Finance",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Solidity", "Hardhat", "ERC-4626", "Aave V3", "Uniswap V3"]),
    business_background: "Yield farming requires manual gas-expensive rebalancing across lending protocols. Automated vaults pool capital to compound returns and maximize APY.",
    problem_statement: "Implement an ERC-4626 Tokenized Vault smart contract that routes deposited stablecoins to the highest-yielding lending strategy (Aave vs Compound) and auto-compounds rewards.",
    business_requirements: "ERC-4626 standard compliance, emergency withdrawal pause mechanism.",
    functional_requirements: "Deposit USDC to receive vault shares, harvest yield function, withdrawal with interest.",
    technical_requirements: "Solidity reentrancy guards, Hardhat mainnet fork testing, gas profiling.",
    expected_deliverables: "Smart contracts, deployment scripts, test suite verifying yield distribution.",
    resources: JSON.stringify([{ name: "ERC-4626 Tokenized Vault Standard", url: "https://eips.ethereum.org/EIPS/eip-4626" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ds-45",
    project_id: "PRJ-DS-220",
    title: "Graph Neural Networks (GNN) for Fraud Ring & Sybil Attack Detection",
    industry: "Cybercrime & Anti-Fraud",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "PyTorch Geometric (PyG)", "NetworkX", "FastAPI", "Neo4j"]),
    business_background: "Organized fraud syndicates use synthetic identities that appear legitimate individually but share device fingerprints and transaction chains in a hidden network.",
    problem_statement: "Build a Graph Neural Network (GNN) classification model detecting coordinated fraud rings and illicit fund laundering patterns across 50,000 transaction nodes.",
    business_requirements: "High precision > 92% to prevent false-positive account freezes.",
    functional_requirements: "Graph dataset generator, GCN/GAT model training, risk score API endpoint, network graph visualization.",
    technical_requirements: "PyTorch Geometric, Graph Attention Networks (GAT), edge weighting.",
    expected_deliverables: "Model training pipeline, fraud scoring API, interactive graph investigation dashboard.",
    resources: JSON.stringify([{ name: "PyTorch Geometric Docs", url: "https://pytorch-geometric.readthedocs.io/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-cloud-46",
    project_id: "PRJ-CL-221",
    title: "Enterprise Multi-Account Cloud Governance & Compliance Automation Engine",
    industry: "Cloud Security & Governance",
    difficulty: "Advanced",
    technologies: JSON.stringify(["AWS Organizations", "AWS Config", "Lambda", "Python", "CloudTrail"]),
    business_background: "Large companies manage hundreds of AWS accounts. Automated governance auto-remediates non-compliant resources (e.g. unencrypted S3 buckets, open security groups).",
    problem_statement: "Build an event-driven compliance engine that detects unencrypted S3 buckets or public security groups within 30 seconds and auto-remediates them while notifying admins.",
    business_requirements: "Sub-minute remediation, comprehensive compliance audit logging.",
    functional_requirements: "Config rule evaluation, automated Lambda remediation, Slack audit notification, monthly executive compliance report.",
    technical_requirements: "EventBridge rules, IAM cross-account assume roles, AWS SDK for Python (Boto3).",
    expected_deliverables: "CloudFormation / Terraform templates, Lambda remediation handlers, testing walkthrough.",
    resources: JSON.stringify([{ name: "AWS Security Hub Standards", url: "https://docs.aws.amazon.com/securityhub/latest/userguide/standards-reference.html" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-ai-47",
    project_id: "PRJ-AI-222",
    title: "AI Video Summarizer & Key Moment Highlight Generator with Multimodal LLMs",
    industry: "Media & AI Content",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "OpenAI Whisper", "GPT-4o / Claude Vision", "FFmpeg", "Streamlit"]),
    business_background: "Video editors and webinar attendees need automated highlight reels and chapter timestamps generated from 2-hour video recordings.",
    problem_statement: "Construct an automated video processing pipeline extracting audio transcriptions and video frames, detecting topic transitions, and outputting short highlight clips with captions.",
    business_requirements: "Accurate chapter timestamps within 2 seconds of topic shift, automated subtitle burning.",
    functional_requirements: "Video upload, audio extraction, Whisper transcription, multimodal keyframe analysis, FFmpeg clip export.",
    technical_requirements: "FFmpeg scene change detection, structured JSON chapter outputs, Streamlit user interface.",
    expected_deliverables: "Video processing codebase, Streamlit web app, sample processed demonstration video.",
    resources: JSON.stringify([{ name: "FFmpeg Filters Guide", url: "https://ffmpeg.org/ffmpeg-filters.html" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-devops-48",
    project_id: "PRJ-DO-223",
    title: "Enterprise GitOps Infrastructure Delivery with Crossplane & Kubernetes",
    industry: "Cloud Native & Platform Engineering",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Crossplane", "Kubernetes", "AWS Provider", "ArgoCD", "Helm"]),
    business_background: "Platform engineering teams provide developers self-service infrastructure (RDS databases, S3 buckets) managed purely through Kubernetes custom resources.",
    problem_statement: "Implement a Crossplane control plane allowing developers to provision production AWS RDS and S3 resources by declaring simple Kubernetes YAML manifests.",
    business_requirements: "Consistent corporate tagging standards, automated policy enforcement.",
    functional_requirements: "Composition definitions, Composite Resource Definitions (XRDs), developer claim examples.",
    technical_requirements: "Crossplane AWS provider, IAM IRSA authentication, ArgoCD GitOps synchronization.",
    expected_deliverables: "Platform engineering repo, XRD and Composition YAMLs, developer self-service guide.",
    resources: JSON.stringify([{ name: "Crossplane Documentation", url: "https://docs.crossplane.io/" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-fs-49",
    project_id: "PRJ-FS-224",
    title: "Collaborative Real-Time Whiteboard & Diagramming Engine (Miro / Excalidraw Model)",
    industry: "Productivity & Collaboration",
    difficulty: "Advanced",
    technologies: JSON.stringify(["React", "HTML5 Canvas", "WebSockets", "Node.js", "Zustand"]),
    business_background: "Remote product design sprints require responsive infinite-canvas diagramming with live peer cursor movements and shape synchronization.",
    problem_statement: "Build an infinite-canvas drawing tool supporting freehand sketching, shapes, sticky notes, text, and real-time multi-user cursor tracking.",
    business_requirements: "60 FPS rendering on complex canvases with 1,000+ objects, pan-and-zoom transformation matrix.",
    functional_requirements: "Tool palette (Pen, Rectangle, Diamond, Arrow, Note), multi-user cursor display, export to PNG/SVG.",
    technical_requirements: "HTML5 Canvas / SVG rendering, WebSocket delta synchronization, spatial indexing for fast object selection.",
    expected_deliverables: "Full-stack application repo, demo video showing simultaneous multi-user collaboration.",
    resources: JSON.stringify([{ name: "Canvas 2D Context Optimization", url: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas" }]),
    min_duration: 6,
    tier: 2
  },
  {
    id: "proj-sec-50",
    project_id: "PRJ-SEC-225",
    title: "Automated Threat Intelligence Aggregator & IOC Feed Generator (MISP Model)",
    industry: "Threat Intelligence",
    difficulty: "Advanced",
    technologies: JSON.stringify(["Python", "FastAPI", "STIX 2.1", "TAXII", "PostgreSQL", "Docker"]),
    business_background: "Enterprise firewalls and EDRs require continuous ingestion of verified Indicators of Compromise (malicious IPs, domains, file hashes) from global threat feeds.",
    problem_statement: "Construct an automated threat intelligence platform collecting from 10+ public OSINT feeds, deduplicating IOCs, scoring confidence, and serving a TAXII 2.1 feed to corporate firewalls.",
    business_requirements: "Automated age-off of stale indicators, standardized STIX 2.1 JSON schema compliance.",
    functional_requirements: "Feed collector workers, confidence scoring algorithm, search dashboard, STIX/TAXII REST API endpoints.",
    technical_requirements: "PostgreSQL with GIN indexes on IP/hash columns, TAXII 2.1 protocol endpoints.",
    expected_deliverables: "Threat intel platform repository, TAXII client verification script, documentation.",
    resources: JSON.stringify([{ name: "OASIS STIX/TAXII Standards", url: "https://oasis-open.github.io/cti-documentation/" }]),
    min_duration: 6,
    tier: 2
  }
];

// Student Kit Items
const STUDENT_KIT_DATA = [
  {
    id: "kit-01",
    title: "Production Git & GitHub Professional Workflow Guide",
    category: "Developer Tooling",
    description: "Industry-standard Git branching strategies (GitFlow, Trunk-Based), commit message conventions (Conventional Commits), PR templates, and merge conflict resolution handbook.",
    download_url: "/uploads/student-kit/Skyrovix_Git_Professional_Workflow_Guide.pdf",
    file_type: "PDF",
    file_size: "2.4 MB",
    min_duration: 3,
  },
  {
    id: "kit-02",
    title: "Enterprise Full-Stack Project Architecture Blueprint & Checklist",
    category: "Architecture & Design",
    description: "Complete blueprint covering scalable REST & GraphQL API design, database normalization, caching patterns with Redis, authentication best practices, and Docker compose scaffolding.",
    download_url: "/uploads/student-kit/Skyrovix_FullStack_Architecture_Blueprint.pdf",
    file_type: "PDF",
    file_size: "4.1 MB",
    min_duration: 3,
  },
  {
    id: "kit-03",
    title: "Tech Resume, Portfolio & LinkedIn Optimization Blueprint",
    category: "Career & Placement",
    description: "ATS-optimized developer resume templates, portfolio structuring principles, project bullet points formatting with STAR methodology, and LinkedIn recruitment outreach strategies.",
    download_url: "/uploads/student-kit/Skyrovix_Tech_Resume_and_Career_Blueprint.pdf",
    file_type: "PDF",
    file_size: "3.2 MB",
    min_duration: 3,
  },
  {
    id: "kit-04",
    title: "Code Review & Clean Code Quality Checklist",
    category: "Standards & Quality",
    description: "Essential rules for clean code: SOLID principles, DRY, error handling, security defense against OWASP vulnerabilities, performance considerations, and testing requirements.",
    download_url: "/uploads/student-kit/Skyrovix_Clean_Code_Quality_Checklist.pdf",
    file_type: "PDF",
    file_size: "1.8 MB",
    min_duration: 3,
  },
  {
    id: "kit-05",
    title: "Virtual Internship Starter Pack & Capstone Delivery Manual",
    category: "Internship Guide",
    description: "Comprehensive guide to excelling in your Skyrovix virtual internship: task milestone schedules, mentor communication etiquette, submission guidelines, and presentation tips.",
    download_url: "/uploads/student-kit/Skyrovix_Virtual_Internship_Success_Manual.pdf",
    file_type: "PDF",
    file_size: "2.7 MB",
    min_duration: 3,
  },
  {
    id: "kit-06",
    title: "System Design & Scalability Primer (6-Month Premium Exclusive)",
    category: "Advanced Engineering",
    description: "Deep-dive system design guide covering load balancing, database sharding, microservices communication, CAP theorem, message queues, and rate-limiting architectures.",
    download_url: "/uploads/student-kit/Skyrovix_Advanced_System_Design_Primer.pdf",
    file_type: "PDF",
    file_size: "5.8 MB",
    min_duration: 6,
  }
];

// Student Guidance & Mentoring Schedules
const GUIDANCE_DATA = [
  {
    id: "guidance-01",
    title: "Weekly Technical Q&A & Code Architecture Office Hours",
    topic: "Architecture Review, Bug Resolution & Implementation Guidance",
    mentor_name: "Hariharan S. & Senior Engineering Mentors",
    schedule_time: "Every Saturday, 4:00 PM – 5:30 PM IST",
    support_channel: "Live Google Meet / Skyrovix Discord Stage",
    instructions: "Prepare your GitHub repository link and specific code queries prior to joining. Screen-sharing is enabled for live debugging with mentors.",
    meeting_link: "https://meet.google.com/sky-mentor-ses",
    is_active: 1
  },
  {
    id: "guidance-02",
    title: "Asynchronous Priority Code Review & Deliverable Feedback",
    topic: "Task & Project Review Turnaround (24–48 Hours)",
    mentor_name: "Skyrovix Verification & Mentorship Panel",
    schedule_time: "Continuous (Mon–Sat, 10:00 AM – 7:00 PM IST)",
    support_channel: "Student Portal Review Tab & Admin Notes",
    instructions: "Submit your task with detailed notes and live demo links. Mentors provide line-by-line feedback and actionable suggestions for approval.",
    meeting_link: null,
    is_active: 1
  },
  {
    id: "guidance-03",
    title: "Career & Placement Preparation Mentorship Session",
    topic: "Resume Reviews, Mock Technical Interviews & LinkedIn Strategies",
    mentor_name: "Industry Guest Mentors & Leadership Team",
    schedule_time: "Bi-Weekly Sundays, 6:00 PM – 7:30 PM IST",
    support_channel: "Live Webinar & Interactive Workshop",
    instructions: "Bring your updated ATS resume. Live reviews and mock interview rounds with real-world technical screening questions.",
    meeting_link: "https://meet.google.com/sky-career-prep",
    is_active: 1
  }
];

async function seed() {
  const c = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  });

  console.log(`Connected to MySQL at ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);

  // 1. Seed Projects into project_challenges
  console.log("Seeding 50 verified project learning resources...");
  for (const p of PROJECTS_DATA) {
    await c.query(`
      INSERT INTO project_challenges (
        id, project_id, title, industry, difficulty,
        technologies, business_background, problem_statement,
        business_requirements, functional_requirements, technical_requirements,
        expected_deliverables, resources, min_duration, tier,
        is_published, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, now(), now())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        industry = VALUES(industry),
        difficulty = VALUES(difficulty),
        technologies = VALUES(technologies),
        business_background = VALUES(business_background),
        problem_statement = VALUES(problem_statement),
        business_requirements = VALUES(business_requirements),
        functional_requirements = VALUES(functional_requirements),
        technical_requirements = VALUES(technical_requirements),
        expected_deliverables = VALUES(expected_deliverables),
        resources = VALUES(resources),
        min_duration = VALUES(min_duration),
        tier = VALUES(tier),
        is_published = 1,
        updated_at = now()
    `, [
      p.id, p.project_id, p.title, p.industry, p.difficulty,
      p.technologies, p.business_background, p.problem_statement,
      JSON.stringify(typeof p.business_requirements === "string" ? [p.business_requirements] : p.business_requirements),
      JSON.stringify(typeof p.functional_requirements === "string" ? [p.functional_requirements] : p.functional_requirements),
      JSON.stringify(typeof p.technical_requirements === "string" ? [p.technical_requirements] : p.technical_requirements),
      JSON.stringify(typeof p.expected_deliverables === "string" ? [p.expected_deliverables] : p.expected_deliverables),
      p.resources, p.min_duration, p.tier
    ]);
  }
  console.log(`+ Seeded ${PROJECTS_DATA.length} project challenges!`);

  // 2. Seed Student Kit items
  console.log("Seeding Student Kit items...");
  for (const item of STUDENT_KIT_DATA) {
    await c.query(`
      INSERT INTO student_kit_items (
        id, title, category, description, download_url,
        file_type, file_size, min_duration, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, now(), now())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        category = VALUES(category),
        description = VALUES(description),
        download_url = VALUES(download_url),
        file_type = VALUES(file_type),
        file_size = VALUES(file_size),
        min_duration = VALUES(min_duration),
        is_active = 1,
        updated_at = now()
    `, [
      item.id, item.title, item.category, item.description,
      item.download_url, item.file_type, item.file_size, item.min_duration
    ]);
  }
  console.log(`+ Seeded ${STUDENT_KIT_DATA.length} student kit items!`);

  // 3. Seed Guidance Schedules
  console.log("Seeding Guidance Schedules...");
  for (const g of GUIDANCE_DATA) {
    await c.query(`
      INSERT INTO guidance_schedules (
        id, title, topic, mentor_name, schedule_time,
        support_channel, instructions, meeting_link, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        topic = VALUES(topic),
        mentor_name = VALUES(mentor_name),
        schedule_time = VALUES(schedule_time),
        support_channel = VALUES(support_channel),
        instructions = VALUES(instructions),
        meeting_link = VALUES(meeting_link),
        is_active = VALUES(is_active),
        updated_at = now()
    `, [
      g.id, g.title, g.topic, g.mentor_name, g.schedule_time,
      g.support_channel, g.instructions, g.meeting_link, g.is_active
    ]);
  }
  console.log(`+ Seeded ${GUIDANCE_DATA.length} guidance schedules!`);

  console.log("🎉 All resources seeded successfully!");
  await c.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
