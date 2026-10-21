import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2/promise";

function loadEnv() {
  for (const f of [".env", ".env.local"]) {
    const p = path.resolve(process.cwd(), f);
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(p);
      }
    } catch {}
  }
}

// RFC-4180 compliant CSV parser that handles multi-line strings, embedded commas, and quotes
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
    if (row.length === 1 && !row[0]) continue; // blank line
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const val = row[c] !== undefined ? row[c] : "";
      obj[headers[c]] = val;
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
  } catch (err) {
    // ignore
  }
}

async function main() {
  loadEnv();
  const host = process.env.MYSQL_HOST || "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT || 3307);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD || "123Sk_hari@2006";
  const database = process.env.MYSQL_DATABASE || "skyrovix";

  const csvDir = path.resolve(process.cwd(), "database", "csv");
  console.log(`🚀 Starting CSV backup restoration from: ${csvDir}`);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 0. Ensure schema columns are present
    console.log("🛠️ Checking and enhancing database schema columns...");
    
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
    await modifyColumn(conn, "submission_history", "github_url", "text NULL");
    await modifyColumn(conn, "submission_history", "deployed_url", "text NULL");

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

    // Registrations
    await ensureColumn(conn, "registrations", "status", "varchar(50) NULL DEFAULT 'APPROVED'");

    // Course certificates
    await ensureColumn(conn, "course_certificates", "user_id", "varchar(64) NULL");
    await ensureColumn(conn, "course_certificates", "course_id", "varchar(64) NULL");
    await ensureColumn(conn, "course_certificates", "student_name", "varchar(255) NULL");
    await ensureColumn(conn, "course_certificates", "course_title", "varchar(255) NULL");

    // Certificates
    await ensureColumn(conn, "certificates", "verification_hash", "varchar(255) NULL DEFAULT NULL");
    await ensureColumn(conn, "certificates", "intern_id", "varchar(100) NULL");
    await modifyColumn(conn, "certificates", "student_id", "varchar(64) NULL DEFAULT NULL");
    await modifyColumn(conn, "certificates", "student_name", "varchar(191) NULL DEFAULT ''");
    await modifyColumn(conn, "certificates", "issue_date", "varchar(100) NULL DEFAULT ''");

    // Storage files table
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

    // Lookup caches
    const userByEmail = new Map();
    const userById = new Map();
    const userByAppId = new Map();

    // 1. RESTORE STUDENTS_MASTER (into users, profiles, user_roles, students)
    console.log("📥 Restoring students_master.csv...");
    const studentsMasterFile = path.join(csvDir, "students_master.csv");
    const studentsMasterCsv = await fs.readFile(studentsMasterFile, "utf-8");
    const studentsData = parseCsv(studentsMasterCsv);
    console.log(`   Found ${studentsData.length} records in students_master.csv`);

    let usersCount = 0;
    for (const s of studentsData) {
      const id = s.student_id;
      const email = (s.email || "").trim().toLowerCase();
      if (!id || !email) continue;

      const fullName = (s.full_name || email.split("@")[0]).trim();
      const passwordHash = s.encrypted_password_hash || "";
      const createdAt = toMysqlDatetime(s.account_created_at) || toMysqlDatetime(s.email_confirmed_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
      const role = s.role || "student";
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

      // users
      await conn.query(
        `REPLACE INTO users (id, email, password_hash, full_name, raw_user_meta_data, is_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, email, passwordHash, fullName, meta, isVerified, createdAt, createdAt]
      );

      // profiles
      await conn.query(
        `REPLACE INTO profiles (id, full_name, email, phone, college, course, year, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, fullName, email, phone, college, course, year, createdAt, createdAt]
      );

      // user_roles
      await conn.query(
        `INSERT INTO user_roles (id, user_id, role, created_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [crypto.randomUUID(), id, role, createdAt]
      );

      // students
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
      const createdAt = toMysqlDatetime(a.created_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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

      // sync to registrations
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
      const loginTime = toMysqlDatetime(l.login_time) || new Date().toISOString().slice(0, 19).replace("T", " ");
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

    // 4. RESTORE TASK SUBMISSIONS
    console.log("📥 Restoring task_submissions.csv...");
    const subFile = path.join(csvDir, "task_submissions.csv");
    const subCsv = await fs.readFile(subFile, "utf-8");
    const subData = parseCsv(subCsv);
    console.log(`   Found ${subData.length} records in task_submissions.csv`);

    let subCount = 0;
    for (const s of subData) {
      const id = s.submission_id;
      if (!id) continue;
      const submittedAt = toMysqlDatetime(s.submitted_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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
      const createdAt = toMysqlDatetime(h.created_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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
      const issuedAt = toMysqlDatetime(c.issued_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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
          `https://skyrovix.com/verify?id=${certId}`, issuedAt, issuedAt,
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
      const issuedAt = toMysqlDatetime(cc.issued_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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
      const issuedAt = toMysqlDatetime(pc.issued_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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
      if (!p.id) continue;
      const submittedAt = toMysqlDatetime(p.submitted_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
      const verifiedAt = toMysqlDatetime(p.verified_at);

      await conn.query(
        `REPLACE INTO payments (
          id, application_id, registration_id, utr_number, screenshot_url, amount, status,
          submitted_at, verified_at, coupon_code, discount_amount, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id, p.application_id || null, p.application_id || null, p.utr_number || null, p.screenshot_url || null,
          p.amount ? Number(p.amount) : 100, p.status || "verified",
          submittedAt, verifiedAt, p.coupon_code || null,
          p.discount_amount ? Number(p.discount_amount) : 0,
          submittedAt, verifiedAt || submittedAt,
        ]
      );
      payCount++;
    }
    console.log(`   ✅ Restored ${payCount} payment records.`);

    // 10. RESTORE EMAIL LOGS
    console.log("📥 Restoring email_logs.csv...");
    const emailFile = path.join(csvDir, "email_logs.csv");
    const emailCsv = await fs.readFile(emailFile, "utf-8");
    const emailData = parseCsv(emailCsv);
    console.log(`   Found ${emailData.length} records in email_logs.csv`);

    let emailCount = 0;
    for (const e of emailData) {
      if (!e.id) continue;
      const createdAt = toMysqlDatetime(e.created_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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

    // 11. RESTORE STORAGE FILES INDEX
    console.log("📥 Restoring storage_files_index.csv...");
    const storageFile = path.join(csvDir, "storage_files_index.csv");
    try {
      const storageCsv = await fs.readFile(storageFile, "utf-8");
      const storageData = parseCsv(storageCsv);
      console.log(`   Found ${storageData.length} records in storage_files_index.csv`);

      let storageCount = 0;
      for (const st of storageData) {
        if (!st.id) continue;
        const createdAt = toMysqlDatetime(st.created_at) || new Date().toISOString().slice(0, 19).replace("T", " ");
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

        // If bucket is profile-photos, update user profile and application photo_url
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

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("\n=======================================================");
    console.log("🎉 ALL CSV BACKUP DATA RESTORED SUCCESSFULLY!");
    console.log("=======================================================");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ Fatal restoration error:", err);
  process.exit(1);
});
