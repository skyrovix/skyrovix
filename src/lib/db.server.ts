import pg from "pg";

const { Pool } = pg;

// Singleton pool instance for server functions
let _pool: pg.Pool | null = null;

export function getDbPool(): pg.Pool {
  if (!_pool) {
    const host = process.env.PGHOST || "aws-1-ap-south-1.pooler.supabase.com";
    const port = Number(process.env.PGPORT || 6543);
    const user = process.env.PGUSER || "postgres.eesiuqeswydlmwhecrcy";
    const password = process.env.PGPASSWORD || "123harimahesh";
    const database = process.env.PGDATABASE || "postgres";

    _pool = new Pool({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    _pool.on("error", (err: Error) => {
      console.error("[Database Pool Error]:", err.message);
    });
  }

  return _pool;
}

let _schemaMigrated = false;

async function ensureSchemaMigrated(pool: pg.Pool) {
  if (_schemaMigrated) return;
  try {
    await pool.query(`
      ALTER TABLE public.fee_settings
      ADD COLUMN IF NOT EXISTS offer_enabled BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS offer_amount NUMERIC NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS offer_name TEXT NOT NULL DEFAULT 'Certificate Free Offer',
      ADD COLUMN IF NOT EXISTS offer_start_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS offer_end_at TIMESTAMPTZ;

      ALTER TABLE public.applications
      ADD COLUMN IF NOT EXISTS certificate_offer_eligible BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS certificate_offer_id TEXT,
      ADD COLUMN IF NOT EXISTS certificate_offer_amount NUMERIC,
      ADD COLUMN IF NOT EXISTS certificate_offer_snapshot JSONB,
      ADD COLUMN IF NOT EXISTS certificate_offer_granted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS certificate_offer_expires_at TIMESTAMPTZ;

      UPDATE public.fee_settings
      SET amount = CASE WHEN amount = 0 THEN 100 ELSE amount END,
          is_enabled = true
      WHERE fee_type = 'certificate' AND amount = 0 AND offer_enabled = false;
    `);
    _schemaMigrated = true;
    console.log("[db.server] Schema migration verified successfully");
  } catch (err: any) {
    console.error("[db.server] Schema migration check notice:", err.message);
  }
}

export async function dbQuery<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const pool = getDbPool();
  if (!_schemaMigrated) {
    await ensureSchemaMigrated(pool);
  }
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = getDbPool();
  if (!_schemaMigrated) {
    await ensureSchemaMigrated(pool);
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
