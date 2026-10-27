import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2/promise";
import JSZip from "jszip";

// Load .env manually if available
try {
  if (fsSync.existsSync(".env")) {
    const envContent = fsSync.readFileSync(".env", "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const parts = trimmed.split("=");
      const key = parts[0].trim().replace(/^export\s+/, "");
      let val = parts.slice(1).join("=").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
} catch {}

const ALL_TABLES = [
  "users",
  "user_roles",
  "profiles",
  "admins",
  "batches",
  "courses",
  "course_topics",
  "course_tasks",
  "course_quiz_questions",
  "course_certificates",
  "course_task_submissions",
  "tasks",
  "guidance_schedules",
  "training_modules",
  "training_submissions",
  "applications",
  "registrations",
  "students",
  "student_tasks",
  "student_kit_items",
  "enrollments",
  "lesson_progress",
  "submissions",
  "submission_history",
  "quiz_attempts",
  "payments",
  "payment_records",
  "payment_events",
  "cashfree_orders",
  "certificates",
  "offer_letters",
  "coupons",
  "coupon_redemptions",
  "fee_settings",
  "fee_audit_logs",
  "intern_workflows",
  "internship_domain_tasks",
  "audit_logs",
  "notifications",
  "notification_recipients",
  "announcements",
  "system_logs",
  "topic_quiz_questions",
  "topic_quiz_attempts",
  "bookmarks",
  "notes",
  "achievement_definitions",
  "achievements",
  "leaderboard",
  "promotions",
  "promo_popups",
  "email_templates",
  "email_logs",
];

function toCsvValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "object") {
    const s = JSON.stringify(val);
    return `"${s.replace(/"/g, '""')}"`;
  }
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

async function main() {
  console.log("=================================================");
  console.log("   Skyrovix All Data CSV Backup Generator       ");
  console.log("   Target Database: skyrovix_main_db            ");
  console.log("=================================================");

  const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQL_USER || process.env.DB_USER || "root";
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || "skyrovix_main_db";

  if (database === "skyrovix") {
    throw new Error("SAFETY VIOLATION: Never connect to 'skyrovix'. Must use 'skyrovix_main_db'.");
  }

  console.log(`Connecting to MySQL ${user}@${host}:${port}/${database}...`);
  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      dateStrings: true,
    });
  } catch (err) {
    // If port 3306 failed on local machine, try 3307
    if (err.code === "ECONNREFUSED" && (host === "127.0.0.1" || host === "localhost") && port !== 3307) {
      console.log(`Connection refused on port ${port}, trying port 3307...`);
      conn = await mysql.createConnection({
        host,
        port: 3307,
        user,
        password,
        database,
        dateStrings: true,
      });
    } else {
      throw err;
    }
  }

  console.log("Database connected successfully.\n");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupId = `csv-backup-${Date.now()}`;
  const zipFilename = `skyrovix-all-data-csv-${timestamp}.zip`;

  const backupDir = path.resolve(process.cwd(), "public", "uploads", "backups", backupId);
  const rawCsvDir = path.resolve(process.cwd(), "database", `csv-backup-${timestamp}`);

  await fs.mkdir(backupDir, { recursive: true });
  await fs.mkdir(rawCsvDir, { recursive: true });

  const zip = new JSZip();
  const tableStats = {};
  let totalRows = 0;

  console.log(`Exporting ${ALL_TABLES.length} tables to CSV...`);

  for (const table of ALL_TABLES) {
    try {
      const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
      const count = rows ? rows.length : 0;
      tableStats[table] = count;
      totalRows += count;

      let csvContent = "";
      if (count > 0) {
        const headers = Object.keys(rows[0]);
        const lines = [headers.join(",")];
        for (const row of rows) {
          const line = headers.map((h) => toCsvValue(row[h])).join(",");
          lines.push(line);
        }
        csvContent = lines.join("\r\n");
      }

      // Add to ZIP
      zip.file(`${table}.csv`, csvContent);

      // Also save raw CSV to database/csv-backup-<timestamp>/
      await fs.writeFile(path.join(rawCsvDir, `${table}.csv`), csvContent, "utf-8");

      console.log(`  ✓ [${table}] -> ${count} rows`);
    } catch (e) {
      console.warn(`  ⚠ [${table}] skipped: ${e.message}`);
    }
  }

  await conn.end();

  // Add summary readme to zip
  const readmeContent = `# Skyrovix All Data CSV Backup
- Generated: ${new Date().toISOString()}
- Backup ID: ${backupId}
- Total Tables: ${Object.keys(tableStats).length}
- Total Rows: ${totalRows}
- Host: ${host}
- Database: ${database}

This archive contains complete data exports formatted in RFC-4180 CSV standard.
Can be imported directly into MySQL or restored via the Skyrovix Admin Dashboard.
`;
  zip.file("README.md", readmeContent);

  console.log("\nGenerating ZIP compressed archive...");
  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilePath = path.join(backupDir, zipFilename);
  await fs.writeFile(zipFilePath, zipBuffer);
  const zipSize = zipBuffer.length;

  console.log(`✓ CSV Backup ZIP created: ${zipFilePath} (${formatBytes(zipSize)})`);
  console.log(`✓ Raw CSV files saved to: ${rawCsvDir}`);

  // Register in public/uploads/backups/backup-index.json
  const backupsDir = path.resolve(process.cwd(), "public", "uploads", "backups");
  const indexFile = path.join(backupsDir, "backup-index.json");
  const auditFile = path.join(backupsDir, "audit-log.jsonl");

  let backups = [];
  try {
    const raw = await fs.readFile(indexFile, "utf-8");
    backups = JSON.parse(raw);
  } catch {}

  const backupRecord = {
    id: backupId,
    name: zipFilename,
    type: "csv",
    size: zipSize,
    status: "completed",
    created_by: "system",
    created_by_name: "Contabo VPS Script",
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    storage_path: `${backupId}/${zipFilename}`,
    tables_count: Object.keys(tableStats).length,
  };

  backups.unshift(backupRecord);
  await fs.writeFile(indexFile, JSON.stringify(backups, null, 2), "utf-8");

  // Audit log entry
  const auditEntry = JSON.stringify({
    action: "backup_created",
    resource: "csv",
    details: `Created all data CSV backup via VPS script: ${zipFilename} (${formatBytes(zipSize)}, ${totalRows} rows across ${Object.keys(tableStats).length} tables)`,
    user: "System (Contabo VPS Script)",
    timestamp: new Date().toISOString(),
  }) + "\n";

  await fs.appendFile(auditFile, auditEntry, "utf-8");

  console.log("\n=================================================");
  console.log("   BACKUP COMPLETED SUCCESSFULLY!                ");
  console.log(`   - Archive: ${zipFilename}`);
  console.log(`   - Total Tables: ${Object.keys(tableStats).length}`);
  console.log(`   - Total Records: ${totalRows}`);
  console.log(`   - Size: ${formatBytes(zipSize)}`);
  console.log(`   - Dashboard View: https://skyrovix.in/admin`);
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
