import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'uploads', 'rooms');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const images = [
  { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', file: 'single-101.jpg' },
  { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', file: 'single-102.jpg' },
  { url: 'https://images.unsplash.com/photo-1522798514-54ceb8d209bc?w=800', file: 'double-201.jpg' },
  { url: 'https://images.unsplash.com/photo-1554995207-c18c203607cb?w=800', file: 'double-202.jpg' },
  { url: 'https://images.unsplash.com/photo-1560185007-cde436f09a4a?w=800', file: 'deluxe-301.jpg' },
  { url: 'https://images.unsplash.com/photo-1564078516393-cf04a1a22e13?w=800', file: 'deluxe-302.jpg' },
  { url: 'https://images.unsplash.com/photo-1584132905271-512b6b1fee9b?w=800', file: 'suite-401.jpg' },
  { url: 'https://images.unsplash.com/photo-1566665797732-1f09c4627294?w=800', file: 'suite-501.jpg' },
];

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const request = (currentUrl) => {
      mod.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          const stats = fs.statSync(filepath);
          console.log(`  Downloaded ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve();
        });
      }).on('error', reject);
    };
    request(url);
  });
}

async function main() {
  console.log('Downloading room images...');
  for (const img of images) {
    const filepath = path.join(outDir, img.file);
    try {
      await download(img.url, filepath);
    } catch (err) {
      console.error(`  FAILED ${img.file}: ${err.message}`);
      // Create a placeholder if download fails
      if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
        console.log(`  Skipping ${img.file}`);
      }
    }
  }
  console.log('Done!');
}

main();
