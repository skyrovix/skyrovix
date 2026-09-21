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
    console.log("Auditing current fee settings...");
    const fees = await pool.query("SELECT * FROM public.fee_settings ORDER BY fee_type");
    console.log("Fee settings:", fees.rows);

    const appFeeRow = fees.rows.find(r => r.fee_type === "application");
    const isAppFeeActive = Boolean(appFeeRow && appFeeRow.is_enabled && Number(appFeeRow.amount) > 0);

    console.log(`Application Fee Active: ${isAppFeeActive} (Amount: ₹${appFeeRow?.amount})`);

    // Audit applications and their approved submission count
    const apps = await pool.query(`
      SELECT 
        a.id, 
        a.user_id, 
        a.full_name, 
        a.email, 
        a.status,
        a.application_fee_required, 
        a.application_fee_status,
        a.all_tasks_verified, 
        a.certificate_payment_unlocked, 
        a.certificate_payment_status,
        (SELECT COUNT(*) FROM public.submissions s WHERE s.application_id = a.id) as total_subs,
        (SELECT COUNT(*) FROM public.submissions s WHERE s.application_id = a.id AND s.status = 'approved') as approved_subs,
        (SELECT COUNT(*) FROM public.payment_records pr WHERE pr.application_id = a.id AND pr.payment_type = 'application' AND pr.status = 'approved') as approved_app_payments,
        (SELECT COUNT(*) FROM public.payment_records pr WHERE pr.application_id = a.id AND pr.payment_type = 'certificate' AND pr.status = 'approved') as approved_cert_payments
      FROM public.applications a
      ORDER BY a.created_at DESC
    `);

    console.log(`Found ${apps.rows.length} applications. Auditing and syncing...`);

    let updatedCount = 0;
    for (const app of apps.rows) {
      const approvedSubs = Number(app.approved_subs);
      const totalSubs = Number(app.total_subs);
      const hasApprovedAppPayment = Number(app.approved_app_payments) > 0;
      const hasApprovedCertPayment = Number(app.approved_cert_payments) > 0;

      // Determine correct application fee status
      let newAppFeeReq = isAppFeeActive;
      let newAppFeeStatus = app.application_fee_status;

      if (!isAppFeeActive) {
        newAppFeeReq = false;
        newAppFeeStatus = 'not_required';
      } else {
        if (hasApprovedAppPayment || app.application_fee_status === 'approved') {
          newAppFeeStatus = 'approved';
        } else if (app.application_fee_status === 'pending' || app.application_fee_status === 'under_review') {
          newAppFeeStatus = app.application_fee_status;
        } else {
          newAppFeeStatus = 'pending';
        }
      }

      // Determine task verification & certificate unlock
      // Required tasks is 5 (or minimum 5 for standard Skyrovix internship)
      const allTasksApproved = approvedSubs >= 5;
      const certUnlocked = allTasksApproved;
      let certPaymentStatus = app.certificate_payment_status;

      if (!allTasksApproved) {
        certPaymentStatus = 'locked';
      } else if (hasApprovedCertPayment || app.certificate_payment_status === 'approved') {
        certPaymentStatus = 'approved';
      } else if (app.certificate_payment_status === 'waived') {
        certPaymentStatus = 'waived';
      } else if (app.certificate_payment_status === 'pending') {
        certPaymentStatus = 'pending';
      } else {
        certPaymentStatus = 'unlocked';
      }

      await pool.query(`
        UPDATE public.applications
        SET 
          application_fee_required = $1,
          application_fee_status = $2,
          all_tasks_verified = $3,
          certificate_payment_unlocked = $4,
          certificate_payment_status = $5
        WHERE id = $6
      `, [newAppFeeReq, newAppFeeStatus, allTasksApproved, certUnlocked, certPaymentStatus, app.id]);

      updatedCount++;
    }

    console.log(`Successfully synced ${updatedCount} applications to exact business rules!`);
  } catch (err) {
    console.error("Sync Error:", err);
  } finally {
    await pool.end();
  }
}

main();
