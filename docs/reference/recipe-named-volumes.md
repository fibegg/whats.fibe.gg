---
title: "Named Volumes"
description: "Use to declare Compose named volumes for persistent data (databases, uploads, caches), and to replace host bind mounts that don't survive Marquee filesystem rules."
slug: /reference/recipe-named-volumes
sidebar_label: "Named Volumes"
image: /img/og/reference-recipe-named-volumes.png
keywords: ["Fibe", "Recipe", "recipe", "named", "volumes"]
tags: ["reference", "recipe"]
format: md
---

Stateful services (Postgres, MinIO, Redis with AOF, Git service data) need persistent storage. Use Compose **named volumes**. Host bind mounts (`./data:/var/lib/...`) generally do not work on Fibe Marquees because templates should not assume a host filesystem layout.

## Pattern

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: ${PGPASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:8-alpine
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    command: server /data
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

The `volumes:` top-level block declares the named volumes; the per-service `volumes:` array mounts them.

## Named vs bind

| Form | Example | Use on Fibe |
|---|---|---|
| Named volume | `postgres_data:/var/lib/postgresql/data` | YES — Fibe manages the volume |
| Anonymous volume | `/var/lib/postgresql/data` | OK — but loses naming, harder to manage |
| Host bind | `./data:/var/lib/postgresql/data` | NO — Marquee filesystem doesn't have `./data` |
| Source mount (Fibe-injected) | (via `fibe.gg/source_mount`) | YES — Fibe injects automatically |

## Read-only mounts

Use `:ro` suffix for read-only:

```yaml
services:
  web:
    volumes:
      - gitea_data:/gitea-data:ro
```

Use read-only mounts when one service owns the data and another service only needs to inspect generated files.

## Shared between services

A named volume can be mounted into multiple services for shared storage:

```yaml
services:
  setup:
    volumes:
      - storage:/rails/storage
  web:
    volumes:
      - storage:/rails/storage
  jobs:
    volumes:
      - storage:/rails/storage

volumes:
  storage:
```

This is the standard pattern for app uploads or generated files that more than one role needs to access.

## Volume backups

Fibe does not automatically back up named volumes. If the app's data must survive Marquee destruction:

- Use external services (S3 for blobs, managed Postgres for DB) when possible.
- For Postgres on a named volume, the application is responsible for backup. Schedule a `pg_dump` job (`mode-schedule-cron`) that uploads to S3.
- or consider using something like https://hub.docker.com/r/offen/docker-volume-backup

## Volume options

Compose allows volume drivers and options:

```yaml
volumes:
  pg_data:
    driver: local
    driver_opts:
      type: tmpfs
      device: tmpfs
      o: "size=1g"
```

Marquee defaults to `local` driver. Custom drivers may or may not be available — keep portable templates simple (just `<name>:` with no options).

## Replacing host binds — common rewrites

```yaml
# BAD (Compose / docker-compose.yml on dev laptop)
services:
  app:
    volumes:
      - ./public:/usr/share/nginx/html
      - ./logs:/var/log/app

# GOOD (Fibe template)
services:
  app:
    volumes:
      - app_static:/usr/share/nginx/html
      - app_logs:/var/log/app

volumes:
  app_static:
  app_logs:
```

If the app actually needs source files in `/usr/share/nginx/html`, that's a dynamic service — use `fibe.gg/source_mount` and `fibe.gg/repo_url`.

## Variable-driven volume options

You usually don't parameterize the volume itself, but you might parameterize a path inside:

```yaml
services:
  app:
    volumes:
      - app_data:$$var__DATA_PATH

x-fibe.gg:
  variables:
    DATA_PATH:
      name: "Data directory inside container"
      default: "/var/lib/app/data"
```

## Pitfalls

- **Forgetting the top-level `volumes:` block** — Compose treats `postgres_data` in the service array as anonymous and creates a new random volume per launch. Always declare.
- **Bind mounts assuming repo paths** — `./Dockerfile:/app/Dockerfile` works locally but a Marquee does not guarantee that relative host path. Use `fibe.gg/source_mount` when the service needs repository files.
- **Mounting a volume into a path the image already populates** — the volume gets the image's first-write data only; subsequent image updates don't repopulate. For init data, copy from `/opt/init-data` to the volume on first start (entrypoint script pattern).
- **Mounting a volume into multiple services with read-write** — possible but careful: Postgres specifically refuses to start if its data dir is owned by something else. Use `:ro` on the read-only consumers, leave RW only for the writer.

## Related skills

[recipe-source-mount](recipe-source-mount.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [recipe-configs-block](recipe-configs-block.md), [playbook-postgres-app](playbook-postgres-app.md), [playbook-wordpress](playbook-wordpress.md).
