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

function extractCodeExample(content) {
  const match = content.match(/```[\w]*\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

function extractKeyPoints(content) {
  const points = [];
  const lines = content.split('\n');
  let inKeyConcepts = false;
  for (const line of lines) {
    if (line.includes('🧠 Key Concepts')) { inKeyConcepts = true; continue; }
    if (inKeyConcepts && line.startsWith('## ')) break;
    if (inKeyConcepts && line.match(/^- \*\*(.+?)\*\*/)) {
      const m = line.match(/- \*\*(.+?)\*\*/);
      if (m) points.push(m[1].trim());
    }
    if (inKeyConcepts && line.match(/^- /) && !line.match(/^- \*\*/)) {
      points.push(line.replace(/^- /, '').trim());
    }
  }
  return points.length > 0 ? points.slice(0, 10) : ['Learn the fundamentals', 'Practice with real-world examples'];
}

function parseTopicNumber(filename) {
  const m = filename.match(/^(\d+)_/);
  return m ? parseInt(m[1]) : 1;
}

function parseTopicTitle(content) {
  const m = content.match(/^## \d+\.\s*(.+)$/m);
  return m ? m[1].trim() : 'Lesson Topic';
}

async function main() {
  console.log("🚀 Generating TOTAL WEBSITE Single-File Master SQL Dump...");

  const rootDir = process.cwd();
  const csvDir = path.join(rootDir, "database", "csv");
  const schemaFile = path.join(rootDir, "mysql_schema.sql");
  const courseContentDir = path.join(rootDir, "course-content");

  let out = "";

  // 1. Header & Configuration
  out += `-- ==============================================================================\n`;
  out += `-- SKYROVIX LMS & INTERNSHIP PLATFORM — TOTAL WEBSITE MASTER DATABASE DUMP\n`;
  out += `-- Generated: ${new Date().toISOString()}\n`;
  out += `-- Target Database: skyrovix_main_db (MySQL 8.0+)\n`;
  out += `--\n`;
  out += `-- INCLUDES 100% OF THE ENTIRE WEBSITE:\n`;
  out += `--   1. Full Schema (53 Tables, Views, Stored Procedures)\n`;
  out += `--   2. All 12 Complete Courses (Python, Java, HTML, CSS, JS, PHP, MySQL, Django, etc.)\n`;
  out += `--   3. All 435 Course Topics with full Markdown lessons, code examples & key points\n`;
  out += `--   4. All 1,200 Interactive Quiz Questions (100 MCQs per course)\n`;
  out += `--   5. Tasks 1 to 12 for all 25 Internship Domains (Full sequential curricula)\n`;
  out += `--   6. 50 Verified Enterprise Project Challenges with tier access\n`;
  out += `--   7. Complete Student Kit Items & Mentorship Guidance Schedules\n`;
  out += `--   8. All 1,071 Students & Profiles + Admin hariharan@skyrovix.com (Admin@123)\n`;
  out += `--   9. All 789 Enrolled Internship Applications & Registrations\n`;
  out += `--  10. All 840 Task Submissions, Reviews & Audit History\n`;
  out += `--  11. All Issued Certificates (Internship, Course, and Project Certificates)\n`;
  out += `--  12. All Payments, Fee Settings, Discount Coupons (SKYROFREE), Popups & Reviews\n`;
  out += `--  13. All Email Audit Logs, Storage Files Index, and Login Sessions\n`;
  out += `--\n`;
  out += `-- SINGLE-STEP IMPORT COMMAND ON CONTABO VPS:\n`;
  out += `--   mysql -u root skyrovix_main_db < skyrovix_total_website_master.sql\n`;
  out += `--   OR\n`;
  out += `--   mysql -u skyrovix_main_user -pSkyrovixMain@2026#SecureDb skyrovix_main_db < skyrovix_total_website_master.sql\n`;
  out += `-- ==============================================================================\n\n`;

  out += `CREATE DATABASE IF NOT EXISTS \`skyrovix_main_db\`\n`;
  out += `  CHARACTER SET utf8mb4\n`;
  out += `  COLLATE utf8mb4_unicode_ci;\n\n`;
  out += `USE \`skyrovix_main_db\`;\n\n`;
  out += `SET NAMES utf8mb4;\n`;
  out += `SET FOREIGN_KEY_CHECKS = 0;\n`;
  out += `SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n`;
  out += `SET time_zone = '+00:00';\n\n`;

  // 2. Base Schema DDL from mysql_schema.sql
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 1: CORE SCHEMA DDL & STRUCTURE DEFINITION\n`;
  out += `-- ==============================================================================\n\n`;

  let baseSchema = await fs.readFile(schemaFile, "utf-8");
  baseSchema = baseSchema.replace(/CREATE DATABASE IF NOT EXISTS skyrovix/g, "CREATE DATABASE IF NOT EXISTS `skyrovix_main_db`");
  baseSchema = baseSchema.replace(/USE skyrovix;/g, "USE `skyrovix_main_db`;");

  // Cut before tasks seed in baseSchema so we can do a comprehensive tasks 1-12 seed
  const taskSeedIdx = baseSchema.indexOf("-- Seed Core Tasks 1 to 5 for All Domains");
  if (taskSeedIdx !== -1) {
    out += baseSchema.slice(0, taskSeedIdx) + "\n\n";
  } else {
    out += baseSchema + "\n\n";
  }

  // Ensure additional and restored tables exist with exact schemas (drop stale structures if any)
  out += `-- Additional Enterprise & Restored Tables Schema Definitions\n`;
  out += `DROP TABLE IF EXISTS \`students\`;\n`;
  out += `CREATE TABLE \`students\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`full_name\` VARCHAR(255),
  \`email\` VARCHAR(255),
  \`mobile\` VARCHAR(50),
  \`college\` VARCHAR(255),
  \`degree\` VARCHAR(255),
  \`department\` VARCHAR(255),
  \`year_of_study\` VARCHAR(50),
  \`city\` VARCHAR(100),
  \`skill_level\` VARCHAR(50) DEFAULT 'Beginner',
  \`password_hash\` VARCHAR(255),
  \`student_id_formatted\` VARCHAR(100),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_students_email\` (\`email\`),
  INDEX \`idx_students_mobile\` (\`mobile\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`registrations\`;\n`;
  out += `CREATE TABLE \`registrations\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`student_id\` VARCHAR(36),
  \`domain\` VARCHAR(100),
  \`registration_status\` VARCHAR(50) DEFAULT 'APPROVED',
  \`internship_status\` VARCHAR(50) DEFAULT 'ACTIVE',
  \`status\` VARCHAR(50) DEFAULT 'APPROVED',
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_reg_student\` (\`student_id\`),
  INDEX \`idx_reg_domain\` (\`domain\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`submissions\`;\n`;
  out += `CREATE TABLE \`submissions\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`application_id\` VARCHAR(36),
  \`student_id\` VARCHAR(36),
  \`intern_id\` VARCHAR(100),
  \`domain\` VARCHAR(100),
  \`task_id\` VARCHAR(36),
  \`task_number\` INT,
  \`task_title\` VARCHAR(255),
  \`github_url\` TEXT,
  \`deployed_url\` TEXT,
  \`pdf_url\` TEXT,
  \`screenshot_url\` TEXT,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
  \`feedback\` TEXT,
  \`notes\` TEXT,
  \`student_name\` VARCHAR(255),
  \`student_email\` VARCHAR(255),
  \`submitted_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`reviewed_at\` DATETIME(3),
  \`resubmission_count\` INT DEFAULT 0,
  \`project_id\` VARCHAR(100),
  \`project_title\` VARCHAR(255),
  \`github_repo_url\` TEXT,
  \`live_deployment_url\` TEXT,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_submissions_app\` (\`application_id\`),
  INDEX \`idx_submissions_student\` (\`student_id\`),
  INDEX \`idx_submissions_task\` (\`task_id\`),
  INDEX \`idx_submissions_domain\` (\`domain\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`submission_history\`;\n`;
  out += `CREATE TABLE \`submission_history\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`submission_id\` VARCHAR(36),
  \`application_id\` VARCHAR(36),
  \`task_id\` VARCHAR(36),
  \`status\` VARCHAR(50),
  \`notes\` TEXT,
  \`github_url\` TEXT,
  \`deployed_url\` TEXT,
  \`pdf_url\` TEXT,
  \`screenshot_url\` TEXT,
  \`feedback\` TEXT,
  \`previous_status\` VARCHAR(50),
  \`new_status\` VARCHAR(50),
  \`changed_by\` VARCHAR(255),
  \`reason\` TEXT,
  \`table_name\` VARCHAR(100) DEFAULT 'submissions',
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX \`idx_sub_hist_app\` (\`application_id\`),
  INDEX \`idx_sub_hist_sub\` (\`submission_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`certificates\`;\n`;
  out += `CREATE TABLE \`certificates\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`certificate_id\` VARCHAR(100) NOT NULL UNIQUE,
  \`student_id\` VARCHAR(36),
  \`application_id\` VARCHAR(36),
  \`intern_id\` VARCHAR(100),
  \`internship_id\` VARCHAR(100),
  \`student_name\` VARCHAR(255),
  \`domain\` VARCHAR(100),
  \`verification_hash\` VARCHAR(255) NOT NULL,
  \`issued_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`issue_date\` DATETIME(3),
  \`status\` VARCHAR(50) DEFAULT 'ISSUED',
  \`certificate_status\` VARCHAR(50) DEFAULT 'VALID',
  \`verification_url\` TEXT,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_certs_cert_id\` (\`certificate_id\`),
  INDEX \`idx_certs_app\` (\`application_id\`),
  INDEX \`idx_certs_student\` (\`student_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`course_certificates\`;\n`;
  out += `CREATE TABLE \`course_certificates\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`certificate_id\` VARCHAR(100) NOT NULL UNIQUE,
  \`enrollment_id\` VARCHAR(36),
  \`user_id\` VARCHAR(36),
  \`course_id\` VARCHAR(36),
  \`student_name\` VARCHAR(255),
  \`course_title\` VARCHAR(255),
  \`verification_hash\` VARCHAR(255) NOT NULL,
  \`score\` INT NOT NULL DEFAULT 100,
  \`issued_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX \`idx_course_certs_cert_id\` (\`certificate_id\`),
  INDEX \`idx_course_certs_user\` (\`user_id\`),
  INDEX \`idx_course_certs_enroll\` (\`enrollment_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`payments\`;\n`;
  out += `CREATE TABLE \`payments\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`application_id\` VARCHAR(36),
  \`registration_id\` VARCHAR(36),
  \`utr_number\` VARCHAR(100),
  \`screenshot_url\` TEXT,
  \`amount\` DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'verified',
  \`coupon_code\` VARCHAR(100),
  \`discount_amount\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`submitted_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`verified_at\` DATETIME(3),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_payments_app\` (\`application_id\`),
  INDEX \`idx_payments_utr\` (\`utr_number\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`email_logs\`;\n`;
  out += `CREATE TABLE \`email_logs\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36),
  \`email_to\` VARCHAR(255),
  \`recipient_email\` VARCHAR(255) NOT NULL,
  \`student_name\` VARCHAR(255),
  \`recipient_name\` VARCHAR(255),
  \`document_type\` VARCHAR(100) DEFAULT 'offer_letter',
  \`email_type\` VARCHAR(100) NOT NULL DEFAULT 'offer_letter',
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'sent',
  \`subject\` VARCHAR(255) NOT NULL,
  \`reference_id\` VARCHAR(100),
  \`error_message\` TEXT,
  \`metadata\` JSON,
  \`sent_at\` DATETIME(3),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX \`idx_email_logs_email\` (\`recipient_email\`),
  INDEX \`idx_email_logs_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`storage_files\`;\n`;
  out += `CREATE TABLE \`storage_files\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`bucket_id\` VARCHAR(100),
  \`file_path\` TEXT,
  \`file_size_bytes\` BIGINT,
  \`mime_type\` VARCHAR(100),
  \`direct_public_url\` TEXT,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_storage_bucket\` (\`bucket_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`project_certificates\`;\n`;
  out += `CREATE TABLE \`project_certificates\` (
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
  \`issued_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_proj_certs_cert_id\` (\`cert_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`project_awards\`;\n`;
  out += `CREATE TABLE \`project_awards\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`award_id\` VARCHAR(100) NOT NULL UNIQUE,
  \`user_id\` VARCHAR(36),
  \`submission_id\` VARCHAR(36),
  \`participant_name\` VARCHAR(255),
  \`project_title\` VARCHAR(255),
  \`rank_position\` VARCHAR(50),
  \`award_title\` VARCHAR(255) DEFAULT '',
  \`title\` VARCHAR(255),
  \`award_category\` VARCHAR(100),
  \`award_type\` VARCHAR(100),
  \`final_score\` DECIMAL(5,1),
  \`issue_date\` DATE,
  \`issued_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_proj_awards_award_id\` (\`award_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`student_kit_items\`;\n`;
  out += `CREATE TABLE \`student_kit_items\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL DEFAULT 'toolkit',
  \`description\` TEXT,
  \`icon\` VARCHAR(50) NOT NULL DEFAULT 'Package',
  \`file_url\` TEXT,
  \`external_url\` TEXT,
  \`download_url\` VARCHAR(255) NOT NULL,
  \`file_type\` VARCHAR(50) DEFAULT 'PDF',
  \`resource_type\` VARCHAR(50) DEFAULT 'PDF',
  \`file_size\` VARCHAR(50) DEFAULT '2 MB',
  \`format\` VARCHAR(50) NOT NULL DEFAULT 'ZIP',
  \`min_duration\` INT DEFAULT 3,
  \`min_tier\` INT NOT NULL DEFAULT 1,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`sort_order\` INT NOT NULL DEFAULT 0,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`guidance_schedules\`;\n`;
  out += `CREATE TABLE \`guidance_schedules\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`mentor_name\` VARCHAR(255) NOT NULL,
  \`mentor_role\` VARCHAR(255),
  \`topic\` VARCHAR(255) NOT NULL,
  \`session_type\` VARCHAR(100),
  \`description\` TEXT,
  \`scheduled_at\` DATETIME(3) NULL,
  \`schedule_time\` VARCHAR(255) NULL,
  \`duration_minutes\` INT NOT NULL DEFAULT 60,
  \`meeting_url\` TEXT,
  \`meeting_link\` VARCHAR(255),
  \`recording_url\` TEXT,
  \`support_channel\` VARCHAR(255),
  \`instructions\` TEXT,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`notes\` TEXT,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`login_sessions\`;\n`;
  out += `CREATE TABLE \`login_sessions\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL,
  \`intern_id\` VARCHAR(100),
  \`student_name\` VARCHAR(255),
  \`email\` VARCHAR(255),
  \`domain\` VARCHAR(100),
  \`college\` VARCHAR(255),
  \`login_time\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`logout_time\` DATETIME(3),
  \`last_active\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'online',
  \`ip_address\` VARCHAR(100),
  \`device\` VARCHAR(100),
  \`browser\` VARCHAR(100),
  \`os\` VARCHAR(100),
  \`country\` VARCHAR(100),
  \`state\` VARCHAR(100),
  \`city\` VARCHAR(100),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_login_sessions_student\` (\`student_id\`),
  INDEX \`idx_login_sessions_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`cashfree_orders\`;\n`;
  out += `CREATE TABLE \`cashfree_orders\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`order_id\` VARCHAR(100) UNIQUE NOT NULL,
  \`user_id\` VARCHAR(36),
  \`customer_name\` VARCHAR(255) NOT NULL,
  \`customer_email\` VARCHAR(255) NOT NULL,
  \`customer_phone\` VARCHAR(50) NOT NULL,
  \`product_service\` VARCHAR(255) NOT NULL,
  \`product_type\` VARCHAR(50) NOT NULL DEFAULT 'certificate',
  \`entity_id\` VARCHAR(100),
  \`amount\` DECIMAL(10, 2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'INR',
  \`payment_status\` VARCHAR(50) NOT NULL DEFAULT 'CREATED',
  \`cashfree_payment_id\` VARCHAR(100),
  \`cf_order_id\` VARCHAR(100),
  \`payment_session_id\` TEXT,
  \`payment_method\` VARCHAR(100),
  \`payment_time\` DATETIME(3),
  \`error_message\` TEXT,
  \`coupon_code\` VARCHAR(100),
  \`discount_amount\` DECIMAL(10, 2) DEFAULT 0.00,
  \`raw_response\` JSON,
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_cf_order_id\` (\`order_id\`),
  INDEX \`idx_cf_user\` (\`user_id\`),
  INDEX \`idx_cf_status\` (\`payment_status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`payment_records\`;\n`;
  out += `CREATE TABLE \`payment_records\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36) NOT NULL,
  \`application_id\` VARCHAR(36),
  \`certificate_id\` VARCHAR(100),
  \`payment_type\` VARCHAR(50) NOT NULL,
  \`amount\` DECIMAL(10,2) NOT NULL,
  \`utr_number\` VARCHAR(100) NOT NULL,
  \`screenshot_url\` TEXT,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
  \`admin_note\` TEXT,
  \`reviewed_by\` VARCHAR(36),
  \`reviewed_at\` DATETIME(3),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_pay_rec_user\` (\`user_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`enrollments\`;\n`;
  out += `CREATE TABLE \`enrollments\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36) NOT NULL,
  \`course_id\` VARCHAR(36) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'enrolled',
  \`progress_percent\` INT NOT NULL DEFAULT 0,
  \`current_topic_id\` VARCHAR(36),
  \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`completed_at\` DATETIME(3),
  \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_user_course\` (\`user_id\`, \`course_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`lesson_progress\`;\n`;
  out += `CREATE TABLE \`lesson_progress\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`enrollment_id\` VARCHAR(36) NOT NULL,
  \`topic_id\` VARCHAR(36) NOT NULL,
  \`completed_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX \`idx_enrollment_topic\` (\`enrollment_id\`, \`topic_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`quiz_attempts\`;\n`;
  out += `CREATE TABLE \`quiz_attempts\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`enrollment_id\` VARCHAR(36) NOT NULL,
  \`score\` INT NOT NULL DEFAULT 0,
  \`total\` INT NOT NULL DEFAULT 100,
  \`passed\` TINYINT(1) NOT NULL DEFAULT 0,
  \`answers\` JSON,
  \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  \`submitted_at\` DATETIME(3),
  INDEX \`idx_quiz_enroll\` (\`enrollment_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  out += `DROP TABLE IF EXISTS \`leaderboard\`;\n`;
  out += `CREATE TABLE \`leaderboard\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36) NOT NULL,
  \`course_id\` VARCHAR(36) NOT NULL,
  \`score\` INT NOT NULL DEFAULT 0,
  \`total\` INT NOT NULL DEFAULT 100,
  \`quiz_attempt_id\` VARCHAR(36),
  \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX \`idx_leaderboard_user\` (\`user_id\`),
  INDEX \`idx_leaderboard_course\` (\`course_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;

  // 3. SEED TASKS 1 to 12 FOR ALL 25 DOMAINS
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 2: COMPLETE DOMAIN TASKS 1 TO 12 FOR ALL 25 DOMAINS\n`;
  out += `-- ==============================================================================\n\n`;

  const tasksMap = new Map(); // key: domain:task_number

  // Read Tasks 1 to 5 from mysql_schema.sql
  const task1to5Regex = /INSERT INTO tasks \(id, domain, task_number, title, description\)\s+VALUES\s*\(([^;]+)\)\s*ON DUPLICATE KEY UPDATE/g;
  let m1;
  while ((m1 = task1to5Regex.exec(baseSchema)) !== null) {
    const lines = m1[1].split("\n");
    for (const l of lines) {
      const rowMatch = l.match(/\('([^']+)',\s*'([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)'\)/);
      if (rowMatch) {
        const [, id, domain, task_num, title, desc] = rowMatch;
        tasksMap.set(`${domain}:${task_num}`, [id, domain, Number(task_num), title, desc, null]);
      }
    }
  }

  // Read Tasks 6 to 12 from migrations-tasks-6-12.sql
  const tasks6to12File = path.join(rootDir, "database", "legacy-migrations", "migrations-tasks-6-12.sql");
  if (fsSync.existsSync(tasks6to12File)) {
    const buf = await fs.readFile(tasks6to12File);
    const text = (buf[0] === 0xff && buf[1] === 0xfe) ? buf.toString("utf16le") : buf.toString("utf8");
    const taskInsertRegex = /INSERT INTO public\.tasks\s*\((domain,\s*task_number,\s*title,\s*description)\)\s*VALUES\s*\('([^']+)',\s*(\d+),\s*'([^']+)',\s*'([^']+)'\)/g;
    let tm;
    while ((tm = taskInsertRegex.exec(text)) !== null) {
      const [, , domain, task_num, title, desc] = tm;
      const key = `${domain}:${task_num}`;
      if (!tasksMap.has(key)) {
        tasksMap.set(key, [crypto.randomUUID(), domain, Number(task_num), title, desc, null]);
      }
    }
  }

  const taskRows = Array.from(tasksMap.values());
  out += formatBatchInsert("tasks", ["id", "domain", "task_number", "title", "description", "resources"], taskRows);
  console.log(`+ Seeded ${taskRows.length} domain tasks (Tasks 1 to 12 across domains).`);

  // 4. SEED ALL 12 COURSES
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 3: ALL 12 COMPLETE COURSES\n`;
  out += `-- ==============================================================================\n\n`;

  const COURSE_META = {
    python: { name: 'Python Programming Masterclass', icon: 'Code2', domain: 'python', difficulty: 'Beginner', duration_weeks: 10, description: 'Learn Python programming from scratch to advanced object-oriented programming, data structures, and automation scripting.' },
    java: { name: 'Java Enterprise Development', icon: 'Monitor', domain: 'java', difficulty: 'Intermediate', duration_weeks: 10, description: 'Master Java core, OOP principles, collections framework, multithreading, and enterprise backend engineering.' },
    html: { name: 'HTML5 Modern Web Architecture', icon: 'Code2', domain: 'html', difficulty: 'Beginner', duration_weeks: 6, description: 'Build responsive, accessible, and semantic web applications with HTML5 and web accessibility standards.' },
    css: { name: 'CSS3 & Responsive Design Mastery', icon: 'Palette', domain: 'css', difficulty: 'Intermediate', duration_weeks: 8, description: 'Style modern websites with Flexbox, CSS Grid, animations, variables, and responsive layout architectures.' },
    javascript: { name: 'Modern JavaScript (ES6+)', icon: 'Brain', domain: 'javascript', difficulty: 'Intermediate', duration_weeks: 10, description: 'Deep dive into modern JavaScript, DOM manipulation, asynchronous programming, closures, and browser APIs.' },
    php: { name: 'PHP & Modern Web Applications', icon: 'Server', domain: 'php', difficulty: 'Intermediate', duration_weeks: 8, description: 'Build dynamic backend web applications with PHP, sessions, MySQL integration, and MVC patterns.' },
    mysql: { name: 'MySQL Relational Database Mastery', icon: 'Database', domain: 'mysql', difficulty: 'Intermediate', duration_weeks: 6, description: 'Master relational database design, complex SQL queries, stored procedures, indexing, and optimization.' },
    django: { name: 'Django Web Framework Bootcamp', icon: 'Server', domain: 'django', difficulty: 'Intermediate', duration_weeks: 8, description: 'Build scalable web applications with Python Django, ORM, REST APIs, authentication, and deployment.' },
    numpy: { name: 'NumPy for Numerical Computing', icon: 'BarChart3', domain: 'numpy', difficulty: 'Intermediate', duration_weeks: 4, description: 'High-performance numerical computing and multi-dimensional array operations with NumPy for data science.' },
    pandas: { name: 'Pandas Data Analysis & Wrangling', icon: 'BarChart3', domain: 'pandas', difficulty: 'Intermediate', duration_weeks: 6, description: 'Master tabular data analysis, cleaning, aggregation, reshaping, and time series manipulation with Pandas.' },
    scipy: { name: 'SciPy Scientific Computing', icon: 'BarChart3', domain: 'scipy', difficulty: 'Advanced', duration_weeks: 4, description: 'Advanced scientific computing, optimization, statistical distributions, and signal processing with SciPy.' },
    matplotlib: { name: 'Matplotlib Data Visualization', icon: 'BarChart3', domain: 'matplotlib', difficulty: 'Intermediate', duration_weeks: 4, description: 'Create production-ready charts, statistical plots, custom subplots, and interactive visual data representations.' },
  };

  const courseIds = new Map();
  const courseRows = [];

  for (const [slug, meta] of Object.entries(COURSE_META)) {
    // Deterministic UUID for course so references match
    const courseId = crypto.createHash("md5").update("course:" + slug).digest("hex");
    const uuid = `${courseId.slice(0,8)}-${courseId.slice(8,12)}-4${courseId.slice(13,16)}-a${courseId.slice(17,20)}-${courseId.slice(20,32)}`;
    courseIds.set(slug, uuid);

    courseRows.push([
      uuid, slug, meta.name, meta.description, meta.icon, meta.domain,
      0, 5, 100, 60, 60, meta.duration_weeks, meta.difficulty, 1
    ]);
  }

  // 5. SEED ALL 435 COURSE TOPICS
  console.log("Reading course topics from course-content/...");
  const topicRows = [];
  const courseTopicCounts = new Map();

  for (const slug of Object.keys(COURSE_META)) {
    const cDir = path.join(courseContentDir, slug);
    if (!fsSync.existsSync(cDir)) continue;

    const files = (await fs.readdir(cDir)).filter(f => f.endsWith(".md"));
    files.sort((a, b) => parseTopicNumber(a) - parseTopicNumber(b));
    courseTopicCounts.set(slug, files.length);

    const cId = courseIds.get(slug);

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const filePath = path.join(cDir, file);
      const rawContent = await fs.readFile(filePath, "utf-8");

      const orderIndex = parseTopicNumber(file);
      const title = parseTopicTitle(rawContent);
      const codeExample = extractCodeExample(rawContent);
      const keyPoints = JSON.stringify(extractKeyPoints(rawContent));
      const topicId = crypto.createHash("md5").update(`topic:${slug}:${orderIndex}`).digest("hex");
      const topicUuid = `${topicId.slice(0,8)}-${topicId.slice(8,12)}-4${topicId.slice(13,16)}-b${topicId.slice(17,20)}-${topicId.slice(20,32)}`;

      topicRows.push([
        topicUuid, cId, orderIndex, title, rawContent, codeExample, keyPoints
      ]);
    }
  }

  // Update total_topics on courses
  for (const row of courseRows) {
    const slug = row[1];
    row[6] = courseTopicCounts.get(slug) || 0;
  }

  out += formatBatchInsert("courses", [
    "id", "slug", "name", "short_description", "icon", "domain",
    "total_topics", "total_tasks", "quiz_marks", "pass_marks", "quiz_duration_min",
    "duration_weeks", "difficulty", "is_published"
  ], courseRows);

  out += `-- ==============================================================================\n`;
  out += `-- SECTION 4: ALL 435 IN-DEPTH COURSE LESSON TOPICS\n`;
  out += `-- ==============================================================================\n\n`;
  out += formatBatchInsert("course_topics", ["id", "course_id", "order_index", "title", "content_md", "code_example", "key_points"], topicRows, 25);
  console.log(`+ Seeded 12 courses and ${topicRows.length} full Markdown lesson topics.`);

  // 6. SEED ALL 1,200 COURSE QUIZ QUESTIONS
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 5: ALL 1,200 INTERACTIVE QUIZ QUESTIONS (100 MCQS PER COURSE)\n`;
  out += `-- ==============================================================================\n\n`;

  const quizFiles = [
    { file: "quiz-python-html-css.json", mapping: { python: "python", html: "html", css: "css" } },
    { file: "quiz-java-js-php.json", mapping: { java: "java", javascript: "javascript", php: "php" } },
    { file: "quiz-mysql-django-numpy.json", mapping: { mysql: "mysql", django: "django", numpy: "numpy" } },
    { file: "quiz-pandas-scipy-matplotlib.json", mapping: { pandas: "pandas", scipy: "scipy", matplotlib: "matplotlib" } },
  ];

  const quizRows = [];
  for (const qf of quizFiles) {
    const qPath = path.join(rootDir, "scripts", qf.file);
    if (!fsSync.existsSync(qPath)) continue;

    const list = JSON.parse(await fs.readFile(qPath, "utf-8"));
    for (let i = 0; i < list.length; i++) {
      const q = list[i];
      const prefix = q.id.split("-")[0];
      const targetSlug = qf.mapping[prefix] || prefix;
      const cId = courseIds.get(targetSlug);
      if (!cId) continue;

      const qId = crypto.createHash("md5").update(`quiz:${q.id}:${i}`).digest("hex");
      const qUuid = `${qId.slice(0,8)}-${qId.slice(8,12)}-4${qId.slice(13,16)}-c${qId.slice(17,20)}-${qId.slice(20,32)}`;

      quizRows.push([
        qUuid, cId, i + 1, q.question, JSON.stringify(q.options),
        Number(q.correct_index), "mcq", Number(q.marks || 2), q.explanation || null
      ]);
    }
  }

  out += formatBatchInsert("course_quiz_questions", [
    "id", "course_id", "order_index", "question", "options", "correct_index", "question_type", "marks", "explanation"
  ], quizRows, 100);
  console.log(`+ Seeded ${quizRows.length} course quiz questions.`);

  // 7. SEED 50 PROJECT CHALLENGES & STUDENT KIT & GUIDANCE
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 6: 50 VERIFIED ENTERPRISE PROJECT CHALLENGES & STUDENT RESOURCES\n`;
  out += `-- ==============================================================================\n\n`;

  const seedScriptContent = await fs.readFile(path.join(rootDir, "scripts", "seed-premium-resources.mjs"), "utf-8");

  // Extract PROJECTS_DATA
  const pMatch = seedScriptContent.match(/const PROJECTS_DATA = (\[[\s\S]*?\]);\s*\/\//);
  if (pMatch) {
    const projects = eval(pMatch[1]);
    const prjRows = projects.map(p => [
      crypto.randomUUID(), p.project_id, p.title, p.industry, p.difficulty,
      p.business_background, p.problem_statement,
      JSON.stringify(typeof p.business_requirements === "string" ? [p.business_requirements] : p.business_requirements),
      JSON.stringify(typeof p.functional_requirements === "string" ? [p.functional_requirements] : p.functional_requirements),
      JSON.stringify(typeof p.technical_requirements === "string" ? [p.technical_requirements] : p.technical_requirements),
      JSON.stringify(typeof p.expected_deliverables === "string" ? [p.expected_deliverables] : p.expected_deliverables),
      null, p.technologies, p.resources, p.min_duration || 3, `tier${p.tier || 1}`, null, 1
    ]);

    out += formatBatchInsert("project_challenges", [
      "id", "project_id", "title", "industry", "difficulty",
      "business_background", "problem_statement", "business_requirements",
      "functional_requirements", "technical_requirements", "expected_deliverables",
      "evaluation_criteria", "technologies", "resources", "min_duration", "tier",
      "submission_deadline", "is_published"
    ], prjRows, 25);
    console.log(`+ Seeded ${prjRows.length} project challenges.`);
  }

  // Extract STUDENT_KIT_DATA
  const kitMatch = seedScriptContent.match(/const STUDENT_KIT_DATA = (\[[\s\S]*?\]);\s*\/\//);
  if (kitMatch) {
    const kit = eval(kitMatch[1]);
    const kitRows = kit.map(k => [
      k.id, k.title, k.category, k.description, k.download_url,
      k.file_type || "PDF", k.file_size || "2 MB", k.min_duration || 3, 1
    ]);
    out += formatBatchInsert("student_kit_items", [
      "id", "title", "category", "description", "download_url", "file_type", "file_size", "min_duration", "is_active"
    ], kitRows);
    console.log(`+ Seeded ${kitRows.length} student kit items.`);
  }

  // Extract GUIDANCE_DATA
  const guideMatch = seedScriptContent.match(/const GUIDANCE_DATA = (\[[\s\S]*?\]);\s*async function/);
  if (guideMatch) {
    const guides = eval(guideMatch[1]);
    const guideRows = guides.map(g => [
      g.id, g.title, g.topic, g.mentor_name, g.schedule_time,
      g.support_channel, g.instructions, g.meeting_link, 1
    ]);
    out += formatBatchInsert("guidance_schedules", [
      "id", "title", "topic", "mentor_name", "schedule_time", "support_channel", "instructions", "meeting_link", "is_active"
    ], guideRows);
    console.log(`+ Seeded ${guideRows.length} guidance schedules.`);
  }

  // 8. RESTORE STUDENTS_MASTER (1,071 users, profiles, roles, students)
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 7: ALL 1,071 STUDENTS & USER ACCOUNTS + ADMIN LOGIN\n`;
  out += `-- ==============================================================================\n\n`;

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
  console.log(`+ Seeded ${usersRows.length} users and student profiles.`);

  // 9. RESTORE APPLICATIONS & REGISTRATIONS (789 RECORDS)
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 8: ALL 789 INTERNSHIP APPLICATIONS & REGISTRATIONS\n`;
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
  console.log(`+ Seeded ${appsRows.length} applications and registrations.`);

  // 10. RESTORE TASK SUBMISSIONS & HISTORY (840 RECORDS)
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 9: ALL 840 TASK SUBMISSIONS & AUDIT HISTORY\n`;
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
  console.log(`+ Seeded ${subsRows.length} submissions and ${histRows.length} audit history logs.`);

  // 11. RESTORE ALL CERTIFICATES
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 10: ALL ISSUED CERTIFICATES (INTERNSHIP, COURSES, PROJECTS)\n`;
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
  console.log(`+ Seeded ${certRows.length + ccRows.length + pcRows.length} certificates.`);

  // 12. RESTORE PAYMENTS
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 11: ALL PAYMENTS & CASHFREE TRANSACTIONS\n`;
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

  // 13. RESTORE EMAIL LOGS, STORAGE FILES & LOGIN SESSIONS
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 12: EMAIL AUDIT LOGS, STORAGE FILES & LOGIN SESSIONS\n`;
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

  // 13B. RESTORE CASHFREE ORDERS, PAYMENT RECORDS, ENROLLMENTS, LESSON PROGRESS & QUIZZES
  if (fsSync.existsSync(path.join(csvDir, "cashfree_orders.csv"))) {
    const cfCsv = await fs.readFile(path.join(csvDir, "cashfree_orders.csv"), "utf-8");
    const cfList = parseCsv(cfCsv);
    const cfRows = [];
    for (const c of cfList) {
      if (!c.id) continue;
      const createdAt = toMysqlDatetime(c.created_at) || "2026-01-01 00:00:00";
      const updatedAt = toMysqlDatetime(c.updated_at) || createdAt;
      const payTime = toMysqlDatetime(c.payment_time);
      cfRows.push([
        c.id, c.order_id, c.user_id || null, (c.customer_name || "").trim(), (c.customer_email || "").trim(),
        (c.customer_phone || "").trim(), c.product_service || "Certificate", c.product_type || "certificate",
        c.entity_id || null, c.amount ? Number(c.amount) : 100.0, c.currency || "INR", c.payment_status || "PENDING",
        c.cashfree_payment_id || null, c.cf_order_id || null, c.payment_session_id || null, c.payment_method || null,
        payTime, c.error_message || null, c.coupon_code || null, c.discount_amount ? Number(c.discount_amount) : 0.0,
        c.raw_response || null, createdAt, updatedAt
      ]);
    }
    out += formatBatchInsert("cashfree_orders", [
      "id", "order_id", "user_id", "customer_name", "customer_email", "customer_phone", "product_service", "product_type",
      "entity_id", "amount", "currency", "payment_status", "cashfree_payment_id", "cf_order_id", "payment_session_id", "payment_method",
      "payment_time", "error_message", "coupon_code", "discount_amount", "raw_response", "created_at", "updated_at"
    ], cfRows);
    console.log(`+ Seeded ${cfRows.length} Cashfree orders.`);
  }

  if (fsSync.existsSync(path.join(csvDir, "payment_records.csv"))) {
    const prCsv = await fs.readFile(path.join(csvDir, "payment_records.csv"), "utf-8");
    const prList = parseCsv(prCsv);
    const prRows = [];
    for (const pr of prList) {
      if (!pr.id) continue;
      const createdAt = toMysqlDatetime(pr.created_at) || "2026-01-01 00:00:00";
      const updatedAt = toMysqlDatetime(pr.updated_at) || createdAt;
      const reviewedAt = toMysqlDatetime(pr.reviewed_at);
      prRows.push([
        pr.id, pr.user_id, pr.application_id || null, pr.certificate_id || null,
        pr.payment_type || "certificate", pr.amount ? Number(pr.amount) : 100.0,
        pr.utr_number || "", pr.screenshot_url || null, pr.status || "approved",
        pr.admin_note || null, pr.reviewed_by || null, reviewedAt, createdAt, updatedAt
      ]);
    }
    out += formatBatchInsert("payment_records", [
      "id", "user_id", "application_id", "certificate_id", "payment_type", "amount",
      "utr_number", "screenshot_url", "status", "admin_note", "reviewed_by", "reviewed_at", "created_at", "updated_at"
    ], prRows);
    console.log(`+ Seeded ${prRows.length} payment audit records.`);
  }

  if (fsSync.existsSync(path.join(csvDir, "enrollments.csv"))) {
    const enCsv = await fs.readFile(path.join(csvDir, "enrollments.csv"), "utf-8");
    const enList = parseCsv(enCsv);
    const enRows = [];
    for (const en of enList) {
      if (!en.id) continue;
      const createdAt = toMysqlDatetime(en.created_at) || "2026-01-01 00:00:00";
      const updatedAt = toMysqlDatetime(en.updated_at) || createdAt;
      const startedAt = toMysqlDatetime(en.started_at) || createdAt;
      const completedAt = toMysqlDatetime(en.completed_at);
      enRows.push([
        en.id, en.user_id, en.course_id, en.status || "completed", en.progress_percent ? Number(en.progress_percent) : 100,
        en.current_topic_id || null, startedAt, completedAt, createdAt, updatedAt
      ]);
    }
    out += formatBatchInsert("enrollments", [
      "id", "user_id", "course_id", "status", "progress_percent", "current_topic_id", "started_at", "completed_at", "created_at", "updated_at"
    ], enRows);
    console.log(`+ Seeded ${enRows.length} course enrollments.`);
  }

  if (fsSync.existsSync(path.join(csvDir, "lesson_progress.csv"))) {
    const lpCsv = await fs.readFile(path.join(csvDir, "lesson_progress.csv"), "utf-8");
    const lpList = parseCsv(lpCsv);
    const lpRows = [];
    for (const lp of lpList) {
      if (!lp.id) continue;
      const completedAt = toMysqlDatetime(lp.completed_at) || "2026-01-01 00:00:00";
      lpRows.push([lp.id, lp.enrollment_id, lp.topic_id, completedAt]);
    }
    out += formatBatchInsert("lesson_progress", ["id", "enrollment_id", "topic_id", "completed_at"], lpRows);
    console.log(`+ Seeded ${lpRows.length} lesson progress records.`);
  }

  if (fsSync.existsSync(path.join(csvDir, "quiz_attempts.csv"))) {
    const qaCsv = await fs.readFile(path.join(csvDir, "quiz_attempts.csv"), "utf-8");
    const qaList = parseCsv(qaCsv);
    const qaRows = [];
    for (const qa of qaList) {
      if (!qa.id) continue;
      const startedAt = toMysqlDatetime(qa.started_at) || "2026-01-01 00:00:00";
      const submittedAt = toMysqlDatetime(qa.submitted_at) || startedAt;
      qaRows.push([
        qa.id, qa.enrollment_id, qa.score ? Number(qa.score) : 100, qa.total ? Number(qa.total) : 100,
        toBoolean(qa.passed), qa.answers || null, startedAt, submittedAt
      ]);
    }
    out += formatBatchInsert("quiz_attempts", [
      "id", "enrollment_id", "score", "total", "passed", "answers", "started_at", "submitted_at"
    ], qaRows);
    console.log(`+ Seeded ${qaRows.length} quiz attempts.`);
  }

  if (fsSync.existsSync(path.join(csvDir, "leaderboard.csv"))) {
    const lbCsv = await fs.readFile(path.join(csvDir, "leaderboard.csv"), "utf-8");
    const lbList = parseCsv(lbCsv);
    const lbRows = [];
    for (const lb of lbList) {
      if (!lb.id) continue;
      const updatedAt = toMysqlDatetime(lb.updated_at) || "2026-01-01 00:00:00";
      lbRows.push([
        lb.id, lb.user_id, lb.course_id, lb.score ? Number(lb.score) : 100, lb.total ? Number(lb.total) : 100,
        lb.quiz_attempt_id || null, updatedAt
      ]);
    }
    out += formatBatchInsert("leaderboard", [
      "id", "user_id", "course_id", "score", "total", "quiz_attempt_id", "updated_at"
    ], lbRows);
    console.log(`+ Seeded ${lbRows.length} leaderboard records.`);
  }

  // 14. ADMIN ACCOUNT ENFORCEMENT & HIGH-PERFORMANCE INDEXING
  out += `-- ==============================================================================\n`;
  out += `-- SECTION 13: SOLE ADMIN ACCOUNT ENFORCEMENT & HIGH-PERFORMANCE INDEXES\n`;
  out += `-- ==============================================================================\n\n`;

  out += `-- 1. Ensure sole admin has role 'admin'\n`;
  out += `INSERT INTO \`user_roles\` (\`id\`, \`user_id\`, \`role\`, \`created_at\`)\n`;
  out += `VALUES (UUID(), '15430c49-f28f-459e-ba3f-411b18519445', 'admin', NOW())\n`;
  out += `ON DUPLICATE KEY UPDATE \`role\` = 'admin';\n\n`;

  out += `-- 2. Revoke any accidental admin roles\n`;
  out += `DELETE FROM \`user_roles\` WHERE \`user_id\` != '15430c49-f28f-459e-ba3f-411b18519445' AND \`role\` = 'admin';\n\n`;



  out += `SET FOREIGN_KEY_CHECKS = 1;\n\n`;
  out += `-- ==============================================================================\n`;
  out += `-- END OF TOTAL WEBSITE MASTER DUMP — EVERYTHING IS READY FOR PRODUCTION!\n`;
  out += `-- ==============================================================================\n`;

  // Write file to both destinations
  const totalMasterFile = path.join(rootDir, "skyrovix_total_website_master.sql");
  const totalMasterDbFile = path.join(rootDir, "database", "skyrovix_total_website_master.sql");

  await fs.writeFile(totalMasterFile, out, "utf-8");
  await fs.writeFile(totalMasterDbFile, out, "utf-8");

  const stat = await fs.stat(totalMasterFile);
  console.log(`\n🎉 TOTAL WEBSITE MASTER SQL DUMP GENERATED SUCCESSFULLY!`);
  console.log(`📍 File: ${totalMasterFile}`);
  console.log(`📦 Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📚 Courses: ${courseRows.length}`);
  console.log(`📖 Course Topics (Lessons): ${topicRows.length}`);
  console.log(`❓ Quiz Questions: ${quizRows.length}`);
  console.log(`🎯 Domain Tasks: ${taskRows.length}`);
  console.log(`🚀 Project Challenges: 50`);
  console.log(`👥 Students / Users: ${usersRows.length}`);
  console.log(`📝 Applications: ${appsRows.length}`);
  console.log(`📤 Submissions: ${subsRows.length}`);
  console.log(`🏆 Certificates: ${certRows.length + ccRows.length + pcRows.length}`);
  console.log(`💳 Payments: ${payRows.length}`);
}

main().catch((err) => {
  console.error("❌ Generator failed:", err);
  process.exit(1);
});
