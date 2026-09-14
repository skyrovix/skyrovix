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
          if (force || !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (e) {
    // Ignore error if file reading fails
  }
}

loadEnv();
