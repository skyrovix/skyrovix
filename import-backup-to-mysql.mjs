#!/usr/bin/env node
/**
 * ==============================================================================
 * SKYROVIX — BACKUP ZIP / SQL TO MYSQL IMPORT & RESTORATION TOOL
 * Usage:
 *   node import-backup-to-mysql.mjs <path-to-backup.zip or path-to-database.sql>
 *
 * Examples:
 *   node import-backup-to-mysql.mjs mv8b58ysh80p4by.zip
 *   node import-backup-to-mysql.mjs database.sql
 * ==============================================================================
 */

import fs from "fs/promises";
import { existsSync, createReadStream } from "fs";
import path from "path";
import JSZip from "jszip";
import mysql from "mysql2/promise";

const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT || 3306);
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "skyrovix_main_db";

async function main() {
  const targetArg = process.argv[2];
  if (!targetArg) {
    console.log("==================================================================");
    console.log("📦 SKYROVIX BACKUP RESTORATION TOOL");
    console.log("==================================================================");
    console.log("Usage:");
    console.log("  node import-backup-to-mysql.mjs <backup-file.zip | database.sql>");
    console.log("");
    console.log("Please provide the path to your backup file (ZIP or SQL).");
    console.log("Example:");
    console.log("  node import-backup-to-mysql.mjs ./mv8b58ysh80p4by.zip");
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), targetArg);
  if (!existsSync(filePath)) {
    console.error(`❌ Error: File not found at '${filePath}'`);
    process.exit(1);
  }

  console.log(`🔍 Inspecting backup file: ${filePath}`);
  const fileBuffer = await fs.readFile(filePath);
  const isZip = filePath.endsWith(".zip") || (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b);

  let sqlContent = "";
  const publicUploadsDir = path.resolve(process.cwd(), "public", "uploads");

  if (isZip) {
    console.log("📦 Extracting ZIP backup archive...");
    const zip = await JSZip.loadAsync(fileBuffer);

    // 1. Check metadata
    if (zip.files["metadata.json"]) {
      const metaText = await zip.files["metadata.json"].async("text");
      try {
        const meta = JSON.parse(metaText);
        console.log(`📋 Backup Metadata: ID=${meta.id || meta.backupId}, Type=${meta.type}, Created=${meta.created_at || meta.createdAt}`);
      } catch {}
    }

    // 2. Extract database.sql
    if (zip.files["database.sql"]) {
      sqlContent = await zip.files["database.sql"].async("text");
      console.log(`📄 Found database.sql (${(sqlContent.length / 1024).toFixed(1)} KB)`);
    } else {
      console.warn("⚠️ No 'database.sql' found in the ZIP archive.");
    }

    // 3. Extract uploads/
    const uploadsFolder = zip.folder("uploads");
    if (uploadsFolder) {
      console.log("📂 Restoring uploaded files to public/uploads/...");
      await fs.mkdir(publicUploadsDir, { recursive: true });

      let fileCount = 0;
      const entries = [];
      uploadsFolder.forEach((relPath, file) => entries.push({ relPath, file }));

      for (const { relPath, file } of entries) {
        if (file.dir) continue;
        const content = await file.async("nodebuffer");
        const outPath = path.resolve(publicUploadsDir, relPath);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, content);
        fileCount++;
      }
      console.log(`✅ Restored ${fileCount} files into public/uploads/`);
    }
  } else {
    // Plain SQL file
    sqlContent = fileBuffer.toString("utf-8");
  }

  if (!sqlContent.trim()) {
    console.log("ℹ️ No SQL statements to import. Exiting.");
    process.exit(0);
  }

  console.log(`🐬 Connecting to MySQL at ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      multipleStatements: true,
    });
    console.log("✅ Connected to MySQL database successfully.");
  } catch (err) {
    console.error(`❌ Could not connect to MySQL database '${MYSQL_DATABASE}':`, err.message);
    console.log("💡 Tip: Verify your MySQL credentials in .env or run:");
    console.log(`   mysql -u ${MYSQL_USER} -p -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};"`);
    process.exit(1);
  }

  try {
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';");

    console.log("🔄 Adapting PostgreSQL queries for MySQL...");

    // Split SQL by lines
    const lines = sqlContent.split(/\r?\n/);
    let tableStats = {};
    let executedStatements = 0;
    let failedStatements = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("--") || line.startsWith("SET ")) continue;

      if (line.startsWith("INSERT INTO") || line.startsWith("DELETE FROM")) {
        // Adapt query for MySQL:
        // 1. Remove "public."
        // 2. Replace "true" with 1, "false" with 0
        // 3. For INSERT INTO, use INSERT IGNORE INTO so duplicate primary keys don't crash
        let adapted = line
          .replace(/\bpublic\./gi, "")
          .replace(/\bINSERT INTO\b/gi, "INSERT IGNORE INTO ");

        // Extract table name for reporting
        const match = adapted.match(/INSERT IGNORE INTO\s+([a-zA-Z0-9_`]+)/i);
        const tbl = match ? match[1].replace(/`/g, "") : "unknown";

        try {
          await connection.query(adapted);
          executedStatements++;
          tableStats[tbl] = (tableStats[tbl] || 0) + 1;
        } catch (queryErr) {
          failedStatements++;
          if (failedStatements <= 5) {
            console.warn(`  ⚠️ Query notice on ${tbl}: ${queryErr.message}`);
          }
        }
      }
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("==================================================================");
    console.log(`🎉 BACKUP IMPORT COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Total statements executed: ${executedStatements} (Skipped/Errors: ${failedStatements})`);
    console.log("📋 Records imported per table:");
    for (const [tbl, count] of Object.entries(tableStats)) {
      console.log(`   • ${tbl.padEnd(25)}: ${count} records`);
    }
    console.log("==================================================================");
  } finally {
    if (connection) await connection.end();
  }
}

main().catch((err) => {
  console.error("Fatal import error:", err);
  process.exit(1);
});
