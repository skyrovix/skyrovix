import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";
import { dbQuery, getDbPool } from "./db.server";

export type BackupType = "database" | "csv" | "files" | "full";
export type BackupStatus = "running" | "completed" | "failed";

export interface BackupRecord {
  id: string;
  name: string;
  type: BackupType;
  size: number;
  status: BackupStatus;
  created_by: string;
  created_by_name: string;
  created_at: string;
  completed_at?: string;
  storage_path: string;
  error?: string;
  tables_count?: number;
  files_count?: number;
}

export interface AuditEntry {
  action: string;
  resource: string;
  details: string;
  user: string;
  timestamp: string;
}

const BACKUPS_DIR = path.resolve(process.cwd(), "public", "uploads", "backups");
const UPLOADS_ROOT = path.resolve(process.cwd(), "public", "uploads");
const INDEX_FILE = path.join(BACKUPS_DIR, "backup-index.json");
const AUDIT_FILE = path.join(BACKUPS_DIR, "audit-log.jsonl");
const CONFIG_FILE = path.join(BACKUPS_DIR, "auto-backup-config.json");

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
  "leaderboard",
  "linkedin_submissions",
  "login_sessions",
  "email_logs",
  "notifications",
  "user_notifications",
  "promotional_popups",
  "project_challenges",
  "project_submissions",
  "project_evaluations",
  "project_awards",
  "project_certificates",
  "reviews",
  "support_tickets",
  "support_replies",
  "settings",
  "audit_logs",
] as const;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function isoNow() {
  return new Date().toISOString();
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

async function ensureBackupsDir() {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
}

async function getBackupIndex(): Promise<BackupRecord[]> {
  try {
    await ensureBackupsDir();
    const text = await fs.readFile(INDEX_FILE, "utf-8");
    return JSON.parse(text || "[]");
  } catch {
    return [];
  }
}

async function saveBackupIndex(backups: BackupRecord[]) {
  await ensureBackupsDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(backups, null, 2), "utf-8");
}

async function appendAuditLog(entry: AuditEntry) {
  try {
    await ensureBackupsDir();
    await fs.appendFile(AUDIT_FILE, JSON.stringify(entry) + "\n", "utf-8");
  } catch (e) {
    console.warn("[Backup] Audit log append failed:", e);
  }
}

function escapeSql(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") return String(val);
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
  }
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
  }
  return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

async function generateSqlDump(): Promise<string> {
  const lines: string[] = [];
  lines.push("-- Skyrovix Database Backup");
  lines.push(`-- Generated: ${isoNow()}`);
  lines.push("-- Database: MySQL");
  lines.push("");
  lines.push("SET FOREIGN_KEY_CHECKS = 0;");
  lines.push("SET SQL_MODE = '';");
  lines.push("");

  for (const table of ALL_TABLES) {
    try {
      const res = await dbQuery<any>(`SELECT * FROM \`${table}\``);
      const rows = res.rows || [];
      if (rows.length === 0) continue;

      lines.push(`-- Table: ${table} (${rows.length} rows)`);
      lines.push(`DELETE FROM \`${table}\`;`);

      for (const row of rows) {
        const keys = Object.keys(row);
        const values = keys.map((k) => escapeSql(row[k]));
        lines.push(`INSERT INTO \`${table}\` (\`${keys.join("`, `")}\`) VALUES (${values.join(", ")});`);
      }
      lines.push("");
    } catch (e: any) {
      lines.push(`-- Notice on table ${table}: ${e.message}`);
      lines.push("");
    }
  }

  lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  lines.push("-- End of backup");
  return lines.join("\n");
}

async function getAllUploadFiles(): Promise<string[]> {
  const files: string[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "backups") continue; // Never zip existing backup archives
        await walk(full);
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
  }
  await walk(UPLOADS_ROOT);
  return files;
}

async function createFilesZip(): Promise<ArrayBuffer> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const filePaths = await getAllUploadFiles();

  for (const filePath of filePaths) {
    try {
      const rel = path.relative(UPLOADS_ROOT, filePath).replace(/\\/g, "/");
      const content = await fs.readFile(filePath);
      zip.file("uploads/" + rel, content);
    } catch {}
  }

  const blob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return blob.buffer.slice(0) as ArrayBuffer;
}

