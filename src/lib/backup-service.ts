import { createServerFn } from "@tanstack/react-start";

export type BackupType = "database" | "files" | "full";
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

interface AuditEntry {
  action: string;
  resource: string;
  details: string;
  user: string;
  timestamp: string;
}

const BACKUPS_BUCKET = "backups";

async function ensureBucket(supabaseAdmin: any): Promise<boolean> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (buckets?.some((b: any) => b.name === BACKUPS_BUCKET)) return true;
    const { error } = await supabaseAdmin.storage.createBucket(BACKUPS_BUCKET, { public: false, fileSizeLimit: 524288000 });
    if (error && !error.message.includes("already exists")) throw error;
    return true;
  } catch (e: any) {
    if (e.message?.includes("already exists")) return true;
    console.warn("[Backup] Could not verify/create backups bucket:", e.message);
    return false;
  }
}

const ALL_TABLES = [
  "applications", "certificates", "course_certificates", "course_quiz_questions",
  "course_task_submissions", "course_tasks", "course_topics", "courses",
  "enrollments", "lesson_progress", "payments", "profiles", "quiz_attempts",
  "submissions", "tasks", "user_roles", "login_sessions", "email_logs",
  "coupons", "popups",
] as const;

const FILE_BUCKETS = ["profile-photos", "payment-screenshots", "task-submissions"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function pad(n: number) { return n.toString().padStart(2, "0"); }

function timestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function isoNow() { return new Date().toISOString(); }

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

async function getBackupIndex(supabaseAdmin: any): Promise<BackupRecord[]> {
  await ensureBucket(supabaseAdmin);
  try {
    const { data, error } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download("backup-index.json");
    if (error || !data) return [];
    const text = await data.text();
    return JSON.parse(text || "[]");
  } catch { return []; }
}

async function saveBackupIndex(supabaseAdmin: any, backups: BackupRecord[]) {
  await ensureBucket(supabaseAdmin);
  const json = JSON.stringify(backups, null, 2);
  const buffer = Buffer.from(json, "utf-8");
  await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload("backup-index.json", buffer, { upsert: true, contentType: "application/json" });
}

async function appendAuditLog(supabaseAdmin: any, entry: AuditEntry) {
  try {
    await ensureBucket(supabaseAdmin);
    const { data, error } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download("audit-log.jsonl");
    let existing = "";
    if (!error && data) existing = await data.text();
    const line = JSON.stringify(entry) + "\n";
    const buffer = Buffer.from(existing + line, "utf-8");
    await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload("audit-log.jsonl", buffer, { upsert: true, contentType: "text/plain" });
  } catch (e) { console.warn("[Backup] Audit log append failed:", e); }
}

function escapeSql(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function generateSqlDump(supabaseAdmin: any): Promise<string> {
  const lines: string[] = [];
  lines.push("-- Skyrovix Database Backup");
  lines.push(`-- Generated: ${isoNow()}`);
  lines.push("--");
  lines.push("");
  lines.push("SET statement_timeout = 0;");
  lines.push("SET client_encoding = 'UTF8';");
  lines.push("SET standard_conforming_strings = on;");
  lines.push("");

  for (const table of ALL_TABLES) {
    try {
      let offset = 0;
      const batchSize = 500;
      let hasRows = false;
      let colNames: string[] = [];

      while (true) {
        const { data: rows, error } = await supabaseAdmin
          .from(table)
          .select("*")
          .range(offset, offset + batchSize - 1);

        if (error || !rows || rows.length === 0) break;

        if (!hasRows) {
          colNames = Object.keys(rows[0]).filter((k) => k !== "id" || true);
          lines.push(`-- Table: ${table}`);
          lines.push(`DELETE FROM public.${table};`);
          hasRows = true;
        }

        for (const row of rows) {
          const keys = Object.keys(row);
          const values = keys.map((k) => escapeSql(row[k]));
          lines.push(`INSERT INTO public.${table} (${keys.join(", ")}) VALUES (${values.join(", ")});`);
        }

        if (rows.length < batchSize) break;
        offset += batchSize;
      }

      if (hasRows) lines.push("");
    } catch (e: any) {
      lines.push(`-- Error backing up table ${table}: ${e.message}`);
      lines.push("");
    }
  }

  lines.push("-- End of backup");
  return lines.join("\n");
}

async function getAllStorageFiles(supabaseAdmin: any): Promise<{ bucket: string; path: string; size: number }[]> {
  const allFiles: { bucket: string; path: string; size: number }[] = [];

  for (const bucket of FILE_BUCKETS) {
    try {
      let offset = 0;
      const pageSize = 200;
      while (true) {
        const { data: files, error } = await supabaseAdmin.storage.from(bucket).list("", { limit: pageSize, offset });
        if (error || !files || files.length === 0) break;
        for (const f of files) {
          if (!f.id) continue;
          allFiles.push({ bucket, path: f.name, size: f.metadata?.size || 0 });
        }
        if (files.length < pageSize) break;
        offset += pageSize;
      }
    } catch {}
  }

  return allFiles;
}

async function createFilesZip(supabaseAdmin: any): Promise<ArrayBuffer> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const files = await getAllStorageFiles(supabaseAdmin);

  const uploadsFolder = zip.folder("uploads");
  if (!uploadsFolder) throw new Error("Failed to create uploads folder in ZIP");

  for (const f of files) {
    try {
      const { data, error } = await supabaseAdmin.storage.from(f.bucket).download(f.path);
      if (!error && data) {
        const buffer = await data.arrayBuffer();
        const dir = uploadsFolder.folder(f.bucket);
        if (dir) dir.file(f.path, new Uint8Array(buffer));
      }
    } catch {}
  }

  const blob = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return blob.buffer.slice(0) as ArrayBuffer;
}

async function createFullZip(supabaseAdmin: any, sqlContent: string, backupId: string): Promise<{ buffer: ArrayBuffer; size: number }> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file("database.sql", sqlContent);

  const files = await getAllStorageFiles(supabaseAdmin);
  const uploadsFolder = zip.folder("uploads");
  if (uploadsFolder) {
    for (const f of files) {
      try {
        const { data, error } = await supabaseAdmin.storage.from(f.bucket).download(f.path);
        if (!error && data) {
          const buffer = await data.arrayBuffer();
          const dir = uploadsFolder.folder(f.bucket);
          if (dir) dir.file(f.path, new Uint8Array(buffer));
        }
      } catch {}
    }
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

// ─── Server Functions ─────────────────────────────────────────

export const createBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { type: BackupType; userEmail: string; userName: string })
  .handler(async ({ data }): Promise<BackupRecord> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { type, userEmail, userName } = data;
    const id = generateId();
    const ts = timestamp();
    const now = isoNow();

    let name = "";
    let storagePath = "";
    let size = 0;

    const record: BackupRecord = {
      id, name: "", type, size: 0, status: "running",
      created_by: userEmail, created_by_name: userName, created_at: now, storage_path: "",
    };

    try {
      await ensureBucket(supabaseAdmin);

      if (type === "database") {
        name = `database-${ts}.sql`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const sql = await generateSqlDump(supabaseAdmin);
        const buffer = Buffer.from(sql, "utf-8");
        size = buffer.length;
        await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload(storagePath, buffer, { contentType: "text/plain", upsert: true });

        record.tables_count = ALL_TABLES.length;
      } else if (type === "files") {
        name = `uploads-${ts}.zip`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const buf = await createFilesZip(supabaseAdmin);
        size = buf.byteLength;
        await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload(storagePath, Buffer.from(buf), { contentType: "application/zip", upsert: true });
      } else {
        name = `skyrovix-backup-${ts}.zip`;
        record.name = name;
        storagePath = `${id}/${name}`;
        record.storage_path = storagePath;

        const sql = await generateSqlDump(supabaseAdmin);
        const { buffer: fullBuf, size: fullSize } = await createFullZip(supabaseAdmin, sql, id);
        size = fullSize;
        await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload(storagePath, Buffer.from(fullBuf), { contentType: "application/zip", upsert: true });

        record.tables_count = ALL_TABLES.length;
      }

      record.status = "completed";
      record.size = size;
      record.completed_at = isoNow();

      const backups = await getBackupIndex(supabaseAdmin);
      backups.unshift(record);
      await saveBackupIndex(supabaseAdmin, backups);

      await appendAuditLog(supabaseAdmin, {
        action: "backup_created",
        resource: type,
        details: `Created ${type} backup: ${name} (${formatBytes(size)})`,
        user: `${userName} (${userEmail})`,
        timestamp: isoNow(),
      });
    } catch (e: any) {
      record.status = "failed";
      record.error = e.message;
      record.completed_at = isoNow();

      const backups = await getBackupIndex(supabaseAdmin);
      backups.unshift(record);
      await saveBackupIndex(supabaseAdmin, backups);

      await appendAuditLog(supabaseAdmin, {
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return getBackupIndex(supabaseAdmin);
  });

export const deleteBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { backupId: string; userEmail: string; userName: string })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { backupId, userEmail, userName } = data;

    try {
      const backups = await getBackupIndex(supabaseAdmin);
      const idx = backups.findIndex((b) => b.id === backupId);
      if (idx === -1) return { success: false, error: "Backup not found" };

      const backup = backups[idx];
      const pathsToDelete = [backup.storage_path];
      try {
        const { data: folderFiles } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).list(backup.id);
        if (folderFiles) {
          for (const f of folderFiles) pathsToDelete.push(`${backup.id}/${f.name}`);
        }
      } catch {}

      await supabaseAdmin.storage.from(BACKUPS_BUCKET).remove(pathsToDelete);

      backups.splice(idx, 1);
      await saveBackupIndex(supabaseAdmin, backups);

      await appendAuditLog(supabaseAdmin, {
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { backupId, userEmail, userName, restoreDb = true, restoreFiles = true } = data;

    try {
      const backups = await getBackupIndex(supabaseAdmin);
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) return { success: false, error: "Backup not found" };

      if (backup.type === "database" && !backup.storage_path.endsWith(".sql")) {
        return { success: false, error: "Database backup file not found" };
      }

      const { data: fileData, error: fileError } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download(backup.storage_path);
      if (fileError || !fileData) return { success: false, error: "Backup file not found in storage" };

      const buffer = await fileData.arrayBuffer();

      if (backup.type === "database" || backup.storage_path.endsWith(".sql")) {
        const sql = await fileData.text();
        const insertLines = sql.split("\n").filter((l) => l.trim().startsWith("INSERT INTO"));
        let inserted = 0;
        for (const line of insertLines) {
          try {
            const match = line.match(/INSERT INTO public\.(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\);/);
            if (!match) continue;
            const [, table, colsStr, valsStr] = match;
            const cols = colsStr.split(",").map((c: string) => c.trim());
            const vals = parseSqlValues(valsStr);
            if (vals.length !== cols.length) continue;

            const row: Record<string, any> = {};
            cols.forEach((c: string, i: number) => { row[c] = vals[i]; });
            delete row.id;

            await (supabaseAdmin.from(table as any) as any).insert(row);
            inserted++;
          } catch {}
        }
        await appendAuditLog(supabaseAdmin, {
          action: "restore_completed",
          resource: "database",
          details: `Restored ${inserted} rows from "${backup.name}"`,
          user: `${userName} (${userEmail})`,
          timestamp: isoNow(),
        });
        return { success: true, details: `Restored ${inserted} rows from database backup` };
      }

      if (backup.type === "files" || backup.storage_path.endsWith(".zip")) {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(new Uint8Array(buffer));

        if (restoreDb && zip.files["database.sql"]) {
          const sqlContent = await zip.files["database.sql"].async("string");
          const insertLines = sqlContent.split("\n").filter((l) => l.trim().startsWith("INSERT INTO"));
          let inserted = 0;
          for (const line of insertLines) {
            try {
              const match = line.match(/INSERT INTO public\.(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\);/);
              if (!match) continue;
              const [, table, colsStr, valsStr] = match;
              const cols = colsStr.split(",").map((c: string) => c.trim());
              const vals = parseSqlValues(valsStr);
              if (vals.length !== cols.length) continue;

              const row: Record<string, any> = {};
              cols.forEach((c: string, i: number) => { row[c] = vals[i]; });
              delete row.id;

              await (supabaseAdmin.from(table as any) as any).insert(row);
              inserted++;
            } catch {}
          }
        }

        if (restoreFiles && zip.files["uploads/"]) {
          const uploadsFolder = zip.folder("uploads");
          if (uploadsFolder) {
            const fileEntries: { relPath: string; file: any }[] = [];
            uploadsFolder.forEach((relPath: string, file: any) => fileEntries.push({ relPath, file }));
            for (const { relPath, file } of fileEntries) {
              if (file.dir) continue;
              try {
                const content = await file.async("uint8array");
                const parts = relPath.split("/");
                const bucket = parts[0];
                const path = parts.slice(1).join("/");
                if (bucket && FILE_BUCKETS.includes(bucket) && path) {
                  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, content, { upsert: true });
                  if (error) console.warn(`[Restore] File upload warning (${relPath}):`, error.message);
                }
              } catch (e: any) {
                console.warn(`[Restore] File restore warning (${relPath}):`, e.message);
              }
            }
          }
        }

        const details = `Restored from "${backup.name}"`;
        await appendAuditLog(supabaseAdmin, {
          action: "restore_completed", resource: "full", details,
          user: `${userName} (${userEmail})`, timestamp: isoNow(),
        });

        return { success: true, details };
      }

      return { success: false, error: "Unknown backup type" };
    } catch (e: any) {
      await appendAuditLog(supabaseAdmin, {
        action: "restore_failed", resource: "full",
        details: `Restore failed: ${e.message}`,
        user: `${userName} (${userEmail})`, timestamp: isoNow(),
      });
      return { success: false, error: e.message };
    }
  });

