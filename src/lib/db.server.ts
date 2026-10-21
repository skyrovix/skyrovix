import mysql from "mysql2/promise";
import { loadEnv } from "./env.server";

let _pool: mysql.Pool | null = null;
let _activePort: number | null = null;

export function getDbPool(): mysql.Pool {
  loadEnv();
  if (!_pool) {
    const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
    const defaultPort = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3307);
    const port = _activePort || defaultPort;
    const user = process.env.MYSQL_USER || process.env.DB_USER || "root";
    const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "123Sk_hari@2006";
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || "skyrovix";

    _pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      decimalNumbers: true,
      dateStrings: true,
      multipleStatements: true,
    });

    console.log(`[Database Pool] Initialized MySQL pool for ${user}@${host}:${port}/${database}`);
  }

  return _pool;
}

function trySwitchLocalPort(err: any): boolean {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
  const isLocal = host === "127.0.0.1" || host === "localhost";
  if (err && err.code === "ECONNREFUSED" && isLocal) {
    const configuredPort = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3307);
    const currentPort = _activePort || configuredPort;
    const altPort = currentPort === 3306 ? 3307 : 3306;
    if (_activePort !== altPort) {
      console.warn(`[db.server] Port ${currentPort} refused. Trying alternate local MySQL port ${altPort}...`);
      _activePort = altPort;
      if (_pool) {
        try {
          _pool.end();
        } catch {
          // ignore
        }
      }
      _pool = null;
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

let _schemaMigrated = false;

async function ensureSchemaMigrated(pool: mysql.Pool) {
  if (_schemaMigrated) return;
  try {
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
      try {
        await pool.query(
          `ALTER TABLE \`${tbl}\` ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP`
        );
      } catch {
        // Safe to ignore if column already exists
      }
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
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    _schemaMigrated = true;
  } catch (err: any) {
    if (trySwitchLocalPort(err)) {
      _schemaMigrated = false;
      const retryPool = getDbPool();
      return ensureSchemaMigrated(retryPool);
    }
    _pool = null;
    console.warn("[db.server] MySQL connection verification failed, reset pool:", err.message);
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
  if (!_schemaMigrated) {
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
  if (!_schemaMigrated) {
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
