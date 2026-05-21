# seed-skills/ — upstream skill mirror

This directory mirrors `db/seeds/fibe_skills/` from the **fibe** Rails repo.

These files are the canonical source for the skills an **Agent container** knows
about at runtime. The Rails app loads them into the `fibe_skills` table on every
`db:seed` and distributes them to running Agents at `~/.cursor/skills/<slug>/SKILL.md`.

**Do not edit files in this directory.** Edit the source at:

    /Users/vvsk/play/fibe/db/seeds/fibe_skills/

Then re-import:

    npm run import-seed-skills

And regenerate the Docusaurus pages:

    npm run sync-skills

## What we import (and what we don't)

Only files matching `fibe-tool-*.md` come into this directory. They document
the MCP tools that ship with the `fibe` SDK, and the SDK section of the docs
site links each tool's detail page back to its file here.

We intentionally skip:

- `main.md`, `system.md`, `cursor-runtime.mdc` — agent runtime prompts.
- `fibe-coding`, `fibe-debug`, `fibe-docker-tips`, `fibe-labels`, etc. — agent runtime guidance the user-facing docs cover differently.
- `fibe-tricks`, `fibe-pantry-checklist`, `fibe-secondary-concepts`, etc. — same.
- `fibe-playwright`, `fibe-template-*`, `fibe-traefik`, `fibe-live-reload`, `token-saver`, etc.

If a non-tool seed file ever needs to become public documentation, edit
`scripts/import-seed-skills.mjs` to widen the filter.
