import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

function sqlEscape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") {
    if (isNaN(val)) return "NULL";
    return String(val);
  }
  if (typeof val === "boolean") return val ? "1" : "0";
  const s = String(val);
  return "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\0/g, "\\0") + "'";
}

function formatBatchInsert(tableName, columns, rows, batchSize = 100) {
  if (rows.length === 0) return "";
  let out = "";
  const cols = columns.map(c => `\`${c}\``).join(", ");
  
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    out += `INSERT INTO \`${tableName}\` (${cols}) VALUES\n`;
    out += chunk.map(row => "  (" + row.map(v => sqlEscape(v)).join(", ") + ")").join(",\n");
    out += "\nON DUPLICATE KEY UPDATE " + columns.filter(c => c !== "id").map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(", ") + ";\n\n";
  }
  return out;
}

async function main() {
  console.log("🚀 Generating Complete Single-File SQL Master...");

  const rootDir = process.cwd();
  const csvDir = path.join(rootDir, "database", "csv");
  const schemaFile = path.join(rootDir, "mysql_schema.sql");

  // Read base schema
  let baseSchema = await fs.readFile(schemaFile, "utf-8");

  // Ensure targeting skyrovix_main_db
  baseSchema = baseSchema.replace(/CREATE DATABASE IF NOT EXISTS skyrovix/g, "CREATE DATABASE IF NOT EXISTS `skyrovix_main_db`");
  baseSchema = baseSchema.replace(/USE skyrovix;/g, "USE `skyrovix_main_db`;");

  let out = "";

  // 1. Header
  out += `-- ==============================================================================\n`;
  out += `-- SKYROVIX LMS & INTERNSHIP PLATFORM — COMPLETE ALL-IN-ONE MASTER DATABASE DUMP\n`;
  out += `-- Generated: ${new Date().toISOString()}\n`;
  out += `-- Target Database: skyrovix_main_db (MySQL 8.0+)\n`;
  out += `-- Contains: Complete Schema + All 53 Tables + 1,071 Students + All Submissions\n`;
  out += `--           + Applications + Certificates + Payments + Admin hariharan@skyrovix.com\n`;
  out += `--\n`;
  out += `-- HOW TO IMPORT ON CONTABO VPS OR ANY SERVER (Takes ~3 seconds):\n`;
  out += `--   mysql -u root -p < skyrovix_complete_master.sql\n`;
  out += `--   OR\n`;
  out += `--   mysql -u skyrovix_main_user -pSkyrovixMain@2026#SecureDb skyrovix_main_db < skyrovix_complete_master.sql\n`;
  out += `-- ==============================================================================\n\n`;

  out += `CREATE DATABASE IF NOT EXISTS \`skyrovix_main_db\`\n`;
  out += `  CHARACTER SET utf8mb4\n`;
  out += `  COLLATE utf8mb4_unicode_ci;\n\n`;
  out += `USE \`skyrovix_main_db\`;\n\n`;
  out += `SET NAMES utf8mb4;\n`;
  out += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  out += `SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n`;
  out += `SET time_zone = '+00:00';\n\n`;

  // 2. Base Schema (Tables, Views, Stored Procedures, Course Data, Tasks)
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 1: CORE SCHEMA DDL & PLATFORM CONFIGURATION\n`;
  out += `-- ==============================================================================\n\n`;

  // We append extra table definitions if not in baseSchema
  out += baseSchema + "\n\n";

  // Additional tables from CSVs
  out += `-- Additional Tables (Storage, Projects, etc.)\n`;
  out += `CREATE TABLE IF NOT EXISTS \`storage_files\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`bucket_id\` VARCHAR(100),
  \`file_path\` TEXT,
  \`file_size_bytes\` BIGINT,
  \`mime_type\` VARCHAR(100),
  \`direct_public_url\` TEXT,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_storage_bucket\` (\`bucket_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `CREATE TABLE IF NOT EXISTS \`project_certificates\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`cert_id\` VARCHAR(100) NOT NULL UNIQUE,
  \`submission_id\` VARCHAR(36),
  \`user_id\` VARCHAR(36),
  \`project_id\` VARCHAR(36),
  \`participant_name\` VARCHAR(255),
  \`project_title\` VARCHAR(255),
  \`industry\` VARCHAR(100),
  \`final_score\` DECIMAL(5,2) DEFAULT 80.00,
  \`completion_date\` DATETIME,
  \`issued_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `CREATE TABLE IF NOT EXISTS \`project_awards\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`award_id\` VARCHAR(100) NOT NULL UNIQUE,
  \`user_id\` VARCHAR(36),
  \`title\` VARCHAR(255),
  \`award_type\` VARCHAR(100),
  \`issued_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `-- ==============================================================================\n`;
  out += `-- SECTION 2: ALL RESTORED USERS & STUDENT PROFILES (1,071 RECORDS)\n`;
  out += `-- ==============================================================================\n\n`;

  // Parse students_master.csv
  const userByEmail = new Map();
  const userById = new Map();
  const userByAppId = new Map();

  const studentsCsv = await fs.readFile(path.join(csvDir, "students_master.csv"), "utf-8");
  const students = parseCsv(studentsCsv);

  const usersRows = [];
  const profilesRows = [];
  const userRolesRows = [];
  const studentsRows = [];

  const adminBcryptHash = "$2b$10$bxTZ5YsCda5mi6eTctu05.sKz.OE3r1iZv4fNuNzR.O07onX/pQyu"; // Admin@123

  for (const s of students) {
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

    usersRows.push([id, email, passwordHash, fullName, meta, isVerified, createdAt, createdAt]);
    profilesRows.push([id, fullName, email, phone, college, course, year, null, createdAt, createdAt]);
    userRolesRows.push([crypto.randomUUID(), id, role, createdAt]);
    studentsRows.push([
      id, fullName, email, phone, college, course, course, year,
      "", "Beginner", passwordHash,
      internIds ? internIds.split(";")[0].trim() : null,
      createdAt, createdAt
    ]);
  }

  out += formatBatchInsert("users", ["id", "email", "password_hash", "full_name", "raw_user_meta_data", "is_verified", "created_at", "updated_at"], usersRows);
  out += formatBatchInsert("profiles", ["id", "full_name", "email", "phone", "college", "course", "year", "photo_url", "created_at", "updated_at"], profilesRows);
  out += formatBatchInsert("user_roles", ["id", "user_id", "role", "created_at"], userRolesRows);
  out += formatBatchInsert("students", ["id", "full_name", "email", "mobile", "college", "degree", "department", "year_of_study", "city", "skill_level", "password_hash", "student_id_formatted", "created_at", "updated_at"], studentsRows);

  // 3. Applications & Registrations
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 3: ALL INTERNSHIP APPLICATIONS & REGISTRATIONS (789 RECORDS)\n`;
  out += `-- ==============================================================================\n\n`;

  const appsCsv = await fs.readFile(path.join(csvDir, "applications.csv"), "utf-8");
  const apps = parseCsv(appsCsv);
  const appsRows = [];
  const regRows = [];

  for (const a of apps) {
    if (!a.id) continue;
    const createdAt = toMysqlDatetime(a.created_at) || "2026-01-01 00:00:00";
    const offerIssuedAt = toMysqlDatetime(a.offer_issued_at);
    const completedAt = toMysqlDatetime(a.completed_at);
    const submittedAt = toMysqlDatetime(a.submitted_at);
    const verifiedAt = toMysqlDatetime(a.verified_at);
    const certGenAt = toMysqlDatetime(a.certificate_generated_at);
    const userId = a.user_id || userByEmail.get((a.email || "").trim().toLowerCase()) || a.id;
    userByAppId.set(a.id, userId);

    appsRows.push([
      a.id, userId, a.intern_id || null, (a.full_name || "").trim(), (a.email || "").trim(), (a.phone || "").trim(), (a.domain || "").trim(), a.status || "approved",
      (a.college || "").trim(), (a.course || "").trim(), (a.year || "").trim(), a.duration ? Number(a.duration) : 1, a.country || "India", (a.state || "").trim(), (a.city || "").trim(),
      a.referral_name || null, a.hear_about || null, a.coupon_code || null, offerIssuedAt, createdAt,
      completedAt, a.submission_status || "in_progress", submittedAt, toBoolean(a.verified), verifiedAt,
      toBoolean(a.certificate_generated), certGenAt, a.certificate_payment_status || "locked",
      createdAt
    ]);

    regRows.push([a.id, userId, a.domain || "", "APPROVED", a.status || "ACTIVE", a.status || "APPROVED", createdAt, createdAt]);
  }

  out += formatBatchInsert("applications", [
    "id", "user_id", "intern_id", "full_name", "email", "phone", "domain", "status",
    "college", "course", "year", "duration", "country", "state", "city",
    "referral_name", "hear_about", "coupon_code", "offer_issued_at", "created_at",
    "completed_at", "submission_status", "submitted_at", "verified", "verified_at",
    "certificate_generated", "certificate_generated_at", "certificate_payment_status",
    "updated_at"
  ], appsRows);

  out += formatBatchInsert("registrations", ["id", "student_id", "domain", "registration_status", "internship_status", "status", "created_at", "updated_at"], regRows);

  // 4. Task Submissions
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 4: ALL TASK SUBMISSIONS (840 RECORDS)\n`;
  out += `-- ==============================================================================\n\n`;

  const subsCsv = await fs.readFile(path.join(csvDir, "task_submissions.csv"), "utf-8");
  const subs = parseCsv(subsCsv);
  const subsRows = [];

  for (const s of subs) {
    const id = s.submission_id;
    if (!id) continue;
    const submittedAt = toMysqlDatetime(s.submitted_at) || "2026-01-01 00:00:00";
    const reviewedAt = toMysqlDatetime(s.reviewed_at);
    const studentEmail = (s.student_email || "").trim().toLowerCase();
    const studentId = userByAppId.get(s.application_id) || userByEmail.get(studentEmail) || null;

    subsRows.push([
      id, s.application_id || null, studentId, s.intern_id || null, s.domain || null,
      s.task_id || null, s.task_number ? Number(s.task_number) : null, (s.task_title || "").trim(),
      s.github_url || null, s.deployed_url || null, s.pdf_url || null, s.screenshot_url || null,
      s.status || "SUBMITTED", s.feedback || null, s.notes || null,
      (s.student_name || "").trim() || null, studentEmail || null,
      submittedAt, reviewedAt, s.resubmission_count ? Number(s.resubmission_count) : 0,
      s.task_id || id, (s.task_title || "Task").trim(),
      s.github_url || "", s.deployed_url || "",
      submittedAt, reviewedAt || submittedAt
    ]);
  }

  out += formatBatchInsert("submissions", [
    "id", "application_id", "student_id", "intern_id", "domain", "task_id", "task_number", "task_title",
    "github_url", "deployed_url", "pdf_url", "screenshot_url", "status", "feedback", "notes",
    "student_name", "student_email",
    "submitted_at", "reviewed_at", "resubmission_count", "project_id", "project_title",
    "github_repo_url", "live_deployment_url", "created_at", "updated_at"
  ], subsRows);

  // 5. Submission History
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 5: SUBMISSION AUDIT HISTORY\n`;
  out += `-- ==============================================================================\n\n`;

  const histCsv = await fs.readFile(path.join(csvDir, "submission_history.csv"), "utf-8");
  const hist = parseCsv(histCsv);
  const histRows = [];

  for (const h of hist) {
    if (!h.id) continue;
    const createdAt = toMysqlDatetime(h.created_at) || "2026-01-01 00:00:00";
    histRows.push([
      h.id, h.submission_id || null, h.application_id || null, h.task_id || null,
      h.status || null, h.notes || null, h.github_url || null, h.deployed_url || null,
      h.pdf_url || null, h.screenshot_url || null, h.feedback || null,
      h.previous_status || null, h.new_status || null, h.changed_by || null,
      h.reason || null, h.table_name || "submissions", createdAt
    ]);
  }

  out += formatBatchInsert("submission_history", [
    "id", "submission_id", "application_id", "task_id", "status", "notes",
    "github_url", "deployed_url", "pdf_url", "screenshot_url", "feedback",
    "previous_status", "new_status", "changed_by", "reason", "table_name", "created_at"
  ], histRows);

  // 6. Certificates
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 6: ISSUED CERTIFICATES\n`;
  out += `-- ==============================================================================\n\n`;

  const certCsv = await fs.readFile(path.join(csvDir, "certificates_issued.csv"), "utf-8");
  const certs = parseCsv(certCsv);
  const certRows = [];

  for (const c of certs) {
    const id = c.id || c.certificate_id;
    if (!id) continue;
    const issuedAt = toMysqlDatetime(c.issued_at) || "2026-01-01 00:00:00";
    const certId = c.certificate_id || id;
    const studentEmail = (c.student_email || "").trim().toLowerCase();
    const studentId = userByAppId.get(c.application_id) || userByEmail.get(studentEmail) || null;

    certRows.push([
      id, certId, studentId, c.application_id || null, c.intern_id || null, c.intern_id || null,
      (c.student_name || "").trim(), (c.domain || "").trim(),
      c.verification_hash || null, issuedAt, issuedAt, "ISSUED", "VALID",
      `https://skyrovix.com/verify?id=${certId}`, issuedAt, issuedAt
    ]);
  }

  out += formatBatchInsert("certificates", [
    "id", "certificate_id", "student_id", "application_id", "intern_id", "internship_id",
    "student_name", "domain", "verification_hash", "issued_at", "issue_date", "status",
    "certificate_status", "verification_url", "created_at", "updated_at"
  ], certRows);

  // Course Certificates
  const ccCsv = await fs.readFile(path.join(csvDir, "course_certificates.csv"), "utf-8");
  const ccList = parseCsv(ccCsv);
  const ccRows = [];
  for (const cc of ccList) {
    if (!cc.id) continue;
    const issuedAt = toMysqlDatetime(cc.issued_at) || "2026-01-01 00:00:00";
    ccRows.push([
      cc.id, cc.certificate_id || "", cc.enrollment_id || cc.id, cc.user_id || null, cc.course_id || null,
      cc.student_name || null, cc.course_title || null, cc.verification_hash || null, 100, issuedAt
    ]);
  }
  out += formatBatchInsert("course_certificates", [
    "id", "certificate_id", "enrollment_id", "user_id", "course_id", "student_name", "course_title",
    "verification_hash", "score", "issued_at"
  ], ccRows);

  // Project Certificates
  const pcCsv = await fs.readFile(path.join(csvDir, "project_certificates.csv"), "utf-8");
  const pcList = parseCsv(pcCsv);
  const pcRows = [];
  for (const pc of pcList) {
    if (!pc.id) continue;
    const issuedAt = toMysqlDatetime(pc.issued_at) || "2026-01-01 00:00:00";
    const compDate = toMysqlDatetime(pc.completion_date) || issuedAt;
    pcRows.push([
      pc.id, pc.cert_id || "", pc.submission_id || null, pc.user_id || null, pc.project_id || null,
      (pc.participant_name || "").trim(), (pc.project_title || "").trim(), (pc.industry || "").trim(),
      pc.final_score ? Number(pc.final_score) : 80.0, compDate, issuedAt
    ]);
  }
  out += formatBatchInsert("project_certificates", [
    "id", "cert_id", "submission_id", "user_id", "project_id", "participant_name",
    "project_title", "industry", "final_score", "completion_date", "issued_at"
  ], pcRows);

  // 7. Payments
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 7: PAYMENTS & VERIFICATIONS\n`;
  out += `-- ==============================================================================\n\n`;

  const payCsv = await fs.readFile(path.join(csvDir, "payments.csv"), "utf-8");
  const pays = parseCsv(payCsv);
  const payRows = [];

  for (const p of pays) {
    if (!p.id) continue;
    const submittedAt = toMysqlDatetime(p.submitted_at) || "2026-01-01 00:00:00";
    const verifiedAt = toMysqlDatetime(p.verified_at);
    payRows.push([
      p.id, p.application_id || null, p.application_id || null, p.utr_number || null, p.screenshot_url || null,
      p.amount ? Number(p.amount) : 100, p.status || "verified",
      submittedAt, verifiedAt, p.coupon_code || null,
      p.discount_amount ? Number(p.discount_amount) : 0,
      submittedAt, verifiedAt || submittedAt
    ]);
  }

  out += formatBatchInsert("payments", [
    "id", "application_id", "registration_id", "utr_number", "screenshot_url", "amount", "status",
    "submitted_at", "verified_at", "coupon_code", "discount_amount", "created_at", "updated_at"
  ], payRows);

  // 8. Email Logs
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 8: EMAIL AUDIT LOGS\n`;
  out += `-- ==============================================================================\n\n`;

  const emailCsv = await fs.readFile(path.join(csvDir, "email_logs.csv"), "utf-8");
  const emails = parseCsv(emailCsv);
  const emailRows = [];

  for (const e of emails) {
    if (!e.id) continue;
    const createdAt = toMysqlDatetime(e.created_at) || "2026-01-01 00:00:00";
    const sentAt = toMysqlDatetime(e.sent_at);
    emailRows.push([
      e.id, e.user_id || null, e.email_to || null, (e.student_name || "").trim() || null,
      e.document_type || "offer_letter", e.document_type || "offer_letter", e.status || "sent", e.subject || "Skyrovix Notification",
      e.reference_id || null, e.error_message || null, sentAt, createdAt,
      e.email_to || "", (e.student_name || "").trim() || ""
    ]);
  }

  out += formatBatchInsert("email_logs", [
    "id", "user_id", "email_to", "student_name", "document_type", "email_type", "status", "subject",
    "reference_id", "error_message", "sent_at", "created_at", "recipient_email", "recipient_name"
  ], emailRows);

  // 9. Storage Files
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 9: STORAGE FILES INDEX\n`;
  out += `-- ==============================================================================\n\n`;

  const storageCsv = await fs.readFile(path.join(csvDir, "storage_files_index.csv"), "utf-8");
  const storageList = parseCsv(storageCsv);
  const storageRows = [];

  for (const st of storageList) {
    if (!st.id) continue;
    const createdAt = toMysqlDatetime(st.created_at) || "2026-01-01 00:00:00";
    storageRows.push([
      st.id, st.bucket_id || null, st.file_path || null,
      st.file_size_bytes ? Number(st.file_size_bytes) : null,
      st.mime_type || null, st.direct_public_url || null,
      createdAt
    ]);
  }

  out += formatBatchInsert("storage_files", [
    "id", "bucket_id", "file_path", "file_size_bytes", "mime_type", "direct_public_url", "created_at"
  ], storageRows);

  // 10. Login Sessions
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 10: LOGIN SESSIONS\n`;
  out += `-- ==============================================================================\n\n`;

  const loginCsv = await fs.readFile(path.join(csvDir, "login_sessions.csv"), "utf-8");
  const logins = parseCsv(loginCsv);
  const loginRows = [];

  for (const l of logins) {
    if (!l.id) continue;
    const loginTime = toMysqlDatetime(l.login_time) || "2026-01-01 00:00:00";
    const logoutTime = toMysqlDatetime(l.logout_time);
    const lastActive = toMysqlDatetime(l.last_active) || loginTime;
    const createdAt = toMysqlDatetime(l.created_at) || loginTime;
    const studentId = l.student_id || userByEmail.get((l.email || "").trim().toLowerCase()) || l.id;

    loginRows.push([
      l.id, studentId, l.intern_id || null, (l.student_name || "").trim() || null, (l.email || "").trim() || null, (l.domain || "").trim() || null, (l.college || "").trim() || null,
      loginTime, logoutTime, lastActive, l.status || "offline", l.ip_address || null, l.device || null, l.browser || null, l.os || null,
      l.country || null, l.state || null, l.city || null, createdAt, createdAt
    ]);
  }

  out += formatBatchInsert("login_sessions", [
    "id", "student_id", "intern_id", "student_name", "email", "domain", "college",
    "login_time", "logout_time", "last_active", "status", "ip_address", "device", "browser", "os",
    "country", "state", "city", "created_at", "updated_at"
  ], loginRows);

  // 11. Final Verification & Post-Migration Tuning
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 11: ADMIN ACCESS ENFORCEMENT & HIGH-PERFORMANCE INDEXING\n`;
  out += `-- ==============================================================================\n\n`;

  out += `-- Ensure sole admin has role 'admin'\n`;
  out += `INSERT INTO \`user_roles\` (\`id\`, \`user_id\`, \`role\`, \`created_at\`)\n`;
  out += `VALUES (UUID(), '15430c49-f28f-459e-ba3f-411b18519445', 'admin', NOW())\n`;
  out += `ON DUPLICATE KEY UPDATE \`role\` = 'admin';\n\n`;

  out += `-- Remove any unauthorized admin assignments\n`;
  out += `UPDATE \`user_roles\` SET \`role\` = 'user' WHERE \`user_id\` != '15430c49-f28f-459e-ba3f-411b18519445' AND \`role\` = 'admin';\n\n`;

  out += `-- Optimize B-Tree indexes for fast login, dashboard, and search\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_users_email_btree\` ON \`users\` (\`email\`);\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_applications_user_btree\` ON \`applications\` (\`user_id\`);\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_submissions_app_btree\` ON \`submissions\` (\`application_id\`);\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_submissions_student_btree\` ON \`submissions\` (\`student_id\`);\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_certificates_app_btree\` ON \`certificates\` (\`application_id\`);\n`;
  out += `CREATE INDEX IF NOT EXISTS \`idx_payments_app_btree\` ON \`payments\` (\`application_id\`);\n\n`;

  out += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
  out += `-- ==============================================================================\n`;
  out += `-- END OF COMPLETE MASTER DUMP. TOTAL RECORDS: ~5,500 ROWS READY TO USE!\n`;
  out += `-- ==============================================================================\n`;

  // Write output file in both database/ and root
  const destDb = path.join(rootDir, "database", "skyrovix_complete_master.sql");
  const destRoot = path.join(rootDir, "skyrovix_complete_master.sql");

  await fs.writeFile(destDb, out, "utf-8");
  await fs.writeFile(destRoot, out, "utf-8");

  const stat = await fs.stat(destRoot);
  console.log(`✅ COMPLETE MASTER SQL GENERATED!`);
  console.log(`📍 File 1: ${destRoot} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`📍 File 2: ${destDb}`);
  console.log(`📊 Total Users: ${usersRows.length}`);
  console.log(`📊 Total Applications: ${appsRows.length}`);
  console.log(`📊 Total Submissions: ${subsRows.length}`);
  console.log(`📊 Total Certificates: ${certRows.length + ccRows.length + pcRows.length}`);
  console.log(`📊 Total Payments: ${payRows.length}`);
}

main().catch((err) => {
  console.error("❌ Generator failed:", err);
  process.exit(1);
});
