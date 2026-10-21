import mysql from "mysql2/promise";

const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "123Sk_hari@2006";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "skyrovix";

async function run() {
  const c = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  });

  console.log(`Connected to MySQL database ${MYSQL_DATABASE}`);

  // Update application fee to 100 and enabled (common for all domains)
  await c.query(
    "UPDATE fee_settings SET amount = 100.00, is_enabled = 1, updated_at = NOW() WHERE fee_type = 'application'"
  );

  // Update premium_plan fee to 200 and enabled (exclusive for fullstack 3M & 6M)
  await c.query(
    "UPDATE fee_settings SET amount = 200.00, is_enabled = 1, updated_at = NOW() WHERE fee_type = 'premium_plan'"
  );

  const [rows] = await c.query("SELECT fee_type, amount, is_enabled FROM fee_settings");
  console.log("Current fee_settings:", rows);

  await c.end();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
