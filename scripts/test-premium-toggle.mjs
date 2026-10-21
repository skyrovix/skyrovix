import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "123Sk_hari@2006",
  database: process.env.MYSQL_DATABASE || "skyrovix",
});

async function main() {
  console.log("=== CHECKING FEE_SETTINGS IN MYSQL ===");
  const [rows] = await pool.query("SELECT fee_type, amount, is_enabled FROM fee_settings");
  console.table(rows);

  console.log("\n=== TEST 1: TOGGLE OFF ===");
  await pool.query("UPDATE fee_settings SET is_enabled = 0 WHERE fee_type = 'premium_plan'");
  const [offRows] = await pool.query("SELECT fee_type, amount, is_enabled FROM fee_settings WHERE fee_type = 'premium_plan'");
  console.log("When OFF in DB:", offRows[0]);
  if (offRows[0].is_enabled === 0) {
    console.log("✅ Verified: is_enabled = 0 (OFF)");
  } else {
    console.error("❌ Failed to turn OFF");
  }

  console.log("\n=== TEST 2: TOGGLE ON ===");
  await pool.query("UPDATE fee_settings SET is_enabled = 1 WHERE fee_type = 'premium_plan'");
  const [onRows] = await pool.query("SELECT fee_type, amount, is_enabled FROM fee_settings WHERE fee_type = 'premium_plan'");
  console.log("When ON in DB:", onRows[0]);
  if (onRows[0].is_enabled === 1) {
    console.log("✅ Verified: is_enabled = 1 (ON)");
  } else {
    console.error("❌ Failed to turn ON");
  }

  await pool.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
