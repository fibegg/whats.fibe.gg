---
title: Compose → Fibe
description: Nine-step path for taking an existing docker-compose.yml and turning it into a Fibe template. Includes a quick-reference cheatsheet.
slug: /authoring/compose-to-fibe
sidebar_position: 2
image: /img/og/authoring-compose-to-fibe.png
keywords: [Compose, conversion, ports to expose, build to repo_url, source mount, zero-downtime, variables]
---

A nine-step path for taking an existing `docker-compose.yml` and turning it into a Fibe template. The result is **still valid Docker Compose** — you can `docker compose up` it locally — plus the Fibe additions that make it launchable on a Marquee.

## Pick the shape first

```text
your docker-compose.yml + intent
  ├─ HTTP service(s) someone visits  → a long-running web template
  ├─ background workers + DB only    → a long-running app template
  ├─ one-shot task that exits        → a Trick
  ├─ recurring on a cron schedule    → a Trick + schedule
  └─ runs on git push / pull request → a Trick + trigger
```

The shape decides what you do with steps 5–7.

## The nine steps

### 1 — Classify each service

For each service, decide whether it uses a prebuilt image (**static**) or comes from a Git repository (**dynamic**). Dynamic services point at a repo URL; static ones just reference an image.

Static services: `postgres:17`, `redis:8`, `nginx:alpine`. Use the image directly.

Dynamic services: your own application code. Either built from a Dockerfile or live-mounted from source for dev mode.

See [`decide-static-vs-dynamic`](/reference/decide-static-vs-dynamic/) for the full rules.

### 2 — Resolve `build:`

A Compose `build:` block becomes a dynamic service. Replace it with the `fibe.gg/repo_url` label and any related build settings (Dockerfile path, branch, target stage, build args).

```yaml
# Before (plain Compose)
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
      target: production
      args:
        NODE_ENV: production

# After (Fibe)
services:
  web:
    image: ghcr.io/owner/repo:latest    # placeholder image tag — Fibe builds the real one
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/dockerfile: Dockerfile.web
      fibe.gg/build_target: production
      fibe.gg/build_args: NODE_ENV=production
```

See [`recipe-build-to-repo-url`](/reference/recipe-build-to-repo-url/).

### 3 — Replace `ports:`

For services that need a URL, use `fibe.gg/expose` instead of Compose port publishing. Fibe handles HTTPS routing and gives you a clean URL.

```yaml
# Before
ports: ["3000:3000"]

# After
labels:
  fibe.gg/expose: external:3000      # → https://<service>.<root-domain>
```

Use `internal:` instead of `external:` for services that should be Basic-Auth-gated (admin consoles, dashboards).

See [`recipe-ports-to-expose`](/reference/recipe-ports-to-expose/).

### 4 — Drop incompatible keys

Remove `ports:`, `container_name`, and `hostname:` — Fibe takes care of those. Keep `depends_on`, `volumes`, `environment`, `healthcheck`, `networks`, and `restart` as-is.

See [`recipe-strip-incompatible-keys`](/reference/recipe-strip-incompatible-keys/).

### 5 — Decide rolling updates

For exposed HTTP services that can run multiple replicas concurrently, enable zero-downtime rollouts and add the healthcheck labels Fibe needs to know when a new replica is ready.

```yaml
labels:
  fibe.gg/zerodowntime: "true"
  fibe.gg/healthcheck_path: /health
  fibe.gg/healthcheck_interval: 10s
  fibe.gg/healthcheck_timeout: 3s
  fibe.gg/healthcheck_retries: 3
  fibe.gg/healthcheck_start_period: 60s
```

**Do not** enable on stateful singletons (Postgres, Redis, single-instance Kafka). See [`decide-zero-downtime`](/reference/decide-zero-downtime/).

### 6 — Extract launch variables

Anything the launcher should choose (subdomain, image tag, replica count, credentials) becomes a variable. Generated secrets can be set to `random: true` so the launcher doesn't have to invent one.

```yaml
x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      default: "demo"
      validation: "/^[a-z][a-z0-9-]*$/"
      path: services.web.labels.fibe.gg/subdomain
    DB_PASSWORD:
      name: "Database password"
      required: true
      random: true
      secret: true
      path: services.db.environment.POSTGRES_PASSWORD
```

See [Launch variables](/authoring/variables/).

### 7 — Pick the execution mode

| Shape | Add this |
| --- | --- |
| Long-running HTTP | nothing — the default. |
| Trick | `fibe.gg/job_watch: "true"` on the watched service + `x-fibe.gg.metadata.job_mode: true`. |
| Scheduled | (Trick settings) + `metadata.schedule_config`. |
| Triggered | (Trick settings) + `metadata.trigger_config`. |

See [Execution modes](/authoring/execution-modes/).

### 8 — Add metadata

Fill in the template's description and category. If the template will be launched from a Prop, opt in to source defaults so the repository and branch can be filled in automatically.

```yaml
x-fibe.gg:
  metadata:
    description: "Wiki.js + Postgres, ready to launch"
    category: "Knowledge"
    source_defaults: true
```

### 9 — Validate & preview

Run a preview launch before publishing. Many issues only surface at compile or runtime — schema validity isn't the same as a successful launch.

A typical iteration loop:

1. Edit the Template.
2. Click Preview launch on a test Marquee.
3. Watch the build logs.
4. Open the service URL.
5. Repeat until it's clean.

## Quick cheatsheet

| Intent | Add these labels / settings |
| --- | --- |
| Public HTTP from a prebuilt image | `fibe.gg/expose: external:PORT` |
| Internal-only HTTP behind Basic Auth | `fibe.gg/expose: internal:PORT` |
| Build from your repository | `fibe.gg/repo_url` (optionally `fibe.gg/dockerfile`, `fibe.gg/branch`) |
| Live-edit dev mode | `fibe.gg/repo_url` + `fibe.gg/source_mount: /app` + `fibe.gg/start_command` + `fibe.gg/production: "false"` |
| Zero-downtime rollouts | `fibe.gg/zerodowntime: "true"` + the `fibe.gg/healthcheck_*` labels |
| One-shot Trick | `fibe.gg/job_watch: "true"` on the watched service + `x-fibe.gg.metadata.job_mode: true` |
| Subdomain chosen at launch | `fibe.gg/subdomain: $$var__SUBDOMAIN` + matching variable |
| Image tag chosen at launch | `image: ghcr.io/owner/repo:$$var__TAG` + matching variable |

## Example: minimal nginx → Fibe

```yaml
# docker-compose.yml (before)
services:
  web:
    image: nginx:alpine
    ports: ["80:80"]
    volumes:
      - ./html:/usr/share/nginx/html:ro

# Fibe template (after)
services:
  web:
    image: nginx:alpine
    labels:
      fibe.gg/expose: external:80
    volumes:
      - ./html:/usr/share/nginx/html:ro    # mount stays; Marquee preserves it
```

For more, see the [Playbooks](/authoring/playbooks/).

## Related

- [Service labels](/authoring/service-labels/) — the full reference for every `fibe.gg/*` label.
- [Settings block](/authoring/settings-block/) — the full reference for `x-fibe.gg`.
- [Common problems](/operate/common-problems/) — what to do when the conversion misbehaves.
- Reference: [`convert-compose-to-fibe`](/reference/convert-compose-to-fibe/) — the skill version of this same flow.
