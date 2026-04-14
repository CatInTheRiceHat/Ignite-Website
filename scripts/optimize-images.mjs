import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../public/assets');
const MAX_WIDTH = 1920;
const PNG_QUALITY = 80;

const files = await readdir(ASSETS_DIR);
const pngs = files.filter(f => f.toLowerCase().endsWith('.png'));

let totalBefore = 0;
let totalAfter = 0;

console.log(`\nOptimizing ${pngs.length} images...\n`);

for (const file of pngs) {
  const filepath = join(ASSETS_DIR, file);
  const before = (await stat(filepath)).size;
  totalBefore += before;

  const image = sharp(filepath);
  const meta = await image.metadata();

  const pipeline = meta.width > MAX_WIDTH
    ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
    : image;

  const buffer = await pipeline
    .png({ quality: PNG_QUALITY, compressionLevel: 9 })
    .toBuffer();

  await sharp(buffer).toFile(filepath);

  const after = (await stat(filepath)).size;
  totalAfter += after;

  const saved = (((before - after) / before) * 100).toFixed(0);
  const beforeKB = (before / 1024).toFixed(0);
  const afterKB = (after / 1024).toFixed(0);
  console.log(`  ${file.padEnd(35)} ${String(beforeKB + ' KB').padStart(9)} → ${String(afterKB + ' KB').padStart(9)}  (-${saved}%)`);
}

const totalBeforeMB = (totalBefore / 1024 / 1024).toFixed(1);
const totalAfterMB = (totalAfter / 1024 / 1024).toFixed(1);
const totalSaved = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0);

console.log(`\n${'─'.repeat(70)}`);
console.log(`  Total: ${totalBeforeMB} MB → ${totalAfterMB} MB  (-${totalSaved}% / saved ${(totalBefore - totalAfter) / 1024 / 1024 < 1 ? ((totalBefore - totalAfter) / 1024).toFixed(0) + ' KB' : ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1) + ' MB'})\n`);
