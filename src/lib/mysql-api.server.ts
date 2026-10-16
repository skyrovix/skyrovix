import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { dbQuery } from "./db.server";

const ALLOWED_TABLES = new Set([
  "users",
  "profiles",
  "user_roles",
  "applications",
  "tasks",
  "submissions",
  "submission_history",
  "payments",
  "payment_records",
  "certificates",
  "fee_settings",
  "cashfree_orders",
  "coupons",
  "coupon_redemptions",
  "reviews",
  "email_logs",
  "promotional_popups",
  "project_challenges",
  "project_submissions",
  "project_evaluations",
  "project_certificates",
  "project_awards",
  "courses",
  "course_topics",
  "course_tasks",
  "course_quiz_questions",
  "enrollments",
  "lesson_progress",
  "course_task_submissions",
  "quiz_attempts",
  "course_certificates",
  "topic_quiz_questions",
  "topic_quiz_attempts",
  "bookmarks",
  "notes",
  "achievement_definitions",
  "achievements",
  "leaderboard",
  "login_sessions",
]);

function isSafeIdentifier(str: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(str);
}

function sanitizeSelectColumns(selectStr?: string): string {
  if (!selectStr || selectStr.includes("*")) return "*";
  // Strip nested relations like table(...) or table!inner(...)
  const stripped = selectStr.replace(/[a-zA-Z0-9_!]+\([^)]*\)/g, "");
  const cols = stripped
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const safeCols = cols.filter(isSafeIdentifier);
  return safeCols.length > 0 ? safeCols.map((c) => `\`${c}\``).join(", ") : "*";
}

export interface MysqlFilter {
  type: "eq" | "neq" | "in" | "lte" | "gte" | "like" | "ilike";
  column: string;
  value?: any;
  values?: any[];
}

export interface MysqlQueryRequest {
  action: "select" | "insert" | "update" | "delete" | "upsert";
  table: string;
  select?: string;
  values?: any;
  filters?: MysqlFilter[];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
}

