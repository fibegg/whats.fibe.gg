/**
 * Custom Docusaurus plugin: emit /llms.txt and /llms-full.txt at build.
 *
 * - llms.txt — a compact, sectioned index of every documentation page per
 *   the format proposed at https://llmstxt.org. One section per top-level
 *   sidebar category; each entry is `[Title](url): description`.
 * - llms-full.txt — every markdown source file concatenated, prefixed with
 *   `# Title` and `> url`, so an LLM can ingest the full guide in one read.
 *
 * The plugin reads from the on-disk `docs/` directory directly so it doesn't
 * need to introspect Docusaurus's internal route table.
 */

import fs from 'node:fs';
import path from 'node:path';

const SITE_TITLE = 'Fibe — user guide & skills';
const SITE_DESCRIPTION =
  'Fibe runs your projects in real Docker environments connected to your compute hosts and Git repositories. The guide covers Marquees, Props, Templates, Playgrounds, Tricks, Genies, and a full reference library of authoring skills.';
const SITE_URL = 'https://whats.fibe.gg';

const CATEGORIES = [
  {label: 'Get started', dir: '.', filter: (n) => n === 'intro'},
  {label: 'Concepts', dir: 'concepts'},
  {label: 'Agents', dir: 'agents'},
  {label: 'Security', dir: 'security'},
  {label: 'Authoring templates', dir: 'authoring'},
  {label: 'Operate', dir: 'operate'},
  {label: 'SDK, CLI & MCP', dir: 'sdk'},
  {label: 'Reference: API', dir: 'api'},
  {label: 'Reference (skills)', dir: 'reference'},
  {label: 'Reference: Tools', dir: 'reference/tools'},
];

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

function listMarkdown(dirAbs) {
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs)
    .filter((n) => n.endsWith('.md') || n.endsWith('.mdx'))
    .map((n) => path.join(dirAbs, n));
}

function pageMeta(filePath, baseSlug) {
  const source = fs.readFileSync(filePath, 'utf8');
  const {data, body} = parseFrontmatter(source);
  const base = path.basename(filePath).replace(/\.mdx?$/, '');
  const title = data.title || base.replace(/[-_]/g, ' ');
  const description = data.description || body.split(/\n\n/)[0].slice(0, 240).replace(/\n/g, ' ');
  const slug = data.slug || `/${baseSlug ? baseSlug + '/' : ''}${base === 'intro' && !baseSlug ? '' : base}`;
  return {title, description, slug, body};
}

export default function pluginLlmsTxt() {
  return {
    name: 'plugin-llms-txt',
    async postBuild({siteConfig, outDir, siteDir}) {
      const docsDir = path.resolve(siteDir, 'docs');

      // Build llms.txt sections.
      const sections = [];
      for (const cat of CATEGORIES) {
        const dirAbs = path.join(docsDir, cat.dir);
        let files = listMarkdown(dirAbs);
        if (cat.filter) {
          files = files.filter((f) => cat.filter(path.basename(f, '.md')));
        }
        if (files.length === 0) continue;
        const entries = files
          .map((f) => pageMeta(f, cat.dir === '.' ? '' : cat.dir))
          .sort((a, b) => a.title.localeCompare(b.title));
        sections.push({label: cat.label, entries});
      }

      // Compose llms.txt.
      let llms = `# ${SITE_TITLE}\n\n> ${SITE_DESCRIPTION}\n\n`;
      for (const s of sections) {
        llms += `## ${s.label}\n\n`;
        for (const e of s.entries) {
          const url = `${SITE_URL}${e.slug}/`.replace(/\/+$/, '/');
          llms += `- [${e.title}](${url}): ${e.description}\n`;
        }
        llms += '\n';
      }
      llms += `## Optional\n\n- [llms-full.txt](${SITE_URL}/llms-full.txt): full Markdown content of every page concatenated.\n`;

      fs.writeFileSync(path.join(outDir, 'llms.txt'), llms);

      // Compose llms-full.txt.
      let full = `# ${SITE_TITLE}\n\n${SITE_DESCRIPTION}\n\n${SITE_URL}\n\n`;
      for (const s of sections) {
        full += `\n---\n\n# ${s.label}\n\n`;
        for (const e of s.entries) {
          const url = `${SITE_URL}${e.slug}/`.replace(/\/+$/, '/');
          full += `\n\n## ${e.title}\n> ${url}\n\n${e.body.trim()}\n`;
        }
      }
      fs.writeFileSync(path.join(outDir, 'llms-full.txt'), full);

      console.log(`[plugin-llms-txt] wrote ${path.join(outDir, 'llms.txt')} and llms-full.txt`);
    },
  };
}
