---
title: "Multi Service"
description: "Use when converting a docker-compose with many services (5+) that share configuration - leverages YAML anchors, anchored env blocks, anchored depends_on, and `paths:` arrays for variables."
slug: /reference/playbook-multi-service
sidebar_label: "Multi Service"
image: /img/og/reference-playbook-multi-service.png
keywords: ["Fibe", "Playbook", "playbook", "multi", "service"]
tags: ["reference", "playbook"]
format: md
---

When the input compose has many services with overlapping config (`environment`, `depends_on`, `labels`), use YAML anchors to deduplicate. This keeps large templates readable without relying on source-code examples.

## When to apply

Apply when:

- 3+ services share an `environment` block (for example web/jobs/worker/setup all wanting the same database connection envs).
- 3+ services share `depends_on` (setup, web, jobs all wait for the same DB+Redis).
- 3+ services share `fibe.gg/repo_url` / `fibe.gg/branch` / `fibe.gg/dockerfile` labels (for example an app where multiple roles run the same Dockerfile).
- 3+ services share a label set (rare but useful).

For 2 services, anchors might be overkill. For 5+ services, they're essential.

## Skeleton with anchors

```yaml
# ============================================================
# Anchors — top-level x-* keys are ignored by Compose
# ============================================================

x-app-env: &app-env
  RAILS_ENV: ${RAILS_ENV:-production}
  DATABASE_URL: "postgres://app:${DB_PASS}@pgbouncer:5432/${DB_NAME}"
  REDIS_URL: redis://redis:6379/0
  RAILS_LOG_TO_STDOUT: "1"
  RAILS_SERVE_STATIC_FILES: "1"

x-app-deps: &app-deps
  postgres:
    condition: service_healthy
  pgbouncer:
    condition: service_started
  redis:
    condition: service_healthy

x-app-build-labels: &app-build-labels
  fibe.gg/repo_url: ${REPO_URL}
  fibe.gg/branch: ${BRANCH:-main}
  fibe.gg/dockerfile: Dockerfile
  fibe.gg/source_mount: "/rails"
  fibe.gg/env_file: env.example

# ============================================================
# Services
# ============================================================

services:
  postgres:
    image: postgres:17.5
    shm_size: 1gb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME:-app}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

  pgbouncer:
    image: edoburu/pgbouncer:latest
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASS}
      POOL_MODE: transaction
      AUTH_TYPE: scram-sha-256
    depends_on:
      postgres:
        condition: service_healthy

  redis:
    image: redis:8-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped

  setup:
    build: .
    depends_on: *app-deps
    environment: *app-env
    command:
      - /bin/sh
      - -lc
      - |
        bin/setup --skip-server
        bin/rails db:prepare
        bin/rails assets:precompile
    restart: "no"
    labels:
      <<: *app-build-labels

  web:
    build: .
    depends_on:
      <<: *app-deps
      setup:
        condition: service_completed_successfully
    deploy:
      replicas: ${WEB_REPLICAS:-2}
    environment: *app-env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/up"]
      interval: 10s
      timeout: 10s
      retries: 12
      start_period: 120s
    labels:
      <<: *app-build-labels
      fibe.gg/start_command: bin/rails server -b 0.0.0.0
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: ${SUBDOMAIN:-app}
      fibe.gg/production: "true"
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: /up
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 10s
      fibe.gg/healthcheck_retries: "12"
      fibe.gg/healthcheck_start_period: 120s

  jobs:
    build: .
    depends_on:
      <<: *app-deps
      setup:
        condition: service_completed_successfully
    deploy:
      replicas: ${JOBS_REPLICAS:-2}
    environment: *app-env
    command: bundle exec sidekiq
    restart: unless-stopped
    labels:
      <<: *app-build-labels
      fibe.gg/start_command: bundle exec sidekiq
      fibe.gg/production: "true"

volumes:
  pg_data:
  redis_data:

# ============================================================
# Fibe variables — single source of truth
# ============================================================

x-fibe.gg:
  variables:
    REPO_URL:
      name: "Repository URL"
      required: true
      default: "https://github.com/owner/repo"
    BRANCH:
      name: "Branch"
      required: true
      default: "main"
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "app"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
    RAILS_ENV:
      name: "Rails environment"
      required: true
      default: "production"
    DB_NAME:
      name: "Database name"
      required: true
      default: "app"
    DB_PASS:
      name: "Database password"
      required: true
      random: true
      secret: true
      sensitive: true
    WEB_REPLICAS:
      name: "Web replicas"
      required: true
      default: "2"
      validation: "/^[1-9][0-9]*$/"
    JOBS_REPLICAS:
      name: "Worker replicas"
      required: true
      default: "2"
      validation: "/^[1-9][0-9]*$/"
  metadata:
    description: "Multi-service Rails stack with Postgres, pgbouncer, Redis, Sidekiq"
    category: "Web"
    source_defaults: true
```

