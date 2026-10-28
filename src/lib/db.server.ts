import mysql from "mysql2/promise";
import { loadEnv } from "./env.server";

declare global {
  var __skyrovix_mysql_pool: mysql.Pool | undefined;
  var __skyrovix_active_port: number | undefined;
  var __skyrovix_schema_migrated: boolean | undefined;
}

export function getDbPool(): mysql.Pool {
  if (!globalThis.__skyrovix_mysql_pool) {
    loadEnv();
    const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
    const defaultPort = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3307);
    const port = globalThis.__skyrovix_active_port || defaultPort;
    const user = process.env.MYSQL_USER || process.env.DB_USER || "root";
    const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "";
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || "skyrovix_main_db";

    if (database === "skyrovix") {
      throw new Error(
        "CRITICAL DATABASE SAFETY VIOLATION: Connecting to the 'skyrovix' internship database is strictly prohibited. The main application must use 'skyrovix_main_db'."
      );
    }

    globalThis.__skyrovix_mysql_pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 15000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      decimalNumbers: true,
      dateStrings: true,
      multipleStatements: true,
    });

    console.log(`[Database Pool] Initialized MySQL pool for ${user}@${host}:${port}/${database} (connectionLimit: 10)`);
  }

  return globalThis.__skyrovix_mysql_pool;
}

function trySwitchLocalPort(err: any): boolean {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
  const isLocal = host === "127.0.0.1" || host === "localhost";
  if (err && err.code === "ECONNREFUSED" && isLocal) {
    const configuredPort = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3307);
    const currentPort = globalThis.__skyrovix_active_port || configuredPort;
    const altPort = currentPort === 3306 ? 3307 : 3306;
    if (globalThis.__skyrovix_active_port !== altPort) {
      console.warn(`[db.server] Port ${currentPort} refused. Trying alternate local MySQL port ${altPort}...`);
      globalThis.__skyrovix_active_port = altPort;
      if (globalThis.__skyrovix_mysql_pool) {
        try {
          globalThis.__skyrovix_mysql_pool.end().catch(() => {});
        } catch {
          // ignore
        }
      }
      globalThis.__skyrovix_mysql_pool = undefined;
      return true;
    }
  }
  return false;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Automatically adapts PostgreSQL queries (legacy) to valid MySQL syntax:
 * 1. Strips "public." and "auth." schema prefixes
 * 2. Replaces ILIKE with LIKE (MySQL is case-insensitive by default)
 * 3. Maps PostgreSQL positional parameters ($1, $2, ...) to MySQL (?) placeholders and aligns parameter values
 */
export function prepareMysqlQueryAndParams(
  sql: string,
  params?: any[]
): { sql: string; params: any[] | undefined } {
  let adaptedSql = sql
    .replace(/\b(?:public|auth)\./gi, "")
    .replace(/\bILIKE\b/gi, "LIKE")
    .replace(/\bON\s+CONFLICT\s*(?:\([^)]*\))?\s*DO\s+NOTHING\b/gi, "ON DUPLICATE KEY UPDATE id=id")
    .replace(/\bON\s+CONFLICT\s*\([^)]*\)\s*DO\s+UPDATE\s+SET\b/gi, "ON DUPLICATE KEY UPDATE")
    .replace(/\bEXCLUDED\.(\w+)/gi, "VALUES($1)")
    .replace(/\bRETURNING\s+[*a-zA-Z0-9_,\s]+$/i, "");

  if (!params || !Array.isArray(params) || params.length === 0) {
    adaptedSql = adaptedSql.replace(/\$(\d+)/g, "?");
    return { sql: adaptedSql, params: undefined };
  }

  const hasDollarPlaceholders = /\$(\d+)/.test(adaptedSql);
  if (hasDollarPlaceholders) {
    const reorderedParams: any[] = [];
    adaptedSql = adaptedSql.replace(/\$(\d+)/g, (_match, digits) => {
      const idx = parseInt(digits, 10) - 1;
      const val = params[idx];
      reorderedParams.push(val !== undefined ? val : null);
      return "?";
    });
    return { sql: adaptedSql, params: sanitizeParamsForMysql(reorderedParams) };
  }

  return { sql: adaptedSql, params: sanitizeParamsForMysql(params) };
}

export function adaptSqlForMysql(sql: string): string {
  return prepareMysqlQueryAndParams(sql).sql;
}

