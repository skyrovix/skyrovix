import pg from 'pg';
import fs from 'fs';
import path from 'path';

async function main() {
  const client = new pg.Client({
    user: 'postgres.eesiuqeswydlmwhecrcy',
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    database: 'postgres',
    password: '123harimahesh',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting to PostgreSQL database...');
  await client.connect();
  console.log('Connected!');

  const sql = fs.readFileSync('migrations-fee-payment-system.sql', 'utf-8');
  console.log('Executing migration...');
  await client.query(sql);
  console.log('Migration executed successfully!');

  // Verify tables
  console.log('\nVerifying tables:');
  const tables = ['fee_settings', 'payment_records', 'coupon_redemptions', 'fee_audit_logs', 'coupons'];
  for (const t of tables) {
    const r = await client.query(`SELECT count(*) FROM ${t}`);
    console.log(`  - ${t}: ${r.rows[0].count} rows`);
  }

  // Verify fee_settings content
  const fees = await client.query('SELECT * FROM fee_settings ORDER BY fee_type');
  console.log('\nCurrent Fee Settings:');
  fees.rows.forEach(f => {
    console.log(`  - [${f.fee_type}] amount: ₹${f.amount}, enabled: ${f.is_enabled}, upi: ${f.upi_id}`);
  });

  // Verify payment_records sample
  const pays = await client.query('SELECT id, payment_type, amount, utr_number, status, created_at FROM payment_records LIMIT 5');
  console.log('\nSample Payment Records:');
  pays.rows.forEach(p => {
    console.log(`  - [${p.payment_type}] id: ${p.id}, amount: ₹${p.amount}, utr: ${p.utr_number}, status: ${p.status}`);
  });

  await client.end();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
