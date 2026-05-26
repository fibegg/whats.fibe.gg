---
title: "Ports To Expose"
description: "Use to convert Compose `ports:` declarations into `fibe.gg/port` labels for public/internal HTTP routing through Traefik."
slug: /reference/recipe-ports-to-expose
sidebar_label: "Ports To Expose"
image: /img/og/reference-recipe-ports-to-expose.png
keywords: ["Fibe", "Recipe", "recipe", "ports", "to", "expose"]
tags: ["reference", "recipe"]
format: md
---

Compose `ports:` publishes a container port to a host port. On Fibe, **all** user-facing HTTP routing is done by Traefik based on `fibe.gg/port`. Drop `ports:` and add the label.

## Mapping

| Compose `ports:` form | Container port | Fibe label |
|---|---|---|
| `- "3000:3000"` | 3000 | `fibe.gg/port: 3000` + `fibe.gg/visibility: external` |
| `- "8080:80"` | 80 | `fibe.gg/port: 80` + `fibe.gg/visibility: external` |
| `- "5173"` | 5173 (auto host) | `fibe.gg/port: 5173` + `fibe.gg/visibility: external` |
| `- "127.0.0.1:8000:8000"` (host-loopback only) | 8000 | `fibe.gg/port: 8000` + `fibe.gg/visibility: internal` (Basic Auth) |
| `- "9000:9000"` for an admin console | 9000 | `fibe.gg/port: 9000` + `fibe.gg/visibility: internal` |

The PORT in the label is the **container** port (the second number in Compose's `host:container` form, or the only number when bare). Fibe owns host port allocation; you cannot pin a host port.

## Step-by-step

1. **Read the container port** from the rightmost colon of each `ports:` entry.
2. **Decide visibility**:
   - Public web → `fibe.gg/visibility: external`
   - Admin/staff → `fibe.gg/visibility: internal`
   - Not human-facing (DB/queue/cache) → no `fibe.gg/port` at all; **delete** the `ports:` entry.
3. **Add the label** under `labels:` on the service.
4. **Delete the `ports:` block** from the service.
5. **Add `fibe.gg/subdomain`** if you don't want the default (service name) routing. See [recipe-add-subdomain](recipe-add-subdomain.md).
6. **Ensure the app binds `0.0.0.0`** inside the container — see [decide-exposure-strategy](decide-exposure-strategy.md).

## Before / after

### Public web

```yaml
# BEFORE
services:
  web:
    image: ghcr.io/owner/app:latest
    ports:
      - "3000:3000"

# AFTER
services:
  web:
    image: ghcr.io/owner/app:latest
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
```

### Multiple ports — pick the one humans use, drop the rest

If a Compose service publishes multiple ports (e.g. main HTTP + metrics), only **one** can be public-facing per `fibe.gg/port` label. For metrics/admin on a different port, split into two services if they really need separate routing, or omit the extra port entirely (it's reachable inside the Compose network without `ports:`).

```yaml
# BEFORE
services:
  app:
    image: my-app
    ports:
      - "8080:8080"   # HTTP
      - "9090:9090"   # metrics

# AFTER — keep only the HTTP one
services:
  app:
    image: my-app
    labels:
      fibe.gg/port: 8080
      fibe.gg/visibility: external
```

Metrics still reachable as `app:9090` from another container inside the Compose network.

### Internal admin

```yaml
# BEFORE
services:
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "127.0.0.1:5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com

# AFTER
services:
  pgadmin:
    image: dpage/pgadmin4:latest
    labels:
      fibe.gg/port: 80
      fibe.gg/visibility: internal
      fibe.gg/subdomain: pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
```

The Marquee-level Basic Auth credentials apply.

### Database / cache — drop entirely

```yaml
# BEFORE
services:
  db:
    image: postgres:17
    ports:
      - "5432:5432"   # often only there for "I want to connect from my laptop"

# AFTER
services:
  db:
    image: postgres:17
    # no labels/ports — service is reachable as "db:5432" inside the Compose network
```

Apps in the same Compose network reach Postgres as `db:5432`. If a Player needs psql access from their laptop, do it through `fibe_playgrounds_debug` and an exec into the container — never expose the database on the public internet.

## Variable-driven port

If the port should be configurable at launch:

```yaml
services:
  web:
    image: ghcr.io/owner/app:latest
    labels:
      fibe.gg/port: $$var__PORT
      fibe.gg/visibility: external

x-fibe.gg:
  variables:
    PORT:
      name: "Container port"
      required: true
      default: "3000"
      validation: "/^[0-9]+$/"
```

See [recipe-inline-variables](recipe-inline-variables.md).

## Pitfalls

- **Leaving `ports:` while also setting `fibe.gg/port`** — works for non-zero-downtime services, but `ports:` is a security/firewall surprise. Always remove it.
- **Leaving `ports:` while turning on `fibe.gg/zerodowntime: "true"`** — validator rejects (`zerodowntime services cannot have 'ports'`).
- **Setting `fibe.gg/port` on a service that doesn't actually listen on that port** — Traefik routes traffic; the container 404s or refuses. Verify with `docker exec <c> ss -ltnp` (or equivalent).
- **Using `fibe.gg/visibility: external` for a port the app binds to localhost only** — `0.0.0.0` is required. Fix the app's bind config (see [decide-exposure-strategy](decide-exposure-strategy.md)).

## Related skills

[decide-exposure-strategy](decide-exposure-strategy.md), [recipe-add-subdomain](recipe-add-subdomain.md), [recipe-add-path-rule](recipe-add-path-rule.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [recipe-inline-variables](recipe-inline-variables.md), [reference-fibe-labels](reference-fibe-labels.md).
