import { createCanvas, loadImage } from "canvas";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const customOgJpg = path.resolve("src/assets/og-default.jpeg");
const outPng = path.resolve("public/og-default.png");
const outJpg = path.resolve("public/og-default.jpeg");

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

function drawGradient(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#07284a");
  grad.addColorStop(0.4, "#0c3b6e");
  grad.addColorStop(0.7, "#0a2f5a");
  grad.addColorStop(1, "#051c36");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawDecorations(ctx, w, h) {
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 6; i++) {
    const x = 80 + i * 200;
    const y = 50 + (i % 3) * 180;
    const r = 60 + (i % 2) * 40;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 4; i++) {
    const x = w - 100 - i * 150;
    const y = h - 80 - (i % 2) * 100;
    ctx.beginPath();
    ctx.arc(x, y, 40 + i * 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 90);
    ctx.lineTo(w, i * 90 + 30);
    ctx.stroke();
  }
}

function drawBottomBar(ctx, w, h) {
  const barH = 52;
  const barY = h - barH;
  const grad = ctx.createLinearGradient(0, barY, 0, h);
  grad.addColorStop(0, "rgba(5,28,54,0.9)");
  grad.addColorStop(1, "rgba(5,28,54,1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, barY, w, barH);

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, barY);
  ctx.lineTo(w - 40, barY);
  ctx.stroke();
}

const tags = [
  "Full Stack", "Frontend", "Backend", "Python", "Java",
  "Data Science", "AI & ML", "UI/UX Design", "Digital Marketing"
];

async function main() {
  if (fs.existsSync(customOgJpg)) {
    if (!fs.existsSync(outJpg) || fs.statSync(customOgJpg).size !== fs.statSync(outJpg).size) {
      fs.copyFileSync(customOgJpg, outJpg);
    }
    await sharp(customOgJpg)
      .resize(W, H, { fit: "cover", position: "center" })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPng);
    console.log(`[og] Converted custom ${customOgJpg} -> ${outPng} (${W}x${H}) and synced ${outJpg}`);
    return;
  }

  drawGradient(ctx, W, H);
  drawDecorations(ctx, W, H);

  let logoY = 55;
  try {
    const logoPath = path.resolve("src/assets/logo.png");
    if (fs.existsSync(logoPath)) {
      const logo = await loadImage(logoPath);
      const logoH = 52;
      const logoW = (logo.width / logo.height) * logoH;
      ctx.drawImage(logo, 60, logoY, logoW, logoH);
    }
  } catch {}

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px sans-serif";
  ctx.fillText("Skyrovix", 60, 145);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "22px sans-serif";
  ctx.fillText("Virtual Internships & Training Portal", 60, 182);

  ctx.strokeStyle = "rgba(59,130,246,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 200);
  ctx.lineTo(340, 200);
  ctx.stroke();

  const tagStartY = 230;
  const tagH = 34;
  const tagGap = 10;
  const tagPadX = 16;
  const tagPadY = 7;
  let curX = 60;
  let curY = tagStartY;
  const maxW = W - 120;

  ctx.font = "600 15px sans-serif";
  for (const tag of tags) {
    const tw = ctx.measureText(tag).width;
    const totalW = tw + tagPadX * 2;
    if (curX + totalW > maxW) {
      curX = 60;
      curY += tagH + tagGap;
    }
    ctx.fillStyle = "rgba(59,130,246,0.15)";
    ctx.beginPath();
    const r = 6;
    const x = curX;
    const y = curY;
    const w = totalW;
    const h = tagH;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(59,130,246,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#e0ecff";
    ctx.fillText(tag, curX + tagPadX, curY + 23);
    curX += totalW + 10;
  }

  drawBottomBar(ctx, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("https://skyrovix.online", 60, H - 18);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Empowering Future Innovators", W - 60, H - 18);
  ctx.textAlign = "left";

  const outPath = path.resolve("public/og-default.png");
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outPath, buffer);
  console.log(`[og] Generated ${outPath} (${buffer.length} bytes, ${W}x${H})`);
}

main().catch((err) => {
  console.error("[og] Failed:", err);
  process.exit(1);
});
