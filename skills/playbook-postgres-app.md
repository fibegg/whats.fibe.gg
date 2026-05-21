---
name: playbook-postgres-app
description: Use as a generic pattern for "web app + Postgres" Compose templates - the right env wiring, healthchecks, password generation, and volume layout for any framework.
---

# Playbook: generic web app + Postgres

A reusable skeleton for any HTTP app that needs Postgres. Mix and match with [playbook-python-app](playbook-python-app.md), [playbook-nodejs-dev](playbook-nodejs-dev.md), [playbook-rails-app](playbook-rails-app.md), or use as-is for a hand-rolled image.

## Skeleton

```yaml
services:
  app:
    image: <YOUR_APP_IMAGE>          # or use build via fibe.gg/repo_url
    environment:
      DATABASE_URL: "postgres://app:$$var__DB_PASS@db:5432/app"
      <APP_ENVS_HERE>: ...
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    labels:
      fibe.gg/expose: external:<APP_PORT>
      fibe.gg/subdomain: $$var__SUBDOMAIN

  db:
    image: postgres:17.5
    shm_size: 256mb
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: placeholder
      POSTGRES_DB: app
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
    restart: unless-stopped

volumes:
  pg_data:

x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "app"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
    DB_PASS:
      name: "Database password"
      required: true
      random: true
      secret: true
      sensitive: true
      path: services.db.environment.POSTGRES_PASSWORD
  metadata:
    description: "Web app with managed Postgres"
    category: "Web"
```

## Important details

### `pg_isready` healthcheck

The healthcheck above uses `pg_isready -U app -d app`. Adapt user/db to your variables. Without a working healthcheck, `depends_on: service_healthy` doesn't help — the app starts before Postgres is accepting connections.

### Single shared password

```yaml
DB_PASS:
  name: "Database password"
  required: true
  random: true
  path: services.db.environment.POSTGRES_PASSWORD
```

The variable lives in ONE place (`services.db.environment.POSTGRES_PASSWORD`), and the app reads it via the inline `$$var__DB_PASS` in `DATABASE_URL`. Both come from the same variable, so the values are identical.

### `shm_size: 256mb`

Postgres uses shared memory for sorts/joins. Default Docker `/dev/shm` is 64 MB — often too small for non-trivial queries (`could not resize shared memory segment` errors). Bump to 256MB or 1GB for heavier workloads.

### `restart: unless-stopped`

Both services restart on container crash but stay down on `docker stop`. For job-mode this gets forced to `no`; for long-running, this is the right default.

## Adding pgbouncer

For high-replica apps, pgbouncer is a connection pooler that prevents Postgres connection exhaustion:

```yaml
services:
  pgbouncer:
    image: edoburu/pgbouncer:latest
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: app
      DB_PASSWORD: placeholder
      POOL_MODE: transaction
      ADMIN_USERS: app
      AUTH_TYPE: scram-sha-256
      IGNORE_STARTUP_PARAMETERS: extra_float_digits
    depends_on:
      db:
        condition: service_healthy

  app:
    environment:
      DATABASE_URL: "postgres://app:$$var__DB_PASS@pgbouncer:5432/app"   # connect to pgbouncer
    depends_on:
      db:
        condition: service_healthy
      pgbouncer:
        condition: service_started

x-fibe.gg:
  variables:
    DB_PASS:
      name: "Database password"
      required: true
      random: true
      paths:
        - services.db.environment.POSTGRES_PASSWORD
        - services.pgbouncer.environment.DB_PASSWORD
```

The app talks to `pgbouncer:5432`, pgbouncer talks to `db:5432`. Same password.

## With migration / setup service

```yaml
services:
  setup:
    image: <YOUR_APP_IMAGE>
    command: <MIGRATION_COMMAND>      # bin/rails db:prepare / alembic upgrade head / etc.
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgres://app:$$var__DB_PASS@db:5432/app"
    restart: "no"

  app:
    depends_on:
      db:
        condition: service_healthy
      setup:
        condition: service_completed_successfully
```

See [recipe-depends-on](recipe-depends-on.md).

## Postgres config tuning via `configs:`

```yaml
services:
  db:
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    configs:
      - source: pg_conf
        target: /etc/postgresql/postgresql.conf

configs:
  pg_conf:
    content: |
      listen_addresses = '*'
      shared_buffers = 256MB
      effective_cache_size = 1GB
      work_mem = 10MB
      max_connections = 100
```

Use larger values only when the app's real workload needs them.

## Pitfalls

- **Forgetting `POSTGRES_DB`** — Postgres creates only the role's default DB; the app's expected DB doesn't exist; connection fails.
- **Default Postgres image runs init scripts ONLY on first init** — if the volume already has data, ENVs like `POSTGRES_DB` are ignored.
- **`postgres:latest`** — major version upgrades require manual migration. Pin to `17.5` or whatever you tested.
- **Connections from the app exceed `max_connections`** — bump pgbouncer in or raise `max_connections`. Sidekiq with 25 workers × 4 replicas = 100 connections fast.
- **App's password env case** — Postgres uses `POSTGRES_PASSWORD`, MariaDB uses `MARIADB_PASSWORD`, the app probably wants `DATABASE_URL` or `DB_PASS`. Map deliberately.
- **No healthcheck** → `depends_on: service_healthy` does nothing. Always include the healthcheck.

## Related skills

[recipe-named-volumes](recipe-named-volumes.md), [recipe-depends-on](recipe-depends-on.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [recipe-configs-block](recipe-configs-block.md), [playbook-rails-app](playbook-rails-app.md), [playbook-python-app](playbook-python-app.md), [playbook-wikijs](playbook-wikijs.md).
