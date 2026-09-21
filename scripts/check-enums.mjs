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
  const res = await pool.query(`
    SELECT t.typname, e.enumlabel
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder
  `);
  console.log("=== ENUMS ===");
  res.rows.forEach(r => console.log(`${r.typname}: ${r.enumlabel}`));
  await pool.end();
}

main().catch(console.error);
