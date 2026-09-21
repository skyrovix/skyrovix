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
  try {
    const buckets = await pool.query("SELECT id, name, public FROM storage.buckets");
    console.log("storage.buckets:", buckets.rows);

    const objects = await pool.query("SELECT bucket_id, name, created_at FROM storage.objects WHERE name ILIKE '%qr%' LIMIT 10");
    console.log("QR objects:", objects.rows);

    const anyObjects = await pool.query("SELECT bucket_id, name, created_at FROM storage.objects ORDER BY created_at DESC LIMIT 10");
    console.log("Recent objects:", anyObjects.rows);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await pool.end();
  }
}

main();
