import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  host: process.env.PGHOST || "aws-1-ap-south-1.pooler.supabase.com",
  port: Number(process.env.PGPORT || 6543),
  user: process.env.PGUSER || "postgres.eesiuqeswydlmwhecrcy",
  password: process.env.PGPASSWORD || "123harimahesh",
  database: process.env.PGDATABASE || "postgres",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const res = await pool.query(`SELECT * FROM public.fee_settings`);
  console.log("=== FEE SETTINGS ===", res.rows);
  const pay = await pool.query(`SELECT count(*) FROM public.payment_records`);
  console.log("=== PAYMENT RECORDS COUNT ===", pay.rows[0].count);
  await pool.end();
}

main().catch(console.error);
