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
    const fees = await pool.query("SELECT * FROM public.fee_settings ORDER BY fee_type");
    const appFeeRow = fees.rows.find(r => r.fee_type === "application");
    const isAppFeeActive = Boolean(appFeeRow && appFeeRow.is_enabled && Number(appFeeRow.amount) > 0);

    console.log(`Setting isAppFeeActive=${isAppFeeActive} based on fee_settings (amount=${appFeeRow?.amount})`);

    const res = await pool.query(`
      UPDATE public.applications a
      SET 
        application_fee_required = $1,
        application_fee_status = CASE 
          WHEN NOT $1 THEN 'not_required'
          WHEN EXISTS (
            SELECT 1 FROM public.payment_records pr 
            WHERE pr.application_id = a.id AND pr.payment_type = 'application' AND pr.status = 'approved'
          ) OR a.application_fee_status = 'approved' THEN 'approved'
          WHEN a.application_fee_status IN ('pending', 'under_review') THEN a.application_fee_status
          ELSE 'pending'
        END,
        all_tasks_verified = (
          (SELECT COUNT(*) FROM public.submissions s WHERE s.application_id = a.id AND s.status = 'approved') >= 5
        ),
        certificate_payment_unlocked = (
          (SELECT COUNT(*) FROM public.submissions s WHERE s.application_id = a.id AND s.status = 'approved') >= 5
        ),
        certificate_payment_status = CASE 
          WHEN (SELECT COUNT(*) FROM public.submissions s WHERE s.application_id = a.id AND s.status = 'approved') < 5 THEN 'locked'
          WHEN EXISTS (
            SELECT 1 FROM public.payment_records pr 
            WHERE pr.application_id = a.id AND pr.payment_type = 'certificate' AND pr.status = 'approved'
          ) OR a.certificate_payment_status = 'approved' THEN 'approved'
          WHEN a.certificate_payment_status = 'waived' THEN 'waived'
          WHEN a.certificate_payment_status = 'pending' THEN 'pending'
          ELSE 'unlocked'
        END;
    `, [isAppFeeActive]);

    console.log(`Updated ${res.rowCount} application rows in single transaction.`);
  } catch (err) {
    console.error("Bulk sync error:", err);
  } finally {
    await pool.end();
  }
}

main();