async function ensureSchemaMigrated(pool: mysql.Pool) {
  if (globalThis.__skyrovix_schema_migrated) return;
  try {
    const ensureCol = async (tbl: string, col: string, def: string) => {
      try {
        const [rows]: any = await pool.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
          [tbl, col]
        );
        if (!rows || rows.length === 0) {
          await pool.query(`ALTER TABLE \`${tbl}\` ADD COLUMN \`${col}\` ${def}`);
        }
      } catch {
        // Safe to ignore if table does not exist yet
      }
    };

    // Ensure applications schema contains all critical columns
    await ensureCol("applications", "total_tasks", "INT DEFAULT 5");
    await ensureCol("applications", "application_fee_required", "TINYINT(1) DEFAULT 0");
    await ensureCol("applications", "application_fee_status", "VARCHAR(50) DEFAULT 'not_required'");
    await ensureCol("applications", "plan_type", "VARCHAR(50) NOT NULL DEFAULT 'standard'");
    await ensureCol("applications", "plan_fee", "DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    await ensureCol("applications", "plan_payment_status", "VARCHAR(50) NOT NULL DEFAULT 'pending'");
    await ensureCol("applications", "plan_paid_at", "DATETIME NULL");
    await ensureCol("applications", "agreed_fee", "DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    await ensureCol("applications", "discount_amount", "DECIMAL(10,2) NOT NULL DEFAULT 0.00");
    await ensureCol("applications", "all_tasks_verified", "TINYINT(1) DEFAULT 0");
    await ensureCol("applications", "certificate_payment_unlocked", "TINYINT(1) DEFAULT 0");
    await ensureCol("applications", "certificate_payment_status", "VARCHAR(50) DEFAULT 'pending'");
    await ensureCol("applications", "verification_offer_sent_at", "DATETIME NULL");
    await ensureCol("applications", "verification_offer_coupon", "VARCHAR(100) NULL");

    const tablesToCheck = [
      "payments",
      "submissions",
      "certificates",
      "coupon_redemptions",
      "fee_settings",
      "course_certificates",
      "project_certificates",
      "project_awards",
      "quiz_attempts",
      "lesson_progress",
      "leaderboard",
      "tasks",
    ];

    for (const tbl of tablesToCheck) {
      await ensureCol(tbl, "created_at", "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fee_audit_logs (
        id VARCHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
        admin_id VARCHAR(36) NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NULL,
        old_value JSON NULL,
        new_value JSON NULL,
        ip_address VARCHAR(100) NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureCol("fee_audit_logs", "ip_address", "VARCHAR(100) NULL");
    await ensureCol("fee_audit_logs", "created_at", "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP");

    try {
      await pool.query(`ALTER TABLE \`fee_audit_logs\` MODIFY COLUMN \`id\` VARCHAR(36) NOT NULL DEFAULT (UUID())`);
    } catch {
      // Safe to ignore if already default or not supported
    }

    globalThis.__skyrovix_schema_migrated = true;
  } catch (err: any) {
    if (trySwitchLocalPort(err)) {
      globalThis.__skyrovix_schema_migrated = false;
      const retryPool = getDbPool();
      return ensureSchemaMigrated(retryPool);
    }
    console.warn("[db.server] MySQL connection verification non-fatal:", err.message);
    globalThis.__skyrovix_schema_migrated = true;
  }
}

export function sanitizeParamsForMysql(params?: any[]): any[] | undefined {
  if (!params || !Array.isArray(params)) return params;
  return params.map((p) => {
    if (typeof p === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(p)) {
      return p.slice(0, 19).replace("T", " ");
    }
    return p;
  });
}

export async function dbQuery<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  let pool = getDbPool();
  if (!globalThis.__skyrovix_schema_migrated) {
    await ensureSchemaMigrated(pool);
    pool = getDbPool();
  }

  const prepared = prepareMysqlQueryAndParams(text, params);
  try {
    const [result] = await pool.query(prepared.sql, prepared.params);

    if (Array.isArray(result)) {
      return {
        rows: result as T[],
        rowCount: result.length,
      };
    }

    return {
      rows: [] as T[],
      rowCount: (result as any)?.affectedRows || 0,
    };
  } catch (err: any) {
    if (trySwitchLocalPort(err)) {
      const retryPool = getDbPool();
      const [result] = await retryPool.query(prepared.sql, prepared.params);
      if (Array.isArray(result)) {
        return {
          rows: result as T[],
          rowCount: result.length,
        };
      }
      return {
        rows: [] as T[],
        rowCount: (result as any)?.affectedRows || 0,
      };
    }
    throw err;
  }
}

export interface DbTransactionClient {
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
}

export async function withTransaction<T>(
  callback: (client: DbTransactionClient) => Promise<T>
): Promise<T> {
  let pool = getDbPool();
  if (!globalThis.__skyrovix_schema_migrated) {
    await ensureSchemaMigrated(pool);
    pool = getDbPool();
  }

  let connection;
  try {
    connection = await pool.getConnection();
  } catch (err: any) {
    if (trySwitchLocalPort(err)) {
      pool = getDbPool();
      connection = await pool.getConnection();
    } else {
      throw err;
    }
  }

  try {
    await connection.beginTransaction();

    const client: DbTransactionClient = {
      query: async <R = any>(text: string, params?: any[]) => {
        const prepared = prepareMysqlQueryAndParams(text, params);
        const [result] = await connection.query(prepared.sql, prepared.params);
        if (Array.isArray(result)) {
          return {
            rows: result as R[],
            rowCount: result.length,
          };
        }
        return {
          rows: [] as R[],
          rowCount: (result as any)?.affectedRows || 0,
        };
      },
    };

    const result = await callback(client);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