## Pattern breakdown

### `x-app-env` anchor

Defined once, referenced four times: `setup`, `web`, `jobs`, and could extend to `worker`, `console`. Every service gets the exact same env. Changes happen in one place.

### `x-app-deps` anchor

The "everyone waits for these" dependency set. Use `<<: *app-deps` to extend with service-specific deps (`setup` for web/jobs).

### `x-app-build-labels` anchor

The Fibe labels common to all services that build from the same repo. Override per-service in `labels: <<: *app-build-labels` + extra labels.

### Hybrid `${VAR}` and `$$var__`

The template uses Compose's `${VAR}` interpolation throughout (because the same template can run as plain `docker compose up`). Variables are still declared in `x-fibe.gg.variables` so the Fibe launcher knows about them. The values map by name:

- `${DB_PASS}` in compose ↔ `DB_PASS` declared in Fibe variables.
- Fibe substitutes `${DB_PASS}` with the bound value at compile time? No — Compose's `${VAR}` substitution uses the environment passed at compose start. Fibe arranges for the variables to be in the env. The advantage: the YAML stays readable for local debug.

For a Fibe-only template, replace `${VAR}` with `$$var__VAR` and bind via `paths:` for type safety. Both are valid.

## Variable strategy for multi-service

For each variable, decide between three patterns:

1. **One path** — single location, written once: `path: services.db.environment.POSTGRES_PASSWORD`.
2. **Multiple paths** — write to many locations simultaneously: `paths: [a, b, c]`.
3. **Inline only** — use `$$var__NAME` in many services' environments; declare with no `path`/`paths` (referenced means it's "used").

For shared envs that appear in an anchored block, option 3 + inline is the simplest. The anchor expands to N services, each containing `$$var__NAME`, and the substitution touches all of them.

For label values that need typing (`replicas: 4` as integer), use option 1 or 2 with `path:` for type-safe write.

## Pitfalls

- **Anchors used before declaration** — YAML 1.2 requires `&anchor` to appear before `*anchor`. Place all anchors at the top of the file.
- **Forgetting `<<: *anchor`** — `depends_on: *anchor` works (full replace), but `depends_on: <<: *anchor` is wrong syntax. Use `<<:` only inside mappings: `depends_on: { <<: *anchor, extra: ... }`.
- **`paths:` array with N services that share an anchor** — `paths:` lists exact dotted paths. After anchor expansion, the YAML structure exists at each path, so the writes succeed. Just list them explicitly.
- **Anchor includes a service-specific value** — over-anchoring leads to wrong defaults across services. Anchor only what's truly identical.

## Related skills

[recipe-anchors-and-aliases](recipe-anchors-and-aliases.md), [recipe-whole-node-paths](recipe-whole-node-paths.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [playbook-rails-app](playbook-rails-app.md), [recipe-depends-on](recipe-depends-on.md), [reference-template-variables](reference-template-variables.md).
