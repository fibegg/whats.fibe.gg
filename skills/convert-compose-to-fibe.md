---
name: convert-compose-to-fibe
description: Use as the entry point for converting any existing docker-compose.yml into a Fibe Compose template (fibe.gg labels + x-fibe.gg namespace). Orchestrates which surgical skills to load next.
---

# Convert any docker-compose.yml into a Fibe Compose template

This skill is the **master playbook**. It does not duplicate exact rules — it tells you which surgical skills to load for each step. Load the listed skills on demand; do not preload all of them.

## The contract (read first)

A Fibe template is **valid Docker Compose** plus:

1. Service-level Fibe behavior expressed through `fibe.gg/*` labels under `services.<name>.labels`.
2. Optional `x-fibe.gg` block with `variables` and `metadata`. Put job, schedule and trigger settings under `metadata` for current launch/import behavior.
3. No other Fibe-specific top-level keys. `services:` is still required.

Validation runs in three stages — schema is a first pass, runtime owns final compile. Load [reference-validation-pipeline](reference-validation-pipeline.md) to see what each stage catches.

## High-level decision tree

```
input: a docker-compose.yml + intent (one of)
  ├─ HTTP service(s)                     → "long-running web template"
  ├─ background workers + DB only        → "long-running app template"
  ├─ one-shot task that exits            → "job-mode template" (Trick)
  ├─ cron-style recurring                → "job-mode + schedule_config"
  └─ git push / PR triggered             → "job-mode + metadata.trigger_config"
```

→ Load [decide-job-mode](decide-job-mode.md) if uncertain which one.

## Conversion steps

Do them in this order. Each step links to one or more surgical skills.

### Step 1 — Classify every service

For each service, decide *static* (use a prebuilt `image`) or *dynamic* (Fibe clones/builds from a Git repo, can be source-mounted).

→ Load [decide-static-vs-dynamic](decide-static-vs-dynamic.md).

The signal is the `fibe.gg/repo_url` label. A Compose `build:` block **requires** `fibe.gg/repo_url`. So does `fibe.gg/source_mount`.

### Step 2 — Resolve `build:` into Fibe labels

If the service has a `build:` block, you have a dynamic service. Add `fibe.gg/repo_url` + (optional) `fibe.gg/dockerfile`, `fibe.gg/branch`, `fibe.gg/build_target`, `fibe.gg/build_args`, `fibe.gg/source_mount`.

→ Load [recipe-build-to-repo-url](recipe-build-to-repo-url.md) and [recipe-build-args-and-target](recipe-build-args-and-target.md).

### Step 3 — Replace `ports:` with `fibe.gg/port`

User-facing HTTP is **always** `fibe.gg/port`. Never use Compose `ports:` for public traffic — Traefik handles routing.

→ Load [recipe-ports-to-expose](recipe-ports-to-expose.md).

Then choose how the public URL is shaped:
- subdomain only: [recipe-add-subdomain](recipe-add-subdomain.md)
- path prefix on the same host: [recipe-add-path-rule](recipe-add-path-rule.md)
- internal-only auth-protected: [decide-exposure-strategy](decide-exposure-strategy.md)

### Step 4 — Strip Compose keys that Fibe forbids or owns

Remove `ports:`, `container_name`, `hostname:` lines (compiler strips `hostname:` automatically; the others are surfaced as errors when combined with `fibe.gg/zerodowntime`). Keep everything else (`depends_on`, `volumes`, `environment`, `healthcheck`, `networks`, `restart`) — pass-through.

→ Load [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md). Adjust supporting bits: [recipe-named-volumes](recipe-named-volumes.md) for persistence volumes, [recipe-depends-on](recipe-depends-on.md) for startup ordering, [recipe-anchors-and-aliases](recipe-anchors-and-aliases.md) for shared config blocks, [recipe-configs-block](recipe-configs-block.md) for inline config files.

### Step 5 — Decide zero-downtime

For exposed HTTP services that can scale horizontally and respond to a health endpoint, enable rolling updates.

→ Load [decide-zero-downtime](decide-zero-downtime.md) and [recipe-zero-downtime-healthcheck](recipe-zero-downtime-healthcheck.md).

### Step 6 — Extract launch-time variables

Anything the launcher should set (subdomain, image tag, replica counts, credentials defaults) becomes a `x-fibe.gg.variables.<NAME>` entry. Two interpolation idioms:
- whole-node value: `path:` / `paths:` → [recipe-whole-node-paths](recipe-whole-node-paths.md)
- inline-string fragment: `$$var__NAME` inside a Compose string → [recipe-inline-variables](recipe-inline-variables.md)

Sources of variables to extract:
- `${ENV_VAR}` references already in the input compose → [recipe-extract-env-variables](recipe-extract-env-variables.md)
- Anything that should differ between launches: hostname, port, replicas, branch, secrets.

