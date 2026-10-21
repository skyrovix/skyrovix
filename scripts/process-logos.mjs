import sharp from "sharp";

async function processLogos() {
  // 1. Process skyrovix logo (full form)
  const fullMeta = await sharp("public/images/skyrovix logo.jpeg").raw().toBuffer({ resolveWithObject: true });
  const fullW = fullMeta.info.width;
  const fullH = fullMeta.info.height;
  const fullData = fullMeta.data;
  
  // Create RGBA buffer for dark text (default for light backgrounds)
  const fullRgba = Buffer.alloc(fullW * fullH * 4);
  // Create RGBA buffer for white text (for dark backgrounds)
  const fullRgbaWhite = Buffer.alloc(fullW * fullH * 4);

  for (let i = 0, j = 0; i < fullData.length; i += 3, j += 4) {
    const r = fullData[i];
    const g = fullData[i+1];
    const b = fullData[i+2];

    const maxVal = Math.max(r, g, b);

    // Is it background black?
    if (maxVal <= 3) {
      fullRgba[j] = 0;
      fullRgba[j+1] = 0;
      fullRgba[j+2] = 0;
      fullRgba[j+3] = 0; // transparent

      fullRgbaWhite[j] = 0;
      fullRgbaWhite[j+1] = 0;
      fullRgbaWhite[j+2] = 0;
      fullRgbaWhite[j+3] = 0;
    } else {
      // Is it orange accent? (r high, b low)
      const isOrange = r > 120 && b < 60;
      if (isOrange) {
        // Orange element (location pin / tassel)
        fullRgba[j] = r;
        fullRgba[j+1] = g;
        fullRgba[j+2] = b;
        fullRgba[j+3] = 255;

        fullRgbaWhite[j] = r;
        fullRgbaWhite[j+1] = g;
        fullRgbaWhite[j+2] = b;
        fullRgbaWhite[j+3] = 255;
      } else {
        // Text letters & cap
        // Dark charcoal #181619 for light backgrounds
        fullRgba[j] = 24;
        fullRgba[j+1] = 22;
        fullRgba[j+2] = 25;
        fullRgba[j+3] = Math.min(255, Math.round(Math.max(0, (maxVal - 3) / 7) * 255));

        // White #ffffff for dark backgrounds
        fullRgbaWhite[j] = 255;
        fullRgbaWhite[j+1] = 255;
        fullRgbaWhite[j+2] = 255;
        fullRgbaWhite[j+3] = Math.min(255, Math.round(Math.max(0, (maxVal - 3) / 7) * 255));
      }
    }
  }

  // Save trimmed transparent PNG for full logo (dark)
  await sharp(fullRgba, { raw: { width: fullW, height: fullH, channels: 4 } })
    .trim()
    .png()
    .toFile("public/images/skyrovix-logo-transparent.png");
  console.log("Generated public/images/skyrovix-logo-transparent.png");

  // Save trimmed transparent PNG for full logo (white)
  await sharp(fullRgbaWhite, { raw: { width: fullW, height: fullH, channels: 4 } })
    .trim()
    .png()
    .toFile("public/images/skyrovix-logo-white.png");
  console.log("Generated public/images/skyrovix-logo-white.png");

  // 2. Process SK logo (short first letter)
  const skMeta = await sharp("public/images/sk logo.jpeg").raw().toBuffer({ resolveWithObject: true });
  const skW = skMeta.info.width;
  const skH = skMeta.info.height;
  const skData = skMeta.data;

  const skRgba = Buffer.alloc(skW * skH * 4);
  const skRgbaWhite = Buffer.alloc(skW * skH * 4);

  for (let i = 0, j = 0; i < skData.length; i += 3, j += 4) {
    const r = skData[i];
    const g = skData[i+1];
    const b = skData[i+2];

    const maxVal = Math.max(r, g, b);

    if (maxVal <= 3) {
      skRgba[j] = 0;
      skRgba[j+1] = 0;
      skRgba[j+2] = 0;
      skRgba[j+3] = 0;

      skRgbaWhite[j] = 0;
      skRgbaWhite[j+1] = 0;
      skRgbaWhite[j+2] = 0;
      skRgbaWhite[j+3] = 0;
    } else {
      const isOrange = r > 120 && b < 60;
      if (isOrange) {
        skRgba[j] = r;
        skRgba[j+1] = g;
        skRgba[j+2] = b;
        skRgba[j+3] = 255;

        skRgbaWhite[j] = r;
        skRgbaWhite[j+1] = g;
        skRgbaWhite[j+2] = b;
        skRgbaWhite[j+3] = 255;
      } else {
        skRgba[j] = 24;
        skRgba[j+1] = 22;
        skRgba[j+2] = 25;
        skRgba[j+3] = Math.min(255, Math.round(Math.max(0, (maxVal - 3) / 7) * 255));

        skRgbaWhite[j] = 255;
        skRgbaWhite[j+1] = 255;
        skRgbaWhite[j+2] = 255;
        skRgbaWhite[j+3] = Math.min(255, Math.round(Math.max(0, (maxVal - 3) / 7) * 255));
      }
    }
  }

  // Save trimmed transparent PNG for SK logo (dark)
  await sharp(skRgba, { raw: { width: skW, height: skH, channels: 4 } })
    .trim()
    .png()
    .toFile("public/images/sk-logo-transparent.png");
  console.log("Generated public/images/sk-logo-transparent.png");

  // Save trimmed transparent PNG for SK logo (white)
  await sharp(skRgbaWhite, { raw: { width: skW, height: skH, channels: 4 } })
    .trim()
    .png()
    .toFile("public/images/sk-logo-white.png");
  console.log("Generated public/images/sk-logo-white.png");
}

processLogos();
