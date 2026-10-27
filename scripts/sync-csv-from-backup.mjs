import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

// RFC-4180 CSV parser
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

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));
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
  return { headers, rows: data };
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function stringifyCsv(headers, data) {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of data) {
    lines.push(headers.map(h => escapeCsvField(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

export async function syncAllBackupCsvs() {
  const rootDir = process.cwd();
  const backupDir = path.join(rootDir, "database", "skyrovix_all_csv_backup_2026-10-26");
  const targetDir = path.join(rootDir, "database", "csv");
  const rawDir = path.join(backupDir, "8_all_database_tables_raw");

  if (!fsSync.existsSync(backupDir)) {
    throw new Error(`Backup folder not found at: ${backupDir}`);
  }

  await fs.mkdir(targetDir, { recursive: true });
  console.log("🚀 Syncing and standardizing CSV backup files from:", backupDir);
  console.log("🎯 Target directory:", targetDir);

  // 1. Load auth password hashes from auth_users.csv
  const authUsersPath = path.join(rawDir, "auth_users.csv");
  const authUsersData = parseCsv(await fs.readFile(authUsersPath, "utf-8"));
  const passwordMap = new Map();

  for (const u of authUsersData.rows) {
    if (u.id && u.encrypted_password) {
      passwordMap.set(u.id, u.encrypted_password);
    }
    if (u.email && u.encrypted_password) {
      passwordMap.set(u.email.trim().toLowerCase(), u.encrypted_password);
    }
  }
  console.log(`🔑 Loaded ${passwordMap.size / 2} user password hashes from auth_users.csv`);

  // 2. Prepare students_master.csv with actual passwords
  const studentsMasterPath = path.join(backupDir, "1_students_data", "students_master_complete.csv");
  const studentsData = parseCsv(await fs.readFile(studentsMasterPath, "utf-8"));
  
  const enrichedStudents = studentsData.rows.map(s => {
    const studentId = s.student_id;
    const email = (s.email || "").trim().toLowerCase();
    const hash = passwordMap.get(studentId) || passwordMap.get(email) || "";
    return {
      ...s,
      encrypted_password_hash: hash,
    };
  });

  const studentHeaders = [...studentsData.headers];
  if (!studentHeaders.includes("encrypted_password_hash")) {
    studentHeaders.push("encrypted_password_hash");
  }

  await fs.writeFile(
    path.join(targetDir, "students_master.csv"),
    stringifyCsv(studentHeaders, enrichedStudents),
    "utf-8"
  );
  console.log(`✅ students_master.csv: ${enrichedStudents.length} students with auth hashes`);

  // 3. File mapping definitions: prefer raw relational tables where exact FKs (like enrollment_id) are critical
  const copyMappings = [
    { src: path.join(rawDir, "public_applications.csv"), dest: "applications.csv" },
    { src: path.join(rawDir, "public_tasks.csv"), dest: "tasks.csv" },
    { src: path.join(backupDir, "2_task_and_all_submissions", "task_submissions_master.csv"), dest: "task_submissions.csv" },
    { src: path.join(rawDir, "public_submission_history.csv"), dest: "submission_history.csv" },
    { src: path.join(backupDir, "3_certificates_issued", "internship_certificates_master.csv"), dest: "certificates_issued.csv" },
    { src: path.join(rawDir, "public_course_certificates.csv"), dest: "course_certificates.csv" },
    { src: path.join(rawDir, "public_project_certificates.csv"), dest: "project_certificates.csv" },
    { src: path.join(rawDir, "public_payments.csv"), dest: "payments.csv" },
    { src: path.join(rawDir, "public_payment_records.csv"), dest: "payment_records.csv" },
    { src: path.join(rawDir, "public_cashfree_orders.csv"), dest: "cashfree_orders.csv" },
    { src: path.join(rawDir, "public_fee_settings.csv"), dest: "fee_settings.csv" },
    { src: path.join(rawDir, "public_coupons.csv"), dest: "coupons.csv" },
    { src: path.join(rawDir, "public_coupon_redemptions.csv"), dest: "coupon_redemptions.csv" },
    { src: path.join(rawDir, "public_fee_audit_logs.csv"), dest: "fee_audit_logs.csv" },
    { src: path.join(rawDir, "public_reviews.csv"), dest: "reviews.csv" },
    { src: path.join(rawDir, "public_login_sessions.csv"), dest: "login_sessions.csv" },
    { src: path.join(rawDir, "public_email_logs.csv"), dest: "email_logs.csv" },
    { src: path.join(backupDir, "7_analytics_and_logs", "storage_files_catalog.csv"), dest: "storage_files_index.csv" },
    { src: path.join(rawDir, "public_leaderboard.csv"), dest: "leaderboard.csv" },
    { src: path.join(rawDir, "public_enrollments.csv"), dest: "enrollments.csv" },
    { src: path.join(rawDir, "public_lesson_progress.csv"), dest: "lesson_progress.csv" },
    { src: path.join(rawDir, "public_quiz_attempts.csv"), dest: "quiz_attempts.csv" },
    { src: path.join(rawDir, "public_project_challenges.csv"), dest: "project_challenges.csv" },
    { src: path.join(rawDir, "public_project_submissions.csv"), dest: "project_submissions.csv" },
    { src: path.join(rawDir, "public_project_evaluations.csv"), dest: "project_evaluations.csv" },
    { src: path.join(rawDir, "public_promotional_popups.csv"), dest: "promotional_popups.csv" },
  ];

  for (const m of copyMappings) {
    if (fsSync.existsSync(m.src)) {
      await fs.copyFile(m.src, path.join(targetDir, m.dest));
      const text = await fs.readFile(m.src, "utf-8");
      const rows = text.split("\n").filter(l => l.trim().length > 0).length - 1;
      console.log(`📋 Copied ${m.dest.padEnd(25)} (${rows} rows)`);
    } else {
      console.warn(`⚠️ Warning: Source file missing: ${m.src}`);
    }
  }

  console.log("\n🎉 All 25 database CSV files synchronized and prepared successfully in database/csv/!");
}

// Run directly if invoked
if (process.argv[1] && process.argv[1].endsWith("sync-csv-from-backup.mjs")) {
  syncAllBackupCsvs().catch(err => {
    console.error("❌ CSV Sync failed:", err);
    process.exit(1);
  });
}
