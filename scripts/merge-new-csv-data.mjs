import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

function parseCsv(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];

    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          currentVal += '"';
          i += 2;
          continue;
        } else {
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentVal += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = "";
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && text[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
        currentRow = [];
        currentVal = "";
        i++;
        continue;
      } else {
        currentVal += char;
        i++;
        continue;
      }
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) return { headers: [], rows: [] };
  const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));
  const data = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && !row[0]) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] !== undefined ? row[c] : "";
    }
    data.push(obj);
  }
  return { headers, rows: data };
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function stringifyCsv(headers, data) {
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of data) {
    lines.push(headers.map(h => escapeCsvField(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

async function main() {
  const rootDir = process.cwd();
  const csvDir = path.join(rootDir, "database", "csv");
  const newDir = path.join(csvDir, "new_datas_csv_2026-10-26");

  console.log("🚀 Starting CSV Merging Process...");

  // Mapping of Base CSV to New CSV & Key field
  const mergeMap = [
    { base: "students_master.csv", newFile: "new_students_master.csv", idKey: "student_id" },
    { base: "applications.csv", newFile: "new_applications.csv", idKey: "id" },
    { base: "task_submissions.csv", newFile: "new_task_submissions.csv", idKey: "submission_id" },
    { base: "submission_history.csv", newFile: "new_submission_history.csv", idKey: "id" },
    { base: "certificates_issued.csv", newFile: "new_certificates_issued.csv", idKey: "certificate_id" },
    { base: "course_certificates.csv", newFile: "new_course_certificates.csv", idKey: "certificate_id" },
    { base: "payments.csv", newFile: "new_payments.csv", idKey: "id" },
    { base: "storage_files_index.csv", newFile: "new_storage_files_index.csv", idKey: "id" },
    { base: "login_sessions.csv", newFile: "new_login_sessions.csv", idKey: "id" },
  ];

  for (const m of mergeMap) {
    const basePath = path.join(csvDir, m.base);
    const newPath = path.join(newDir, m.newFile);

    let baseData = { headers: [], rows: [] };
    if (fsSync.existsSync(basePath)) {
      const content = await fs.readFile(basePath, "utf-8");
      baseData = parseCsv(content);
    }

    let newData = { headers: [], rows: [] };
    if (fsSync.existsSync(newPath)) {
      const content = await fs.readFile(newPath, "utf-8");
      newData = parseCsv(content);
    }

    const seenIds = new Set();
    const merged = [];

    // Add existing
    for (const row of baseData.rows) {
      const id = row[m.idKey];
      if (id) seenIds.add(id);
      merged.push(row);
    }

    // Add new
    let addedCount = 0;
    for (const row of newData.rows) {
      const id = row[m.idKey];
      if (!id || !seenIds.has(id)) {
        if (id) seenIds.add(id);
        merged.push(row);
        addedCount++;
      } else {
        // update existing
        const idx = merged.findIndex(r => r[m.idKey] === id);
        if (idx !== -1) {
          merged[idx] = { ...merged[idx], ...row };
        }
      }
    }

    const headers = baseData.headers.length > 0 ? baseData.headers : newData.headers;
    await fs.writeFile(basePath, stringifyCsv(headers, merged), "utf-8");
    console.log(`✅ ${m.base}: ${baseData.rows.length} -> ${merged.length} (+${addedCount} new rows)`);
  }

  // Also copy direct new tables into database/csv
  const directNew = [
    { src: "new_cashfree_orders.csv", dest: "cashfree_orders.csv" },
    { src: "new_payment_records.csv", dest: "payment_records.csv" },
    { src: "new_enrollments.csv", dest: "enrollments.csv" },
    { src: "new_lesson_progress.csv", dest: "lesson_progress.csv" },
    { src: "new_quiz_attempts.csv", dest: "quiz_attempts.csv" },
    { src: "new_leaderboard.csv", dest: "leaderboard.csv" },
  ];

  for (const d of directNew) {
    const srcPath = path.join(newDir, d.src);
    const destPath = path.join(csvDir, d.dest);
    if (fsSync.existsSync(srcPath)) {
      await fs.copyFile(srcPath, destPath);
      const parsed = parseCsv(await fs.readFile(srcPath, "utf-8"));
      console.log(`📋 Copied ${d.dest} (${parsed.rows.length} rows) into database/csv/`);
    }
  }

  console.log("\n🎉 All CSV files merged and prepared successfully!");
}

main().catch(err => {
  console.error("❌ Merge failed:", err);
  process.exit(1);
});
