import mysql from "mysql2/promise";
import { loadEnv } from "./env.server";

let _pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool {
  loadEnv();
  if (!_pool) {
    const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
    const port = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
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
    });

    console.log(`[Database Pool] Initialized MySQL pool for ${user}@${host}:${port}/${database}`);
  }

  return _pool;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

/**
 * Automatically adapts PostgreSQL queries (legacy) to valid MySQL syntax:
 * 1. Strips "public." prefixes
 * 2. Replaces ILIKE with LIKE (MySQL is case-insensitive by default)
 * 3. Converts PostgreSQL positional parameters ($1, $2, ...) to MySQL (?) placeholders
 */
export function adaptSqlForMysql(sql: string): string {
  return sql
    .replace(/\bpublic\./gi, "")
    .replace(/\bILIKE\b/gi, "LIKE")
    .replace(/\$(\d+)/g, "?");
}

let _schemaMigrated = false;

async function ensureSchemaMigrated(pool: mysql.Pool) {
  if (_schemaMigrated) return;
  try {
    // Quick test query to verify connectivity
    await pool.query("SELECT 1");
    _schemaMigrated = true;
  } catch (err: any) {
    _pool = null;
    console.warn("[db.server] MySQL connection verification failed, reset pool:", err.message);
  }
}

export async function dbQuery<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getDbPool();
  if (!_schemaMigrated) {
    await ensureSchemaMigrated(pool);
  }

  const adaptedSql = adaptSqlForMysql(text);
  const [result] = await pool.query(adaptedSql, params);

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

export interface DbTransactionClient {
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
}

export async function withTransaction<T>(
  callback: (client: DbTransactionClient) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  if (!_schemaMigrated) {
    await ensureSchemaMigrated(pool);
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const client: DbTransactionClient = {
      query: async <R = any>(text: string, params?: any[]) => {
        const adaptedSql = adaptSqlForMysql(text);
        const [result] = await connection.query(adaptedSql, params);
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
