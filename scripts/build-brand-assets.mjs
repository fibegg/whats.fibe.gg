#!/usr/bin/env node
/**
 * Pull the real Fibe brand assets from the upstream fibe Rails repo, and
 * generate the 1200×630 OG social card from an SVG source.
 *
 * Upstream icon sources (canonical Fibe brand):
 *   - <fibe>/app/assets/images/favicon.ico         — multi-size ICO
 *   - <fibe>/app/assets/images/favicon-64.png      — 64×64
 *   - <fibe>/app/assets/images/apple-touch-icon.png — 180×180
 *   - <fibe>/app/assets/images/icon-192.png        — 192×192
 *   - <fibe>/app/assets/images/icon-512.png        — 512×512
 *
 * Set FIBE_REPO_PATH to override the default location (../fibe).
 *
 * OG card:
 *   - static/img/_source/og-default.svg — hand-authored 1200×630 social card.
 *     Rendered to static/img/og-default.png via @resvg/resvg-js.
 *
 * Outputs:
 *   - static/img/favicon.ico, apple-touch-icon.png, favicon-64.png,
 *     icon-192.png, icon-512.png, og-default.png
 *
 * Usage:
 *   npm run build-brand-assets
 *   FIBE_REPO_PATH=/path/to/fibe npm run build-brand-assets
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Resvg} from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG = path.join(ROOT, 'static', 'img');
const SRC = path.join(IMG, '_source');

const FIBE_REPO = process.env.FIBE_REPO_PATH || path.resolve(ROOT, '..', 'fibe');
const FIBE_IMAGES = path.join(FIBE_REPO, 'app', 'assets', 'images');

const UPSTREAM_ICONS = [
  'favicon.ico',
  'favicon-64.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
];

for (const f of UPSTREAM_ICONS) {
  const src = path.join(FIBE_IMAGES, f);
  if (!fs.existsSync(src)) {
    console.error(`[build-brand-assets] Missing upstream icon: ${src}`);
    console.error('Set FIBE_REPO_PATH or check that the fibe repo is checked out next to this one.');
    process.exit(1);
  }
}

// Copy the upstream icons verbatim. They ARE the brand.
for (const f of UPSTREAM_ICONS) {
  fs.copyFileSync(path.join(FIBE_IMAGES, f), path.join(IMG, f));
}

// Drop any leftover synthesized SVG icons. The site references favicon.ico
// (declared in docusaurus.config.js) and the PNGs only.
for (const f of ['favicon.svg', 'logo.svg']) {
  fs.rmSync(path.join(IMG, f), {force: true});
}

// Render the OG social card from SVG. The card design is local — fibe has no
// 1200×630 social-share asset upstream.
const OG_SVG = path.join(SRC, 'og-default.svg');
if (!fs.existsSync(OG_SVG)) {
  console.error(`[build-brand-assets] Missing OG source SVG: ${OG_SVG}`);
  process.exit(1);
}
let ogSvg = fs.readFileSync(OG_SVG, 'utf8');

// Substitute __ICON_BASE64__ with the real upstream icon so the OG card uses
// the actual Fibe brand mark. We use icon-192.png (small, renders crisply at
// the 120px mark size on a 1200×630 card).
const iconBytes = fs.readFileSync(path.join(FIBE_IMAGES, 'icon-192.png'));
const iconB64 = iconBytes.toString('base64');
if (!ogSvg.includes('__ICON_BASE64__')) {
  console.error('[build-brand-assets] og-default.svg is missing the __ICON_BASE64__ placeholder.');
  process.exit(1);
}
ogSvg = ogSvg.replace('__ICON_BASE64__', iconB64);

const ogPng = new Resvg(ogSvg, {
  fitTo: {mode: 'width', value: 1200},
  background: 'rgba(0,0,0,0)',
}).render().asPng();
fs.writeFileSync(path.join(IMG, 'og-default.png'), ogPng);

// Report
const report = (name) => {
  const p = path.join(IMG, name);
  if (!fs.existsSync(p)) return;
  const sz = fs.statSync(p).size;
  console.log(`  ${name.padEnd(22)} ${sz.toString().padStart(7)} bytes`);
};
console.log(`[build-brand-assets] from upstream (${FIBE_IMAGES}):`);
for (const f of UPSTREAM_ICONS) report(f);
console.log('[build-brand-assets] generated:');
report('og-default.png');
