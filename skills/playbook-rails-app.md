---
name: playbook-rails-app
description: Use to convert a Ruby on Rails docker-compose (web + db + redis + jobs + optional websocket) into a Fibe template.
---

# Playbook: Ruby on Rails

Use this playbook for a user workload built with Ruby on Rails. It focuses on public template behavior: source-backed app services, one-shot setup, Postgres, Redis, jobs, optional websocket routing, launch variables, and zero-downtime web rollouts.

## Typical Rails compose shape

```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      RAILS_ENV: production
      DATABASE_URL: postgres://postgres:secret@db:5432/myapp
      REDIS_URL: redis://redis:6379/0
      RAILS_MASTER_KEY: <from .env>
    depends_on:
      - db
      - redis
  jobs:
    build: .
    command: bundle exec sidekiq
    environment:
      RAILS_ENV: production
      DATABASE_URL: postgres://postgres:secret@db:5432/myapp
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pg_data:/var/lib/postgresql/data
  redis:
    image: redis:8-alpine
    volumes:
      - redis_data:/data

volumes:
  pg_data:
  redis_data:
```

## Conversion targets

| Concern | Approach |
|---|---|
| Rails app source | Dynamic via `fibe.gg/repo_url` + Dockerfile build |
| Migrations | One-shot `setup` service that runs `bin/setup` / `bin/rails db:prepare`, exits |
| Web | Public route on `fibe.gg/port: 3000`, optionally zero-downtime with `/up` healthcheck |
| Jobs | No `expose`; `fibe.gg/start_command: bin/jobs` (or `bundle exec sidekiq`) |
| Postgres | Static `postgres:17`; named volume; random password |
| Redis | Static `redis:8-alpine`; named volume |
| WebSocket (AnyCable / ActionCable) | Optional separate `ws` service sharing subdomain with `path_rule` |
| ENV: RAILS_ENV, MASTER_KEY, DB_PASS | Top-level variables, `paths:`-bound to every service |

## Output (full Rails template)

```yaml
x-rails-deps: &rails-deps
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
  setup:
    condition: service_completed_successfully

x-rails-env: &rails-env
  RAILS_ENV: ${RAILS_ENV:-production}
  RAILS_MASTER_KEY: ${RAILS_MASTER_KEY}
  DATABASE_URL: "postgres://postgres:${DB_PASSWORD}@postgres:5432/${APP_DB}"
  REDIS_URL: redis://redis:6379/0
  RAILS_LOG_TO_STDOUT: "1"
  RAILS_SERVE_STATIC_FILES: "1"

services:
  postgres:
    image: postgres:17.5
    shm_size: 1gb
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${APP_DB:-app}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

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
    depends_on:
      postgres:
        condition: service_healthy
    command:
      - /bin/sh
      - -lc
      - |
        bin/setup --skip-server
        bin/rails db:prepare
        bin/rails assets:precompile
    environment: *rails-env
    restart: "no"
    labels:
      fibe.gg/repo_url: ${REPO_URL}
      fibe.gg/branch: ${BRANCH:-main}
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/source_mount: "/rails"

  web:
    build: .
    depends_on: *rails-deps
    deploy:
      replicas: ${WEB_REPLICAS:-2}
    environment: *rails-env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/up"]
      interval: 10s
      timeout: 10s
      retries: 12
      start_period: 120s
    labels:
      fibe.gg/repo_url: ${REPO_URL}
      fibe.gg/branch: ${BRANCH:-main}
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/source_mount: "/rails"
      fibe.gg/start_command: bin/rails server -b 0.0.0.0
      fibe.gg/port: 3000
      fibe.gg/visibility: external
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
    depends_on: *rails-deps
    deploy:
      replicas: ${JOBS_REPLICAS:-2}
    environment: *rails-env
    command: bundle exec sidekiq
    restart: unless-stopped
    labels:
      fibe.gg/repo_url: ${REPO_URL}
      fibe.gg/branch: ${BRANCH:-main}
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/source_mount: "/rails"
      fibe.gg/start_command: bundle exec sidekiq
      fibe.gg/production: "true"

volumes:
  pg_data:
  redis_data:

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
      validation: "/^[a-z]+$/"
    RAILS_MASTER_KEY:
      name: "Rails master key"
      required: true
      secret: true
      sensitive: true
    DB_PASSWORD:
      name: "Postgres password"
      required: true
      random: true
      secret: true
      sensitive: true
    APP_DB:
      name: "Postgres database name"
      required: true
      default: "app"
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
    description: "Ruby on Rails web stack with Postgres, Redis, and Sidekiq workers"
    category: "Web"
    source_defaults: true
```

