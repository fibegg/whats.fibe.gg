---
name: recipe-depends-on
description: Use Compose `depends_on` with `condition: service_healthy` / `service_completed_successfully` / `service_started` to order service startup correctly in Fibe templates.
---

# Recipe: `depends_on` for startup ordering

`depends_on:` controls the order Compose starts services. Fibe passes it through unchanged. Use it to:

- wait for a database to be **healthy** before starting an app,
- wait for a setup/migration job to **complete** before starting the web tier,
- wait for a config-producing service to **start** before others read from its filesystem.

## Three conditions

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy
      setup:
        condition: service_completed_successfully
      cache:
        condition: service_started
```

| Condition | Means |
|---|---|
| `service_started` | Compose started the container (no readiness guarantee) |
| `service_healthy` | The dependent service's Compose `healthcheck:` is passing |
| `service_completed_successfully` | The dependent service has exited with status 0 (one-shot jobs) |

## Long-form vs short-form

Compose allows the short form `depends_on: [a, b]` — equivalent to `condition: service_started` for each. For Fibe templates, use the long form: most apps need `service_healthy` for databases.

## Healthcheck on the dependency

For `condition: service_healthy` to work, the dependency must define a Compose `healthcheck:`:

```yaml
services:
  db:
    image: postgres:17.5
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 30s
  web:
    image: my-app
    depends_on:
      db:
        condition: service_healthy
```

This is the standard pattern for apps that need a database to be reachable before setup, web, or worker roles start.

## Setup/migration pattern

A common pattern: a one-shot service that runs migrations, then exits. Other services wait for it:

```yaml
services:
  setup:
    image: my-app
    command: bin/rails db:prepare
    restart: 'no'
    depends_on:
      db:
        condition: service_healthy

  web:
    image: my-app
    command: bin/rails server -b 0.0.0.0
    depends_on:
      setup:
        condition: service_completed_successfully
      db:
        condition: service_healthy
```

Use this for setup services that prepare the app, then exit. Web and worker services can then wait for setup to complete successfully.

## DRY with anchors

Repeating the same `depends_on:` across services is wasteful. Anchor it:

```yaml
x-app-deps: &app-deps
  db:
    condition: service_healthy
  cache:
    condition: service_started
  setup:
    condition: service_completed_successfully

services:
  web:
    depends_on: *app-deps
  jobs:
    depends_on: *app-deps
```

See [recipe-anchors-and-aliases](recipe-anchors-and-aliases.md).

## Cyclic depends_on

Compose rejects cycles. If `a` depends on `b` and `b` depends on `a`, restructure: usually one of them is wrong (use service discovery + retry logic in the app instead of startup ordering).

## Job-mode and `depends_on`

In job-mode templates, `depends_on` works as in Compose. Watched services (`fibe.gg/job_watch: "true"`) should NOT depend on each other's `service_completed_successfully` if they should run in parallel.

## `depends_on` vs in-app retry

App code still must retry connections — Compose start order isn't a hard guarantee. `depends_on` reduces transient errors at first start; the app must handle reconnection over its lifetime anyway.

Use the app framework's normal database retry support. For Node/PG, use a connection-pool retry strategy. For Python, use the database driver's retry settings or a retry library.

## Pitfalls

- **`service_healthy` without a `healthcheck:`** — Compose fails to start: "depends_on service_healthy is not configured". Always pair.
- **Healthcheck too strict during boot** — app retries forever; `start_period` should be generous.
- **Compose v2 vs v3 syntax** — long-form `depends_on` works on both. Avoid the v3 deprecation of the short form.
- **Depending on a service that has been removed from the template** — Compose error. Audit `depends_on` keys.
- **Depending on a static service from a dynamic service's build** — `depends_on` is runtime ordering only; build happens before any runtime services exist.

## Related skills

[recipe-anchors-and-aliases](recipe-anchors-and-aliases.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [playbook-rails-app](playbook-rails-app.md), [playbook-postgres-app](playbook-postgres-app.md).