export async function executeMysqlQuery(req: MysqlQueryRequest): Promise<{ data: any; error: any }> {
  const table = req.table?.replace(/^public\./, "");
  if (!ALLOWED_TABLES.has(table)) {
    return { data: null, error: { message: `Table '${req.table}' not permitted or does not exist` } };
  }

  try {
    // 1. SELECT
    if (req.action === "select") {
      const selectCols = sanitizeSelectColumns(req.select);
      const whereParts: string[] = [];
      const params: any[] = [];

      if (req.filters && req.filters.length > 0) {
        for (const f of req.filters) {
          if (!isSafeIdentifier(f.column)) continue;
          if (f.type === "eq") {
            whereParts.push(`\`${f.column}\` = ?`);
            params.push(f.value);
          } else if (f.type === "neq") {
            whereParts.push(`\`${f.column}\` != ?`);
            params.push(f.value);
          } else if (f.type === "in") {
            const vals = Array.isArray(f.values) ? f.values : [];
            if (vals.length === 0) {
              whereParts.push("1=0");
            } else {
              whereParts.push(`\`${f.column}\` IN (${vals.map(() => "?").join(", ")})`);
              params.push(...vals);
            }
          } else if (f.type === "lte") {
            whereParts.push(`\`${f.column}\` <= ?`);
            params.push(f.value);
          } else if (f.type === "gte") {
            whereParts.push(`\`${f.column}\` >= ?`);
            params.push(f.value);
          } else if (f.type === "like" || f.type === "ilike") {
            whereParts.push(`\`${f.column}\` LIKE ?`);
            params.push(f.value);
          }
        }
      }

      let sql = `SELECT ${selectCols} FROM \`${table}\``;
      if (whereParts.length > 0) {
        sql += ` WHERE ${whereParts.join(" AND ")}`;
      }

      if (req.order && isSafeIdentifier(req.order.column)) {
        const dir = req.order.ascending ? "ASC" : "DESC";
        sql += ` ORDER BY \`${req.order.column}\` ${dir}`;
      }

      if (req.single || req.maybeSingle) {
        sql += ` LIMIT 1`;
      } else if (typeof req.limit === "number" && req.limit > 0) {
        sql += ` LIMIT ${Math.floor(req.limit)}`;
      }

      const res = await dbQuery(sql, params);
      let rows = res.rows || [];

      // Hydrate relations if requested
      if (req.select && rows.length > 0) {
        if (table === "submissions") {
          if (req.select.includes("applications")) {
            const appIds = [...new Set(rows.map((r: any) => r.application_id).filter(Boolean))];
            if (appIds.length > 0) {
              const appRes = await dbQuery(
                `SELECT * FROM applications WHERE id IN (${appIds.map(() => "?").join(", ")})`,
                appIds
              );
              const appMap = new Map((appRes.rows || []).map((a: any) => [a.id, a]));
              rows.forEach((r: any) => {
                r.applications = appMap.get(r.application_id) || null;
              });
            }
          }
          if (req.select.includes("tasks")) {
            const taskIds = [...new Set(rows.map((r: any) => r.task_id).filter(Boolean))];
            if (taskIds.length > 0) {
              const taskRes = await dbQuery(
                `SELECT * FROM tasks WHERE id IN (${taskIds.map(() => "?").join(", ")})`,
                taskIds
              );
              const taskMap = new Map((taskRes.rows || []).map((t: any) => [t.id, t]));
              rows.forEach((r: any) => {
                r.tasks = taskMap.get(r.task_id) || null;
              });
            }
          }
        } else if (table === "project_submissions") {
          if (req.select.includes("project_challenges")) {
            const challengeIds = [...new Set(rows.map((r: any) => r.challenge_id || r.project_id).filter(Boolean))];
            if (challengeIds.length > 0) {
              const chalRes = await dbQuery(
                `SELECT * FROM project_challenges WHERE id IN (${challengeIds.map(() => "?").join(", ")})`,
                challengeIds
              );
              const chalMap = new Map((chalRes.rows || []).map((c: any) => [c.id, c]));
              rows.forEach((r: any) => {
                r.project_challenges = chalMap.get(r.challenge_id || r.project_id) || null;
              });
            }
          }
        }
      }

      if (req.single) {
        if (rows.length === 0) {
          return { data: null, error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" } };
        }
        return { data: rows[0], error: null };
      }

      if (req.maybeSingle) {
        return { data: rows[0] || null, error: null };
      }

      return { data: rows, error: null };
    }

    // 2. INSERT
    if (req.action === "insert") {
      const items = Array.isArray(req.values) ? req.values : [req.values];
      if (items.length === 0 || !items[0]) {
        return { data: [], error: null };
      }

      const insertedRows: any[] = [];
      for (const rawItem of items) {
        const item = { ...rawItem };
        if (!item.id && table !== "courses") {
          item.id = crypto.randomUUID();
        }

        const keys = Object.keys(item).filter(isSafeIdentifier);
        const placeholders = keys.map(() => "?");
        const values = keys.map((k) => {
          const val = item[k];
          if (val !== null && typeof val === "object" && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          return val;
        });

        const sql = `INSERT INTO \`${table}\` (\`${keys.join("`, `")}\`) VALUES (${placeholders.join(", ")})`;
        await dbQuery(sql, values);
        insertedRows.push(item);
      }

      return { data: Array.isArray(req.values) ? insertedRows : insertedRows[0], error: null };
    }

    // 3. UPDATE
    if (req.action === "update") {
      const updates = req.values || {};
      const keys = Object.keys(updates).filter(isSafeIdentifier);
      if (keys.length === 0) {
        return { data: null, error: null };
      }

      const setParts: string[] = [];
      const setParams: any[] = [];

      for (const k of keys) {
        setParts.push(`\`${k}\` = ?`);
        const val = updates[k];
        if (val !== null && typeof val === "object" && !(val instanceof Date)) {
          setParams.push(JSON.stringify(val));
        } else {
          setParams.push(val);
        }
      }

      const whereParts: string[] = [];
      const whereParams: any[] = [];

      if (req.filters) {
        for (const f of req.filters) {
          if (!isSafeIdentifier(f.column)) continue;
          if (f.type === "eq") {
            whereParts.push(`\`${f.column}\` = ?`);
            whereParams.push(f.value);
          } else if (f.type === "in") {
            const vals = Array.isArray(f.values) ? f.values : [];
            whereParts.push(`\`${f.column}\` IN (${vals.map(() => "?").join(", ")})`);
            whereParams.push(...vals);
          }
        }
      }

      let sql = `UPDATE \`${table}\` SET ${setParts.join(", ")}`;
      if (whereParts.length > 0) {
        sql += ` WHERE ${whereParts.join(" AND ")}`;
      }

      await dbQuery(sql, [...setParams, ...whereParams]);
      return { data: updates, error: null };
    }

    // 4. UPSERT
    if (req.action === "upsert") {
      const items = Array.isArray(req.values) ? req.values : [req.values];
      const results: any[] = [];

      for (const rawItem of items) {
        const item = { ...rawItem };
        if (!item.id && !item.key && !item.domain && !item.code) {
          item.id = crypto.randomUUID();
        }

        const keys = Object.keys(item).filter(isSafeIdentifier);
        const placeholders = keys.map(() => "?");
        const values = keys.map((k) => {
          const val = item[k];
          if (val !== null && typeof val === "object" && !(val instanceof Date)) {
            return JSON.stringify(val);
          }
          return val;
        });

        const updateParts = keys
          .filter((k) => k !== "id")
          .map((k) => `\`${k}\` = VALUES(\`${k}\`)`);

        let sql = `INSERT INTO \`${table}\` (\`${keys.join("`, `")}\`) VALUES (${placeholders.join(", ")})`;
        if (updateParts.length > 0) {
          sql += ` ON DUPLICATE KEY UPDATE ${updateParts.join(", ")}`;
        }

        await dbQuery(sql, values);
        results.push(item);
      }

      return { data: Array.isArray(req.values) ? results : results[0], error: null };
    }

    // 5. DELETE
    if (req.action === "delete") {
      const whereParts: string[] = [];
      const whereParams: any[] = [];

      if (req.filters) {
        for (const f of req.filters) {
          if (!isSafeIdentifier(f.column)) continue;
          if (f.type === "eq") {
            whereParts.push(`\`${f.column}\` = ?`);
            whereParams.push(f.value);
          } else if (f.type === "in") {
            const vals = Array.isArray(f.values) ? f.values : [];
            whereParts.push(`\`${f.column}\` IN (${vals.map(() => "?").join(", ")})`);
            whereParams.push(...vals);
          }
        }
      }

      let sql = `DELETE FROM \`${table}\``;
      if (whereParts.length > 0) {
        sql += ` WHERE ${whereParts.join(" AND ")}`;
      }

      await dbQuery(sql, whereParams);
      return { data: null, error: null };
    }

    return { data: null, error: { message: `Unsupported action: ${req.action}` } };
  } catch (err: any) {
    console.error(`[executeMysqlQuery error on ${table}]:`, err);
    return { data: null, error: { message: err.message || "Database query failed" } };
  }
}

export async function executeMysqlRpc(
  fnName: string,
  params: Record<string, any> = {}
): Promise<{ data: any; error: any }> {
  try {
    if (fnName === "count_domain_applications") {
      const domain = params.p_domain || "";
      const res = await dbQuery("SELECT COUNT(*) AS total FROM applications WHERE domain = ?", [domain]);
      const total = Number(res.rows?.[0]?.total || 0);
      return { data: total, error: null };
    }

    if (fnName === "ensure_task" || fnName === "ensure_linkedin_task") {
      const domain = params.p_domain || "";
      const taskNumber = fnName === "ensure_linkedin_task" ? 0 : Number(params.p_task_number || 1);
      const title = params.p_title || (taskNumber === 0 ? "Share on LinkedIn" : `Task ${taskNumber}`);
      const description = params.p_description || "";

      // Check existing
      const existing = await dbQuery(
        "SELECT id FROM tasks WHERE domain = ? AND task_number = ? LIMIT 1",
        [domain, taskNumber]
      );
      if (existing.rows && existing.rows.length > 0) {
        return { data: existing.rows[0].id, error: null };
      }

      // Insert new
      const newId = crypto.randomUUID();
      await dbQuery(
        "INSERT INTO tasks (id, domain, task_number, title, description) VALUES (?, ?, ?, ?, ?)",
        [newId, domain, taskNumber, title, description]
      );
      return { data: newId, error: null };
    }

    return { data: null, error: { message: `RPC '${fnName}' not implemented` } };
  } catch (err: any) {
    return { data: null, error: { message: err.message || "RPC execution failed" } };
  }
}

export async function saveUploadedFile(
  bucket: string,
  relativePath: string,
  buffer: Buffer
): Promise<{ path: string; publicUrl: string }> {
  const safeBucket = bucket.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanPath = relativePath.replace(/^(\.\.(\/|\\|$))+/, "").replace(/^\/+/, "");
  
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", safeBucket);
  const targetFile = path.resolve(uploadDir, cleanPath);

  // Security: prevent path traversal out of uploads dir
  if (!targetFile.startsWith(uploadDir)) {
    throw new Error("Invalid target file path");
  }

  await fs.mkdir(path.dirname(targetFile), { recursive: true });
  await fs.writeFile(targetFile, buffer);

  const publicUrl = `/uploads/${safeBucket}/${cleanPath.replace(/\\/g, "/")}`;
  return { path: cleanPath, publicUrl };
}
