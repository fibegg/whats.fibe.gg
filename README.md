# fibe-skills

The source for **[whats.fibe.gg](https://whats.fibe.gg)** — the Fibe user guide and machine-readable skill library.

Two things live here:

1. **A human user guide** — a Docusaurus site that explains every part of Fibe in clear, user-facing language.
2. **A library of LLM skills** — small, task-focused Markdown files that let an AI agent understand Fibe's behavior, answer product questions, design workflows, and turn Docker Compose files into launchable Fibe templates without reading the application source.

Both are published from this repo to `whats.fibe.gg` via GitHub Pages.

---

## Local development

Requires Node.js 20+.

```sh
nvm use            # picks up Node 20 from .nvmrc
npm install
npm start          # http://localhost:3000 with live reload
```

The dev server hot-reloads on edits to anything under `docs/`, `src/`, or static config.

## Build & preview

```sh
npm run build      # production build into ./build/
npm run serve      # preview the built site at http://localhost:3000
```

`npm run build` is strict: broken internal links cause a build failure (`onBrokenLinks: 'throw'`). Run it locally before opening a PR.

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. The custom domain comes from `static/CNAME`.

## Repository structure

```
fibe-skills/
├── docusaurus.config.js   # site config (URL, navbar, footer, plugins)
├── sidebars.js            # manual sidebar hierarchy
├── docs/                  # the user-facing guide content (Markdown)
│   ├── intro.md
│   ├── concepts/          # Marquees, Props, Templates, Playgrounds, Tricks, Wallet
│   ├── agents/            # Genies, Bridge, Build in Public, Artefacts
│   ├── security/          # 2FA, API keys, Secret Vault & Job ENV, Webhooks, Audit log
│   ├── authoring/         # Compose → Fibe authoring guides
│   ├── operate/           # Common problems, publishing
│   └── reference/         # All 50+ machine-readable skill files
├── skills/                # Canonical skill sources (mirrored into docs/reference/)
├── plugins/
│   ├── plugin-llms-txt.js # Emits /llms.txt and /llms-full.txt at build
│   └── plugin-og-images.js# Emits one OG card per page at build
├── src/
│   ├── pages/index.js     # Native React homepage
│   ├── theme/Footer/      # Custom footer (social icons + legal links)
│   ├── css/custom.css     # Dark-mode violet palette
│   └── components/        # Hero, FeatureGrid
├── static/
│   ├── CNAME              # whats.fibe.gg
│   ├── robots.txt
│   ├── site.webmanifest
│   └── img/               # Favicons, OG fallback, logos
└── .github/workflows/
    └── deploy.yml         # Build + publish to GitHub Pages
```

## The homepage

- `/` — the React homepage. Hero + feature grid + footer.
- `/intro/` — the entry point into the guide.

## Editing content

- **Per-section guide pages** live under `docs/<area>/<page>.md`. They use Docusaurus frontmatter (`title`, `description`, `sidebar_position`, `keywords`) and Markdown / MDX with admonitions (`:::tip`, `:::caution`, `:::info`, `:::details`).
- **Skill reference pages** live under `docs/reference/` and `docs/reference/tools/`. The canonical sources are:
  - `skills/` — the **docs-only** authoring source (recipes, playbooks, decision guides, foundations).
  - `seed-skills/` — a **mirror of the upstream Rails seed dir** (`/Users/vvsk/play/fibe/db/seeds/fibe_skills/`). These files describe the skills an Agent container is given at runtime. Do **not** edit them here; edit the source in the fibe repo and re-run `npm run import-seed-skills`.
- **Open Graph card images** are generated automatically at build time from the page title + description. No need to author them by hand.
- **llms.txt** and **llms-full.txt** are also generated at build time from the same content. No manual upkeep.

### Regenerating reference pages

There are two collections to refresh:

```sh
npm run import-seed-skills   # pull the latest seed-skills/ from ../fibe/db/seeds/fibe_skills/
npm run sync-skills          # regenerate docs/reference/ from both skills/ and seed-skills/
# Or both in one shot:
npm run refresh-skills
```

The sync routes files like this:

- `skills/<name>.md` → `docs/reference/<name>.md`
- `seed-skills/fibe-tool-<rest>.md` → `docs/reference/tools/<rest>.md`
- `seed-skills/fibe-<rest>.md` (not tool) → `docs/reference/foundation-<rest>.md`
- Other seed files → `docs/reference/<name>.md`

The agent-internal seed files (`main.md`, `system.md`, `cursor-runtime.mdc`) are excluded — they're runtime prompts, not documentation.

## SEO and discoverability

- `sitemap.xml` is generated automatically by the classic preset and listed in `robots.txt`.
- Each page emits per-page Open Graph + Twitter Card meta from its frontmatter.
- `llms.txt` and `llms-full.txt` make the entire site indexable by LLM agents per [llmstxt.org](https://llmstxt.org).
- `llm-skills.txt` is a compact, deterministic `<name>: <description>` index of every skill and tool. Generated by `npm run build-llm-skills` (and automatically as a `prebuild` step). Re-running on the same inputs always produces a byte-identical file.
- `robots.txt` follows the standard at [robotstxt.org](https://www.robotstxt.org).

## License

© fibe.gg — all rights reserved (the published site). The `skills/` content is licensed for use by LLM tooling that consumes them per the file headers.
