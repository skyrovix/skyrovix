import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const srcLogo = path.resolve("src/assets/logo.png");
const pubDir = path.resolve("public");

if (!fs.existsSync(srcLogo)) {
  console.error("[favicon] src/assets/logo.png not found");
  process.exit(1);
}

async function main() {
  const logoBuf = fs.readFileSync(srcLogo);
  const { data: rawLogo, info } = await sharp(logoBuf)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;

  // Build a subtle white contour around dark pixels so the favicon remains
  // crystal clear on BOTH dark browser tabs (e.g. Chrome dark mode) and light tabs
  const strokeData = Buffer.alloc(W * H * 4);
  const strokeRadius = Math.max(4, Math.round(W * 0.012));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let maxA = 0;
      for (let dy = -strokeRadius; dy <= strokeRadius; dy += 2) {
        for (let dx = -strokeRadius; dx <= strokeRadius; dx += 2) {
          if (dx * dx + dy * dy <= strokeRadius * strokeRadius) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < H && nx >= 0 && nx < W) {
              const a = rawLogo[(ny * W + nx) * 4 + 3];
              if (a > maxA) maxA = a;
            }
          }
        }
      }
      const idx = (y * W + x) * 4;
      if (maxA > 25) {
        strokeData[idx] = 255;
        strokeData[idx + 1] = 255;
        strokeData[idx + 2] = 255;
        strokeData[idx + 3] = Math.min(255, maxA);
      }
    }
  }

  const whiteStrokeImg = await sharp(strokeData, {
    raw: { width: W, height: H, channels: 4 },
  })
    .png()
    .toBuffer();

  const contouredMaster = await sharp(whiteStrokeImg)
    .composite([{ input: logoBuf, gravity: "center" }])
    .png()
    .toBuffer();

  // 1. Generate tab favicons (16x16 and 32x32) with 100% transparent background and zero edge lines
  const tabFaviconSizes = [
    { name: "favicon-16x16.png", canvasSize: 16, contentSize: 14 },
    { name: "favicon-32x32.png", canvasSize: 32, contentSize: 28 },
  ];

  for (const { name, canvasSize, contentSize } of tabFaviconSizes) {
    const out = path.join(pubDir, name);
    const emblem = await sharp(contouredMaster)
      .resize(contentSize, contentSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    await sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: emblem, gravity: "center" }])
      .png({ quality: 100 })
      .toFile(out);

    const stat = fs.statSync(out);
    console.log(`[favicon] ${name} (${canvasSize}x${canvasSize}) — ${stat.size} bytes`);
  }

  // 2. Multi-size favicon.ico (16, 32, 48) with transparent background
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const size of icoSizes) {
    const contentSize = Math.max(12, Math.round(size * 0.88));
    const emblem = await sharp(contouredMaster)
      .resize(contentSize, contentSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    const buf = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{ input: emblem, gravity: "center" }])
      .png()
      .toBuffer();

    icoBuffers.push({ size, data: buf });
  }

  const icoPath = path.join(pubDir, "favicon.ico");
  const icoModule = await import("ico-endec");
  const icoBuf = icoModule.default.encode(icoBuffers.map((b) => b.data));
  fs.writeFileSync(icoPath, icoBuf);
  const icoStat = fs.statSync(icoPath);
  console.log(`[favicon] favicon.ico — ${icoStat.size} bytes`);

  // 3. Apple Touch Icon (180x180) & Android Chrome Icons (192x192, 512x512)
  // Clean white background with crisp logo in center safe zone (no dark-on-dark clipping!)
  const appIconSizes = [
    { name: "apple-touch-icon.png", size: 180, padPct: 0.16 },
    { name: "android-chrome-192x192.png", size: 192, padPct: 0.20 },
    { name: "android-chrome-512x512.png", size: 512, padPct: 0.20 },
  ];

  for (const { name, size, padPct } of appIconSizes) {
    const out = path.join(pubDir, name);
    const emblemSize = Math.round(size * (1 - padPct));
    const emblemResized = await sharp(logoBuf)
      .resize(emblemSize, emblemSize, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    const bgSvg = Buffer.from(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#ffffff" />
      </svg>
    `);

    await sharp(bgSvg)
      .composite([{ input: emblemResized, gravity: "center" }])
      .png({ quality: 100 })
      .toFile(out);

    const stat = fs.statSync(out);
    console.log(`[favicon] ${name} (${size}x${size}) — ${stat.size} bytes`);
  }
}

main().catch((err) => {
  console.error("[favicon] Failed:", err);
  process.exit(1);
});
