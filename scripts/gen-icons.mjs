import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const outDir = path.join(here, '..', 'static', 'img');

// Minimal 16x16 ICO file (Phoenix purple square). ICO header + 16x16 bitmap.
// This is a placeholder — replace with a real branded icon before launch.

function pngFromSvg(svg, size) {
  // No external deps yet — emit a tiny solid-color placeholder PNG.
  // 1x1 violet PNG (we will scale via the <img> tag).
  // Below is a hand-rolled PNG: signature + IHDR + IDAT + IEND for a single violet pixel.
  // Color: #a78bfa (167, 139, 250).
  return Buffer.from([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a, // signature
    0x00,0x00,0x00,0x0d, // IHDR length
    0x49,0x48,0x44,0x52, // 'IHDR'
    0x00,0x00,0x00,0x01, 0x00,0x00,0x00,0x01, // 1x1
    0x08, 0x02, 0x00, 0x00, 0x00, // 8-bit RGB
    0x90,0x77,0x53,0xde, // CRC
    0x00,0x00,0x00,0x0c, // IDAT length
    0x49,0x44,0x41,0x54, // 'IDAT'
    0x08,0x99,0x63,0xa8,0x8b,0xfa,0x00,0x00,0x00,0x03,0x00,0x01, // zlib stream of 167,139,250
    0x6d,0x3b,0xae,0xbd, // approximate CRC (renderers tolerate)
    0x00,0x00,0x00,0x00, // IEND length
    0x49,0x45,0x4e,0x44, // 'IEND'
    0xae,0x42,0x60,0x82, // CRC
  ]);
}

const placeholderPng = pngFromSvg(null, 1);

fs.writeFileSync(path.join(outDir, 'icon-192.png'), placeholderPng);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), placeholderPng);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), placeholderPng);
fs.writeFileSync(path.join(outDir, 'og-default.png'), placeholderPng);

// Tiny ICO with one 16x16 image (a single violet pixel placeholder).
// Header (6 bytes) + ICONDIRENTRY (16 bytes) + payload.
const ico = Buffer.concat([
  Buffer.from([0x00,0x00, 0x01,0x00, 0x01,0x00]), // ICONDIR: reserved, type=1, count=1
  Buffer.from([0x10, 0x10, 0x00, 0x00, 0x01,0x00, 0x20,0x00]), // 16x16, 0 palette, 1 plane, 32 bpp
  Buffer.from([(placeholderPng.length) & 0xff, ((placeholderPng.length)>>8)&0xff, 0,0]), // bytes-in-resource
  Buffer.from([22,0,0,0]), // offset
  placeholderPng,
]);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), ico);

console.log('Wrote placeholder icons to', outDir);
