---
name: recipe-add-metadata
description: Use to fill in `x-fibe.gg.metadata.description`, `category`, `source_defaults`, and execution settings such as `job_mode`, `schedule_config`, and `trigger_config`.
---

# Recipe: `x-fibe.gg.metadata`

Templates that get published (Bazaar) need metadata. Templates intended only for private launch can skip metadata, but it's still good hygiene.

## Minimum

```yaml
x-fibe.gg:
  metadata:
    description: "One-sentence summary of what launches when you run this template."
    category: "Web"
```

That's the floor for Bazaar. Both are free-form strings; no enums.

## All recognized fields

```yaml
x-fibe.gg:
  metadata:
    description: "Wiki.js + Postgres production-ready stack"
    category: "Productivity"
    source_defaults: true
    job_mode: false
    schedule_config:
      enabled: false
      cron: "0 * * * *"
      marquee_id: 1
    trigger_config:
      enabled: false
      event_type: push
      repo_url: ""
      branch: main
      prop_id: 1
      marquee_id: 1
```

| Field | Type | Purpose |
|---|---|---|
| `description` | string | Bazaar card description and launcher summary |
| `category` | string | Bazaar filter |
| `source_defaults` | bool | Auto-fill `repo_url`/`branch` from the source Prop when imported |
| `job_mode` | bool | Marks this template as one-shot/job-mode |
| `schedule_config` | object | Cron-driven job launches |
| `trigger_config` | object | VCS-triggered job launches |

Put `job_mode`, `schedule_config`, and `trigger_config` inside `metadata` for current launch/import behavior. Root-level copies are schema-accepted compatibility mirrors, but root-only execution settings are not portable across all public flows.

## `description` style

Write **others will see** when they launch this template:

- ✅ "Wiki.js + Postgres — collaborative documentation server"
- ✅ "Ruby on Rails web stack with Postgres, Redis, and Sidekiq workers"
- ✅ "Nightly database backup to S3"
- ❌ "Web app"
- ❌ "Stack"
- ❌ "see README"

A sentence or two. No markdown.

## `category` conventions

Use a short noun phrase. Bazaar doesn't enforce a list — match the audience:

- `Web`, `Productivity`, `CI`, `Operations`, `Development`, `Database`, `AI`, `Storage`, `Communication`, `Security`.

Avoid niche categories — broader matches discovery.

## `source_defaults: true`

Set when the template will be imported from a source Prop (a Git repo). When true, the runtime auto-fills:

- `fibe.gg/repo_url` on services that have `build:`, `fibe.gg/source_mount`, or already declare `fibe.gg/repo_url`/`fibe.gg/branch` → with the source Prop's repo URL.
- `fibe.gg/branch` similarly with the source ref.
- `trigger_config.repo_url`/`branch` if the template has a `trigger_config` and `job_mode: true`.

This lets one template be used across many repos: import from any Prop, no per-import editing.

```yaml
x-fibe.gg:
  metadata:
    description: "CI test runner — runs `npm test` against the source repo on push"
    category: "CI"
    source_defaults: true
    job_mode: true
    trigger_config:
      enabled: true
      event_type: push
      # repo_url and branch auto-fill from source Prop
      prop_id: 1
      marquee_id: 1
```

## Execution settings in metadata

Schema accepts these at both `x-fibe.gg.<key>` and `x-fibe.gg.metadata.<key>`. Current public import flows use the metadata location for Playspec execution settings. Reasons to keep them in metadata:

- Public templates return one metadata payload.
- Launchers and import flows can carry the template's execution shape with its description/category.
- `source_defaults` can fill trigger repo/branch in the same object that owns `trigger_config`.

If you mirror root-level fields for schema-facing tools, keep the values identical.

## Skipping metadata

Private one-off templates can skip `metadata` entirely. The template will still validate and launch. But:

- It can't be published to Bazaar (which requires `description`/`category`).
- Launchers may show "Untitled" or service-name placeholders.

## Variable-driven metadata

You can parameterize description text:

```yaml
x-fibe.gg:
  metadata:
    description: $$var__DESCRIPTION
    category: $$var__CATEGORY

  variables:
    DESCRIPTION:
      name: "Description"
      default: "My app"
    CATEGORY:
      name: "Category"
      default: "Web"
```

Rarely useful — these are usually fixed by the template author. But the schema allows it.

## Pitfalls

- **Markdown in `description`** — Bazaar renders as plain text. No headings, no bold.
- **Root-only `job_mode` / schedule / trigger config** — may validate but not launch/import as intended. Put execution settings in `metadata`.
- **`source_defaults: true` with NO source Prop** — runtime silently does nothing (there's no Prop to read from); explicitly declared values are still honored.
- **Forgetting `description` before publishing** — Bazaar rejects.
- **Description as the template name** — name is set separately when importing/creating the template; description is the body.

## Related skills

[reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md), [decide-job-mode](decide-job-mode.md), [mode-schedule-cron](mode-schedule-cron.md), [mode-trigger-vcs](mode-trigger-vcs.md), [templates-publish-checklist](templates-publish-checklist.md).
