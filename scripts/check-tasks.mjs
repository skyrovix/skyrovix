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
  const colRes = await pool.query(
    `SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = 'tasks' 
     ORDER BY ordinal_position`
  );
  console.log("=== TASKS COLUMNS ===");
  colRes.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

  const sample = await pool.query("SELECT * FROM public.tasks LIMIT 5");
  console.log("=== SAMPLE TASKS ===", sample.rows);
  await pool.end();
}

main().catch(console.error);