function parseSqlValues(valsStr: string): any[] {
  const values: any[] = [];
  let current = "";
  let inString = false;
  let inArray = false;
  let arrayDepth = 0;

  for (let i = 0; i < valsStr.length; i++) {
    const ch = valsStr[i];
    if (ch === "'" && valsStr[i + 1] === "'") { current += "'"; i++; continue; }
    if (ch === "'") { inString = !inString; current += ch; continue; }
    if (!inString && ch === "," && arrayDepth === 0) {
      values.push(parseSingleValue(current.trim()));
      current = "";
      continue;
    }
    if (ch === "{" && !inString) { inArray = true; arrayDepth++; }
    if (ch === "}" && !inString) { arrayDepth--; if (arrayDepth === 0) inArray = false; }
    current += ch;
  }
  if (current.trim()) values.push(parseSingleValue(current.trim()));
  return values;
}

function parseSingleValue(val: string): any {
  if (val === "NULL" || val === "null") return null;
  if (val === "true") return true;
  if (val === "false") return false;
  if (/^\d+$/.test(val)) return parseInt(val, 10);
  if (/^\d+\.\d+$/.test(val)) return parseFloat(val);
  if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/''/g, "'");
  if (val.startsWith("{") && val.endsWith("}")) {
    return val.slice(1, -1).split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
  }
  return val;
}

