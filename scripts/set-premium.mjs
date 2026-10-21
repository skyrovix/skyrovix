import mysql from "mysql2/promise";

const mode = process.argv[2] === "on" ? 1 : 0;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "123Sk_hari@2006",
  database: process.env.MYSQL_DATABASE || "skyrovix",
});

async function run() {
  await pool.query("UPDATE fee_settings SET is_enabled = ? WHERE fee_type = 'premium_plan'", [mode]);
  const [rows] = await pool.query("SELECT fee_type, amount, is_enabled FROM fee_settings WHERE fee_type = 'premium_plan'");
  console.log(`Premium Plan set to ${mode === 1 ? 'ON' : 'OFF'}:`, rows[0]);
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
