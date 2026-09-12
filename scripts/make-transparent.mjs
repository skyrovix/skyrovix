import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'src/assets/college-loge-right-to-left';

async function processOriental() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 4.49.16 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const maxVal = Math.max(r, g, b);
    
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    
    if (maxVal < 18) {
      out[i * 4 + 3] = 0;
    } else if (maxVal < 45) {
      out[i * 4 + 3] = Math.round(((maxVal - 18) / 27) * 255);
    } else {
      out[i * 4 + 3] = 255;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'oriental-transparent.png'));
  console.log('Processed Oriental');
}

async function processVignan() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 4.52.37 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const maxVal = Math.max(r, g, b);
    
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    
    if (maxVal < 20) {
      out[i * 4 + 3] = 0;
    } else if (maxVal < 50) {
      out[i * 4 + 3] = Math.round(((maxVal - 20) / 30) * 255);
    } else {
      out[i * 4 + 3] = 255;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'vignan-transparent.png'));
  console.log('Processed Vignan');
}

async function processKip() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 4.51.42 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const maxVal = Math.max(r, g, b);
    
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    
    if (maxVal < 20) {
      out[i * 4 + 3] = 0;
    } else if (maxVal < 50) {
      out[i * 4 + 3] = Math.round(((maxVal - 20) / 30) * 255);
    } else {
      out[i * 4 + 3] = 255;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'kip-transparent.png'));
  console.log('Processed KIP');
}

async function processPresidency() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 4.56.27 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const minVal = Math.min(r, g, b);
    
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    
    if (minVal > 240) {
      out[i * 4 + 3] = 0;
    } else if (minVal > 210) {
      out[i * 4 + 3] = Math.round(((240 - minVal) / 30) * 255);
    } else {
      out[i * 4 + 3] = 255;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'presidency-transparent.png'));
  console.log('Processed Presidency');
}

async function processAce() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 5.00.14 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  
  // Target blue bg: approx [32, 84, 160]
  // Logo is white. On light background, we render the logo in ACE brand blue [24, 75, 155]
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    
    // Distance from white
    const distToWhite = Math.sqrt((255 - r)**2 + (255 - g)**2 + (255 - b)**2);
    
    if (distToWhite < 120) {
      // White logo pixel -> render as ACE brand blue
      const alpha = distToWhite < 60 ? 1 : (120 - distToWhite) / 60;
      out[i * 4] = 24;     // Brand blue
      out[i * 4 + 1] = 75;
      out[i * 4 + 2] = 155;
      out[i * 4 + 3] = Math.round(alpha * 255);
    } else {
      // Blue background pixel -> transparent
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'ace-transparent.png'));
  console.log('Processed ACE');
}

async function processGnit() {
  const file = path.join(dir, 'WhatsApp Image 2026-09-12 at 4.54.18 PM.jpeg');
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  
  // GNIT: Extract the seal crest on the left (x: 0 to 450) and make background transparent
  // In the seal, background is light blue.
  const out = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    const x = i % info.width;
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    
    // Yellow background on right side: r > 200, g > 170, b < 90
    const isYellowBg = (r > 190 && g > 160 && b < 80);
    // Blue background on left side: b > 180 && r < 140
    const isBlueBg = (b > 180 && r < 150 && g < 180 && (r < 110 || g < 150));
    
    if (isYellowBg || isBlueBg) {
      out[i * 4 + 3] = 0;
    } else {
      out[i * 4] = r;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = b;
      out[i * 4 + 3] = 255;
    }
  }
  
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim()
    .png()
    .toFile(path.join(dir, 'gnit-transparent.png'));
  console.log('Processed GNIT');
}

async function run() {
  await processOriental();
  await processVignan();
  await processKip();
  await processPresidency();
  await processAce();
  await processGnit();
  console.log('All processed!');
}
run();
