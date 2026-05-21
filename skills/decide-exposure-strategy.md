---
name: decide-exposure-strategy
description: Use to decide how a service should be reachable - external public HTTPS via subdomain, internal Basic-Auth-protected HTTPS, sharing a subdomain via path rule, root subdomain, or not exposed at all.
---

# Decide: exposure strategy

The output of this decision is the value of `fibe.gg/expose`, plus optionally `fibe.gg/subdomain` and `fibe.gg/path_rule`.

## Step 1 — Should this service be reachable at all?

| Service kind | Reachable? |
|---|---|
| Public web app | yes — `external:PORT` |
| Internal admin / metrics / status page | yes — `internal:PORT` |
| Background worker (Sidekiq, RQ, Celery) | no — omit `fibe.gg/expose` |
| Database / cache / queue | no — omit `fibe.gg/expose` (they communicate inside the Compose network) |
| Auxiliary build-time service (setup, migrate, notify) | no |
| AnyCable/WebSocket server (talked-to from a public web service) | no |

Internal services talk over the Compose `default` network using their service name as DNS (`db`, `redis`, `web-for-anycable`). Do not expose them externally just because the app needs to reach them.

## Step 2 — Pick internal vs external

- **`external:PORT`** — public HTTPS route via Traefik on `https://<subdomain>.<marquee-root-domain>`. No additional auth from Fibe. Use for the user-facing app.
- **`internal:PORT`** — same routing but Traefik adds a Basic Auth middleware with Marquee credentials. Use for admin consoles (Sidekiq Dashboard, RailsAdmin, Grafana, pgAdmin) that shouldn't be public but you still want a browser URL.

If you want no public surface at all (only reachable from other containers in the network), do NOT set `fibe.gg/expose`. The service is then only reachable inside Compose's network.

## Step 3 — Pick the subdomain

The subdomain is the leftmost label of the public host. Default: the service name. Override with `fibe.gg/subdomain`.

| `fibe.gg/subdomain` value | Resulting host |
|---|---|
| omitted | `<service-name>.<marquee-root-domain>` |
| `api` | `api.<marquee-root-domain>` |
| `@` | `<marquee-root-domain>` (the root) |
| `$$var__SUBDOMAIN` | configured at launch |

Subdomain regex: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`. Lowercase alphanumeric and hyphens, cannot start or end with hyphen.

Use `@` when this service should answer at the root of the Marquee — typically the "front door" web app. At most one service per Marquee can use `@` for a given path; conflicts surface at launch.

## Step 4 — Decide whether to share a subdomain with `path_rule`

Sometimes two services share one host but differ by URL path. The classic case is a Rails web app + an AnyCable WebSocket server: both at `next.fibe.live`, but `/cable` and `/health` route to the WebSocket service.

```yaml
services:
  web:
    labels:
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: ${SUBDOMAIN:-next}
      # no path_rule → catch-all
  ws:
    labels:
      fibe.gg/expose: external:8081
      fibe.gg/subdomain: ${SUBDOMAIN:-next}
      fibe.gg/path_rule: Path(`/cable`) || Path(`/health`)
```

Path rule allowed matchers only: `Path`, `PathPrefix`, `PathRegexp`. Forbidden: Host, HostRegexp, HostSNI, HostSNIRegexp, Headers, HeadersRegexp, Method, Query, ClientIP — Fibe owns those.

See [recipe-add-path-rule](recipe-add-path-rule.md).

## Step 5 — Pick the port

`fibe.gg/expose: <visibility>:PORT` where PORT is the **container** port the service listens on, not a host port. Fibe owns host port allocation.

The PORT must be `1..65535`. Bare `PORT` (no `internal:` / `external:`) is accepted as internal.

```yaml
fibe.gg/expose: external:80      # nginx static
fibe.gg/expose: external:3000    # rails / node
fibe.gg/expose: external:5173    # vite dev
fibe.gg/expose: external:8000    # python
fibe.gg/expose: internal:9000    # admin console
fibe.gg/expose: $$var__PORT      # variable
fibe.gg/expose: external:$$var__PORT  # template uses launcher's port choice
```

## Step 6 — Verify the app listens on `0.0.0.0`

A service exposed via Fibe must bind `0.0.0.0` inside the container. `localhost`/`127.0.0.1` is not reachable from the Compose network. Common one-off fixes:

| App | Correct bind |
|---|---|
| Rails | `bin/rails server -b 0.0.0.0` |
| Node/Express | `app.listen(PORT, '0.0.0.0')` |
| Next.js | `next dev -H 0.0.0.0` |
| Vite | `vite --host 0.0.0.0` |
| Django dev server | `python manage.py runserver 0.0.0.0:8000` |
| FastAPI/uvicorn | `uvicorn app:main --host 0.0.0.0` |
| Flask dev | `flask run --host 0.0.0.0` |

Vite 6+ additionally needs `server.allowedHosts: true` or the explicit Fibe host in config — otherwise the browser gets `Invalid Host header`.

## Step 7 — Never use Compose `ports:` (for web services)

Compose `ports:` exposes a host port directly, bypassing Traefik. On Fibe this:

- doesn't get TLS,
- doesn't get a public URL via the Marquee root domain,
- conflicts with `fibe.gg/zerodowntime: "true"` (validator rejects).

Always convert `ports:` to `fibe.gg/expose`. See [recipe-ports-to-expose](recipe-ports-to-expose.md).

## Decision tree summary

```
Should service be reachable?
├─ No  → omit fibe.gg/expose entirely
└─ Yes
   ├─ Public user-facing       → fibe.gg/expose: external:PORT
   │  ├─ Default service-name routing? → no extra labels
   │  ├─ Different subdomain?         → fibe.gg/subdomain: <name>
   │  ├─ At root of Marquee?          → fibe.gg/subdomain: "@"
   │  └─ Sharing subdomain with another service? → fibe.gg/path_rule + same subdomain
   └─ Admin / staff only       → fibe.gg/expose: internal:PORT
      (Marquee Basic Auth is applied automatically)
```

## Related skills

[recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-add-subdomain](recipe-add-subdomain.md), [recipe-add-path-rule](recipe-add-path-rule.md), [decide-zero-downtime](decide-zero-downtime.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [reference-fibe-labels](reference-fibe-labels.md).
