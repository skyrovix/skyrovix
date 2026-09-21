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
  console.log("Migrating applications table columns...");
  await pool.query(`
    ALTER TABLE public.applications
    ADD COLUMN IF NOT EXISTS all_tasks_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS certificate_payment_unlocked BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS certificate_payment_status TEXT DEFAULT 'locked',
    ADD COLUMN IF NOT EXISTS application_fee_required BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS application_fee_status TEXT DEFAULT 'not_required';
  `);

  console.log("Syncing initial state for existing records...");
  // 1. Applications with fee settings
  const feeRes = await pool.query("SELECT * FROM public.fee_settings WHERE fee_type = 'application'");
  const appFee = feeRes.rows[0];
  const isAppFeeEnabled = Boolean(appFee?.is_enabled && Number(appFee?.amount) > 0);

  // 2. Set application_fee_required
  if (isAppFeeEnabled) {
    await pool.query(`
      UPDATE public.applications 
      SET application_fee_required = true,
          application_fee_status = CASE 
            WHEN EXISTS (SELECT 1 FROM public.payment_records pr WHERE pr.application_id = applications.id AND pr.payment_type = 'application' AND pr.status = 'approved') THEN 'approved'
            WHEN EXISTS (SELECT 1 FROM public.payment_records pr WHERE pr.application_id = applications.id AND pr.payment_type = 'application' AND pr.status = 'pending') THEN 'pending'
            WHEN status IN ('approved', 'ongoing', 'completed') THEN 'approved'
            ELSE 'pending'
          END
      WHERE application_fee_required IS NULL OR application_fee_required = false;
    `);
  } else {
    await pool.query(`
      UPDATE public.applications
      SET application_fee_required = false,
          application_fee_status = 'approved'
      WHERE application_fee_status IS NULL OR application_fee_status = 'not_required';
    `);
  }

  // 3. For all applications, calculate all_tasks_verified & certificate_payment_unlocked
  await pool.query(`
    WITH app_task_counts AS (
      SELECT 
        a.id as app_id,
        a.total_tasks,
        COALESCE(COUNT(DISTINCT s.task_id) FILTER (WHERE s.status = 'approved'), 0) as approved_tasks
      FROM public.applications a
      LEFT JOIN public.submissions s ON s.application_id = a.id
      GROUP BY a.id, a.total_tasks
    )
    UPDATE public.applications a
    SET 
      all_tasks_verified = (atc.approved_tasks >= COALESCE(NULLIF(a.total_tasks, 0), 5) AND atc.approved_tasks > 0),
      certificate_payment_unlocked = (atc.approved_tasks >= COALESCE(NULLIF(a.total_tasks, 0), 5) AND atc.approved_tasks > 0),
      certificate_payment_status = CASE 
        WHEN (atc.approved_tasks >= COALESCE(NULLIF(a.total_tasks, 0), 5) AND atc.approved_tasks > 0) THEN 'unlocked'
        ELSE 'locked'
      END
    FROM app_task_counts atc
    WHERE a.id = atc.app_id;
  `);

  console.log("Migration complete!");
  await pool.end();
}

main().catch(console.error);
