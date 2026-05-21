#!/usr/bin/env node
/**
 * Build /llm-skills.txt and mirror raw skill markdown into static/ so LLM
 * agents can fetch the source files directly.
 *
 * Sources:
 *   - skills/        — docs-only authoring sources (recipes, playbooks, decision guides, foundations).
 *   - seed-skills/   — mirror of upstream MCP-tool skills shipped by the SDK.
 *
 * Outputs:
 *   - static/llm-skills.txt              — committed; served at /llm-skills.txt.
 *   - static/skills/<name>.md            — raw markdown mirrors (gitignored).
 *   - static/seed-skills/<name>.md       — raw markdown mirrors (gitignored).
 *
 * The .md mirrors are rebuilt from scratch on every run so deletions propagate.
 * The web URL in llm-skills.txt points at the raw markdown — the same path you
 * have locally after a `git clone`, just prefixed with the site URL.
 *
 * Per-entry shape:
 *
 *   <name>: <description>
 *     web:   <raw-md URL on whats.fibe.gg>
 *     local: <path relative to the cloned repo root>
 *
 * Routing rules (must mirror scripts/sync-skills.mjs):
 *   - skills/<name>.md                  → /skills/<name>.md       , ./skills/<name>.md
 *   - seed-skills/fibe-tool-<rest>.md   → /seed-skills/<file>     , ./seed-skills/<file>
 *
 * Determinism guarantees (re-running the script produces a byte-identical file):
 *   1. Entries are sorted by `name` (case-sensitive) inside each group.
 *   2. Skills group comes before Tools group.
 *   3. Each entry has the same shape; no timestamps, no counters.
 *   4. The header is fixed text; no environment-derived strings appear.
 *   5. Trailing newline is always present; line endings are always `\n`.
 *   6. Files without a frontmatter `description:` are listed with `(no description)`.
 *
 * Usage:
 *   npm run build-llm-skills
 *
 * Wired into the `prestart` and `prebuild` npm hooks so both dev and CI keep
 * the mirrors fresh.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'static', 'llm-skills.txt');
const STATIC_SKILLS_DIR = path.join(ROOT, 'static', 'skills');
const STATIC_SEED_DIR   = path.join(ROOT, 'static', 'seed-skills');

const SITE_URL = 'https://whats.fibe.gg';

const SOURCES = [
  {dir: path.join(ROOT, 'skills'),      kind: 'skill', mirrorDir: STATIC_SKILLS_DIR},
  {dir: path.join(ROOT, 'seed-skills'), kind: 'tool',  mirrorDir: STATIC_SEED_DIR},
];

// Wipe the static mirrors so deletions in the source propagate cleanly.
for (const {mirrorDir} of SOURCES) {
  fs.rmSync(mirrorDir, {recursive: true, force: true});
  fs.mkdirSync(mirrorDir, {recursive: true});
}

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

/**
 * Map a source file to its raw-markdown URL on the site and the matching local path.
 *
 *   skills/<file>.md       → https://<site>/skills/<file>.md          , ./skills/<file>.md
 *   seed-skills/<file>.md  → https://<site>/seed-skills/<file>.md     , ./seed-skills/<file>.md
 */
function routes(kind, file) {
  const subdir = kind === 'tool' ? 'seed-skills' : 'skills';
  return {
    web:   `${SITE_URL}/${subdir}/${file}`,
    local: `./${subdir}/${file}`,
  };
}

function collect() {
  const entries = [];
  for (const {dir, kind, mirrorDir} of SOURCES) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md');
    for (const file of files) {
      const srcPath = path.join(dir, file);
      const source = fs.readFileSync(srcPath, 'utf8');
      const fm = parseFrontmatter(source);
      const name = (fm.name || path.basename(file, '.md')).trim();
      const description = (fm.description || '(no description)').replace(/\s+/g, ' ').trim();
      const {web, local} = routes(kind, file);

      // Copy the raw source into static/ so the web URL serves it verbatim.
      fs.copyFileSync(srcPath, path.join(mirrorDir, file));

      entries.push({name, description, kind, web, local});
    }
  }
  // Deterministic sort: skills before tools, then by name within each group.
  entries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'skill' ? -1 : 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
  return entries;
}

function renderEntry(e) {
  return [
    `${e.name}: ${e.description}`,
    `  web:   ${e.web}`,
    `  local: ${e.local}`,
    '',
  ].join('\n');
}

function render(entries) {
  const skills = entries.filter((e) => e.kind === 'skill');
  const tools  = entries.filter((e) => e.kind === 'tool');

  const out = [];
  out.push('# Fibe — skill & tool index');
  out.push('');
  out.push('> Compact, deterministic list of every skill and MCP tool that ships with Fibe.');
  out.push('> Generated by scripts/build-llm-skills.mjs from skills/ and seed-skills/.');
  out.push('> Each entry has three lines:');
  out.push('>   1. <name>: <description>');
  out.push(`>   2. web:   ${SITE_URL}/<subdir>/<file>.md — raw markdown an LLM agent can fetch.`);
  out.push('>   3. local: ./<subdir>/<file>.md — same file at the same path in a clone of this repo.');
  out.push('>');
  out.push('> For the linked index of full docs pages, see /llms.txt.');
  out.push('> For the concatenated full content, see /llms-full.txt.');
  out.push('');
  out.push(`## Skills (${skills.length})`);
  out.push('');
  for (const e of skills) out.push(renderEntry(e));
  out.push(`## Tools (${tools.length})`);
  out.push('');
  for (const e of tools) out.push(renderEntry(e));
  return out.join('\n').replace(/\n+$/, '\n');
}

const entries = collect();
const text = render(entries);
fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, text);

const skillsCount = entries.filter((e) => e.kind === 'skill').length;
const toolsCount  = entries.filter((e) => e.kind === 'tool').length;
console.log(`[build-llm-skills] wrote ${OUT}`);
console.log(`[build-llm-skills]   skills: ${skillsCount}`);
console.log(`[build-llm-skills]   tools:  ${toolsCount}`);
console.log(`[build-llm-skills]   total:  ${entries.length}`);
