#!/usr/bin/env node
/**
 * Import the upstream fibe Rails seed skills into seed-skills/.
 *
 * The Rails app at /Users/vvsk/play/fibe loads these into the `fibe_skills`
 * table on every `db:seed` and distributes them to running Agent containers.
 * This script copies the current contents into the docs repo so the build
 * doesn't need access to the Rails source tree.
 *
 * Usage:
 *   npm run import-seed-skills
 *   FIBE_REPO_PATH=/path/to/fibe npm run import-seed-skills
 *
 * Behavior:
 *   - Source: <fibe>/db/seeds/fibe_skills/
 *   - Destination: ./seed-skills/
 *   - Copies every .md file.
 *   - SKIPS agent-internal files: main.md, system.md, cursor-runtime.mdc.
 *   - Removes any files in destination that no longer exist in source (so
 *     deletions upstream propagate).
 *   - Writes seed-skills/README.md explaining what the directory is.
 *   - Idempotent.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DST = path.join(ROOT, 'seed-skills');

const FIBE_REPO = process.env.FIBE_REPO_PATH || path.resolve(ROOT, '..', 'fibe');
const SRC = path.join(FIBE_REPO, 'db', 'seeds', 'fibe_skills');

// Files that exist in the seed dir for the agent runtime but are not user-facing
// documentation. They live in container memory, not in the docs site.
const SKIP = new Set(['main.md', 'system.md', 'cursor-runtime.mdc']);

if (!fs.existsSync(SRC)) {
  console.error(`[import-seed-skills] Source not found: ${SRC}`);
  console.error('Set FIBE_REPO_PATH or check that the fibe repo is checked out next to this one.');
  process.exit(1);
}

fs.mkdirSync(DST, {recursive: true});

// We only import the MCP tool docs. The other seed files (agent runtime prompts,
// foundation skills, system files) are intentionally NOT documentation.
const srcFiles = new Set(
  fs.readdirSync(SRC).filter((f) => f.endsWith('.md') && !SKIP.has(f) && f.startsWith('fibe-tool-'))
);

// Reflect deletions: remove files from DST that are no longer in SRC.
for (const existing of fs.readdirSync(DST)) {
  if (existing === 'README.md' || existing.startsWith('.')) continue;
  if (!srcFiles.has(existing)) {
    fs.unlinkSync(path.join(DST, existing));
    console.log(`[import-seed-skills] removed stale ${existing}`);
  }
}

// Copy current files.
let copied = 0;
for (const f of srcFiles) {
  fs.copyFileSync(path.join(SRC, f), path.join(DST, f));
  copied++;
}

// Always (re)write the README so the provenance note can't drift.
const readme = `# seed-skills/ — upstream skill mirror

This directory mirrors \`db/seeds/fibe_skills/\` from the **fibe** Rails repo.

These files are the canonical source for the skills an **Agent container** knows
about at runtime. The Rails app loads them into the \`fibe_skills\` table on every
\`db:seed\` and distributes them to running Agents at \`~/.cursor/skills/<slug>/SKILL.md\`.

**Do not edit files in this directory.** Edit the source at:

    /Users/vvsk/play/fibe/db/seeds/fibe_skills/

Then re-import:

    npm run import-seed-skills

And regenerate the Docusaurus pages:

    npm run sync-skills

## What we import (and what we don't)

Only files matching \`fibe-tool-*.md\` come into this directory. They document
the MCP tools that ship with the \`fibe\` SDK, and the SDK section of the docs
site links each tool's detail page back to its file here.

We intentionally skip:

- \`main.md\`, \`system.md\`, \`cursor-runtime.mdc\` — agent runtime prompts.
- \`fibe-coding\`, \`fibe-debug\`, \`fibe-docker-tips\`, \`fibe-labels\`, etc. — agent runtime guidance the user-facing docs cover differently.
- \`fibe-tricks\`, \`fibe-pantry-checklist\`, \`fibe-secondary-concepts\`, etc. — same.
- \`fibe-playwright\`, \`fibe-template-*\`, \`fibe-traefik\`, \`fibe-live-reload\`, \`token-saver\`, etc.

If a non-tool seed file ever needs to become public documentation, edit
\`scripts/import-seed-skills.mjs\` to widen the filter.
`;
fs.writeFileSync(path.join(DST, 'README.md'), readme);

console.log(`[import-seed-skills] copied ${copied} files from ${SRC}`);
console.log(`[import-seed-skills] destination: ${DST}`);
console.log('[import-seed-skills] next: npm run sync-skills');
