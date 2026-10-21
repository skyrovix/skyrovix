import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "123Sk_hari@2006",
    database: "skyrovix",
  });

  const [students] = await conn.query("SELECT * FROM students");
  const [registrations] = await conn.query("SELECT * FROM registrations");
  console.log(`Syncing ${students.length} students and ${registrations.length} registrations...`);

  // Map student_id to resolved user_id
  const studentToUserIdMap = new Map();

  for (const s of students) {
    // Check if user already exists with this email
    const [existingUsers] = await conn.query("SELECT id FROM users WHERE email = ? LIMIT 1", [s.email]);
    let userId = s.id;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
    } else {
      await conn.query(
        `INSERT INTO users (id, email, password_hash, full_name, is_verified, created_at)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [s.id, s.email, s.password_hash || "$2b$10$dummyHashForStudentLogin", s.full_name, s.created_at]
      );
    }
    studentToUserIdMap.set(s.id, userId);

    // 2. Profiles
    const course = [s.degree, s.department].filter(Boolean).join(" ") || "B.Tech IT";
    await conn.query(
      `INSERT INTO profiles (id, full_name, email, phone, college, course, year, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), college = VALUES(college), course = VALUES(course)`,
      [userId, s.full_name, s.email, s.mobile, s.college, course, s.year_of_study, s.created_at]
    );

    // 3. User roles
    const [existingRoles] = await conn.query("SELECT id FROM user_roles WHERE user_id = ? AND role = 'student'", [userId]);
    if (existingRoles.length === 0) {
      await conn.query(
        `INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), ?, 'student')`,
        [userId]
      );
    }
  }

  for (const r of registrations) {
    const s = students.find((std) => std.id === r.student_id);
    if (!s) continue;
    const userId = studentToUserIdMap.get(r.student_id) || r.student_id;
    const course = [s.degree, s.department].filter(Boolean).join(" ") || "B.Tech IT";
    const domain = r.domain?.toLowerCase().includes("full stack") ? "fullstack" : (r.domain?.toLowerCase() || "fullstack");
    
    let status = "ongoing";
    if (r.registration_status === "PAYMENT_PENDING") status = "pending";
    else if (r.internship_status === "COMPLETED") status = "completed";
    else if (r.internship_status === "ACTIVE") status = "ongoing";

    const durationWeeks = r.duration?.includes("6") ? 24 : 12;
    const internId = r.internship_id || s.student_id_formatted || `SKX-INT-2026-${r.id.slice(-4)}`;
    const subStatus = r.internship_status === "COMPLETED" ? "approved" : "not_started";

    await conn.query(
      `INSERT INTO applications (
        id, user_id, domain, status, duration, full_name, email, phone,
        college, course, year, intern_id, submission_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status), full_name = VALUES(full_name), intern_id = VALUES(intern_id), domain = VALUES(domain)`,
      [
        r.id, userId, domain, status, durationWeeks, s.full_name, s.email, s.mobile,
        s.college, course, s.year_of_study, internId, subStatus, r.created_at
      ]
    );
  }

async function addColumnIfNotExists(conn, table, col, def) {
  try {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col}\` ${def}`);
  } catch (e) {
    if (e.code !== "ER_DUP_FIELDNAME") throw e;
  }
}

  // Ensure relational columns exist on legacy tables
  await addColumnIfNotExists(conn, "payments", "application_id", "VARCHAR(36) NULL");
  await addColumnIfNotExists(conn, "payments", "utr_number", "VARCHAR(100) NULL");
  await addColumnIfNotExists(conn, "payments", "submitted_at", "DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3)");
  await addColumnIfNotExists(conn, "payments", "verified_at", "DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3)");
  await conn.query("UPDATE payments SET application_id = registration_id WHERE application_id IS NULL AND registration_id IS NOT NULL");
  await conn.query("UPDATE payments SET submitted_at = created_at WHERE submitted_at IS NULL");
  await conn.query("UPDATE payments SET verified_at = updated_at WHERE verified_at IS NULL AND status = 'verified'");

  await addColumnIfNotExists(conn, "submissions", "application_id", "VARCHAR(36) NULL");
  await conn.query("UPDATE submissions s JOIN applications a ON a.user_id = s.student_id SET s.application_id = a.id WHERE s.application_id IS NULL");

  await addColumnIfNotExists(conn, "certificates", "application_id", "VARCHAR(36) NULL");
  await conn.query("UPDATE certificates c JOIN applications a ON a.user_id = c.student_id SET c.application_id = a.id WHERE c.application_id IS NULL");

  await addColumnIfNotExists(conn, "submission_history", "table_name", "VARCHAR(100) NULL DEFAULT 'submissions'");
  await conn.query("UPDATE submission_history SET table_name = 'submissions' WHERE table_name IS NULL");

  const [u] = await conn.query("SELECT COUNT(*) as c FROM users");
  const [p] = await conn.query("SELECT COUNT(*) as c FROM profiles");
  const [a] = await conn.query("SELECT COUNT(*) as c FROM applications");
  console.log(`Sync complete! Users: ${u[0].c}, Profiles: ${p[0].c}, Applications: ${a[0].c}`);

  await conn.end();
}

main().catch(console.error);
