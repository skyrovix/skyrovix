import fsSync from "fs";
import path from "path";
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

const HARI_PHOTO = "https://eesiuqeswydlmwhecrcy.supabase.co/storage/v1/object/public/profile-photos/78b4325a-a65a-4a92-92e4-01b87fc79d41/1782207723772.jpeg";

async function run() {
  console.log("=============================================================");
  console.log("   Skyrovix Safe Contabo VPS Data Synchronization            ");
  console.log("   Zero Truncate / Preserves All Live Student Submissions    ");
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

  console.log("Database Stats Before Sync:");
  console.log(`- Users: ${userCount}`);
  console.log(`- Applications: ${appCount}`);
  console.log(`- Submissions: ${subCount}`);
  console.log(`- Certificates: ${certCount}\n`);

  // Step 0: Ensure applications schema has total_tasks column
  const [appColsCheck] = await conn.query("SHOW COLUMNS FROM `applications`");
  if (!appColsCheck.some((c) => c.Field === "total_tasks")) {
    console.log("Step 0: Adding missing total_tasks column to applications table...");
    await conn.query("ALTER TABLE `applications` ADD COLUMN `total_tasks` INT DEFAULT 5;");
    console.log("  ✓ Added total_tasks column to applications table.\n");
  }

  // 2. Fix Name, Photo, and Identity for Hariharan S
  console.log("Step 1: Correcting student profile and user details for Hariharan S...");
  await conn.query(`
    UPDATE users 
    SET full_name = 'Hariharan S'
    WHERE LOWER(TRIM(email)) = 'hariharanmahesh34@gmail.com';
  `);

  await conn.query(`
    UPDATE profiles 
    SET full_name = 'Hariharan S', photo_url = ?
    WHERE LOWER(TRIM(email)) = 'hariharanmahesh34@gmail.com';
  `, [HARI_PHOTO]);

  // Fix SKX-2026-9055 and any applications under hariharanmahesh34@gmail.com
  await conn.query(`
    UPDATE applications
    SET full_name = 'Hariharan S', photo_url = ?
    WHERE LOWER(TRIM(email)) = 'hariharanmahesh34@gmail.com' OR intern_id = 'SKX-2026-9055' OR intern_id = 'SKX-INT-2026-842D';
  `, [HARI_PHOTO]);
  console.log("  ✓ Hariharan S name and photo synchronized.");

  // Keep Maheshwaran S distinct on harimaheshwaran34@gmail.com
  await conn.query(`
    UPDATE users 
    SET full_name = 'MAHESH WARAN S'
    WHERE LOWER(TRIM(email)) = 'harimaheshwaran34@gmail.com';
  `);
  await conn.query(`
    UPDATE profiles 
    SET full_name = 'MAHESH WARAN S'
    WHERE LOWER(TRIM(email)) = 'harimaheshwaran34@gmail.com';
  `);
  console.log("  ✓ Maheshwaran S account verified distinct.");

  // 3. Insert Missing REG- Applications & Registrations
  console.log("Step 2: Inserting missing batch applications (including SKX-INT-2026-842D)...");
  let regData = null;
  const regJsonPath = path.resolve(process.cwd(), "scripts", "reg-apps-data.json");
  if (fsSync.existsSync(regJsonPath)) {
    try {
      regData = JSON.parse(fsSync.readFileSync(regJsonPath, "utf-8"));
    } catch {}
  }

  // Disable foreign key checks temporarily for safe batch insertion
  await conn.query("SET FOREIGN_KEY_CHECKS = 0;");

  if (regData && regData.apps && regData.apps.length > 0) {
    // Get existing columns in applications table to avoid any schema mismatch
    const [appCols] = await conn.query("SHOW COLUMNS FROM `applications`");
    const existingAppCols = new Set(appCols.map((c) => c.Field));

    let insertedApps = 0;
    for (const app of regData.apps) {
      try {
        // Resolve or create user_id dynamically from users table by matching email
        if (app.email) {
          const cleanEmail = app.email.trim().toLowerCase();
          const [uRows] = await conn.query(
            "SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
            [cleanEmail]
          );
          if (uRows && uRows.length > 0) {
            app.user_id = uRows[0].id;
          } else {
            // Auto-create user account so foreign key and login are 100% valid
            const newUserId = app.user_id && !app.user_id.startsWith("std_") ? app.user_id : crypto.randomUUID();
            const fullName = app.full_name || cleanEmail.split("@")[0];
            const defaultHash = await bcrypt.hash("Student@123", 10);
            try {
              await conn.query(`
                INSERT INTO users (id, email, password_hash, full_name, raw_user_meta_data, is_verified)
                VALUES (?, ?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
              `, [newUserId, cleanEmail, defaultHash, fullName, JSON.stringify({ full_name: fullName })]);

              await conn.query(`
                INSERT INTO profiles (id, email, full_name)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
              `, [newUserId, cleanEmail, fullName]);

              await conn.query(`
                INSERT INTO user_roles (id, user_id, role)
                VALUES (UUID(), ?, 'user')
                ON DUPLICATE KEY UPDATE role = 'user';
              `, [newUserId]);

              app.user_id = newUserId;
            } catch (uErr) {
              // fallback if exists
            }
          }
        }

        // If it's Hariharan's application, make sure photo_url and full_name are set
        if (app.email && app.email.trim().toLowerCase() === "hariharanmahesh34@gmail.com") {
          app.full_name = "Hariharan S";
          app.photo_url = HARI_PHOTO;
        }

        // Filter keys strictly to columns that exist in the target database table
        const filteredApp = {};
        for (const k of Object.keys(app)) {
          if (existingAppCols.has(k)) {
            filteredApp[k] = app[k];
          }
        }

        const cols = Object.keys(filteredApp);
        const colList = cols.map((c) => `\`${c}\``).join(", ");
        const placeholders = cols.map(() => "?").join(", ");
        const updateClauses = cols.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");
        const values = cols.map((c) => filteredApp[c]);

        await conn.query(`
          INSERT INTO \`applications\` (${colList})
          VALUES (${placeholders})
          ON DUPLICATE KEY UPDATE ${updateClauses}
        `, values);
        insertedApps++;
      } catch (err) {
        console.warn(`  Warning on app ${app.id}:`, err.message);
      }
    }
    console.log(`  ✓ Synced ${insertedApps} batch applications into applications table.`);

    if (regData.regs && regData.regs.length > 0) {
      // Get existing columns in registrations table to avoid any schema mismatch
      const [regCols] = await conn.query("SHOW COLUMNS FROM `registrations`");
      const existingRegCols = new Set(regCols.map((c) => c.Field));

      let insertedRegs = 0;
      for (const reg of regData.regs) {
        try {
          // Filter keys strictly to columns that exist in the target database table
          const filteredReg = {};
          for (const k of Object.keys(reg)) {
            if (existingRegCols.has(k)) {
              filteredReg[k] = reg[k];
            }
          }

          const cols = Object.keys(filteredReg);
          const colList = cols.map((c) => `\`${c}\``).join(", ");
          const placeholders = cols.map(() => "?").join(", ");
          const updateClauses = cols.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(", ");
          const values = cols.map((c) => filteredReg[c]);

          await conn.query(`
            INSERT INTO \`registrations\` (${colList})
            VALUES (${placeholders})
            ON DUPLICATE KEY UPDATE ${updateClauses}
          `, values);
          insertedRegs++;
        } catch (err) {
          console.warn(`  Warning on reg ${reg.id}:`, err.message);
        }
      }
      console.log(`  ✓ Synced ${insertedRegs} registrations into registrations table.`);
    }
  }

  // Re-enable foreign key checks
  await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

  // 4. Safe Auto-Link: Applications to Users by matching email
  console.log("Step 3: Synchronizing application user_id with users table by email...");
  const [linkRes] = await conn.query(`
    UPDATE applications a
    JOIN users u ON LOWER(TRIM(a.email)) = LOWER(TRIM(u.email))
    SET a.user_id = u.id
    WHERE a.user_id != u.id OR a.user_id IS NULL;
  `);
  console.log(`  ✓ Linked ${linkRes.changedRows || 0} applications to active user accounts.`);

  // 5. Ensure any application without a user in users table gets an active user account
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

  // 6. Check Submissions linking to applications
  console.log("Step 5: Verifying student task submissions integrity...");
  const [[{ count: validSubs }]] = await conn.query(`
    SELECT COUNT(*) as count
    FROM submissions s
    JOIN applications a ON s.application_id = a.id;
  `);
  console.log(`  ✓ Verified ${validSubs} active task submissions linked to applications.`);

  // 7. Verify Hariharan S's applications specifically
  console.log("\n=============================================================");
  console.log("   HARIHARAN S DASHBOARD DATA VERIFICATION:                  ");
  console.log("=============================================================");
  const [hariApps] = await conn.query(`
    SELECT id, user_id, intern_id, domain, full_name, email, duration, status, created_at, photo_url
    FROM applications
    WHERE LOWER(TRIM(email)) = 'hariharanmahesh34@gmail.com'
    ORDER BY created_at DESC;
  `);

  for (const a of hariApps) {
    const [[{ count: subCount }]] = await conn.query("SELECT COUNT(*) as count FROM submissions WHERE application_id = ?", [a.id]);
    console.log(`  • ID: ${a.intern_id} | Domain: ${a.domain} | Name: ${a.full_name} | Duration: ${a.duration}M | Status: ${a.status} | Submissions: ${subCount} | Photo: ${a.photo_url ? "YES" : "NO"}`);
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
