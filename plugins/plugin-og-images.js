/**
 * Custom Docusaurus plugin: emit one 1200×630 PNG Open Graph card per page.
 *
 * Strategy:
 *  - Walks `docs/` for every .md / .mdx file.
 *  - For each page, reads frontmatter (title + description) and renders an SVG
 *    OG card. Then encodes the SVG → PNG via @resvg/resvg-js.
 *  - Writes to `build/img/og/<slug>.png`.
 *  - A static fallback (`static/img/og-default.png`) covers pages that don't
 *    point at a generated card.
 *
 * Each markdown page's frontmatter sets `image: /img/og/<slug>.png` so
 * Docusaurus's built-in social-card mechanism picks up the right file.
 *
 * Failure mode: if @resvg/resvg-js isn't installed (e.g. fresh clone before
 * `npm install`), the plugin logs a warning and skips silently. The fallback
 * image still works.
 */

import fs from 'node:fs';
import path from 'node:path';

const W = 1200;
const H = 630;
const BG = '#0f0f14';
const ACCENT = '#a78bfa';
const FG = '#f9fafb';
const MUTED = '#c5c9d4';

const CATEGORIES = ['.', 'concepts', 'agents', 'security', 'authoring', 'operate', 'sdk', 'reference', 'reference/tools'];

function parseFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return data;
}

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(s, max) {
  const words = String(s ?? '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur ? cur + ' ' : '') + w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderSvg({title, description, eyebrow}) {
  const titleLines = wrapText(title, 30).slice(0, 3);
  const descLines = wrapText(description, 80).slice(0, 3);
  const titleY = 200;
  const descY = titleY + 30 + titleLines.length * 78;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="g" cx="50%" cy="0%" r="80%">
        <stop offset="0%" stop-color="rgba(167,139,250,0.25)" />
        <stop offset="100%" stop-color="rgba(167,139,250,0)" />
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${ACCENT}"/>
    <g font-family="Inter, system-ui, sans-serif">
      <text x="80" y="120" font-size="22" font-weight="600" letter-spacing="6" fill="${ACCENT}">${escapeXml((eyebrow || 'Fibe — user guide').toUpperCase())}</text>
      ${titleLines.map((line, i) => `<text x="80" y="${titleY + i * 78}" font-size="68" font-weight="700" fill="${FG}">${escapeXml(line)}</text>`).join('')}
      ${descLines.map((line, i) => `<text x="80" y="${descY + i * 36}" font-size="26" fill="${MUTED}">${escapeXml(line)}</text>`).join('')}
      <text x="80" y="${H - 50}" font-size="22" fill="${MUTED}">whats.fibe.gg</text>
    </g>
  </svg>`;
}

function* walkMarkdown(dirAbs, baseSlug) {
  if (!fs.existsSync(dirAbs)) return;
  for (const entry of fs.readdirSync(dirAbs, {withFileTypes: true})) {
    if (entry.isDirectory()) continue; // we handle top-level dirs explicitly
    if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) continue;
    yield {abs: path.join(dirAbs, entry.name), base: path.basename(entry.name, path.extname(entry.name)), baseSlug};
  }
}

export default function pluginOgImages() {
  return {
    name: 'plugin-og-images',
    async postBuild({siteDir, outDir}) {
      let Resvg;
      try {
        ({Resvg} = await import('@resvg/resvg-js'));
      } catch (err) {
        console.warn('[plugin-og-images] @resvg/resvg-js not installed — skipping per-page OG card generation. Run `npm install` to enable.');
        return;
      }

      const docsDir = path.resolve(siteDir, 'docs');
      const ogOutDir = path.join(outDir, 'img', 'og');
      fs.mkdirSync(ogOutDir, {recursive: true});

      let count = 0;
      for (const cat of CATEGORIES) {
        const dirAbs = path.join(docsDir, cat);
        const baseSlug = cat === '.' ? '' : cat;
        for (const f of walkMarkdown(dirAbs, baseSlug)) {
          const source = fs.readFileSync(f.abs, 'utf8');
          const fm = parseFrontmatter(source);
          const title = fm.title || f.base.replace(/[-_]/g, ' ');
          const description = fm.description || '';
          const eyebrow = baseSlug ? `Fibe · ${baseSlug.replace(/_/g, ' ')}` : 'Fibe';

          const svg = renderSvg({title, description, eyebrow});

          try {
            const resvg = new Resvg(svg, {fitTo: {mode: 'width', value: W}});
            const png = resvg.render().asPng();
            // Flatten `reference/tools` into a single filename so we don't need to
            // mkdir subdirectories inside the OG output dir.
            const flatPrefix = baseSlug ? baseSlug.replace(/\//g, '-') + '-' : '';
            const outName = `${flatPrefix}${f.base}.png`;
            fs.writeFileSync(path.join(ogOutDir, outName), png);
            count++;
          } catch (e) {
            console.warn(`[plugin-og-images] failed to render ${f.abs}: ${e.message}`);
          }
        }
      }

      console.log(`[plugin-og-images] generated ${count} OG cards in ${ogOutDir}`);
    },
  };
}
