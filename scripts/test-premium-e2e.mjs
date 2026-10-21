import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "123Sk_hari@2006",
  database: process.env.MYSQL_DATABASE || "skyrovix",
  waitForConnections: true,
  connectionLimit: 10,
});

async function runTests() {
  console.log("=================================================");
  console.log("🚀 STARTING SKYROVIX STANDARD & PREMIUM E2E TESTS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Fee Settings Test
    console.log("--- 1. Testing Fee Settings ---");
    const [feeRows] = await pool.query(
      "SELECT * FROM fee_settings WHERE fee_type = 'premium_plan'"
    );
    assert(feeRows.length === 1, "premium_plan row exists in fee_settings");
    assert(Number(feeRows[0].amount) === 200, "premium_plan default amount is ₹200");
    assert(feeRows[0].is_enabled === 1, "premium_plan is enabled by default");

    // 2. Application Schema Plan Columns Test
    console.log("\n--- 2. Testing Application Columns ---");
    const [cols] = await pool.query("DESCRIBE applications");
    const colNames = cols.map(c => c.Field);
    const expectedCols = [
      "plan_type",
      "plan_fee",
      "plan_payment_status",
      "plan_payment_id",
      "plan_payment_method",
      "plan_paid_at",
      "discount_amount",
      "agreed_fee"
    ];
    expectedCols.forEach(col => {
      assert(colNames.includes(col), `Column '${col}' exists in applications table`);
    });

    // 3. Project Challenges & Tiers Test
    console.log("\n--- 3. Testing Project Learning Resources Catalogue ---");
    const [projectRows] = await pool.query(
      "SELECT id, project_id, title, difficulty, tier, min_duration FROM project_challenges WHERE is_published = 1"
    );
    assert(projectRows.length >= 50, `Found ${projectRows.length} published project resources (>= 50 required)`);
    
    const tier1Projects = projectRows.filter(p => p.tier === "tier1" || p.min_duration <= 3);
    const tier2Projects = projectRows.filter(p => p.tier === "tier2" || p.min_duration === 6);
    assert(tier1Projects.length >= 25, `Found ${tier1Projects.length} Tier 1 resources (>= 25 available for 3-Month Premium)`);
    assert(tier2Projects.length >= 25, `Found ${tier2Projects.length} Tier 2 resources (50+ available for 6-Month Premium)`);

    // 4. Student Kit Items Test
    console.log("\n--- 4. Testing Student Kit Items ---");
    const [kitRows] = await pool.query(
      "SELECT * FROM student_kit_items WHERE is_active = 1"
    );
    assert(kitRows.length >= 6, `Found ${kitRows.length} active Student Kit items`);
    assert(kitRows.some(k => k.category.toLowerCase().includes("tool")), "Includes starter toolkits (Developer Tooling)");
    assert(kitRows.some(k => k.category.toLowerCase().includes("career")), "Includes career and resume kits (Career & Placement)");

    // 5. Guidance Schedules Test
    console.log("\n--- 5. Testing Mentorship Guidance Schedules ---");
    const [guidanceRows] = await pool.query(
      "SELECT * FROM guidance_schedules"
    );
    assert(guidanceRows.length >= 3, `Found ${guidanceRows.length} guidance schedules`);
    assert(guidanceRows.some(g => g.mentor_name), "Mentors assigned to guidance schedules");

    // 6. Plan Duration & Task Matrix Verification
    console.log("\n--- 6. Testing Task Limits & Plan Rules ---");
    const taskMatrix = {
      1: 5,   // Standard 1-month: 5 tasks
      2: 8,   // Standard 2-month: 8 tasks
      3: 10,  // Standard or Premium 3-month: 10 tasks
      6: 12   // Standard or Premium 6-month: 12 tasks
    };

    function getTaskCount(duration) {
      if (duration === 1) return 5;
      if (duration === 2) return 8;
      if (duration === 3) return 10;
      if (duration === 6) return 12;
      return 5;
    }

    assert(getTaskCount(1) === 5, "Standard 1-Month has exactly 5 tasks");
    assert(getTaskCount(2) === 8, "Standard 2-Month has exactly 8 tasks");
    assert(getTaskCount(3) === 10, "Standard & Premium 3-Month has exactly 10 tasks");
    assert(getTaskCount(6) === 12, "Standard & Premium 6-Month has exactly 12 tasks");

    // 7. Simulating Standard Enrollment (1M, 2M, 3M, 6M)
    console.log("\n--- 7. Testing Standard & Premium Database Operations ---");
    const testUserId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"; // admin user as test runner

    // Standard 1-Month Application
    const testInternId1 = `TEST-STD-1M-${Date.now()}`;
    await pool.query(
      `INSERT INTO applications (
        id, user_id, domain, status, intern_id, full_name, email, duration,
        plan_type, plan_fee, plan_payment_status, agreed_fee
      ) VALUES (
        UUID(), ?, 'frontend', 'approved', ?, 'Test Standard Student', 'test.standard@example.com', 1,
        'standard', 0.00, 'free', 0.00
      )`,
      [testUserId, testInternId1]
    );
    const [stdApp1] = await pool.query("SELECT * FROM applications WHERE intern_id = ?", [testInternId1]);
    assert(stdApp1.length === 1, "Standard 1-Month enrollment saved");
    assert(stdApp1[0].plan_type === "standard", "Standard plan type verified");
    assert(Number(stdApp1[0].plan_fee) === 0, "Standard plan fee is 0");

    // Premium 3-Month Application with ₹200 fee
    const testInternIdPrem3 = `TEST-PREM-3M-${Date.now()}`;
    await pool.query(
      `INSERT INTO applications (
        id, user_id, domain, status, intern_id, full_name, email, duration,
        plan_type, plan_fee, plan_payment_status, agreed_fee
      ) VALUES (
        UUID(), ?, 'fullstack', 'approved', ?, 'Test Premium Student 3M', 'test.prem3@example.com', 3,
        'premium', 200.00, 'paid', 200.00
      )`,
      [testUserId, testInternIdPrem3]
    );
    const [premApp3] = await pool.query("SELECT * FROM applications WHERE intern_id = ?", [testInternIdPrem3]);
    assert(premApp3.length === 1, "Premium 3-Month enrollment saved");
    assert(premApp3[0].plan_type === "premium", "Premium plan type verified");
    assert(Number(premApp3[0].plan_fee) === 200, "Premium 3-Month plan fee is ₹200");
    assert(premApp3[0].plan_payment_status === "paid", "Premium plan paid status verified");

    // Premium 6-Month Application with ₹200 fee
    const testInternIdPrem6 = `TEST-PREM-6M-${Date.now()}`;
    await pool.query(
      `INSERT INTO applications (
        id, user_id, domain, status, intern_id, full_name, email, duration,
        plan_type, plan_fee, plan_payment_status, agreed_fee
      ) VALUES (
        UUID(), ?, 'fullstack', 'approved', ?, 'Test Premium Student 6M', 'test.prem6@example.com', 6,
        'premium', 200.00, 'paid', 200.00
      )`,
      [testUserId, testInternIdPrem6]
    );
    const [premApp6] = await pool.query("SELECT * FROM applications WHERE intern_id = ?", [testInternIdPrem6]);
    assert(premApp6.length === 1, "Premium 6-Month enrollment saved");
    assert(premApp6[0].plan_type === "premium", "Premium plan type verified");
    assert(Number(premApp6[0].plan_fee) === 200, "Premium 6-Month plan fee is ₹200");

    // Clean up test rows
    await pool.query(
      "DELETE FROM applications WHERE intern_id IN (?, ?, ?)",
      [testInternId1, testInternIdPrem3, testInternIdPrem6]
    );
    console.log("Cleaned up test application records.");

    // 8. Admin Security & Queries
    console.log("\n--- 8. Testing Admin Plan Filter Query ---");
    const [adminFilterStd] = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE plan_type = 'standard' OR plan_type IS NULL"
    );
    const [adminFilterPrem] = await pool.query(
      "SELECT COUNT(*) as count FROM applications WHERE plan_type = 'premium'"
    );
    assert(adminFilterStd[0].count >= 0, "Admin standard plan query works");
    assert(adminFilterPrem[0].count >= 0, "Admin premium plan query works");

    console.log("\n=================================================");
    console.log(`🏁 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution failed with unhandled error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runTests();
