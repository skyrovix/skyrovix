import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { dbQuery } from "./db.server";
import type { MysqlUser } from "./mysql-auth.server";

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
  "fee_audit_logs",
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
  "student_kit_items",
  "guidance_schedules",
  "students",
  "registrations",
]);

const ADMIN_ONLY_MUTATION_TABLES = new Set([
  "user_roles",
  "fee_settings",
  "fee_audit_logs",
  "promotional_popups",
  "coupons",
  "courses",
  "course_topics",
  "course_tasks",
  "course_quiz_questions",
]);

function isSafeIdentifier(str: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(str);
}

async function sanitizeSelectColumns(selectStr?: string, table?: string): Promise<string> {
  if (!selectStr || selectStr.includes("*")) return "*";
  const validCols = table ? await getTableColumns(table) : null;
  // Strip nested relations like table(...) or table!inner(...)
  const stripped = selectStr.replace(/[a-zA-Z0-9_!]+\([^)]*\)/g, "");
  const cols = stripped
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const safeCols = cols.filter((c) => {
    if (!isSafeIdentifier(c)) return false;
    if (validCols && validCols.size > 0 && !validCols.has(c.toLowerCase())) return false;
    return true;
  });
  return safeCols.length > 0 ? safeCols.map((c) => `\`${c}\``).join(", ") : "*";
}

const tableColumnsCache = new Map<string, Set<string>>();

async function getTableColumns(table: string): Promise<Set<string>> {
  if (tableColumnsCache.has(table)) {
    return tableColumnsCache.get(table)!;
  }
  try {
    const cols = await dbQuery(`DESCRIBE \`${table}\``);
    const set = new Set<string>((cols.rows || []).map((r: any) => r.Field.toLowerCase()));
    tableColumnsCache.set(table, set);
    return set;
  } catch {
    return new Set<string>();
  }
}

export interface MysqlFilter {
  type: "eq" | "neq" | "in" | "lte" | "gte" | "gt" | "lt" | "like" | "ilike" | "is" | "not" | "contains";
  column: string;
  operator?: string;
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
  count?: "exact" | "planned" | "estimated";
  head?: boolean;
}

function buildWhereParts(filters: MysqlFilter[] | undefined, tableCols: Set<string>): { whereParts: string[]; params: any[] } {
  const whereParts: string[] = [];
  const params: any[] = [];
  if (!filters || filters.length === 0) return { whereParts, params };

  for (const f of filters) {
    if (!isSafeIdentifier(f.column)) continue;
    if (tableCols.size > 0 && !tableCols.has(f.column.toLowerCase())) continue;

    if (f.type === "eq") {
      if (f.value === null) {
        whereParts.push(`\`${f.column}\` IS NULL`);
      } else {
        whereParts.push(`\`${f.column}\` = ?`);
        params.push(f.value);
      }
    } else if (f.type === "neq") {
      if (f.value === null) {
        whereParts.push(`\`${f.column}\` IS NOT NULL`);
      } else {
        whereParts.push(`(\`${f.column}\` != ? OR \`${f.column}\` IS NULL)`);
        params.push(f.value);
      }
    } else if (f.type === "gt") {
      whereParts.push(`\`${f.column}\` > ?`);
      params.push(f.value);
    } else if (f.type === "gte") {
      whereParts.push(`\`${f.column}\` >= ?`);
      params.push(f.value);
    } else if (f.type === "lt") {
      whereParts.push(`\`${f.column}\` < ?`);
      params.push(f.value);
    } else if (f.type === "lte") {
      whereParts.push(`\`${f.column}\` <= ?`);
      params.push(f.value);
    } else if (f.type === "like" || f.type === "ilike") {
      whereParts.push(`\`${f.column}\` LIKE ?`);
      params.push(f.value);
    } else if (f.type === "is") {
      if (f.value === null) {
        whereParts.push(`\`${f.column}\` IS NULL`);
      } else if (f.value === true) {
        whereParts.push(`\`${f.column}\` IS TRUE`);
      } else if (f.value === false) {
        whereParts.push(`\`${f.column}\` IS FALSE`);
      } else {
        whereParts.push(`\`${f.column}\` = ?`);
        params.push(f.value);
      }
    } else if (f.type === "not") {
      if (f.operator === "is" && f.value === null) {
        whereParts.push(`\`${f.column}\` IS NOT NULL`);
      } else if (f.operator === "in") {
        const vals = Array.isArray(f.value) ? f.value : (Array.isArray(f.values) ? f.values : []);
        if (vals.length === 0) {
          whereParts.push("1=1");
        } else {
          whereParts.push(`\`${f.column}\` NOT IN (${vals.map(() => "?").join(", ")})`);
          params.push(...vals);
        }
      } else if (f.operator === "eq") {
        whereParts.push(`(\`${f.column}\` != ? OR \`${f.column}\` IS NULL)`);
        params.push(f.value);
      } else if (f.operator === "neq") {
        whereParts.push(`\`${f.column}\` = ?`);
        params.push(f.value);
      } else {
        if (f.value === null) {
          whereParts.push(`\`${f.column}\` IS NOT NULL`);
        } else {
          whereParts.push(`NOT (\`${f.column}\` = ?)`);
          params.push(f.value);
        }
      }
    } else if (f.type === "contains") {
      whereParts.push(`\`${f.column}\` LIKE ?`);
      params.push(`%${f.value}%`);
    } else if (f.type === "in") {
      const vals = Array.isArray(f.values) ? f.values : (Array.isArray(f.value) ? f.value : []);
      if (vals.length === 0) {
        whereParts.push("1=0");
      } else {
        whereParts.push(`\`${f.column}\` IN (${vals.map(() => "?").join(", ")})`);
        params.push(...vals);
      }
    }
  }

  return { whereParts, params };
}