async function createFullZip(sqlContent: string, backupId: string): Promise<{ buffer: ArrayBuffer; size: number }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file("database.sql", sqlContent);

  const filePaths = await getAllUploadFiles();
  for (const filePath of filePaths) {
    try {
      const rel = path.relative(UPLOADS_ROOT, filePath).replace(/\\/g, "/");
      const content = await fs.readFile(filePath);
      zip.file("uploads/" + rel, content);
    } catch {}
  }

  zip.file("metadata.json", JSON.stringify({
    id: backupId,
    created_at: isoNow(),
    type: "full",
    platform: "Skyrovix",
    version: "1.0",
  }, null, 2));

  zip.file("settings.json", JSON.stringify({
    backupId,
    createdAt: isoNow(),
    version: "1.0",
    platform: "Skyrovix",
  }, null, 2));

  const blob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return { buffer: blob.buffer.slice(0) as ArrayBuffer, size: blob.byteLength };
}

function toCsvValue(val: any): string {
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

async function createCsvZip(backupId: string): Promise<{ buffer: ArrayBuffer; size: number; tableStats: Record<string, number> }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const tableStats: Record<string, number> = {};

  for (const table of ALL_TABLES) {
    try {
      const res = await dbQuery<any>(`SELECT * FROM \`${table}\``);
      const rows = res.rows || [];
      tableStats[table] = rows.length;

      if (rows.length === 0) {
        zip.file(`${table}.csv`, "");
        continue;
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [headers.join(",")];

      for (const row of rows) {
        const line = headers.map((h) => toCsvValue(row[h])).join(",");
        csvLines.push(line);
      }

      zip.file(`${table}.csv`, csvLines.join("\r\n"));
    } catch (e: any) {
      console.warn(`[CSV Backup] Table ${table} skip:`, e.message);
    }
  }

  zip.file("README_CSV_BACKUP.md", `# Skyrovix Complete Database CSV Backup
- Backup ID: ${backupId}
- Export Date: ${isoNow()}
- Tables Backed Up: ${Object.keys(tableStats).length}
- Target: Full Data Records Export for Contabo VPS
`);

  const blob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return { buffer: blob.buffer.slice(0) as ArrayBuffer, size: blob.byteLength, tableStats };
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[][] = [];
  let current: string[] = [];
  let val = "";
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (insideQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        val += ch;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
      } else if (ch === ",") {
        current.push(val.trim());
        val = "";
      } else if (ch === "\r") {
        if (i + 1 < text.length && text[i + 1] === "\n") i++;
        current.push(val.trim());
        lines.push(current);
        current = [];
        val = "";
      } else if (ch === "\n") {
        current.push(val.trim());
        lines.push(current);
        current = [];
        val = "";
      } else {
        val += ch;
      }
    }
  }
  if (val || current.length > 0) {
    current.push(val.trim());
    lines.push(current);
  }
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].map((h) => h.replace(/^"|"$/g, "").trim());
  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    if (row.length === 1 && !row[0]) continue;
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] !== undefined ? row[c] : "";
    }
    rows.push(obj);
  }
  return { headers, rows };
}

async function executeCsvRestore(zip: any): Promise<{ executed: number; tableStats: Record<string, number> }> {
  const pool = getDbPool();
  const conn = await pool.getConnection();
  let executed = 0;
  const tableStats: Record<string, number> = {};

  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

    const csvFiles = zip.file(/\.csv$/i);
    for (const file of csvFiles) {
      const tableName = path.basename(file.name, ".csv");
      const csvText = await file.async("string");
      const { headers, rows } = parseCsv(csvText);
      if (rows.length === 0 || headers.length === 0) continue;

      const cols = headers.map((h) => `\`${h}\``).join(", ");
      for (const row of rows) {
        const placeholders = headers.map(() => "?").join(", ");
        const values = headers.map((h) => {
          const v = row[h];
          if (v === "" || v === "NULL" || v === null || v === undefined) return null;
          return v;
        });
        try {
          await conn.query(`REPLACE INTO \`${tableName}\` (${cols}) VALUES (${placeholders})`, values);
          executed++;
        } catch {
          // ignore column mismatch
        }
      }
      tableStats[tableName] = rows.length;
    }
  } finally {
    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
    conn.release();
  }
  return { executed, tableStats };
}

