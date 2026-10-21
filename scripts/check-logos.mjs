import sharp from "sharp";

async function check() {
  const { data, info } = await sharp("public/images/sk logo.jpeg").raw().toBuffer({ resolveWithObject: true });
  console.log("SK Logo W:", info.width, "H:", info.height);

  // Scan across a horizontal line through the middle (y = 600)
  const y = 600;
  const samples = [];
  for (let x = 0; x < info.width; x += 50) {
    const idx = (y * info.width + x) * 3;
    samples.push({ x, rgb: [data[idx], data[idx+1], data[idx+2]] });
  }
  console.log("Samples across y=600 in SK logo:", samples);
}

check();
