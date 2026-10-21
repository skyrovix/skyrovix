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

  console.log(`Connected to MySQL at ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);

  // 1. Applications columns
  const [appCols] = await c.query("DESCRIBE applications");
  const existingAppCols = new Set(appCols.map((col) => col.Field));

  const columnsToAdd = [
    { name: "plan_type", def: "VARCHAR(20) NOT NULL DEFAULT 'standard'" },
    { name: "plan_fee", def: "DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
    { name: "plan_payment_status", def: "VARCHAR(50) NOT NULL DEFAULT 'not_required'" },
    { name: "plan_payment_id", def: "VARCHAR(100) NULL" },
    { name: "plan_payment_method", def: "VARCHAR(50) NULL" },
    { name: "plan_paid_at", def: "DATETIME(3) NULL" },
    { name: "discount_amount", def: "DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
    { name: "agreed_fee", def: "DECIMAL(10,2) NOT NULL DEFAULT 0.00" },
  ];

  for (const col of columnsToAdd) {
    if (!existingAppCols.has(col.name)) {
      await c.query(`ALTER TABLE applications ADD COLUMN ${col.name} ${col.def}`);
      console.log(`+ Added ${col.name} to applications`);
    }
  }

  // 2. Student Kit items table
  await c.query(`
    CREATE TABLE IF NOT EXISTS student_kit_items (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      download_url TEXT,
      external_url TEXT,
      file_url TEXT,
      file_type VARCHAR(50) DEFAULT 'PDF',
      resource_type VARCHAR(50) DEFAULT 'PDF',
      file_size VARCHAR(50) DEFAULT '1.2 MB',
      format VARCHAR(50) DEFAULT 'ZIP',
      min_duration INT DEFAULT 3,
      min_tier INT DEFAULT 1,
      sort_order INT DEFAULT 0,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  const [kitCols] = await c.query("DESCRIBE student_kit_items");
  const existingKitCols = new Set(kitCols.map((col) => col.Field));
  if (!existingKitCols.has("resource_type")) {
    await c.query("ALTER TABLE student_kit_items ADD COLUMN resource_type VARCHAR(50) DEFAULT 'PDF'");
  }
  if (!existingKitCols.has("external_url")) {
    await c.query("ALTER TABLE student_kit_items ADD COLUMN external_url TEXT");
  }
  if (!existingKitCols.has("min_tier")) {
    await c.query("ALTER TABLE student_kit_items ADD COLUMN min_tier INT DEFAULT 1");
  }
  console.log("+ Checked/created student_kit_items table");

  // 3. Guidance Schedules table
  await c.query(`
    CREATE TABLE IF NOT EXISTS guidance_schedules (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      topic VARCHAR(255) NOT NULL,
      mentor_name VARCHAR(100),
      schedule_time VARCHAR(100),
      support_channel VARCHAR(100),
      instructions TEXT,
      meeting_link TEXT,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("+ Checked/created guidance_schedules table");

  // 4. Project Challenges columns
  const [chalCols] = await c.query("DESCRIBE project_challenges");
  const existingChalCols = new Set(chalCols.map((col) => col.Field));
  if (!existingChalCols.has("min_duration")) {
    await c.query("ALTER TABLE project_challenges ADD COLUMN min_duration INT DEFAULT 3");
    console.log("+ Added min_duration to project_challenges");
  }
  if (!existingChalCols.has("tier")) {
    await c.query("ALTER TABLE project_challenges ADD COLUMN tier INT DEFAULT 1");
    console.log("+ Added tier to project_challenges");
  }

  // 5. Fee Settings for Premium Plan
  const [feeRows] = await c.query(
    "SELECT fee_type FROM fee_settings WHERE fee_type IN ('premium_plan', 'premium_3month', 'premium_6month')"
  );
  const existingFeeTypes = new Set(feeRows.map((r) => r.fee_type));

  if (!existingFeeTypes.has("premium_plan")) {
    await c.query(`
      INSERT INTO fee_settings (id, fee_type, amount, is_enabled, upi_id, payee_name, offer_name, updated_at)
      VALUES (UUID(), 'premium_plan', 200.00, 1, 'hariharanmahesh34@oksbi', 'Hariharan Mahesh', 'Standard Premium Registration', now())
    `);
    console.log("+ Inserted premium_plan into fee_settings");
  }

  console.log("✅ All plan migration steps completed successfully!");
  await c.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
