import { writeFileSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import zlib from 'zlib';

function writePNG(size, outputPath) {
  const bg = { r: 10, g: 10, b: 15 };
  const purple = { r: 139, g: 92, b: 246 };

  // Build raw RGBA pixel data
  const pixels = Buffer.alloc(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  const cornerRadius = size * 0.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rect background check
      const inRounded =
        x >= cornerRadius && x <= size - cornerRadius ||
        y >= cornerRadius && y <= size - cornerRadius ||
        (Math.hypot(x - cornerRadius, y - cornerRadius) <= cornerRadius) ||
        (Math.hypot(x - (size - cornerRadius), y - cornerRadius) <= cornerRadius) ||
        (Math.hypot(x - cornerRadius, y - (size - cornerRadius)) <= cornerRadius) ||
        (Math.hypot(x - (size - cornerRadius), y - (size - cornerRadius)) <= cornerRadius);

      if (!inRounded) {
        pixels[idx + 3] = 0; // transparent outside rounded rect
        continue;
      }

      // Diamond: |x - cx| / r + |y - cy| / r <= 1
      const inDiamond = (Math.abs(x - cx) + Math.abs(y - cy)) <= r;

      if (inDiamond) {
        pixels[idx] = purple.r;
        pixels[idx + 1] = purple.g;
        pixels[idx + 2] = purple.b;
      } else {
        pixels[idx] = bg.r;
        pixels[idx + 1] = bg.g;
        pixels[idx + 2] = bg.b;
      }
      pixels[idx + 3] = 255;
    }
  }

  // Build PNG file
  const chunks = [];

  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeBytes = Buffer.from(type, 'ascii');
    const crcInput = Buffer.concat([typeBytes, data]);
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(crcInput));
    return Buffer.concat([len, typeBytes, data, crc]);
  }

  // CRC32
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })();
  function crc32(buf) {
    let c = -1;
    for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
    return (c ^ -1);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB — we'll use RGBA so 6
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(makeChunk('IHDR', ihdr));

  // IDAT — filter + compress
  const scanlines = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    scanlines[y * (size * 4 + 1)] = 0; // filter none
    pixels.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const compressed = zlib.deflateSync(scanlines, { level: 6 });
  chunks.push(makeChunk('IDAT', compressed));

  // IEND
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  writeFileSync(outputPath, Buffer.concat(chunks));
  console.log(`Generated ${outputPath}`);
}

mkdirSync('public/icons', { recursive: true });
writePNG(192, 'public/icons/icon-192.png');
writePNG(512, 'public/icons/icon-512.png');
