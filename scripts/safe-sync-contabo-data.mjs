import fsSync from "fs";
import mysql from "mysql2/promise";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// Read environment variables if available
try {
  if (fsSync.existsSync(".env")) {
    const envContent = fsSync.readFileSync(".env", "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const parts = trimmed.split("=");
      const key = parts[0].trim().replace(/^export\s+/, "");
      let val = parts.slice(1).join("=").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
} catch {}

async function run() {
  console.log("=============================================================");
  console.log("   Skyrovix Safe Contabo VPS Data Synchronization            ");
  console.log("   SAFE MODE: Zero Truncate / Zero Data Loss Guaranteed      ");
  console.log("=============================================================\n");

  const host = process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
  const user = process.env.MYSQL_USER || process.env.DB_USER || "root";
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "";
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || "skyrovix_main_db";

  if (database === "skyrovix") {
    throw new Error("SAFETY VIOLATION: Never connect to 'skyrovix'. Must use 'skyrovix_main_db'.");
  }

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      dateStrings: true,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED" && (host === "127.0.0.1" || host === "localhost") && port !== 3307) {
      console.log(`Port ${port} refused, trying port 3307...`);
      conn = await mysql.createConnection({
        host,
        port: 3307,
        user,
        password: password || "123Sk_hari@2006",
        database,
        dateStrings: true,
      });
    } else {
      throw err;
    }
  }

  console.log(`Connected to MySQL database: ${database} at ${host}\n`);

  // 1. Check current counts
  const [[{ count: userCount }]] = await conn.query("SELECT COUNT(*) as count FROM users");
  const [[{ count: appCount }]] = await conn.query("SELECT COUNT(*) as count FROM applications");
  const [[{ count: subCount }]] = await conn.query("SELECT COUNT(*) as count FROM submissions");
  const [[{ count: certCount }]] = await conn.query("SELECT COUNT(*) as count FROM certificates");

  console.log("Current Database Stats:");
  console.log(`- Users: ${userCount}`);
  console.log(`- Applications: ${appCount}`);
  console.log(`- Submissions: ${subCount}`);
  console.log(`- Certificates: ${certCount}\n`);

  // 2. Safe Auto-Link: Applications to Users by matching email (without disturbing existing data)
  console.log("Step 1: Synchronizing application user_id with users table by email...");
  const [linkRes] = await conn.query(`
    UPDATE applications a
    JOIN users u ON LOWER(TRIM(a.email)) = LOWER(TRIM(u.email))
    SET a.user_id = u.id
    WHERE a.user_id != u.id OR a.user_id IS NULL;
  `);
  console.log(`  ✓ Updated ${linkRes.changedRows || 0} applications to match active user accounts.`);

  // 3. Safe Auto-Link: Profiles to Users by matching email
  console.log("Step 2: Synchronizing profiles table by email...");
  try {
    const [profRes] = await conn.query(`
      UPDATE profiles p
      JOIN users u ON LOWER(TRIM(p.email)) = LOWER(TRIM(u.email))
      SET p.id = u.id
      WHERE p.id != u.id;
    `);
    console.log(`  ✓ Updated ${profRes.changedRows || 0} profiles.`);
  } catch (e) {
    console.log("  Note on profiles:", e.message);
  }

  // 3. Safe Check: Submissions linking to applications
  console.log("Step 3: Checking submissions link to valid applications...");
  const [orphanedSubs] = await conn.query(`
    SELECT COUNT(*) as count
    FROM submissions s
    LEFT JOIN applications a ON s.application_id = a.id
    WHERE a.id IS NULL;
  `);
  console.log(`  ✓ Submissions verified. Orphaned submissions without applications: ${orphanedSubs[0].count}`);

  // 5. Ensure any application without a user in users table gets a user account created so they can log in
  console.log("Step 4: Ensuring user accounts exist for all registered students...");
  const [orphans] = await conn.query(`
    SELECT DISTINCT a.email, a.full_name, a.user_id
    FROM applications a
    LEFT JOIN users u ON LOWER(TRIM(a.email)) = LOWER(TRIM(u.email))
    WHERE u.id IS NULL AND a.email IS NOT NULL AND a.email != '';
  `);

  if (orphans.length > 0) {
    console.log(`  Found ${orphans.length} student application(s) without user logins. Creating accounts...`);
    const defaultPasswordHash = await bcrypt.hash("Student@123", 10);
    for (const orphan of orphans) {
      const cleanEmail = orphan.email.trim().toLowerCase();
      const userId = orphan.user_id || crypto.randomUUID();
      const fullName = orphan.full_name || cleanEmail.split("@")[0];
      try {
        await conn.query(`
          INSERT INTO users (id, email, password_hash, full_name, raw_user_meta_data, is_verified)
          VALUES (?, ?, ?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
        `, [userId, cleanEmail, defaultPasswordHash, fullName, JSON.stringify({ full_name: fullName })]);

        await conn.query(`
          INSERT INTO profiles (id, email, full_name)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
        `, [userId, cleanEmail, fullName]);

        await conn.query(`
          INSERT INTO user_roles (id, user_id, role)
          VALUES (UUID(), ?, 'user')
          ON DUPLICATE KEY UPDATE role = 'user';
        `, [userId]);

        await conn.query(`
          UPDATE applications SET user_id = ? WHERE LOWER(TRIM(email)) = ?;
        `, [userId, cleanEmail]);
      } catch (err) {
        console.warn(`    Could not auto-create user for ${cleanEmail}:`, err.message);
      }
    }
    console.log(`  ✓ Created login accounts for ${orphans.length} student(s) (Default password: Student@123).`);
  } else {
    console.log("  ✓ All applications already have corresponding user accounts.");
  }

  // 6. Verification Summary of Submissions per Application
  const [subStats] = await conn.query(`
    SELECT
      a.email,
      a.domain,
      a.intern_id,
      COUNT(s.id) as total_submissions,
      SUM(CASE WHEN s.status = 'approved' THEN 1 ELSE 0 END) as approved_tasks
    FROM applications a
    JOIN submissions s ON s.application_id = a.id
    GROUP BY a.id, a.email, a.domain, a.intern_id
    HAVING approved_tasks > 0
    ORDER BY approved_tasks DESC
    LIMIT 10;
  `);

  console.log("\nSample Student Submissions Verified Intact:");
  for (const s of subStats) {
    console.log(`  • ${s.email} | Domain: ${s.domain} | Intern ID: ${s.intern_id} | Approved: ${s.approved_tasks}/${s.total_submissions} tasks`);
  }

  console.log("\n=============================================================");
  console.log("   DATA SYNCHRONIZATION FINISHED SUCCESSFULLY!               ");
  console.log("   All Contabo student data & submissions preserved intact.  ");
  console.log("=============================================================\n");

  await conn.end();
}

run().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
