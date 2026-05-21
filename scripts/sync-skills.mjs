#!/usr/bin/env node
/**
 * Rebuild docs/reference/ from BOTH `skills/` (docs-only authoring source) and
 * `seed-skills/` (mirror of the fibe Rails upstream agent-runtime skills).
 *
 * Routing rules:
 *   - skills/<name>.md                  → docs/reference/<name>.md
 *   - seed-skills/fibe-tool-<rest>.md   → docs/reference/tools/<rest>.md
 *                                         (slug = /reference/tools/<rest>)
 *   - seed-skills/fibe-<rest>.md (not tool)
 *                                      → docs/reference/foundation-<rest>.md
 *                                         (slug = /reference/foundation-<rest>)
 *   - seed-skills/<other>.md           → docs/reference/<name>.md
 *
 * The docs/reference/tools/ subdirectory is wiped + rebuilt every run, so stale
 * tool pages disappear when their upstream file is removed.
 *
 * Both source dirs use the upstream skill frontmatter (`name`, `description`).
 * This script rewrites it into Docusaurus frontmatter (`title`, `description`,
 * `slug`, `sidebar_label`, `image`, `keywords`, `tags`, `format: md`).
 *
 * Body transformations:
 *   - Strip a leading H1 if it would duplicate the title.
 *   - HTML-escape angle-bracket placeholders (<root>, <subdomain>, <your-tool>)
 *     outside code blocks/spans so MDX doesn't try to parse them as JSX tags.
 *
 * Usage:
 *   node scripts/sync-skills.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKILLS_SRC = path.join(ROOT, 'skills');
const SEED_SRC = path.join(ROOT, 'seed-skills');
const DST = path.join(ROOT, 'docs', 'reference');
const TOOLS_DST = path.join(DST, 'tools');

fs.mkdirSync(DST, {recursive: true});

// Wipe and recreate tools/ so deletions upstream propagate cleanly.
fs.rmSync(TOOLS_DST, {recursive: true, force: true});
fs.mkdirSync(TOOLS_DST, {recursive: true});

function parseFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return {data: {}, body: source};
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return {data, body: source.slice(m[0].length)};
}

function humanize(text) {
  return text
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Decide where a source file should be written and what slug + sidebar group it
 * belongs to.
 *
 * Returns:
 *   { dstPath, slug, title, sidebarLabel, ogName, category, tagsExtra }
 */
function route(file, src) {
  const name = path.basename(file, '.md');

  if (src === SEED_SRC && name.startsWith('fibe-tool-')) {
    const stripped = name.replace(/^fibe-tool-/, '');
    return {
      name,
      dstPath: path.join(TOOLS_DST, `${stripped}.md`),
      slug: `/reference/tools/${stripped}`,
      title: humanize(stripped),
      sidebarLabel: humanize(stripped),
      ogName: `reference-tools-${stripped}`,
      category: 'Tool',
      tagsExtra: ['tool'],
    };
  }

  if (src === SEED_SRC && name.startsWith('fibe-')) {
    // Foundation/guidance skills from the seed dir — flatten the prefix in the slug
    // to avoid colliding with docs-only fibe-* pages in skills/.
    const stripped = name.replace(/^fibe-/, '');
    const dstName = `foundation-${stripped}.md`;
    return {
      name,
      dstPath: path.join(DST, dstName),
      slug: `/reference/foundation-${stripped}`,
      title: humanize(stripped),
      sidebarLabel: humanize(stripped),
      ogName: `reference-foundation-${stripped}`,
      category: 'Foundation',
      tagsExtra: ['foundation', 'agent-runtime'],
    };
  }

  // Default — copy to docs/reference/<name>.md with category derived from the prefix.
  let category;
  if (name.startsWith('recipe-')) category = 'Recipe';
  else if (name.startsWith('playbook-')) category = 'Playbook';
  else if (name.startsWith('decide-')) category = 'Decision';
  else if (name.startsWith('mode-')) category = 'Execution mode';
  else if (name.startsWith('reference-')) category = 'Reference';
  else if (name.startsWith('fibe-')) category = 'Foundation';
  else category = 'Skill';

  const titleBase = name.replace(/^(recipe|playbook|decide|mode|reference|fibe)-/, '');
  return {
    name,
    dstPath: path.join(DST, `${name}.md`),
    slug: `/reference/${name}`,
    title: humanize(titleBase),
    sidebarLabel: humanize(titleBase),
    ogName: `reference-${name}`,
    category,
    tagsExtra: [],
  };
}

const yq = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

function transform(file, src, info) {
  const source = fs.readFileSync(path.join(src, file), 'utf8');
  const {data, body} = parseFrontmatter(source);

  const description = data.description || `Fibe skill: ${info.name}`;

  const keywordParts = ['Fibe', info.category, ...info.name.split('-')];
  const tags = ['reference', info.category.toLowerCase().replace(/\s+/g, '-'), ...info.tagsExtra];

  const fm = [
    '---',
    `title: ${yq(info.title)}`,
    `description: ${yq(description)}`,
    `slug: ${info.slug}`,
    `sidebar_label: ${yq(info.sidebarLabel)}`,
    `image: /img/og/${info.ogName}.png`,
    `keywords: [${keywordParts.map(yq).join(', ')}]`,
    `tags: [${tags.map(yq).join(', ')}]`,
    // Force CommonMark parsing — skill files contain literal angle-bracket placeholders.
    'format: md',
    '---',
  ].join('\n');

  // Strip leading H1 if it duplicates the title.
  let trimmedBody = body.replace(/^\n*#\s+.+\n+/, '\n');

  // Escape angle-bracket placeholders OUTSIDE code blocks / spans.
  trimmedBody = trimmedBody.replace(/(```[\s\S]*?```|`[^`\n]+`)|<([a-z][a-z0-9_-]*?)>/gi, (m, codeBlock, tag) => {
    if (codeBlock) return codeBlock;
    return `&lt;${tag}&gt;`;
  });

  return `${fm}\n${trimmedBody}`;
}

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
}

let skillsCount = 0;
let toolsCount = 0;
let foundationsCount = 0;
let otherSeedCount = 0;

for (const file of listMd(SKILLS_SRC)) {
  const info = route(file, SKILLS_SRC);
  fs.writeFileSync(info.dstPath, transform(file, SKILLS_SRC, info));
  skillsCount++;
}

for (const file of listMd(SEED_SRC)) {
  const info = route(file, SEED_SRC);
  fs.writeFileSync(info.dstPath, transform(file, SEED_SRC, info));
  if (info.category === 'Tool') toolsCount++;
  else if (info.category === 'Foundation') foundationsCount++;
  else otherSeedCount++;
}

console.log(`[sync-skills] skills/        → ${skillsCount} files`);
console.log(`[sync-skills] seed tools/    → ${toolsCount} files (docs/reference/tools/)`);
console.log(`[sync-skills] seed foundations → ${foundationsCount} files (docs/reference/foundation-*.md)`);
console.log(`[sync-skills] seed other     → ${otherSeedCount} files`);
console.log(`[sync-skills] total          → ${skillsCount + toolsCount + foundationsCount + otherSeedCount} pages under docs/reference/`);