export const validateBackupFile = createServerFn({ method: "POST" })
  .validator((d: any) => d as { fileName: string; fileBase64: string })
  .handler(async ({ data }): Promise<{ valid: boolean; error?: string; info?: { type: string; hasDb: boolean; hasFiles: boolean; fileCount: number; size: number } }> => {
    try {
      const buffer = Buffer.from(data.fileBase64, "base64");
      const size = buffer.length;
      const isZip = data.fileName.endsWith(".zip");
      const isSql = data.fileName.endsWith(".sql");

      if (!isZip && !isSql) return { valid: false, error: "Only .zip and .sql files are supported" };
      if (size > 500 * 1024 * 1024) return { valid: false, error: "File exceeds 500MB maximum size" };

      if (isSql) {
        const content = buffer.toString("utf-8");
        if (!content.includes("INSERT INTO") && !content.includes("CREATE TABLE")) {
          return { valid: false, error: "Invalid SQL backup file" };
        }
        return { valid: true, info: { type: "database", hasDb: true, hasFiles: false, fileCount: 0, size } };
      }

      if (isZip) {
        try {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(buffer);
          const hasDb = !!zip.files["database.sql"];
          const hasUploads = !!zip.files["uploads/"];
          const fileCount = Object.keys(zip.files).length;
          if (!hasDb && !hasUploads) return { valid: false, error: "Invalid backup ZIP: missing database.sql or uploads/ folder" };
          return { valid: true, info: { type: "full", hasDb, hasFiles: hasUploads, fileCount, size } };
        } catch {
          return { valid: false, error: "Invalid or corrupted ZIP file" };
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { fileBase64, fileName, userEmail, userName } = data;

    try {
      await ensureBucket(supabaseAdmin);
      const buffer = Buffer.from(fileBase64, "base64");

      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);

      const hasDb = !!zip.files["database.sql"];
      const hasUploads = !!zip.files["uploads/"];

      if (!hasDb && !hasUploads) return { success: false, error: "Invalid backup: missing database.sql or uploads/" };

      let restoredCount = 0;

      if (hasDb) {
        const sqlContent = await zip.files["database.sql"].async("string");
        const insertLines = sqlContent.split("\n").filter((l) => l.trim().startsWith("INSERT INTO"));
        for (const line of insertLines) {
          try {
            const match = line.match(/INSERT INTO public\.(\w+)\s*\(([^)]+)\)\s*VALUES\s*\((.+)\);/);
            if (!match) continue;
            const [, table, colsStr, valsStr] = match;
            const cols = colsStr.split(",").map((c: string) => c.trim());
            const vals = parseSqlValues(valsStr);
            if (vals.length !== cols.length) continue;
            const row: Record<string, any> = {};
            cols.forEach((c: string, i: number) => { row[c] = vals[i]; });
            delete row.id;
            const { error } = await (supabaseAdmin.from(table as any) as any).insert(row);
            if (!error) restoredCount++;
          } catch {}
        }
      }

      if (hasUploads) {
        const uploadsFolder = zip.folder("uploads");
        if (uploadsFolder) {
          const entries: { relPath: string; file: any }[] = [];
          uploadsFolder.forEach((relPath: string, file: any) => entries.push({ relPath, file }));
          for (const { relPath, file } of entries) {
            if (file.dir) continue;
            try {
              const content = await file.async("uint8array");
              const parts = relPath.split("/");
              const bucket = parts[0];
              const path = parts.slice(1).join("/");
              if (bucket && FILE_BUCKETS.includes(bucket) && path) {
                await supabaseAdmin.storage.from(bucket).upload(path, content, { upsert: true });
              }
            } catch {}
          }
        }
      }

      const details = `Restored ${restoredCount} rows from uploaded backup "${fileName}"`;
      await appendAuditLog(supabaseAdmin, {
        action: "restore_completed", resource: "upload",
        details, user: `${userName} (${userEmail})`, timestamp: isoNow(),
      });

      return { success: true, details };
    } catch (e: any) {
      await appendAuditLog(supabaseAdmin, {
        action: "restore_failed", resource: "upload",
        details: `Upload restore failed: ${e.message}`,
        user: `${userName} (${userEmail})`, timestamp: isoNow(),
      });
      return { success: false, error: e.message };
    }
  });

export const downloadBackupFile = createServerFn({ method: "POST" })
  .validator((d: any) => d as { backupId: string })
  .handler(async ({ data }): Promise<{ content?: string; name?: string; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const backups = await getBackupIndex(supabaseAdmin);
      const backup = backups.find((b) => b.id === data.backupId);
      if (!backup || !backup.storage_path) return { error: "Backup not found" };

      const { data: fileData, error: fileError } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download(backup.storage_path);
      if (fileError || !fileData) return { error: "Backup file not found in storage" };

      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      return { content: base64, name: backup.name };
    } catch (e: any) {
      return { error: e.message };
    }
  });

