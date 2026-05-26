---
name: decide-zero-downtime
description: Use to decide whether to enable `fibe.gg/zerodowntime` on a service - the prerequisites, what to remove, optional healthcheck tuning labels, and when NOT to enable it.
---

# Decide: zero-downtime rollouts

`fibe.gg/zerodowntime: "true"` switches a service to **rolling updates**: Fibe brings up new replicas, waits for them to pass an HTTP healthcheck, then takes old ones down. The trade-off: more constraints on how the service is built.

## When to enable

Enable **only when all of these are true**:

1. The service is **exposed via `fibe.gg/port`**.
2. The service speaks **HTTP** (so a path-based healthcheck makes sense).
3. The service can run with **multiple replicas concurrently** — stateless, or session-shared via external store.
4. The service does **not** require a single fixed `container_name`.
5. The service does **not** publish via Compose `ports:`.

If any are false, leave `fibe.gg/zerodowntime` unset (default behavior is single-instance restart).

## When NOT to enable

| Service | Reason |
|---|---|
| Postgres / MySQL / SQLite | Stateful singleton; rolling updates corrupt or split writes. |
| Redis / memcached (cache) | Cache is fine to restart; the operational gain is small. |
| RabbitMQ / Kafka brokers | Stateful. |
| Sidekiq / Celery worker (background queue) | Not HTTP — has no healthcheck path. Use Docker restart and a small replica count. |
| Private RPC/backend service | Not user-facing; replicas may be useful, but zero-downtime routing usually is not. |
| Any service with `ports:` host-binding | Validator rejects. |
| Single-instance admin tools (Sidekiq Dashboard) | Marginal gain. |

## What to ADD when enabling

Only these two labels are required for a routed zero-downtime service:

```yaml
services:
  web:
    image: ghcr.io/owner/app:latest
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/zerodowntime: "true"
```

Add the `fibe.gg/healthcheck_*` labels when the defaults do not match the app's readiness endpoint or boot time. Current defaults are `/up`, `10s`, `5s`, `3`, and `30s`.

| Label | Value format | Notes |
|---|---|---|
| `fibe.gg/healthcheck_path` | HTTP path beginning with `/` | The endpoint must return 2xx when ready |
| `fibe.gg/healthcheck_interval` | duration `Nms\|s\|m` | 10s is reasonable |
| `fibe.gg/healthcheck_timeout` | duration | < interval |
| `fibe.gg/healthcheck_retries` | positive integer | Fails after N consecutive failures |
| `fibe.gg/healthcheck_start_period` | duration | Grace window during boot |

Pick values that match the actual app boot time. A slow framework app may need `start_period: 120s`; a static nginx can use `start_period: 5s`.

## What to REMOVE when enabling

- Compose `ports:` block — Fibe rejects zero-downtime services with host ports.
- `container_name:` — Fibe rejects zero-downtime services with fixed container names because they prevent scaling.

Keep:
- Compose `healthcheck:` is OK (used by `depends_on` ordering). The Fibe `fibe.gg/healthcheck_*` labels are separate rollout-tuning inputs; if omitted, Fibe generates a rollout healthcheck from defaults.
- `deploy.replicas:` is OK and recommended (otherwise rolling updates roll one instance against itself).

## Scaling

Set replicas via `deploy.replicas`. Either a literal integer or via a variable (`path: services.web.deploy.replicas`):

```yaml
services:
  web:
    deploy:
      replicas: 4
```

Or parameterized:

```yaml
x-fibe.gg:
  variables:
    WEB_REPLICAS:
      name: "Web replicas"
      required: true
      default: "4"
      path: services.web.deploy.replicas
```


## Example

```yaml
services:
  web:
    deploy:
      replicas: ${WEB_REPLICAS:-4}
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: /up
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 10s
      fibe.gg/healthcheck_retries: "12"
      fibe.gg/healthcheck_start_period: 120s
```

Note: 12 retries × 10s interval = up to 2 minutes after the start period before a replica is marked unhealthy. Tune per app.

## Common pitfalls

- **Healthcheck path returns non-2xx during warmup** — old instances stay running; new ones never accept traffic. Verify locally before enabling.
- **App writes to local filesystem** that is replica-local — replicas diverge. Move state to volumes (and share, e.g. named volume + read-after-write semantics) or external service.
- **Session state stored in-memory** — rolling replicas → user logouts. Use Redis/cookie-signed sessions.
- **Long-running per-request work** — old instances may be killed before requests finish. Add a `preStop` mechanism via the app's own shutdown hooks (Rails: `at_exit`, Node: `SIGTERM` handler).

## Related skills

[recipe-zero-downtime-healthcheck](recipe-zero-downtime-healthcheck.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [decide-exposure-strategy](decide-exposure-strategy.md), [playbook-rails-app](playbook-rails-app.md).
