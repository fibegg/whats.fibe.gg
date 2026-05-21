---
title: "Wikijs"
description: "Use to convert a typical Wiki.js docker-compose.yml (Node app + Postgres) into a Fibe template - end-to-end before/after with all labels, variables, and metadata explained."
slug: /reference/playbook-wikijs
sidebar_label: "Wikijs"
image: /img/og/reference-playbook-wikijs.png
keywords: ["Fibe", "Playbook", "playbook", "wikijs"]
tags: ["reference", "playbook"]
format: md
---

[Wiki.js](https://js.wiki/) is a Node-based wiki platform. The official docker-compose has two services: `db` (Postgres) and `wiki` (Wiki.js). Convert to Fibe end-to-end.

## Input (typical Wiki.js docker-compose.yml)

```yaml
version: "3"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wiki
      POSTGRES_PASSWORD: wikijsrocks
      POSTGRES_USER: wikijs
    logging:
      driver: "none"
    restart: unless-stopped
    volumes:
      - db-data:/var/lib/postgresql/data

  wiki:
    image: ghcr.io/requarks/wiki:2
    depends_on:
      - db
    environment:
      DB_TYPE: postgres
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: wikijs
      DB_PASS: wikijsrocks
      DB_NAME: wiki
    restart: unless-stopped
    ports:
      - "8080:3000"

volumes:
  db-data:
```

## Conversion steps

1. **`wiki` is the user-facing service** — public HTTP. Replace `ports: ["8080:3000"]` with `fibe.gg/expose: external:3000` (container port, not host).
2. **`db` is internal-only** — remove `ports:` if any; talk via service-name DNS (`db:5432`).
3. **Hardcoded `wikijsrocks` password is unsafe** — convert to a `random: true` variable.
4. **`DB_NAME=wiki` and other constants** — keep hardcoded.
5. **Add `x-fibe.gg.metadata`** — description, category.
6. **Add `x-fibe.gg.variables`** — subdomain, replicas (optional), DB password.
7. **No `build:`** — both images are pre-built, so this is a fully **static** template.
8. **No `fibe.gg/repo_url`** anywhere — no source backing.

## Output (Fibe template)

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: wiki
      POSTGRES_USER: wikijs
      POSTGRES_PASSWORD: placeholder        # overwritten by path binding
    logging:
      driver: "none"
    restart: unless-stopped
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wikijs -d wiki"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s

  wiki:
    image: ghcr.io/requarks/wiki:2
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_TYPE: postgres
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: wikijs
      DB_NAME: wiki
      DB_PASS: placeholder                  # overwritten by path binding
    restart: unless-stopped
    labels:
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: $$var__SUBDOMAIN

volumes:
  db_data:

x-fibe.gg:
  variables:
    SUBDOMAIN:
      name: "Subdomain"
      required: true
      default: "wiki"
      validation: "/^[a-z0-9][a-z0-9-]*[a-z0-9]$/"
    DB_PASSWORD:
      name: "Database password"
      required: true
      random: true
      secret: true
      sensitive: true
      paths:
        - services.db.environment.POSTGRES_PASSWORD
        - services.wiki.environment.DB_PASS
  metadata:
    description: "Wiki.js collaborative documentation server with Postgres"
    category: "Productivity"
```

## What changed

| Before | After | Why |
|---|---|---|
| `ports: ["8080:3000"]` on `wiki` | `fibe.gg/expose: external:3000` | Fibe routes via Traefik on subdomain, not host port |
| `POSTGRES_PASSWORD: wikijsrocks` | `POSTGRES_PASSWORD: placeholder` + `path` binding | Generated per-launch random secret |
| `DB_PASS: wikijsrocks` | `DB_PASS: placeholder` + `path` binding | Same random as DB password |
| `depends_on: - db` (short form) | `depends_on: db: { condition: service_healthy }` + `healthcheck:` on db | App waits until DB accepts connections |
| `volumes: - db-data:...` (hyphen) | `db_data` (underscore) | YAML safety; both work but `_` is conventional |
| No metadata | `x-fibe.gg.metadata.{description,category}` | Pantry/launcher card |
| No subdomain | `fibe.gg/subdomain: $$var__SUBDOMAIN` | Launcher chooses |

## Optional enhancements

### Add zero-downtime for the `wiki` service

Wiki.js can run with multiple replicas. To opt in:

```yaml
services:
  wiki:
    deploy:
      replicas: 2
    labels:
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: $$var__SUBDOMAIN
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: /healthz
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 5s
      fibe.gg/healthcheck_retries: "5"
      fibe.gg/healthcheck_start_period: 60s
```

(Wiki.js exposes `/healthz` on the same port.)

### Variable-driven image tag

```yaml
services:
  wiki:
    image: ghcr.io/requarks/wiki:$$var__WIKI_VERSION

x-fibe.gg:
  variables:
    WIKI_VERSION:
      name: "Wiki.js version"
      default: "2"
      validation: "/^[A-Za-z0-9_.-]+$/"
```

### Object storage for uploads (production)

Wiki.js supports S3-compatible storage for assets. Add envs:

```yaml
services:
  wiki:
    environment:
      UPLOADS_STORAGE: s3
      S3_ENDPOINT: $$var__S3_ENDPOINT
      S3_ACCESS_KEY_ID: $$var__S3_KEY
      S3_SECRET_ACCESS_KEY: $$var__S3_SECRET
      S3_BUCKET: $$var__S3_BUCKET

x-fibe.gg:
  variables:
    S3_ENDPOINT:
      name: "S3 endpoint URL"
      required: false
    S3_KEY:
      name: "S3 access key"
      secret: true
    S3_SECRET:
      name: "S3 secret"
      secret: true
      sensitive: true
    S3_BUCKET:
      name: "S3 bucket"
      default: "wiki-uploads"
```

## Validate

```
fibe_schema(
  resource: "compose",
  operation: "validate",
  payload: {
    "compose_yaml": "<the template above>"
  }
)
```

Schema passes. Runtime validation accepts. Launch via `fibe_templates_launch`.

## Related skills

[playbook-postgres-app](playbook-postgres-app.md), [recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [recipe-add-subdomain](recipe-add-subdomain.md), [recipe-named-volumes](recipe-named-volumes.md), [recipe-depends-on](recipe-depends-on.md), [recipe-add-metadata](recipe-add-metadata.md), [convert-compose-to-fibe](convert-compose-to-fibe.md).
