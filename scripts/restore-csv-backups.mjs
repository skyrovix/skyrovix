import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function loadEnv() {
  for (const f of [".env", ".env.production", ".env.local"]) {
    const p = path.resolve(process.cwd(), f);
    try {
      if (fsSync.existsSync(p)) {
        const content = fsSync.readFileSync(p, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eq = trimmed.indexOf("=");
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
            if (process.env[key] === undefined) {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {}
  }
}

// RFC-4180 compliant CSV parser
function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          currentVal += '"';
          i += 2;
          continue;
        } else {
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentVal += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = "";
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && text[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
        i++;
        continue;
      } else {
        currentVal += char;
        i++;
        continue;
      }
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().replace(/^"|"$/g, ""));
  const data = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && !row[0]) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] !== undefined ? row[c] : "";
    }
    data.push(obj);
  }

  return data;
}

function toMysqlDatetime(isoStr) {
  if (!isoStr || !isoStr.trim()) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function toBoolean(val) {
  if (val === "true" || val === "1" || val === 1 || val === true) return 1;
  return 0;
}

async function ensureColumn(conn, table, column, definition) {
  try {
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (cols.length === 0) {
      console.log(`   ➕ Adding column ${column} to table ${table}...`);
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  } catch (err) {
    console.warn(`   ⚠️ ensureColumn error on ${table}.${column}:`, err.message);
  }
}

async function modifyColumn(conn, table, column, definition) {
  try {
    await conn.query(`ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` ${definition}`);
  } catch {}
}

async function main() {
  loadEnv();
  const host = process.env.MYSQL_HOST || "127.0.0.1";
  const defaultPort = process.platform === "win32" ? 3307 : 3306;
  const port = Number(process.env.MYSQL_PORT || defaultPort);
  const user = process.env.MYSQL_USER || (process.platform === "win32" ? "root" : "skyrovix_main_user");
  const password = process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : (process.platform === "win32" ? "123Sk_hari@2006" : "SkyrovixMain@2026#SecureDb");
  const database = process.env.MYSQL_DATABASE || "skyrovix_main_db";

  if (database === "skyrovix") {
    throw new Error("CRITICAL SAFETY GUARD: Restoring into 'skyrovix' (internship DB) is strictly forbidden! Target must be 'skyrovix_main_db'.");
  }

  const csvDir = path.resolve(process.cwd(), "database", "csv");
  const backupDir = path.resolve(process.cwd(), "database", "skyrovix_all_csv_backup_2026-10-26");

  // Auto-sync if database/csv is not populated
  if (!fsSync.existsSync(path.join(csvDir, "students_master.csv")) && fsSync.existsSync(backupDir)) {
    console.log("⚙️ database/csv not found or incomplete. Synchronizing from skyrovix_all_csv_backup_2026-10-26...");
    const { execSync } = await import("child_process");
    execSync("node scripts/sync-csv-from-backup.mjs", { stdio: "inherit" });
  }

  console.log(`🚀 Starting Full CSV Database Restoration from: ${csvDir}`);

  const candidates = [
    { host, port, user, password, database },
    { host, port: 3306, user: "skyrovix_main_user", password: "SkyrovixMain@2026#SecureDb", database },
    { host, port: 3306, user: "root", password: "", database },
    { host, port: 3306, user: "root", password: "123Sk_hari@2006", database },
    { host, port: 3307, user: "root", password: "123Sk_hari@2006", database },
  ];

  let conn = null;
  for (const c of candidates) {
    try {
      conn = await mysql.createConnection({
        ...c,
        multipleStatements: true,
      });
      console.log(`🔌 Connected to MySQL as ${c.user}@${c.host}:${c.port}/${c.database}`);
      break;
    } catch {}
  }

  if (!conn) {
    throw new Error(`Failed to connect to MySQL database '${database}'. Please check your MySQL credentials in .env`);
  }

  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

    console.log("🛠️ Checking database schema tables and columns...");

    // Submissions
    await ensureColumn(conn, "submissions", "task_id", "varchar(64) NULL");
    await ensureColumn(conn, "submissions", "task_number", "int NULL");
    await ensureColumn(conn, "submissions", "task_title", "varchar(255) NULL");
    await ensureColumn(conn, "submissions", "github_url", "text NULL");
    await ensureColumn(conn, "submissions", "deployed_url", "text NULL");
    await ensureColumn(conn, "submissions", "pdf_url", "text NULL");
    await ensureColumn(conn, "submissions", "screenshot_url", "text NULL");
    await ensureColumn(conn, "submissions", "domain", "varchar(100) NULL");
    await ensureColumn(conn, "submissions", "intern_id", "varchar(100) NULL");
    await ensureColumn(conn, "submissions", "student_name", "varchar(255) NULL");
    await ensureColumn(conn, "submissions", "student_email", "varchar(255) NULL");
    await ensureColumn(conn, "submissions", "resubmission_count", "int DEFAULT 0");
    await ensureColumn(conn, "submissions", "created_at", "datetime NULL DEFAULT CURRENT_TIMESTAMP");
    await ensureColumn(conn, "submissions", "updated_at", "datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    await modifyColumn(conn, "submissions", "student_id", "varchar(64) NULL DEFAULT NULL");
    await modifyColumn(conn, "submissions", "project_id", "varchar(64) NULL DEFAULT ''");
    await modifyColumn(conn, "submissions", "project_title", "varchar(255) NULL DEFAULT ''");
    await modifyColumn(conn, "submissions", "github_repo_url", "text NULL");
    await modifyColumn(conn, "submissions", "live_deployment_url", "text NULL");
    await modifyColumn(conn, "submissions", "github_url", "text NULL");
    await modifyColumn(conn, "submissions", "deployed_url", "text NULL");

    // Submission history
    await ensureColumn(conn, "submission_history", "previous_status", "varchar(50) NULL");
    await ensureColumn(conn, "submission_history", "new_status", "varchar(50) NULL");
    await ensureColumn(conn, "submission_history", "changed_by", "varchar(64) NULL");
    await ensureColumn(conn, "submission_history", "reason", "text NULL");
    await modifyColumn(conn, "submission_history", "application_id", "varchar(36) NULL");
    await modifyColumn(conn, "submission_history", "task_id", "varchar(36) NULL");
    await modifyColumn(conn, "submission_history", "status", "varchar(50) NULL");

    // Payments
    await ensureColumn(conn, "payments", "screenshot_url", "text NULL");
    await ensureColumn(conn, "payments", "coupon_code", "varchar(100) NULL");
    await ensureColumn(conn, "payments", "discount_amount", "decimal(10,2) DEFAULT 0");
    await modifyColumn(conn, "payments", "registration_id", "varchar(64) NULL DEFAULT NULL");
    await modifyColumn(conn, "payments", "order_id", "varchar(100) NULL DEFAULT NULL");
    await modifyColumn(conn, "payments", "payment_session_id", "varchar(255) NULL DEFAULT NULL");
    try {
      await conn.query("ALTER TABLE payments DROP INDEX order_id;");
    } catch {}

    // Email logs
    await ensureColumn(conn, "email_logs", "user_id", "varchar(64) NULL");
    await ensureColumn(conn, "email_logs", "email_to", "varchar(255) NULL");
    await ensureColumn(conn, "email_logs", "student_name", "varchar(255) NULL");
    await ensureColumn(conn, "email_logs", "document_type", "varchar(50) NULL");
    await ensureColumn(conn, "email_logs", "sent_at", "datetime NULL");
    await modifyColumn(conn, "email_logs", "recipient_email", "varchar(255) NULL DEFAULT ''");
    await modifyColumn(conn, "email_logs", "recipient_name", "varchar(255) NULL DEFAULT ''");

    // Certificates
    await ensureColumn(conn, "certificates", "verification_hash", "varchar(255) NULL DEFAULT NULL");
    await ensureColumn(conn, "certificates", "intern_id", "varchar(100) NULL");
    await modifyColumn(conn, "certificates", "student_id", "varchar(64) NULL DEFAULT NULL");
    await modifyColumn(conn, "certificates", "student_name", "varchar(191) NULL DEFAULT ''");
    await modifyColumn(conn, "certificates", "issue_date", "varchar(100) NULL DEFAULT ''");

    // Additional dynamic tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS storage_files (
        id varchar(64) PRIMARY KEY,
        bucket_id varchar(100),
        file_path text,
        file_size_bytes bigint,
        mime_type varchar(100),
        direct_public_url text,
        created_at datetime
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fee_audit_logs (
        id varchar(36) PRIMARY KEY,
        admin_id varchar(36),
        action varchar(100),
        entity_type varchar(100),
        entity_id varchar(100),
        old_value json,
        new_value json,
        ip_address varchar(100),
        created_at datetime(3) DEFAULT CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await ensureColumn(conn, "fee_audit_logs", "ip_address", "varchar(100) NULL");

    // Lookup caches
    const userByEmail = new Map();
    const userById = new Map();
    const userByAppId = new Map();

    // 1. RESTORE STUDENTS_MASTER
    console.log("📥 Restoring students_master.csv...");
    const studentsMasterFile = path.join(csvDir, "students_master.csv");
    const studentsMasterCsv = await fs.readFile(studentsMasterFile, "utf-8");
    const studentsData = parseCsv(studentsMasterCsv);
    console.log(`   Found ${studentsData.length} records in students_master.csv`);

    const adminBcryptHash = "$2b$10$bxTZ5YsCda5mi6eTctu05.sKz.OE3r1iZv4fNuNzR.O07onX/pQyu"; // Admin@123
    let usersCount = 0;

    for (const s of studentsData) {
      const id = s.student_id;
      const email = (s.email || "").trim().toLowerCase();
      if (!id || !email) continue;

      const fullName = (s.full_name || email.split("@")[0]).trim();
      const isAdminUser = email === "hariharan@skyrovix.com";

      let passwordHash = isAdminUser ? adminBcryptHash : (s.encrypted_password_hash || "");
      const createdAt = toMysqlDatetime(s.account_created_at) || toMysqlDatetime(s.email_confirmed_at) || "2026-01-01 00:00:00";
      const role = isAdminUser ? "admin" : (s.role || "student");
      const phone = (s.phone || "").trim();
      const college = (s.college || "").trim();
      const course = (s.course || "").trim();
      const year = (s.year || "").trim();
      const internIds = (s.intern_ids || "").trim();
      const isVerified = s.email_confirmed_at ? 1 : 0;

      const meta = JSON.stringify({
        full_name: fullName,
        phone,
        college,
        course,
        year,
        intern_ids: internIds,
      });

      userByEmail.set(email, id);
      userById.set(id, id);

      await conn.query(
        `REPLACE INTO users (id, email, password_hash, full_name, raw_user_meta_data, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, email, passwordHash, fullName, meta, isVerified, createdAt, createdAt]
      );

      await conn.query(
        `REPLACE INTO profiles (id, full_name, email, phone, college, course, year, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, fullName, email, phone, college, course, year, createdAt, createdAt]
      );

      await conn.query(
        `INSERT INTO user_roles (id, user_id, role, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [crypto.randomUUID(), id, role, createdAt]
      );

      await conn.query(
        `REPLACE INTO students (id, full_name, email, mobile, college, degree, department, year_of_study, city, skill_level, password_hash, student_id_formatted, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, fullName, email, phone, college, course, course, year,
          "", "Beginner", passwordHash,
          internIds ? internIds.split(";")[0].trim() : null,
          createdAt, createdAt,
        ]
      );

      usersCount++;
    }
    console.log(`   ✅ Restored ${usersCount} users, profiles, and student records.`);

    // 2. RESTORE APPLICATIONS
    console.log("📥 Restoring applications.csv...");
    const appsFile = path.join(csvDir, "applications.csv");
    const appsCsv = await fs.readFile(appsFile, "utf-8");
    const appsData = parseCsv(appsCsv);
    console.log(`   Found ${appsData.length} records in applications.csv`);

    let appsCount = 0;
    for (const a of appsData) {
      if (!a.id) continue;
      const createdAt = toMysqlDatetime(a.created_at) || "2026-01-01 00:00:00";
      const offerIssuedAt = toMysqlDatetime(a.offer_issued_at);
      const completedAt = toMysqlDatetime(a.completed_at);
      const submittedAt = toMysqlDatetime(a.submitted_at);
      const verifiedAt = toMysqlDatetime(a.verified_at);
      const certGenAt = toMysqlDatetime(a.certificate_generated_at);
      const userId = a.user_id || userByEmail.get((a.email || "").trim().toLowerCase()) || a.id;

      userByAppId.set(a.id, userId);

      await conn.query(
        `REPLACE INTO applications (
          id, user_id, intern_id, full_name, email, phone, domain, status,
          college, course, year, duration, country, state, city,
          referral_name, hear_about, coupon_code, offer_issued_at, created_at,
          completed_at, submission_status, submitted_at, verified, verified_at,
          certificate_generated, certificate_generated_at, certificate_payment_status,
          updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?
        )`,
        [
          a.id, userId, a.intern_id || null, (a.full_name || "").trim(), (a.email || "").trim(), (a.phone || "").trim(), (a.domain || "").trim(), a.status || "approved",
          (a.college || "").trim(), (a.course || "").trim(), (a.year || "").trim(), a.duration ? Number(a.duration) : 1, a.country || "India", (a.state || "").trim(), (a.city || "").trim(),
          a.referral_name || null, a.hear_about || null, a.coupon_code || null, offerIssuedAt, createdAt,
          completedAt, a.submission_status || "in_progress", submittedAt, toBoolean(a.verified), verifiedAt,
          toBoolean(a.certificate_generated), certGenAt, a.certificate_payment_status || "locked",
          createdAt,
        ]
      );

      await conn.query(
        `REPLACE INTO registrations (id, student_id, domain, registration_status, internship_status, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, userId, a.domain || "", "APPROVED", a.status || "ACTIVE", a.status || "APPROVED", createdAt, createdAt]
      );

      appsCount++;
    }
    console.log(`   ✅ Restored ${appsCount} application and registration records.`);

    // 3. RESTORE LOGIN SESSIONS
    console.log("📥 Restoring login_sessions.csv...");
    const loginsFile = path.join(csvDir, "login_sessions.csv");
    const loginsCsv = await fs.readFile(loginsFile, "utf-8");
    const loginsData = parseCsv(loginsCsv);
    console.log(`   Found ${loginsData.length} records in login_sessions.csv`);

    let loginsCount = 0;
    for (const l of loginsData) {
      if (!l.id) continue;
      const loginTime = toMysqlDatetime(l.login_time) || "2026-01-01 00:00:00";
      const logoutTime = toMysqlDatetime(l.logout_time);
      const lastActive = toMysqlDatetime(l.last_active) || loginTime;
      const createdAt = toMysqlDatetime(l.created_at) || loginTime;
      const studentId = l.student_id || userByEmail.get((l.email || "").trim().toLowerCase()) || l.id;

      await conn.query(
        `REPLACE INTO login_sessions (
          id, student_id, intern_id, student_name, email, domain, college,
          login_time, logout_time, last_active, status, ip_address, device, browser, os,
          country, state, city, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )`,
        [
          l.id, studentId, l.intern_id || null, (l.student_name || "").trim() || null, (l.email || "").trim() || null, (l.domain || "").trim() || null, (l.college || "").trim() || null,
          loginTime, logoutTime, lastActive, l.status || "offline", l.ip_address || null, l.device || null, l.browser || null, l.os || null,
          l.country || null, l.state || null, l.city || null, createdAt, createdAt,
        ]
      );
      loginsCount++;
    }
    console.log(`   ✅ Restored ${loginsCount} login session records.`);

    // 3B. RESTORE DOMAIN TASKS
    if (fsSync.existsSync(path.join(csvDir, "tasks.csv"))) {
      console.log("📥 Restoring tasks.csv...");
      const tasksCsv = await fs.readFile(path.join(csvDir, "tasks.csv"), "utf-8");
      const tasksData = parseCsv(tasksCsv);
      let tCount = 0;
      for (const t of tasksData) {
        if (!t.id) continue;
        await conn.query(
          `REPLACE INTO tasks (id, domain, task_number, title, description, resources)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [t.id, t.domain || "", Number(t.task_number) || 1, t.title || "Task", t.description || "", t.resources || null]
        );
        tCount++;
      }
      console.log(`   ✅ Restored ${tCount} domain curriculum tasks.`);
    }

    // 4. RESTORE TASK SUBMISSIONS
    console.log("📥 Restoring task_submissions.csv...");
    const subFile = path.join(csvDir, "task_submissions.csv");
    const subCsv = await fs.readFile(subFile, "utf-8");
    const subData = parseCsv(subCsv);
    console.log(`   Found ${subData.length} records in task_submissions.csv`);

    let subCount = 0;
    for (const s of subData) {
      const id = s.submission_id || s.id;
      if (!id) continue;
      const submittedAt = toMysqlDatetime(s.submitted_at) || "2026-01-01 00:00:00";
      const reviewedAt = toMysqlDatetime(s.reviewed_at);
      const studentEmail = (s.student_email || "").trim().toLowerCase();
      const studentId = userByAppId.get(s.application_id) || userByEmail.get(studentEmail) || null;

      await conn.query(
        `REPLACE INTO submissions (
          id, application_id, student_id, intern_id, domain, task_id, task_number, task_title,
          github_url, deployed_url, pdf_url, screenshot_url, status, feedback, notes,
          student_name, student_email,
          submitted_at, reviewed_at, resubmission_count, project_id, project_title,
          github_repo_url, live_deployment_url, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        )`,
        [
          id, s.application_id || null, studentId, s.intern_id || null, s.domain || null,
          s.task_id || null, s.task_number ? Number(s.task_number) : null, (s.task_title || "").trim(),
          s.github_url || null, s.deployed_url || null, s.pdf_url || null, s.screenshot_url || null,
          s.status || "SUBMITTED", s.feedback || null, s.notes || null,
          (s.student_name || "").trim() || null, studentEmail || null,
          submittedAt, reviewedAt, s.resubmission_count ? Number(s.resubmission_count) : 0,
          s.task_id || id, (s.task_title || "Task").trim(),
          s.github_url || "", s.deployed_url || "",
          submittedAt, reviewedAt || submittedAt,
        ]
      );
      subCount++;
    }
    console.log(`   ✅ Restored ${subCount} task submission records.`);

    // 5. RESTORE SUBMISSION HISTORY
    console.log("📥 Restoring submission_history.csv...");
    const historyFile = path.join(csvDir, "submission_history.csv");
    const historyCsv = await fs.readFile(historyFile, "utf-8");
    const historyData = parseCsv(historyCsv);
    console.log(`   Found ${historyData.length} records in submission_history.csv`);

    let histCount = 0;
    for (const h of historyData) {
      if (!h.id) continue;
      const createdAt = toMysqlDatetime(h.created_at) || "2026-01-01 00:00:00";
      await conn.query(
        `REPLACE INTO submission_history (
          id, submission_id, application_id, task_id, status, notes,
          github_url, deployed_url, pdf_url, screenshot_url, feedback,
          previous_status, new_status, changed_by, reason, table_name, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          h.id, h.submission_id || null, h.application_id || null, h.task_id || null,
          h.status || null, h.notes || null, h.github_url || null, h.deployed_url || null,
          h.pdf_url || null, h.screenshot_url || null, h.feedback || null,
          h.previous_status || null, h.new_status || null, h.changed_by || null,
          h.reason || null, h.table_name || "submissions", createdAt,
        ]
      );
      histCount++;
    }
    console.log(`   ✅ Restored ${histCount} submission history records.`);

    // 6. RESTORE CERTIFICATES ISSUED
    console.log("📥 Restoring certificates_issued.csv...");
    const certFile = path.join(csvDir, "certificates_issued.csv");
    const certCsv = await fs.readFile(certFile, "utf-8");
    const certData = parseCsv(certCsv);
    console.log(`   Found ${certData.length} records in certificates_issued.csv`);

    let certCount = 0;
    for (const c of certData) {
      const id = c.id || c.certificate_id;
      if (!id) continue;
      const issuedAt = toMysqlDatetime(c.issued_at) || "2026-01-01 00:00:00";
      const certId = c.certificate_id || id;
      const studentEmail = (c.student_email || "").trim().toLowerCase();
      const studentId = userByAppId.get(c.application_id) || userByEmail.get(studentEmail) || null;

      await conn.query(
        `REPLACE INTO certificates (
          id, certificate_id, student_id, application_id, intern_id, internship_id,
          student_name, domain, verification_hash, issued_at, issue_date, status,
          certificate_status, verification_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, certId, studentId, c.application_id || null, c.intern_id || null, c.intern_id || null,
          (c.student_name || "").trim(), (c.domain || "").trim(),
          c.verification_hash || null, issuedAt, issuedAt, "ISSUED", "VALID",
          `https://skyrovix.online/verify/${certId}`, issuedAt, issuedAt,
        ]
      );
      certCount++;
    }
    console.log(`   ✅ Restored ${certCount} certificate records.`);

    // 7. RESTORE COURSE CERTIFICATES
    console.log("📥 Restoring course_certificates.csv...");
    const ccFile = path.join(csvDir, "course_certificates.csv");
    const ccCsv = await fs.readFile(ccFile, "utf-8");
    const ccData = parseCsv(ccCsv);
    console.log(`   Found ${ccData.length} records in course_certificates.csv`);

    let ccCount = 0;
    for (const cc of ccData) {
      if (!cc.id) continue;
      const issuedAt = toMysqlDatetime(cc.issued_at) || "2026-01-01 00:00:00";
      await conn.query(
        `REPLACE INTO course_certificates (
          id, certificate_id, enrollment_id, user_id, course_id, student_name, course_title,
          verification_hash, score, issued_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cc.id, cc.certificate_id || "", cc.enrollment_id || cc.id, cc.user_id || null, cc.course_id || null,
          cc.student_name || null, cc.course_title || null, cc.verification_hash || null, 100, issuedAt,
        ]
      );
      ccCount++;
    }
    console.log(`   ✅ Restored ${ccCount} course certificate records.`);

    // 8. RESTORE PROJECT CERTIFICATES
    console.log("📥 Restoring project_certificates.csv...");
    const pcFile = path.join(csvDir, "project_certificates.csv");
    const pcCsv = await fs.readFile(pcFile, "utf-8");
    const pcData = parseCsv(pcCsv);
    console.log(`   Found ${pcData.length} records in project_certificates.csv`);

    let pcCount = 0;
    for (const pc of pcData) {
      if (!pc.id) continue;
      const issuedAt = toMysqlDatetime(pc.issued_at) || "2026-01-01 00:00:00";
      const compDate = toMysqlDatetime(pc.completion_date) || issuedAt;

      await conn.query(
        `REPLACE INTO project_certificates (
          id, cert_id, submission_id, user_id, project_id, participant_name,
          project_title, industry, final_score, completion_date, issued_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pc.id, pc.cert_id || "", pc.submission_id || null, pc.user_id || null, pc.project_id || null,
          (pc.participant_name || "").trim(), (pc.project_title || "").trim(), (pc.industry || "").trim(),
          pc.final_score ? Number(pc.final_score) : 80.0, compDate, issuedAt,
        ]
      );
      pcCount++;
    }
    console.log(`   ✅ Restored ${pcCount} project certificate records.`);

    // 9. RESTORE PAYMENTS
    console.log("📥 Restoring payments.csv...");
    const payFile = path.join(csvDir, "payments.csv");
    const payCsv = await fs.readFile(payFile, "utf-8");
    const payData = parseCsv(payCsv);
    console.log(`   Found ${payData.length} records in payments.csv`);

    let payCount = 0;
    for (const p of payData) {
      const id = p.id || p.payment_id;
      if (!id) continue;
      const submittedAt = toMysqlDatetime(p.submitted_at) || "2026-01-01 00:00:00";
      const verifiedAt = toMysqlDatetime(p.verified_at);

      await conn.query(
        `REPLACE INTO payments (
          id, application_id, registration_id, utr_number, screenshot_url, amount, status,
          submitted_at, verified_at, coupon_code, discount_amount, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, p.application_id || null, p.application_id || null, p.utr_number || null, p.screenshot_url || null,
          p.amount ? Number(p.amount) : 100, p.status || "verified",
          submittedAt, verifiedAt, p.coupon_code || null,
          p.discount_amount ? Number(p.discount_amount) : 0,
          submittedAt, verifiedAt || submittedAt,
        ]
      );
      payCount++;
    }
    console.log(`   ✅ Restored ${payCount} payment records.`);

    // 10. RESTORE CASHFREE ORDERS
    if (fsSync.existsSync(path.join(csvDir, "cashfree_orders.csv"))) {
      console.log("📥 Restoring cashfree_orders.csv...");
      const cfCsv = await fs.readFile(path.join(csvDir, "cashfree_orders.csv"), "utf-8");
      const cfData = parseCsv(cfCsv);
      for (const c of cfData) {
        if (!c.id) continue;
        const createdAt = toMysqlDatetime(c.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(c.updated_at) || createdAt;
        const payTime = toMysqlDatetime(c.payment_time);
        await conn.query(
          `REPLACE INTO cashfree_orders (
            id, order_id, user_id, customer_name, customer_email, customer_phone, product_service, product_type,
            entity_id, amount, currency, payment_status, cashfree_payment_id, cf_order_id, payment_session_id, payment_method,
            payment_time, error_message, coupon_code, discount_amount, raw_response, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id, c.order_id, c.user_id || null, (c.customer_name || "").trim(), (c.customer_email || "").trim(),
            (c.customer_phone || "").trim(), c.product_service || "Certificate", c.product_type || "certificate",
            c.entity_id || null, c.amount ? Number(c.amount) : 100.0, c.currency || "INR", c.payment_status || "PENDING",
            c.cashfree_payment_id || null, c.cf_order_id || null, c.payment_session_id || null, c.payment_method || null,
            payTime, c.error_message || null, c.coupon_code || null, c.discount_amount ? Number(c.discount_amount) : 0.0,
            c.raw_response || null, createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${cfData.length} Cashfree orders.`);
    }

    // 11. RESTORE PAYMENT RECORDS
    if (fsSync.existsSync(path.join(csvDir, "payment_records.csv"))) {
      console.log("📥 Restoring payment_records.csv...");
      const prCsv = await fs.readFile(path.join(csvDir, "payment_records.csv"), "utf-8");
      const prData = parseCsv(prCsv);
      for (const pr of prData) {
        if (!pr.id) continue;
        const createdAt = toMysqlDatetime(pr.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(pr.updated_at) || createdAt;
        const reviewedAt = toMysqlDatetime(pr.reviewed_at);
        await conn.query(
          `REPLACE INTO payment_records (
            id, user_id, application_id, certificate_id, payment_type, amount,
            utr_number, screenshot_url, status, admin_note, reviewed_by, reviewed_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pr.id, pr.user_id, pr.application_id || null, pr.certificate_id || null,
            pr.payment_type || "certificate", pr.amount ? Number(pr.amount) : 100.0,
            pr.utr_number || "", pr.screenshot_url || null, pr.status || "approved",
            pr.admin_note || null, pr.reviewed_by || null, reviewedAt, createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${prData.length} payment audit records.`);
    }

    // 12. RESTORE FEE SETTINGS & AUDIT LOGS
    if (fsSync.existsSync(path.join(csvDir, "fee_settings.csv"))) {
      console.log("📥 Restoring fee_settings.csv...");
      const fsCsv = await fs.readFile(path.join(csvDir, "fee_settings.csv"), "utf-8");
      const fsData = parseCsv(fsCsv);
      for (const f of fsData) {
        if (!f.id) continue;
        const updatedAt = toMysqlDatetime(f.updated_at) || "2026-01-01 00:00:00";
        await conn.query(
          `REPLACE INTO fee_settings (
            id, fee_type, amount, is_enabled, upi_id, payee_name, qr_code_url,
            offer_enabled, offer_amount, offer_name, offer_start_at, offer_end_at, updated_by, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            f.id, f.fee_type, f.amount ? Number(f.amount) : 100.0, toBoolean(f.is_enabled),
            f.upi_id || "hariharanmahesh34@oksbi", f.payee_name || "Skyrovix", f.qr_code_url || null,
            toBoolean(f.offer_enabled), f.offer_amount ? Number(f.offer_amount) : 0, f.offer_name || null,
            toMysqlDatetime(f.offer_start_at), toMysqlDatetime(f.offer_end_at), f.updated_by || null, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${fsData.length} fee setting records.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "fee_audit_logs.csv"))) {
      console.log("📥 Restoring fee_audit_logs.csv...");
      const falCsv = await fs.readFile(path.join(csvDir, "fee_audit_logs.csv"), "utf-8");
      const falData = parseCsv(falCsv);
      for (const fa of falData) {
        if (!fa.id) continue;
        await conn.query(
          `REPLACE INTO fee_audit_logs (
            id, admin_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fa.id, fa.admin_id || null, fa.action || "", fa.entity_type || "", fa.entity_id || "",
            fa.old_value || null, fa.new_value || null, fa.ip_address || null,
            toMysqlDatetime(fa.created_at) || "2026-01-01 00:00:00"
          ]
        );
      }
      console.log(`   ✅ Restored ${falData.length} fee audit log records.`);
    }

    // 13. RESTORE COUPONS
    if (fsSync.existsSync(path.join(csvDir, "coupons.csv"))) {
      console.log("📥 Restoring coupons.csv...");
      const cpCsv = await fs.readFile(path.join(csvDir, "coupons.csv"), "utf-8");
      const cpData = parseCsv(cpCsv);
      for (const cp of cpData) {
        if (!cp.id) continue;
        const createdAt = toMysqlDatetime(cp.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(cp.updated_at) || createdAt;
        await conn.query(
          `REPLACE INTO coupons (
            id, code, description, discount_type, discount_value, max_uses, current_uses,
            min_amount, max_discount_amount, expires_at, is_active, applicable_domains, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cp.id, cp.code, cp.description || "Promo Code", cp.discount_type || "percentage",
            cp.discount_value ? Number(cp.discount_value) : 100, cp.max_uses ? Number(cp.max_uses) : 1000,
            cp.current_uses ? Number(cp.current_uses) : 0, cp.min_amount ? Number(cp.min_amount) : 0,
            cp.max_discount_amount ? Number(cp.max_discount_amount) : 100, toMysqlDatetime(cp.expires_at),
            toBoolean(cp.is_active), cp.applicable_domains || null, createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${cpData.length} coupon records.`);
    }

    // 14. RESTORE REVIEWS & PROMOTIONS
    if (fsSync.existsSync(path.join(csvDir, "reviews.csv"))) {
      console.log("📥 Restoring reviews.csv...");
      const rvCsv = await fs.readFile(path.join(csvDir, "reviews.csv"), "utf-8");
      const rvData = parseCsv(rvCsv);
      for (const rv of rvData) {
        if (!rv.id) continue;
        const createdAt = toMysqlDatetime(rv.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(rv.updated_at) || createdAt;
        await conn.query(
          `REPLACE INTO reviews (
            id, user_id, target_type, target_id, rating, title, content, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rv.id, rv.user_id, rv.target_type || "platform", rv.target_id || "skyrovix",
            rv.rating ? Number(rv.rating) : 5, rv.title || "", rv.content || "",
            rv.status || "approved", createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${rvData.length} reviews.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "promotional_popups.csv"))) {
      console.log("📥 Restoring promotional_popups.csv...");
      const ppCsv = await fs.readFile(path.join(csvDir, "promotional_popups.csv"), "utf-8");
      const ppData = parseCsv(ppCsv);
      for (const pp of ppData) {
        if (!pp.id) continue;
        const createdAt = toMysqlDatetime(pp.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(pp.updated_at) || createdAt;
        await conn.query(
          `REPLACE INTO promotional_popups (
            id, title, description, image_url, link_url, link_label, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pp.id, pp.title || "", pp.description || null, pp.image_url || "",
            pp.link_url || null, pp.link_label || "Learn More", toBoolean(pp.is_active),
            createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${ppData.length} promotional popups.`);
    }

    // 15. RESTORE ENROLLMENTS, LESSON PROGRESS & QUIZZES
    if (fsSync.existsSync(path.join(csvDir, "enrollments.csv"))) {
      console.log("📥 Restoring enrollments.csv...");
      const enCsv = await fs.readFile(path.join(csvDir, "enrollments.csv"), "utf-8");
      const enData = parseCsv(enCsv);
      for (const en of enData) {
        if (!en.id) continue;
        const createdAt = toMysqlDatetime(en.created_at) || "2026-01-01 00:00:00";
        const updatedAt = toMysqlDatetime(en.updated_at) || createdAt;
        await conn.query(
          `REPLACE INTO enrollments (
            id, user_id, course_id, status, progress_percent, current_topic_id, started_at, completed_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            en.id, en.user_id, en.course_id, en.status || "completed",
            en.progress_percent ? Number(en.progress_percent) : 100, en.current_topic_id || null,
            toMysqlDatetime(en.started_at) || createdAt, toMysqlDatetime(en.completed_at),
            createdAt, updatedAt
          ]
        );
      }
      console.log(`   ✅ Restored ${enData.length} course enrollments.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "lesson_progress.csv"))) {
      console.log("📥 Restoring lesson_progress.csv...");
      const lpCsv = await fs.readFile(path.join(csvDir, "lesson_progress.csv"), "utf-8");
      const lpData = parseCsv(lpCsv);
      let lpCount = 0;
      for (const lp of lpData) {
        if (!lp.id || !lp.enrollment_id || !lp.topic_id) continue;
        await conn.query(
          `REPLACE INTO lesson_progress (id, enrollment_id, topic_id, completed_at) VALUES (?, ?, ?, ?)`,
          [lp.id, lp.enrollment_id, lp.topic_id, toMysqlDatetime(lp.completed_at) || "2026-01-01 00:00:00"]
        );
        lpCount++;
      }
      console.log(`   ✅ Restored ${lpCount} lesson progress records.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "quiz_attempts.csv"))) {
      console.log("📥 Restoring quiz_attempts.csv...");
      const qaCsv = await fs.readFile(path.join(csvDir, "quiz_attempts.csv"), "utf-8");
      const qaData = parseCsv(qaCsv);
      let qaCount = 0;
      for (const qa of qaData) {
        if (!qa.id || !qa.enrollment_id) continue;
        const startedAt = toMysqlDatetime(qa.started_at) || "2026-01-01 00:00:00";
        const submittedAt = toMysqlDatetime(qa.submitted_at) || startedAt;
        await conn.query(
          `REPLACE INTO quiz_attempts (
            id, enrollment_id, score, total, passed, answers, started_at, submitted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            qa.id, qa.enrollment_id, qa.score ? Number(qa.score) : 100, qa.total ? Number(qa.total) : 100,
            toBoolean(qa.passed), qa.answers || null, startedAt, submittedAt
          ]
        );
        qaCount++;
      }
      console.log(`   ✅ Restored ${qaCount} quiz attempts.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "leaderboard.csv"))) {
      console.log("📥 Restoring leaderboard.csv...");
      const lbCsv = await fs.readFile(path.join(csvDir, "leaderboard.csv"), "utf-8");
      const lbData = parseCsv(lbCsv);
      for (const lb of lbData) {
        if (!lb.id) continue;
        await conn.query(
          `REPLACE INTO leaderboard (id, user_id, course_id, score, total, quiz_attempt_id, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            lb.id, lb.user_id, lb.course_id, lb.score ? Number(lb.score) : 100, lb.total ? Number(lb.total) : 100,
            lb.quiz_attempt_id || null, toMysqlDatetime(lb.updated_at) || "2026-01-01 00:00:00"
          ]
        );
      }
      console.log(`   ✅ Restored ${lbData.length} leaderboard records.`);
    }

    // 16. RESTORE PROJECT CHALLENGES & SUBMISSIONS
    if (fsSync.existsSync(path.join(csvDir, "project_challenges.csv"))) {
      console.log("📥 Restoring project_challenges.csv...");
      const pcCsv = await fs.readFile(path.join(csvDir, "project_challenges.csv"), "utf-8");
      const pcData = parseCsv(pcCsv);
      for (const pc of pcData) {
        if (!pc.id) continue;
        await conn.query(
          `REPLACE INTO project_challenges (
            id, project_id, title, industry, difficulty, business_background,
            problem_statement, business_requirements, functional_requirements, technical_requirements,
            expected_deliverables, evaluation_criteria, technologies, resources,
            submission_deadline, is_published, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pc.id, pc.project_id || pc.id, pc.title || "Project Challenge", pc.industry || "Technology",
            pc.difficulty || "Intermediate", pc.business_background || "", pc.problem_statement || "",
            pc.business_requirements || null, pc.functional_requirements || null, pc.technical_requirements || null,
            pc.expected_deliverables || null, pc.evaluation_criteria || null, pc.technologies || null,
            pc.resources || null, toMysqlDatetime(pc.submission_deadline), toBoolean(pc.is_published),
            toMysqlDatetime(pc.created_at) || "2026-01-01 00:00:00",
            toMysqlDatetime(pc.updated_at) || "2026-01-01 00:00:00"
          ]
        );
      }
      console.log(`   ✅ Restored ${pcData.length} project challenges.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "project_submissions.csv"))) {
      console.log("📥 Restoring project_submissions.csv...");
      const psCsv = await fs.readFile(path.join(csvDir, "project_submissions.csv"), "utf-8");
      const psData = parseCsv(psCsv);
      for (const ps of psData) {
        if (!ps.id) continue;
        await conn.query(
          `REPLACE INTO project_submissions (
            id, project_id, user_id, github_url, demo_url, doc_url, video_url, notes,
            status, final_score, evaluated_at, evaluator_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ps.id, ps.project_id, ps.user_id, ps.github_url || "", ps.demo_url || null,
            ps.doc_url || null, ps.video_url || null, ps.notes || null, ps.status || "submitted",
            ps.final_score ? Number(ps.final_score) : null, toMysqlDatetime(ps.evaluated_at),
            ps.evaluator_id || null, toMysqlDatetime(ps.created_at) || "2026-01-01 00:00:00",
            toMysqlDatetime(ps.updated_at) || "2026-01-01 00:00:00"
          ]
        );
      }
      console.log(`   ✅ Restored ${psData.length} project submissions.`);
    }

    if (fsSync.existsSync(path.join(csvDir, "project_evaluations.csv"))) {
      console.log("📥 Restoring project_evaluations.csv...");
      const peCsv = await fs.readFile(path.join(csvDir, "project_evaluations.csv"), "utf-8");
      const peData = parseCsv(peCsv);
      for (const pe of peData) {
        if (!pe.id) continue;
        await conn.query(
          `REPLACE INTO project_evaluations (
            id, submission_id, problem_solving, ui_ux_design, functionality, code_quality,
            architecture, database_design, performance, security, scalability, documentation,
            total_score, feedback, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pe.id, pe.submission_id, Number(pe.problem_solving) || 0, Number(pe.ui_ux_design) || 0,
            Number(pe.functionality) || 0, Number(pe.code_quality) || 0, Number(pe.architecture) || 0,
            Number(pe.database_design) || 0, Number(pe.performance) || 0, Number(pe.security) || 0,
            Number(pe.scalability) || 0, Number(pe.documentation) || 0,
            Number(pe.total_score) || 0, pe.feedback || null,
            toMysqlDatetime(pe.created_at) || "2026-01-01 00:00:00"
          ]
        );
      }
      console.log(`   ✅ Restored ${peData.length} project evaluations.`);
    }

    // 17. RESTORE EMAIL LOGS
    console.log("📥 Restoring email_logs.csv...");
    const emailFile = path.join(csvDir, "email_logs.csv");
    const emailCsv = await fs.readFile(emailFile, "utf-8");
    const emailData = parseCsv(emailCsv);

    let emailCount = 0;
    for (const e of emailData) {
      if (!e.id) continue;
      const createdAt = toMysqlDatetime(e.created_at) || "2026-01-01 00:00:00";
      const sentAt = toMysqlDatetime(e.sent_at);

      await conn.query(
        `REPLACE INTO email_logs (
          id, user_id, email_to, student_name, document_type, email_type, status, subject,
          reference_id, error_message, sent_at, created_at, recipient_email, recipient_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id, e.user_id || null, e.email_to || null, (e.student_name || "").trim() || null,
          e.document_type || "offer_letter", e.document_type || "offer_letter", e.status || "sent", e.subject || "Skyrovix Notification",
          e.reference_id || null, e.error_message || null, sentAt, createdAt,
          e.email_to || "", (e.student_name || "").trim() || "",
        ]
      );
      emailCount++;
    }
    console.log(`   ✅ Restored ${emailCount} email log records.`);

    // 18. RESTORE STORAGE FILES INDEX
    console.log("📥 Restoring storage_files_index.csv...");
    const storageFile = path.join(csvDir, "storage_files_index.csv");
    try {
      const storageCsv = await fs.readFile(storageFile, "utf-8");
      const storageData = parseCsv(storageCsv);
      let storageCount = 0;
      for (const st of storageData) {
        if (!st.id) continue;
        const createdAt = toMysqlDatetime(st.created_at) || "2026-01-01 00:00:00";
        await conn.query(
          `REPLACE INTO storage_files (
            id, bucket_id, file_path, file_size_bytes, mime_type, direct_public_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            st.id, st.bucket_id || null, st.file_path || null,
            st.file_size_bytes ? Number(st.file_size_bytes) : null,
            st.mime_type || null, st.direct_public_url || null,
            createdAt,
          ]
        );

        if (st.bucket_id === "profile-photos" && st.file_path && st.direct_public_url) {
          const userIdFromPath = st.file_path.split("/")[0];
          if (userIdFromPath && userIdFromPath.length > 20) {
            await conn.query(
              `UPDATE profiles SET photo_url = ? WHERE id = ? AND (photo_url IS NULL OR photo_url = '')`,
              [st.direct_public_url, userIdFromPath]
            );
            await conn.query(
              `UPDATE applications SET photo_url = ? WHERE user_id = ? AND (photo_url IS NULL OR photo_url = '')`,
              [st.direct_public_url, userIdFromPath]
            );
          }
        }
        storageCount++;
      }
      console.log(`   ✅ Restored ${storageCount} storage file records & photos.`);
    } catch (err) {
      console.warn("   ⚠️ storage_files_index note:", err.message);
    }

    // 19. ENFORCE SOLE ADMIN
    console.log("👑 Enforcing sole admin account (hariharan@skyrovix.com)...");
    const adminId = "15430c49-f28f-459e-ba3f-411b18519445";
    await conn.query(
      `INSERT INTO user_roles (id, user_id, role, created_at)
       VALUES (UUID(), ?, 'admin', NOW())
       ON DUPLICATE KEY UPDATE role = 'admin'`,
      [adminId]
    );
    await conn.query(`DELETE FROM user_roles WHERE user_id != ? AND role = 'admin'`, [adminId]);

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("\n=======================================================");
    console.log("🎉 ALL NEW DATABASE BACKUP DETAILS RESTORED SUCCESSFULLY!");
    console.log("=======================================================");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Fatal restoration error:", err);
  process.exit(1);
});