function splitSqlStatements(sqlContent: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sqlContent.length; i++) {
    const ch = sqlContent[i];
    const nextCh = sqlContent[i + 1] || "";

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (ch === "*" && nextCh === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (!inString) {
      if (ch === "-" && nextCh === "-") {
        inLineComment = true;
        i++;
        continue;
      }
      if (ch === "/" && nextCh === "*") {
        inBlockComment = true;
        i++;
        continue;
      }
      if (ch === "'") {
        inString = true;
        current += ch;
        continue;
      }
      if (ch === ";") {
        const trimmed = current.trim();
        if (trimmed) statements.push(trimmed);
        current = "";
        continue;
      }
    } else {
      if (ch === "'") {
        if (nextCh === "'") {
          current += "''";
          i++;
          continue;
        }
        inString = false;
      }
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed) statements.push(trimmed);
  return statements;
}

async function executeSqlRestore(sqlContent: string): Promise<{ executed: number; failed: number; tableStats: Record<string, number> }> {
  const pool = getDbPool();
  const conn = await pool.getConnection();

  let executed = 0;
  let failed = 0;
  const tableStats: Record<string, number> = {};

  try {
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");
    await conn.query("SET SQL_MODE = 'NO_BACKSLASH_ESCAPES';");

    const statements = splitSqlStatements(sqlContent);

    for (const rawStmt of statements) {
      let stmt = rawStmt.trim();
      if (!stmt) continue;

      // Skip harmless PG directives and comments
      if (
        /^SET\s+(statement_timeout|client_encoding|standard_conforming_strings)/i.test(stmt) ||
        /^SELECT\s+pg_catalog/i.test(stmt)
      ) {
        continue;
      }

      // Remove PostgreSQL "public." schema prefix: "public.users" -> "users"
      stmt = stmt.replace(/\bpublic\.([a-zA-Z0-9_`]+)/gi, "$1");

      // Replace PostgreSQL boolean true/false outside quotes if necessary
      let isInsert = false;
      let targetTable = "unknown";

      if (/^INSERT\s+INTO/i.test(stmt)) {
        isInsert = true;
        const match = stmt.match(/^INSERT\s+INTO\s+[`"]?([a-zA-Z0-9_]+)[`"]?/i);
        if (match) targetTable = match[1];
        // Use REPLACE INTO so that existing IDs and primary keys are smoothly updated
        stmt = stmt.replace(/^INSERT\s+INTO/i, "REPLACE INTO");
      } else if (/^DELETE\s+FROM/i.test(stmt)) {
        const match = stmt.match(/^DELETE\s+FROM\s+[`"]?([a-zA-Z0-9_]+)[`"]?/i);
        if (match) targetTable = match[1];
      }

      try {
        await conn.query(stmt);
        executed++;
        if (isInsert && targetTable !== "unknown") {
          tableStats[targetTable] = (tableStats[targetTable] || 0) + 1;
        }
      } catch (stmtErr: any) {
        failed++;
        if (isInsert) {
          try {
            const fallback = stmt.replace(/^REPLACE\s+INTO/i, "INSERT IGNORE INTO");
            await conn.query(fallback);
            executed++;
            failed--;
            tableStats[targetTable] = (tableStats[targetTable] || 0) + 1;
          } catch {}
        }
      }
    }

    // Post-import sync: align profiles and user_roles for all users
    try {
      await conn.query(`
        INSERT IGNORE INTO profiles (id, full_name, created_at, updated_at)
        SELECT id, COALESCE(full_name, SUBSTRING_INDEX(email, '@', 1)), NOW(), NOW()
        FROM users
        WHERE id NOT IN (SELECT id FROM profiles)
      `);
      await conn.query(`
        INSERT IGNORE INTO user_roles (id, user_id, role, created_at)
        SELECT UUID(), id, 'student', NOW()
        FROM users
        WHERE id NOT IN (SELECT user_id FROM user_roles)
      `);
    } catch {}

    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
  } finally {
    conn.release();
  }

  return { executed, failed, tableStats };
}

// ─── Server Functions ─────────────────────────────────────────

export const createBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { type: BackupType; userEmail: string; userName: string })
  .handler(async ({ data }): Promise<BackupRecord> => {
    const { type, userEmail, userName } = data;
    const id = generateId();
    const ts = timestamp();
    const now = isoNow();

    await ensureBackupsDir();
    const backupFolder = path.join(BACKUPS_DIR, id);
    await fs.mkdir(backupFolder, { recursive: true });

    let name = "";
    let storagePath = "";
    let size = 0;

    const record: BackupRecord = {
      id,
      name: "",
      type,
      size: 0,
      status: "running",
      created_by: userEmail,
      created_by_name: userName,
      created_at: now,
      storage_path: "",
    };

    try {
      if (type === "database") {
        name = `database-${ts}.sql`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const sql = await generateSqlDump();
        const fullFilePath = path.join(backupFolder, name);
        await fs.writeFile(fullFilePath, sql, "utf-8");
        const stat = await fs.stat(fullFilePath);
        size = stat.size;
        record.tables_count = ALL_TABLES.length;
      } else if (type === "csv") {
        name = `skyrovix-all-data-csv-${ts}.zip`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const { buffer: csvBuf, size: csvSize, tableStats } = await createCsvZip(id);
        const fullFilePath = path.join(backupFolder, name);
        await fs.writeFile(fullFilePath, Buffer.from(csvBuf));
        size = csvSize;
        record.tables_count = Object.keys(tableStats).length;
      } else if (type === "files") {
        name = `uploads-${ts}.zip`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const buf = await createFilesZip();
        const fullFilePath = path.join(backupFolder, name);
        await fs.writeFile(fullFilePath, Buffer.from(buf));
        size = buf.byteLength;
      } else {
        name = `skyrovix-backup-${ts}.zip`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const sql = await generateSqlDump();
        const { buffer: fullBuf, size: fullSize } = await createFullZip(sql, id);
        const fullFilePath = path.join(backupFolder, name);
        await fs.writeFile(fullFilePath, Buffer.from(fullBuf));
        size = fullSize;
        record.tables_count = ALL_TABLES.length;
      }

      record.status = "completed";
      record.size = size;
      record.completed_at = isoNow();

      const backups = await getBackupIndex();
      backups.unshift(record);
      await saveBackupIndex(backups);

      await appendAuditLog({
        action: "backup_created",
        resource: type,
        details: `Created ${type} backup: ${name} (${formatBytes(size)})`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });
    } catch (e: any) {
      console.error("[Create Backup Error]:", e);
      record.status = "failed";
      record.error = e.message;
      record.completed_at = isoNow();

      const backups = await getBackupIndex();
      backups.unshift(record);
      await saveBackupIndex(backups);

      await appendAuditLog({
        action: "backup_failed",
        resource: type,
        details: `Failed to create ${type} backup: ${e.message}`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });
    }

    return record;
  });

export const getBackups = createServerFn({ method: "GET" })
  .handler(async (): Promise<BackupRecord[]> => {
    return getBackupIndex();
  });

export const deleteBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { backupId: string; userEmail: string; userName: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const { backupId, userEmail, userName } = data;

    try {
      const backups = await getBackupIndex();
      const idx = backups.findIndex((b) => b.id === backupId);
      if (idx === -1) return { success: false, error: "Backup not found" };

      const backup = backups[idx];
      const folderPath = path.resolve(BACKUPS_DIR, backup.id);
      try {
        await fs.rm(folderPath, { recursive: true, force: true });
      } catch {}

      backups.splice(idx, 1);
      await saveBackupIndex(backups);

      await appendAuditLog({
        action: "backup_deleted",
        resource: backup.type,
        details: `Deleted backup: ${backup.name} (${formatBytes(backup.size)})`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

export const restoreBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { backupId: string; userEmail: string; userName: string; safetyBackupId: string; restoreDb?: boolean; restoreFiles?: boolean })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string; details?: string }> => {
    const { backupId, userEmail, userName, restoreDb = true, restoreFiles = true } = data;

    try {
      const backups = await getBackupIndex();
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) return { success: false, error: "Backup not found" };

      const fullFilePath = path.resolve(BACKUPS_DIR, backup.storage_path);
      let buffer: Buffer;
      try {
        buffer = await fs.readFile(fullFilePath);
      } catch {
        return { success: false, error: `Backup file not found on disk: ${backup.storage_path}` };
      }

      let restoredRecords = 0;
      let restoredFiles = 0;

      if (backup.type === "database" || backup.storage_path.endsWith(".sql")) {
        const sql = buffer.toString("utf-8");
        const { executed, tableStats } = await executeSqlRestore(sql);
        restoredRecords = Object.values(tableStats).reduce((a, b) => a + b, 0) || executed;
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(buffer);

        if (restoreDb) {
          let sqlZipEntry = zip.file("database.sql");
          if (!sqlZipEntry) {
            const sqlFiles = zip.file(/\.sql$/i);
            if (sqlFiles && sqlFiles.length > 0) sqlZipEntry = sqlFiles[0];
          }
          if (sqlZipEntry) {
            const sql = await sqlZipEntry.async("string");
            const { executed, tableStats } = await executeSqlRestore(sql);
            restoredRecords = Object.values(tableStats).reduce((a, b) => a + b, 0) || executed;
          } else {
            const csvFiles = zip.file(/\.csv$/i);
            if (csvFiles && csvFiles.length > 0) {
              const { executed, tableStats } = await executeCsvRestore(zip);
              restoredRecords = Object.values(tableStats).reduce((a, b) => a + b, 0) || executed;
            }
          }
        }

        if (restoreFiles) {
          const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadsDir, { recursive: true });

          const entries: { relPath: string; file: any }[] = [];
          zip.forEach((relPath, file) => {
            if (!file.dir && !relPath.endsWith(".sql") && !relPath.endsWith(".json")) {
              entries.push({ relPath, file });
            }
          });

          for (const { relPath, file } of entries) {
            try {
              const cleanRel = relPath.replace(/^uploads\//i, "");
              const targetPath = path.resolve(uploadsDir, cleanRel);
              if (targetPath.startsWith(uploadsDir)) {
                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                const content = await file.async("nodebuffer");
                await fs.writeFile(targetPath, content);
                restoredFiles++;
              }
            } catch {}
          }
        }
      }

      const details = `Restored ${restoredRecords} records and ${restoredFiles} files from "${backup.name}"`;
      await appendAuditLog({
        action: "restore_completed",
        resource: backup.type,
        details,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });

      return { success: true, details };
    } catch (e: any) {
      await appendAuditLog({
        action: "restore_failed",
        resource: "full",
        details: `Restore failed: ${e.message}`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });
      return { success: false, error: e.message };
    }
  });

export const validateBackupFile = createServerFn({ method: "POST" })
  .validator((d: any) => d as { fileName: string; fileBase64: string })
  .handler(async ({ data }): Promise<{ valid: boolean; error?: string; info?: { type: string; hasDb: boolean; hasFiles: boolean; fileCount: number; size: number } }> => {
    try {
      const buffer = Buffer.from(data.fileBase64, "base64");
      const size = buffer.length;
      const lowerName = data.fileName.toLowerCase();
      const isZip = lowerName.endsWith(".zip") || (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b);
      const isSql = lowerName.endsWith(".sql");

      if (!isZip && !isSql) return { valid: false, error: "Only .zip and .sql files are supported" };
      if (size > 500 * 1024 * 1024) return { valid: false, error: "File exceeds 500MB maximum size" };

      if (isSql) {
        const content = buffer.toString("utf-8");
        const hasSqlKeywords = /INSERT\s+INTO|CREATE\s+TABLE|REPLACE\s+INTO|DELETE\s+FROM/i.test(content);
        if (!hasSqlKeywords) {
          return { valid: false, error: "Invalid SQL backup file (no INSERT, CREATE, or REPLACE statements found)" };
        }
        return { valid: true, info: { type: "database", hasDb: true, hasFiles: false, fileCount: 1, size } };
      }

      if (isZip) {
        try {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(buffer);

          let hasDb = false;
          let hasFiles = false;
          let hasCsv = false;
          let fileCount = 0;

          zip.forEach((relPath, entry) => {
            if (entry.dir) return;
            fileCount++;
            if (relPath.toLowerCase().endsWith(".sql")) hasDb = true;
            if (relPath.toLowerCase().endsWith(".csv")) hasCsv = true;
            if (relPath.startsWith("uploads/") || (relPath.includes("/") && !relPath.toLowerCase().endsWith(".csv"))) hasFiles = true;
          });

          if (!hasDb && !hasFiles && !hasCsv && fileCount === 0) {
            return { valid: false, error: "The ZIP archive is empty" };
          }
          if (!hasDb && !hasFiles && !hasCsv) {
            return { valid: false, error: "Invalid backup ZIP: missing SQL dump, CSV files, or uploaded files" };
          }

          const type = hasCsv ? "csv" : hasDb && hasFiles ? "full" : hasDb ? "database" : "files";
          return { valid: true, info: { type, hasDb: hasDb || hasCsv, hasFiles, fileCount, size } };
        } catch (zipErr: any) {
          return { valid: false, error: `Invalid or corrupted ZIP file: ${zipErr.message}` };
        }
      }

      return { valid: false, error: "Unsupported file format" };
    } catch (e: any) {
      return { valid: false, error: `Validation error: ${e.message}` };
    }
  });

export const restoreFromUpload = createServerFn({ method: "POST" })
  .validator((d: any) => d as { fileBase64: string; fileName: string; userEmail: string; userName: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string; details?: string }> => {
    const { fileBase64, fileName, userEmail, userName } = data;

    try {
      const buffer = Buffer.from(fileBase64, "base64");
      const lowerName = fileName.toLowerCase();
      const isZip = lowerName.endsWith(".zip") || (buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b);

      let sqlContent = "";
      let restoredFilesCount = 0;
      let restoredRecords = 0;

      if (isZip) {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(buffer);

        // 1. Find any SQL file
        let sqlZipEntry = zip.file("database.sql");
        if (!sqlZipEntry) {
          const sqlFiles = zip.file(/\.sql$/i);
          if (sqlFiles && sqlFiles.length > 0) {
            sqlZipEntry = sqlFiles[0];
          }
        }

        if (sqlZipEntry) {
          sqlContent = await sqlZipEntry.async("string");
        } else {
          // Check for CSV files in ZIP
          const csvFiles = zip.file(/\.csv$/i);
          if (csvFiles && csvFiles.length > 0) {
            const { executed, tableStats } = await executeCsvRestore(zip);
            restoredRecords = Object.values(tableStats).reduce((a, b) => a + b, 0) || executed;
          }
        }

        // 2. Extract uploads/ or files
        const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const entries: { relPath: string; file: any }[] = [];
        zip.forEach((relPath, file) => {
          if (!file.dir && !relPath.endsWith(".sql") && !relPath.endsWith(".json")) {
            entries.push({ relPath, file });
          }
        });

        for (const { relPath, file } of entries) {
          try {
            const cleanRel = relPath.replace(/^uploads\//i, "");
            const targetPath = path.resolve(uploadsDir, cleanRel);
            if (targetPath.startsWith(uploadsDir)) {
              await fs.mkdir(path.dirname(targetPath), { recursive: true });
              const content = await file.async("nodebuffer");
              await fs.writeFile(targetPath, content);
              restoredFilesCount++;
            }
          } catch (fileErr: any) {
            console.warn(`[Restore] Error writing file ${relPath}:`, fileErr.message);
          }
        }
      } else {
        // Plain SQL file
        sqlContent = buffer.toString("utf-8");
      }

      if (sqlContent.trim()) {
        const { executed, tableStats } = await executeSqlRestore(sqlContent);
        restoredRecords = Object.values(tableStats).reduce((a, b) => a + b, 0) || executed;
      }

      const summaryParts: string[] = [];
      if (restoredRecords > 0) summaryParts.push(`${restoredRecords} database records`);
      if (restoredFilesCount > 0) summaryParts.push(`${restoredFilesCount} files`);
      const details = summaryParts.length > 0
        ? `Successfully restored ${summaryParts.join(" and ")} from "${fileName}"`
        : `Restored backup "${fileName}"`;

      await appendAuditLog({
        action: "restore_completed",
        resource: "upload",
        details,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });

      return { success: true, details };
    } catch (e: any) {
      console.error("[Restore Upload Error]:", e);
      await appendAuditLog({
        action: "restore_failed",
        resource: "upload",
        details: `Upload restore failed: ${e.message}`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });
      return { success: false, error: e.message };
    }
  });

export const downloadBackupFile = createServerFn({ method: "POST" })
  .validator((d: any) => d as { backupId: string })
  .handler(async ({ data }): Promise<{ content?: string; name?: string; error?: string }> => {
    try {
      const backups = await getBackupIndex();
      const backup = backups.find((b) => b.id === data.backupId);
      if (!backup || !backup.storage_path) return { error: "Backup not found" };

      const fullFilePath = path.resolve(BACKUPS_DIR, backup.storage_path);
      const buffer = await fs.readFile(fullFilePath);
      const base64 = buffer.toString("base64");

      return { content: base64, name: backup.name };
    } catch (e: any) {
      return { error: e.message };
    }
  });

export const getBackupStorageInfo = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ totalSize: number; fileCount: number; largestBackup: BackupRecord | null; oldestBackup: BackupRecord | null; backups: BackupRecord[] }> => {
    const backups = await getBackupIndex();
    const completed = backups.filter((b) => b.status === "completed");
    const totalSize = completed.reduce((s, b) => s + b.size, 0);
    const largestBackup = completed.length > 0 ? completed.reduce((a, b) => (a.size > b.size ? a : b)) : null;
    const oldestBackup = completed.length > 0 ? completed.reduce((a, b) => (a.created_at < b.created_at ? a : b)) : null;

    let fileCount = completed.length;
    return { totalSize, fileCount, largestBackup, oldestBackup, backups };
  });

export const getAutoBackupConfig = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ enabled: boolean; frequency: string; backupTime: string; retentionCount: number; lastRun?: string; nextRun?: string }> => {
    try {
      await ensureBackupsDir();
      const text = await fs.readFile(CONFIG_FILE, "utf-8");
      return JSON.parse(text);
    } catch {
      return { enabled: false, frequency: "daily", backupTime: "02:00", retentionCount: 30 };
    }
  });

export const updateAutoBackupConfig = createServerFn({ method: "POST" })
  .validator((d: any) => d as { enabled: boolean; frequency: string; backupTime: string; retentionCount: number })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await ensureBackupsDir();
      const config = { ...data, updatedAt: isoNow() };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

export const createSafetyBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userEmail: string; userName: string })
  .handler(async ({ data }): Promise<{ backupId?: string; error?: string }> => {
    try {
      const result = await createBackup({
        data: { type: "database", userEmail: data.userEmail, userName: data.userName },
      });
      if (result.status === "failed") return { error: result.error || "Failed to create safety backup" };
      return { backupId: result.id };
    } catch (err: any) {
      return { error: err.message || "Failed to create safety backup" };
    }
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async (): Promise<AuditEntry[]> => {
    try {
      await ensureBackupsDir();
      const text = await fs.readFile(AUDIT_FILE, "utf-8");
      return text
        .split("\n")
        .filter(Boolean)
        .map((l: string) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as AuditEntry[];
    } catch {
      return [];
    }
  });
