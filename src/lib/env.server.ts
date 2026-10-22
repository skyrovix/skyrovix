import fs from "node:fs";
import path from "node:path";

let isLoaded = false;

export function loadEnv(force = false) {
  if (isLoaded && !force) return;
  isLoaded = true;

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const parts = trimmed.split("=");
        const key = parts[0].trim().replace(/^export\s+/, "");
        let val = parts.slice(1).join("=").trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key) {
          if (force || !process.env[key] || !process.env[key].trim()) {
            process.env[key] = val;
          }
        }
      }
    }

    if (!process.env.SMTP_HOST) process.env.SMTP_HOST = "smtp.gmail.com";
    if (!process.env.SMTP_PORT) process.env.SMTP_PORT = "465";
    if (!process.env.SMTP_FROM) process.env.SMTP_FROM = "Skyrovix <skyrovix@gmail.com>";

    if (!process.env.CASHFREE_ENVIRONMENT) process.env.CASHFREE_ENVIRONMENT = "SANDBOX";
    if (!process.env.CASHFREE_API_VERSION) process.env.CASHFREE_API_VERSION = "2023-08-01";

    if (!process.env.MYSQL_HOST) process.env.MYSQL_HOST = "127.0.0.1";
    if (!process.env.MYSQL_PORT) process.env.MYSQL_PORT = "3306";
    if (!process.env.MYSQL_DATABASE) process.env.MYSQL_DATABASE = "skyrovix_main_db";
  } catch (e) {
    // Ignore error if file reading fails
  }
}

loadEnv();