export const getBackupStorageInfo = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ totalSize: number; fileCount: number; largestBackup: BackupRecord | null; oldestBackup: BackupRecord | null; backups: BackupRecord[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const backups = await getBackupIndex(supabaseAdmin);
    const completed = backups.filter((b) => b.status === "completed");
    const totalSize = completed.reduce((s, b) => s + b.size, 0);
    const largestBackup = completed.length > 0 ? completed.reduce((a, b) => (a.size > b.size ? a : b)) : null;
    const oldestBackup = completed.length > 0 ? completed.reduce((a, b) => (a.created_at < b.created_at ? a : b)) : null;

    let fileCount = 0;
    try {
      const { data } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).list("", { limit: 1000 });
      fileCount = data?.length ?? 0;
    } catch {}

    return { totalSize, fileCount, largestBackup, oldestBackup, backups };
  });

export const getAutoBackupConfig = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ enabled: boolean; frequency: string; backupTime: string; retentionCount: number; lastRun?: string; nextRun?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const { data, error } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download("auto-backup-config.json");
      if (error || !data) return { enabled: false, frequency: "daily", backupTime: "02:00", retentionCount: 30 };
      const text = await data.text();
      return JSON.parse(text);
    } catch {
      return { enabled: false, frequency: "daily", backupTime: "02:00", retentionCount: 30 };
    }
  });

export const updateAutoBackupConfig = createServerFn({ method: "POST" })
  .validator((d: any) => d as { enabled: boolean; frequency: string; backupTime: string; retentionCount: number })
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const config = { ...data, updatedAt: isoNow() };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      await supabaseAdmin.storage.from(BACKUPS_BUCKET).upload("auto-backup-config.json", blob, { upsert: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

export const createSafetyBackup = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userEmail: string; userName: string })
  .handler(async ({ data }): Promise<{ backupId?: string; error?: string }> => {
    const result = await createBackup({
      data: { type: "full", userEmail: data.userEmail, userName: data.userName },
    });
    if (result.status === "failed") return { error: result.error };
    return { backupId: result.id };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .handler(async (): Promise<AuditEntry[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      const { data, error } = await supabaseAdmin.storage.from(BACKUPS_BUCKET).download("audit-log.jsonl");
      if (error || !data) return [];
      const text = await data.text();
      return text.split("\n").filter(Boolean).map((l: string) => JSON.parse(l));
    } catch { return []; }
  });