Generated/secret values:
→ Load [recipe-random-and-secrets](recipe-random-and-secrets.md) and [decide-secrets-and-randoms](decide-secrets-and-randoms.md).

### Step 7 — Decide and apply execution mode

If long-running HTTP → done. Otherwise:
- one-shot job → [mode-job-trick](mode-job-trick.md)
- recurring cron → [mode-schedule-cron](mode-schedule-cron.md)
- on git push/PR → [mode-trigger-vcs](mode-trigger-vcs.md)

### Step 8 — Add metadata

`x-fibe.gg.metadata.description` and `x-fibe.gg.metadata.category` are required for publishable templates. `source_defaults: true` is useful for triggered/source-backed templates; runtime will fill `trigger_config.repo_url`/`branch` from the source Prop when set.

→ Load [recipe-add-metadata](recipe-add-metadata.md) for the field details, [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md) for full namespace shape.

### Step 9 — Validate

1. YAML parses.
2. Root has `services:`.
3. JSON Schema passes — no unknown `fibe.gg/*` labels, all values match label regexes, variable names match `^[A-Za-z0-9_]+$`, paths match `^[A-Za-z0-9_./\[\]-]+$`.
4. Runtime API (`fibe_schema(resource: "compose", operation: "validate", payload: {...})`) passes — declared-vs-referenced variables match, prop/marquee/repo URLs resolvable.

→ Load [reference-validation-pipeline](reference-validation-pipeline.md), then [templates-publish-checklist](templates-publish-checklist.md) if publishing.

## Minimum viable conversion

The smallest valid Fibe template is:

```yaml
services:
  web:
    image: nginx:alpine
    labels:
      fibe.gg/port: 80
      fibe.gg/visibility: external
```

That gives you a public HTTP route under the Marquee root domain at subdomain `web` (the default — service name). Add `fibe.gg/subdomain` to override.

## "Just give me the labels I need" cheatsheet

| Intent | Add these labels |
|---|---|
| Public HTTP from prebuilt image | `fibe.gg/port: PORT`<br />`fibe.gg/visibility: external` |
| Internal-only (basic auth) HTTP | `fibe.gg/port: PORT`<br />`fibe.gg/visibility: internal` |
| Build from my repo | `fibe.gg/repo_url`, optional `fibe.gg/dockerfile`, `fibe.gg/branch` |
| Live-edit dev mode | `fibe.gg/repo_url`, `fibe.gg/source_mount: /app`, `fibe.gg/start_command`, `fibe.gg/production: "false"` |
| Zero-downtime rollouts | `fibe.gg/zerodowntime: "true"` on an exposed HTTP service, with optional `fibe.gg/healthcheck_*` overrides when defaults do not match the app; forbids `ports:`/`container_name` |
| One-shot job that defines success | `fibe.gg/job_watch: "true"` on the watched service + `x-fibe.gg.metadata.job_mode: true` |
| Pick subdomain at launch | `fibe.gg/subdomain: $$var__SUBDOMAIN` + variable declared in `x-fibe.gg.variables` |
| Pick image tag at launch | `image: ghcr.io/owner/repo:$$var__TAG` + variable declared |

→ For exact value rules of any label above, load [reference-fibe-labels](reference-fibe-labels.md).

## Worked examples

If the input compose matches one of these shapes, jump straight to the matching playbook — it shows the input/output diff and explains every line:

| Input shape | Playbook |
|---|---|
| Wiki.js (Node app + Postgres) | [playbook-wikijs](playbook-wikijs.md) |
| nginx serving static HTML | [playbook-nginx-static](playbook-nginx-static.md) |
| Ruby on Rails + Postgres + Redis + jobs + websocket | [playbook-rails-app](playbook-rails-app.md) |
| Node app with hot-reload dev server | [playbook-nodejs-dev](playbook-nodejs-dev.md) |
| Python web (FastAPI/Django/Flask) | [playbook-python-app](playbook-python-app.md) |
| WordPress + MariaDB | [playbook-wordpress](playbook-wordpress.md) |
| Generic web app + Postgres | [playbook-postgres-app](playbook-postgres-app.md) |
| Many services sharing config | [playbook-multi-service](playbook-multi-service.md) |
| Scheduled cron job | [playbook-cron-scheduled](playbook-cron-scheduled.md) |
| Test runner on every push | [playbook-test-runner](playbook-test-runner.md) |

## After conversion

- Run `fibe_schema(resource: "compose", operation: "validate", payload: {"compose_yaml": "..."})` from MCP.
- Then `fibe_templates_launch` for a test launch, or `fibe_resource_mutate(resource: "playspec", operation: "create", ...)` to import.
- Watch for errors against [common-errors-and-fixes](common-errors-and-fixes.md).

## What this skill is NOT

- It is not a YAML linter — use schema/runtime validation.
- It does not cover deploy/operate concerns after a Playground is already running; use the appropriate runtime tool or environment guide for that stage.
