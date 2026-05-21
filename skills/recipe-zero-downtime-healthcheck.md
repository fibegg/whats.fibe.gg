---
name: recipe-zero-downtime-healthcheck
description: Use to tune the five optional `fibe.gg/healthcheck_*` labels for `fibe.gg/zerodowntime: "true"`. Covers path, interval, timeout, retries, and start_period with realistic values.
---

# Recipe: zero-downtime healthcheck labels

When `fibe.gg/zerodowntime: "true"` is set, Fibe generates rollout healthchecks automatically. The five `fibe.gg/healthcheck_*` labels are **optional overrides** for the generated Docker and routing healthchecks. Use them when the default `/up`, `10s`, `5s`, `3`, `30s` profile is wrong for the app.

## The five optional labels

```yaml
labels:
  fibe.gg/zerodowntime: "true"
  fibe.gg/healthcheck_path: /up
  fibe.gg/healthcheck_interval: 10s
  fibe.gg/healthcheck_timeout: 5s
  fibe.gg/healthcheck_retries: "3"
  fibe.gg/healthcheck_start_period: 30s
```

| Label | Format | Notes |
|---|---|---|
| `fibe.gg/healthcheck_path` | absolute HTTP path beginning with `/` | Endpoint the rolling-update gate hits; default `/up` |
| `fibe.gg/healthcheck_interval` | duration `Nms`/`Ns`/`Nm` | Frequency between probes |
| `fibe.gg/healthcheck_timeout` | duration | Per-probe deadline. Must be `< interval` |
| `fibe.gg/healthcheck_retries` | positive integer (as string) | Consecutive failures before declaring the replica unhealthy |
| `fibe.gg/healthcheck_start_period` | duration | Boot grace window. Probes during this window do not count toward `retries` |

## Picking values

The right values depend on the app's boot time and request latency. Three profiles:

### Fast-boot static / proxy

```yaml
fibe.gg/healthcheck_path: /healthz
fibe.gg/healthcheck_interval: 5s
fibe.gg/healthcheck_timeout: 2s
fibe.gg/healthcheck_retries: "3"
fibe.gg/healthcheck_start_period: 10s
```

### Typical web app (Node / Python / Go)

```yaml
fibe.gg/healthcheck_path: /health
fibe.gg/healthcheck_interval: 10s
fibe.gg/healthcheck_timeout: 5s
fibe.gg/healthcheck_retries: "5"
fibe.gg/healthcheck_start_period: 30s
```

### Slow-boot framework

```yaml
fibe.gg/healthcheck_path: /up
fibe.gg/healthcheck_interval: 10s
fibe.gg/healthcheck_timeout: 10s
fibe.gg/healthcheck_retries: "12"
fibe.gg/healthcheck_start_period: 120s
```

## The healthcheck endpoint contract

The path must:

- Return `2xx` ONLY when the replica is ready to serve real traffic.
- Be reachable on the same `fibe.gg/expose` port.
- Be cheap (Traefik hits it on every interval × every replica).
- Not require Basic Auth even on `internal:` services.

Common framework endpoints:

| Framework | Path |
|---|---|
| Rails | `/up` |
| Node Express | usually app-defined; convention `/healthz` |
| Next.js | app-defined; convention `/api/health` |
| Django | requires custom view (e.g. `django-health-check`) |
| FastAPI | app-defined; convention `/healthz` |
| Flask | app-defined |
| Phoenix | `/health` if `live_dashboard` is enabled, else custom |
| nginx | a static `location = /healthz { return 200; }` |

If the app doesn't have a healthcheck endpoint, add one before enabling `fibe.gg/zerodowntime`.

## Variable-driven values

Use variables only when launchers genuinely need to tune rollout behavior. Most templates should hard-code a known-good endpoint and timing profile instead of exposing all five settings.

```yaml
services:
  web:
    labels:
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: $$var__HEALTHCHECK_PATH
      fibe.gg/healthcheck_interval: $$var__HEALTHCHECK_INTERVAL
      fibe.gg/healthcheck_timeout: $$var__HEALTHCHECK_TIMEOUT
      fibe.gg/healthcheck_retries: $$var__HEALTHCHECK_RETRIES
      fibe.gg/healthcheck_start_period: $$var__HEALTHCHECK_START_PERIOD

x-fibe.gg:
  variables:
    HEALTHCHECK_PATH:
      name: "Healthcheck path"
      required: true
      default: "/up"
    HEALTHCHECK_INTERVAL:
      name: "Healthcheck interval"
      required: true
      default: "10s"
      validation: "/^[0-9]+(ms|s|m)$/"
    HEALTHCHECK_TIMEOUT:
      name: "Healthcheck timeout"
      required: true
      default: "5s"
      validation: "/^[0-9]+(ms|s|m)$/"
    HEALTHCHECK_RETRIES:
      name: "Healthcheck retries"
      required: true
      default: "5"
      validation: "/^[1-9][0-9]*$/"
    HEALTHCHECK_START_PERIOD:
      name: "Healthcheck start period"
      required: true
      default: "30s"
      validation: "/^[0-9]+(ms|s|m)$/"
```

## Total rollout budget

Approximate "max time before a replica is killed":
`start_period + (retries × interval)`.

For the slow-boot profile above: `120s + 12 × 10s = 240s` (4 minutes). Tune to your slowest reasonable cold boot.

## Compose healthcheck vs Fibe healthcheck

The Compose `healthcheck:` block is honored by Docker for `depends_on: condition: service_healthy` ordering. The `fibe.gg/healthcheck_*` labels tune Fibe's generated rolling-update healthcheck. You can have both; they don't conflict.

Example with both healthchecks:

```yaml
services:
  web:
    healthcheck:                       # Compose: used by depends_on
      test: ["CMD", "curl", "-f", "http://localhost:3000/up"]
      interval: 10s
      timeout: 10s
      retries: 12
      start_period: 120s
    labels:
      fibe.gg/healthcheck_path: /up    # Fibe: used by rolling-update gate
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 10s
      fibe.gg/healthcheck_retries: "12"
      fibe.gg/healthcheck_start_period: 120s
```

## Pitfalls

- **Omitting all five labels** — valid. Fibe uses defaults. Add labels only when the defaults do not match the app.
- **`retries` as integer** — schema accepts integer or `[1-9][0-9]*` string. Quote it (`"3"`) to be safe.
- **Duration with `h` / `d`** — only `ms`/`s`/`m`. Convert (`60s` not `1m`, or `1m`).
- **Healthcheck returns 200 too early** — replicas accept traffic before they're warm; users see errors. Tighten the endpoint to check actual readiness (DB connection, cache warmed, etc.).
- **Healthcheck behind auth** — even `internal:` services should not require Basic Auth for the healthcheck path. Keep the healthcheck on a path the app handles before user authentication.

## Related skills

[decide-zero-downtime](decide-zero-downtime.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [reference-fibe-labels](reference-fibe-labels.md), [playbook-rails-app](playbook-rails-app.md).
