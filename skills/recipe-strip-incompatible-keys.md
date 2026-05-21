---
name: recipe-strip-incompatible-keys
description: Use to know which Compose keys to delete or rewrite when converting to a Fibe template - `ports`, `container_name`, `hostname`, host-path bind mounts, and Compose-only directives that conflict with Fibe routing/scaling.
---

# Recipe: strip Compose keys Fibe owns or rewrites

Fibe owns routing, host port allocation, container names for scalable services, and service hostnames. Some keys are hard errors, some are warnings, and some are silently rewritten during launch generation. Prefer clean portable templates even when a key technically passes.

## Hard errors

These cause validation or runtime errors and must be removed or rewritten:

| Compose key | Status | Why |
|---|---|---|
| `ports:` binding host `80` or `443` | hard error | Reserved for platform routing |
| `ports:` on `fibe.gg/zerodowntime: "true"` service | hard error | Host port pinning conflicts with rolling updates |
| `container_name:` | rejected when paired with `fibe.gg/zerodowntime: "true"` | Container names must be unique across replicas |

### Always replace `ports:`

Rewrite `ports:` to `fibe.gg/expose` for user-facing HTTP services, or delete it for service-to-service-only traffic (DB, queue, cache). Manual non-80/443 host ports are warnings in current validation, but they make templates less portable and break zero-downtime. See [recipe-ports-to-expose](recipe-ports-to-expose.md).

### Always remove `container_name:`

Setting a literal `container_name:` blocks replicas, breaks rolling updates, and provides no benefit. Just remove it.

### Remove `hostname:`

You can leave it in for local debugging if you want, but Fibe strips `hostname:` lines during template compilation. For a clean template, remove it.

## Keys that pass through (just stay)

These work as in plain Compose:

- `image:`
- `environment:`
- `env_file:` (a Compose feature, not the same as `fibe.gg/env_file`)
- `volumes:` (named volumes; see [recipe-source-mount](recipe-source-mount.md) for source mounts)
- `depends_on:`
- `healthcheck:` (Compose-level; used for `depends_on` ordering)
- `restart:`
- `command:`, `entrypoint:`
- `working_dir:`
- `networks:`
- `deploy:` (`replicas`, `resources.limits.cpus`, `memory`, etc.)
- `configs:`, `secrets:` (Compose config/secret features — orthogonal to Fibe Secrets)
- `shm_size:`, `tmpfs:`, etc.
- `labels:` (`fibe.gg/*` keys + any other vendor labels)

## Keys that need adjustment

### `build:`

If present, **also** add `fibe.gg/repo_url`. Fibe replaces runtime build context with the cloned source path for that repo. Optionally remove `build:` entirely and use only labels:

```yaml
# BEFORE
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
      target: prod
      args:
        NODE_VERSION: "20"

# AFTER (option A: keep build for local compatibility)
services:
  web:
    build: .
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/dockerfile: Dockerfile.prod
      fibe.gg/build_target: prod
      fibe.gg/build_args: "NODE_VERSION=20"

# AFTER (option B: pure Fibe)
services:
  web:
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/dockerfile: Dockerfile.prod
      fibe.gg/build_target: prod
      fibe.gg/build_args: "NODE_VERSION=20"
```

See [recipe-build-to-repo-url](recipe-build-to-repo-url.md).

### Host-path bind mounts (`./local:/in/container`)

```yaml
# Compose-local pattern
volumes:
  - ./logs:/app/logs
  - ./uploads:/app/uploads
```

Host-path mounts depend on the host filesystem. Marquees do not guarantee arbitrary host paths. **Replace with named volumes**:

```yaml
services:
  web:
    volumes:
      - app_logs:/app/logs
      - app_uploads:/app/uploads

volumes:
  app_logs:
  app_uploads:
```

The exception is `fibe.gg/source_mount` — Fibe injects the source-tree bind mount automatically when `fibe.gg/repo_url` is set. See [recipe-source-mount](recipe-source-mount.md).

### `network_mode: host`

Bypasses Compose networking. Fibe runs services inside Marquee Compose networks. Current validation warns; remove and use the default network.

### `privileged: true`

Current validation warns. Avoid in public templates unless the Marquee owner explicitly expects privileged containers.

### `cap_add: [SYS_ADMIN]` / `devices:` / etc.

Same caveat — host-level escapes need Marquee admin awareness. Avoid for public templates.

## "Quality but not required" cleanups

- **Drop dev-only services** unintended for production: `mailhog`, `phpmyadmin`, file-watchers, etc. Or guard with `profiles:`.
- **Tighten image tags**: `postgres:latest` → `postgres:17.5`. Reproducible launches.
- **Add resource limits**: `deploy.resources.limits.cpus`, `.memory` for noisy containers.
- **Remove `restart: always`** on services that should NOT auto-restart (like one-shot migrations). For Fibe job-mode templates, this is irrelevant — runtime forces `restart: "no"`.

## Worked example

```yaml
# BEFORE
services:
  app:
    build: .
    container_name: my_app_web
    hostname: my-app
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    environment:
      APP_HOST: my-app
    restart: always
  db:
    image: postgres:latest
    ports:
      - "5432:5432"
    network_mode: bridge

volumes: {}

# AFTER
services:
  app:
    labels:
      fibe.gg/repo_url: https://github.com/owner/app
      fibe.gg/expose: external:3000
    volumes:
      - app_logs:/app/logs
    environment:
      APP_HOST: app                  # use the compose service-name DNS
    restart: unless-stopped
  db:
    image: postgres:17               # pinned
    # no ports: — only reachable inside the compose network as db:5432
    # no network_mode: bridge — use the default

volumes:
  app_logs:
  pg_data: {}                        # add if needed for persistence
```

## Pitfalls

- **Forgetting to remove `ports:` on a zero-downtime service** — schema/runtime hard error.
- **Keeping `container_name:` because "the docs said to"** — breaks replicas.
- **Bind-mounting host paths and assuming they exist on every Marquee** — use named volumes or source mounts instead.
- **Leaving `network_mode: host`** — Fibe relies on Compose networks for service discovery.
- **Keeping `restart: always` in a job-mode template** — runtime forces `no` anyway, but the value is misleading. Use `restart: "no"` or omit.

## Related skills

[recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-source-mount](recipe-source-mount.md), [decide-zero-downtime](decide-zero-downtime.md), [recipe-named-volumes](recipe-named-volumes.md) (if present), [reference-fibe-labels](reference-fibe-labels.md).