This uses Compose-style `${VAR:-default}` interpolation because:
- The same template runs as plain `docker compose up` locally.
- It allows mixing variable defaults with structural anchors cleanly.

For a Fibe-only template, replace `${VAR}` with `$$var__VAR` and bind via `path:` if you want type-safe writes.

## Adding AnyCable / ActionCable WebSocket

For apps that split websocket traffic into AnyCable or ActionCable services, share the same subdomain and route websocket paths to the websocket service:

```yaml
services:
  web-for-anycable:                 # private Rails replicas for RPC
    build: .
    depends_on: *rails-deps
    environment: *rails-env
    deploy:
      replicas: ${ANYCABLE_RPC_REPLICAS:-2}
    labels:
      fibe.gg/repo_url: ${REPO_URL}
      fibe.gg/branch: ${BRANCH:-main}
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/start_command: bin/rails server -b 0.0.0.0
      # no fibe.gg/port — private to AnyCable

  ws:                                # anycable-go front
    image: anycable/anycable-go:1.6
    environment:
      ANYCABLE_HOST: 0.0.0.0
      ANYCABLE_PORT: 8081
      ANYCABLE_RPC_HOST: http://web-for-anycable:3000/_anycable
      ANYCABLE_BROADCAST_ADAPTER: redis
      REDIS_URL: redis://redis:6379/0
    depends_on:
      redis:
        condition: service_healthy
      web-for-anycable:
        condition: service_healthy
    labels:
      fibe.gg/port: 8081
      fibe.gg/visibility: external
      fibe.gg/subdomain: ${SUBDOMAIN:-app}       # SAME subdomain as web
      fibe.gg/path_rule: Path(`/cable`) || Path(`/health`)
```

`web` catches everything; `ws` catches `/cable` and `/health` on the same subdomain.

## Why `setup` is one-shot

Rails apps need migrations + asset compilation BEFORE the web tier accepts traffic. `setup`:

- Runs `bin/setup --skip-server` (your repo's setup script).
- Runs `bin/rails db:prepare` (db create + migrate + seed).
- Runs `bin/rails assets:precompile`.
- Exits 0.

`web` and `jobs` depend on `setup` via `service_completed_successfully`. Subsequent rollouts run `setup` again — it should be idempotent.

## Pitfalls

- **Hardcoded `secret` for `RAILS_MASTER_KEY`** — must come from the launcher (the repo's encrypted credentials are decrypted with this).
- **Source mount + `production: "true"`** — combination is fine but the mount is unused at runtime. Set `source_mount` only if you use it for dev mode.
- **Forgetting `RAILS_LOG_TO_STDOUT: "1"`** — without it, Rails logs to a file inside the container; `docker logs` shows nothing useful.
- **Sidekiq without a healthcheck** — Sidekiq is not HTTP. Don't enable zero-downtime for it; rely on restart-style rollouts and small replica counts.
- **`RAILS_SERVE_STATIC_FILES` unset** — without it, Rails returns 404 for `/assets/...` behind Traefik. Always set to `"1"` for production templates.

## Related skills

[recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-zero-downtime-healthcheck](recipe-zero-downtime-healthcheck.md), [recipe-anchors-and-aliases](recipe-anchors-and-aliases.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [recipe-add-path-rule](recipe-add-path-rule.md), [recipe-depends-on](recipe-depends-on.md), [decide-zero-downtime](decide-zero-downtime.md).
