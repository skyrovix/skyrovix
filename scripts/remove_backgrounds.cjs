const path = require('path');
const fs = require('fs');
const sharp = require(path.resolve('./node_modules/sharp'));

const dir = 'c:/Users/HARIHARAN S/OneDrive/Desktop/skyrovix/src/assets/college-loge-right-to-left';
const files = fs.readdirSync(dir);

async function processImages() {
  for (const file of files) {
    if (!file.endsWith('.jpeg') && !file.endsWith('.jpg')) continue;
    const filePath = path.join(dir, file);
    
    const image = sharp(filePath);
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];
    
    let isDarkBg = false;
    let isWhiteBg = false;
    
    let darkCorners = 0;
    let whiteCorners = 0;
    
    corners.forEach(([x, y]) => {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r < 60 && g < 60 && b < 60) darkCorners++;
      if (r > 190 && g > 190 && b > 190) whiteCorners++;
    });

    if (darkCorners >= 2) isDarkBg = true;
    if (whiteCorners >= 2) isWhiteBg = true;

    console.log(`Processing ${file} (Dark: ${isDarkBg}, White: ${isWhiteBg})...`);

    const newBuffer = Buffer.from(data);
    for (let i = 0; i < newBuffer.length; i += 4) {
      const r = newBuffer[i];
      const g = newBuffer[i + 1];
      const b = newBuffer[i + 2];

      if (isDarkBg) {
        const maxVal = Math.max(r, g, b);
        if (maxVal < 45) {
          newBuffer[i + 3] = 0;
        } else if (maxVal < 85) {
          newBuffer[i + 3] = Math.round(((maxVal - 45) / 40) * 255);
        }
      } else if (isWhiteBg) {
        const minVal = Math.min(r, g, b);
        if (minVal > 190) {
          newBuffer[i + 3] = 0;
        } else if (minVal > 160) {
          newBuffer[i + 3] = Math.round(((190 - minVal) / 30) * 255);
        }
      }
    }

    const pngName = file.replace(/\.(jpeg|jpg)$/i, '-transparent.png');
    const outPath = path.join(dir, pngName);
    
    await sharp(newBuffer, { raw: { width, height, channels: 4 } })
      .png()
      .toFile(outPath);

    console.log(`Saved transparent PNG: ${pngName}`);
    fs.unlinkSync(filePath);
  }
}

processImages().catch(console.error);
