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
  const tables = ["applications", "submissions", "payment_records", "payments", "fee_settings", "coupons", "certificates"];
  for (const table of tables) {
    const res = await pool.query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = $1 
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n=== TABLE: ${table} ===`);
    res.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));
  }
  await pool.end();
}

main().catch(console.error);
