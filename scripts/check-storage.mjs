import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://eesiuqeswydlmwhecrcy.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlc2l1cWVzd3lkbG13aGVjcmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxODI0OTAsImV4cCI6MjA5Nzc1ODQ5MH0.56yomVN0MzIVwLbBZarmZVaJyKwC8cs_KJPEil3usY0";

const supabase = createClient(DEFAULT_URL, DEFAULT_ANON_KEY);

async function main() {
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log("Buckets:", buckets, bErr);

  const { data: qrFiles, error: qrErr } = await supabase.storage.from("payment-screenshots").list("qr");
  console.log("payment-screenshots/qr:", qrFiles, qrErr);

  const { data: rootFiles, error: rootErr } = await supabase.storage.from("payment-screenshots").list();
  console.log("payment-screenshots root:", rootFiles?.slice(0, 10), rootErr);
}

main();