export async function executeMysqlQuery(
  req: MysqlQueryRequest,
  currentUser?: MysqlUser | null
): Promise<{ data: any; count: number | null; error: any }> {
  const table = req.table?.replace(/^public\./, "");
  if (!ALLOWED_TABLES.has(table)) {
    return { data: null, count: null, error: { message: `Table '${req.table}' not permitted or does not exist` } };
  }

  // Authorization check for sensitive admin-managed tables
  if (req.action !== "select" && ADMIN_ONLY_MUTATION_TABLES.has(table)) {
    const isAdmin = currentUser?.app_metadata?.role === "admin";
    if (!isAdmin) {
      return {
        data: null,
        count: null,
        error: { message: `Forbidden: Administrator privileges required to modify '${table}'.` },
      };
    }
  }

  try {
    const tableCols = await getTableColumns(table);

    // 1. SELECT
    if (req.action === "select") {
      const selectCols = await sanitizeSelectColumns(req.select, table);
      const { whereParts, params } = buildWhereParts(req.filters, tableCols);

      let sql = `SELECT ${selectCols} FROM \`${table}\``;
      if (whereParts.length > 0) {
        sql += ` WHERE ${whereParts.join(" AND ")}`;
      }

      let totalCount: number | null = null;
      if (req.count === "exact" || req.head) {
        let countSql = `SELECT COUNT(*) AS total_count FROM \`${table}\``;
        if (whereParts.length > 0) {
          countSql += ` WHERE ${whereParts.join(" AND ")}`;
        }
        try {
          const countRes = await dbQuery(countSql, params);
          totalCount = Number(countRes.rows[0]?.total_count ?? 0);
        } catch {
          totalCount = 0;
        }
      }

      if (req.head) {
        return { data: [], count: totalCount, error: null };
      }

      if (req.order && isSafeIdentifier(req.order.column)) {
        let orderCol = req.order.column;
        if (tableCols.size > 0 && !tableCols.has(orderCol.toLowerCase())) {
          orderCol = tableCols.has("created_at") ? "created_at" : "";
        }
        if (orderCol) {
          const dir = req.order.ascending ? "ASC" : "DESC";
          sql += ` ORDER BY \`${orderCol}\` ${dir}`;
        }
      }

      if (req.single || req.maybeSingle) {
        sql += ` LIMIT 1`;
      } else if (typeof req.limit === "number" && req.limit > 0) {
        sql += ` LIMIT ${Math.floor(req.limit)}`;
      }

      const res = await dbQuery(sql, params);
      let rows = res.rows || [];

      // Automatically parse known JSON/array columns if returned as JSON strings from MySQL
      const jsonCols = ["key_points", "technologies", "raw_user_meta_data", "learning_outcomes", "curriculum", "projects", "skills", "benefits", "faqs"];
      if (rows.length > 0) {
        for (const r of rows) {
          if (!r || typeof r !== "object") continue;
          for (const col of jsonCols) {
            if (typeof r[col] === "string" && (r[col].startsWith("[") || r[col].startsWith("{"))) {
              try {
                r[col] = JSON.parse(r[col]);
              } catch {}
            }
          }
        }
      }

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
          return { data: null, count: totalCount ?? 0, error: { message: "JSON object requested, multiple (or no) rows returned", code: "PGRST116" } };
        }
        return { data: rows[0], count: totalCount ?? 1, error: null };
      }

      if (req.maybeSingle) {
        return { data: rows[0] || null, count: totalCount ?? (rows[0] ? 1 : 0), error: null };
      }

      return { data: rows, count: totalCount ?? rows.length, error: null };
    }

    // 2. INSERT
    if (req.action === "insert") {
      const items = Array.isArray(req.values) ? req.values : [req.values];
      if (items.length === 0 || !items[0]) {
        return { data: req.single ? null : [], count: null, error: null };
      }

      const validCols = await getTableColumns(table);
      const insertedRows: any[] = [];
      for (const rawItem of items) {
        const item = { ...rawItem };
        if (!item.id && table !== "courses") {
          item.id = crypto.randomUUID();
        }

        const keys = Object.keys(item).filter((k) => isSafeIdentifier(k) && (validCols.size === 0 || validCols.has(k.toLowerCase())));
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
        if (table === "submissions" && updateParts.length > 0) {
          sql += ` ON DUPLICATE KEY UPDATE ${updateParts.join(", ")}`;
        }

        await dbQuery(sql, values);
        insertedRows.push(item);
      }

      const returnData = (req.single || req.maybeSingle)
        ? (insertedRows[0] || null)
        : (Array.isArray(req.values) ? insertedRows : insertedRows[0]);

      return { data: returnData, count: null, error: null };
    }

    // 3. UPDATE
    if (req.action === "update") {
      const updates = req.values || {};
      const validCols = await getTableColumns(table);
      const keys = Object.keys(updates).filter((k) => isSafeIdentifier(k) && (validCols.size === 0 || validCols.has(k.toLowerCase())));
      if (keys.length === 0) {
        return { data: req.single ? updates : [updates], count: null, error: null };
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

      const { whereParts, params: whereParams } = buildWhereParts(req.filters, validCols);

      if (whereParts.length === 0) {
        return {
          data: null,
          count: null,
          error: { message: "Safety restriction: UPDATE operations must specify filter conditions." },
        };
      }

      let sql = `UPDATE \`${table}\` SET ${setParts.join(", ")} WHERE ${whereParts.join(" AND ")}`;

      await dbQuery(sql, [...setParams, ...whereParams]);
      return { data: req.single ? updates : (Array.isArray(updates) ? updates : [updates]), count: null, error: null };
    }

    // 4. UPSERT
    if (req.action === "upsert") {
      const items = Array.isArray(req.values) ? req.values : [req.values];
      const validCols = await getTableColumns(table);
      const results: any[] = [];

      for (const rawItem of items) {
        const item = { ...rawItem };
        if (!item.id && !item.key && !item.domain && !item.code) {
          item.id = crypto.randomUUID();
        }

        const keys = Object.keys(item).filter((k) => isSafeIdentifier(k) && (validCols.size === 0 || validCols.has(k.toLowerCase())));
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

      const returnData = (req.single || req.maybeSingle)
        ? (results[0] || null)
        : (Array.isArray(req.values) ? results : results[0]);

      return { data: returnData, count: null, error: null };
    }

    // 5. DELETE
    if (req.action === "delete") {
      const validCols = await getTableColumns(table);
      const { whereParts, params: whereParams } = buildWhereParts(req.filters, validCols);

      if (whereParts.length === 0) {
        return {
          data: null,
          count: null,
          error: { message: "Safety restriction: DELETE operations must specify filter conditions." },
        };
      }

      let sql = `DELETE FROM \`${table}\` WHERE ${whereParts.join(" AND ")}`;

      await dbQuery(sql, whereParams);
      return { data: null, count: null, error: null };
    }

    return { data: null, count: null, error: { message: `Unsupported action: ${req.action}` } };
  } catch (err: any) {
    console.error(`[executeMysqlQuery error on ${table}]:`, err);
    return { data: null, count: null, error: { message: err.message || "Database query failed" } };
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

  const allowedExts = new Set([
    ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg",
    ".pdf", ".zip", ".tar", ".gz", ".txt", ".csv", ".json",
  ]);
  const ext = path.extname(cleanPath).toLowerCase();
  if (ext && !allowedExts.has(ext)) {
    throw new Error(`Forbidden file upload: '${ext}' files are not permitted.`);
  }

  if (buffer.length > 25 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowed upload size (25MB).");
  }

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
