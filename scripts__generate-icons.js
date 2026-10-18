import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// Table of CRCs of all 8-bit messages.
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePngBuffer(width, height, isMaskable = false) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      // Default dark navy background
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Subtle gradient towards bottom
      const gradRatio = y / height;
      r = Math.round(15 * (1 - gradRatio * 0.4));
      g = Math.round(23 * (1 - gradRatio * 0.4) + 10 * gradRatio);
      b = Math.round(42 * (1 - gradRatio * 0.3) + 30 * gradRatio);

      // Maskable icon padding handling (full bleed)
      // Draw brand symbols inside safe zone
      const safeRadius = isMaskable ? width * 0.32 : width * 0.40;

      // Circle glow behind bulb
      const bulbCy = cy - height * 0.12;
      const distBulb = Math.sqrt(dx * dx + (y - bulbCy) * (y - bulbCy));
      if (distBulb < width * 0.22) {
        const glowFactor = (1 - distBulb / (width * 0.22));
        r = Math.min(255, Math.round(r + 245 * glowFactor * 0.7));
        g = Math.min(255, Math.round(g + 180 * glowFactor * 0.7));
        b = Math.min(255, Math.round(b + 30 * glowFactor * 0.4));
      }

      // Bulb body (amber glow)
      if (distBulb < width * 0.12 && y <= bulbCy + height * 0.05) {
        r = 251;
        g = 191;
        b = 36;
      }

      // Open book base (teal/cyan curves)
      const bookTop = cy + height * 0.08;
      const bookBottom = cy + height * 0.32;
      if (y >= bookTop && y <= bookBottom) {
        const bookW = width * 0.35;
        if (Math.abs(dx) <= bookW) {
          // Curved page effect
          const pageCurve = Math.sin((Math.abs(dx) / bookW) * Math.PI) * (height * 0.04);
          if (y >= bookTop - pageCurve && y <= bookBottom - pageCurve) {
            if (Math.abs(dx) < 4) {
              // Spine
              r = 56;
              g = 189;
              b = 248;
            } else if (dx > 0) {
              // Right page: teal gradient
              r = 45;
              g = 212;
              b = 191;
            } else {
              // Left page: cyan/blue
              r = 2;
              g = 132;
              b = 199;
            }
          }
        }
      }

      // Rounded border if not maskable
      if (!isMaskable) {
        // Corner radius check
        const cornerR = width * 0.22;
        let isInside = true;
        if (x < cornerR && y < cornerR) {
          if (Math.hypot(x - cornerR, y - cornerR) > cornerR) isInside = false;
        } else if (x > width - cornerR && y < cornerR) {
          if (Math.hypot(x - (width - cornerR), y - cornerR) > cornerR) isInside = false;
        } else if (x < cornerR && y > height - cornerR) {
          if (Math.hypot(x - cornerR, y - (height - cornerR)) > cornerR) isInside = false;
        } else if (x > width - cornerR && y > height - cornerR) {
          if (Math.hypot(x - (width - cornerR), y - (height - cornerR)) > cornerR) isInside = false;
        }
        if (!isInside) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // color type 6: RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method 0 (none)
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all required PWA & mobile icons
const icons = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon.png', size: 64, maskable: false },
];

for (const icon of icons) {
  const filePath = path.join(publicDir, icon.name);
  const buf = generatePngBuffer(icon.size, icon.size, icon.maskable);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${icon.name} (${icon.size}x${icon.size}) - ${buf.length} bytes`);
}
