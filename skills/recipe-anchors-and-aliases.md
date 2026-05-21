---
name: recipe-anchors-and-aliases
description: Use YAML anchors (`&name`) and aliases (`*name`) to share `depends_on`, `environment`, `build`, healthcheck, or label blocks across multiple Fibe services without copy-paste.
---

# Recipe: YAML anchors and aliases for DRY templates

Large templates often repeat the same `environment:`, `depends_on:`, `build:`, or label blocks across services. YAML anchors deduplicate that shared shape. Fibe permits aliases, so use them when they make the template easier to read.

## Syntax recap

- `&name` — declare an anchor on a YAML node.
- `*name` — reference (alias) the anchor.
- `<<: *name` — merge keys from the anchored mapping into the current mapping.

## At the document level: `x-*` extension keys

Compose ignores top-level `x-*` keys. Anchor them there:

```yaml
x-app-environment: &app-environment
  RAILS_ENV: ${RAILS_ENV:-beta}
  RAILS_MASTER_KEY: ${RAILS_MASTER_KEY}
  FIBE_DB_PASS: ${FIBE_DB_PASS:-password}
  FIBE_DB_HOST: pgbouncer
  REDIS_URL: redis://redis:6379/1

x-rails-deps: &rails-deps
  setup:
    condition: service_completed_successfully
  pgbouncer:
    condition: service_started

services:
  web:
    build: .
    depends_on: *rails-deps
    environment: *app-environment

  jobs:
    build: .
    depends_on: *rails-deps
    environment: *app-environment
```

Use this pattern for any shared dependency or environment block that appears in several services.

## Merge with `<<:`

To override or extend an anchored block:

```yaml
x-base-env: &base-env
  RAILS_ENV: production
  APP_NAME: my-app

services:
  web:
    environment:
      <<: *base-env
      LOG_LEVEL: info               # extra key
  jobs:
    environment:
      <<: *base-env
      RAILS_ENV: development        # override
```

## Anchoring a full service definition

```yaml
x-slack-notify-service: &slack-notify-service
  image: node:24-slim
  environment:
    SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL:-}
  restart: 'no'
  command:
    - /bin/sh
    - -ec
    - |
      # ... long script ...

services:
  slack-notify-awaken:
    <<: *slack-notify-service
    environment:
      <<: *slack-notify-environment
      SLACK_STATUS: is awaken...
```

Useful for "near-identical services with one or two field overrides".

## Anchoring `depends_on`

```yaml
x-setup-dependencies: &setup-dependencies
  <<: *slack-notify-awaken-dependency
  postgres:
    condition: service_healthy
  pgbouncer:
    condition: service_started
  redis:
    condition: service_healthy

services:
  setup:
    depends_on: *setup-dependencies
  jobs:
    depends_on:
      <<: *setup-dependencies
      setup:
        condition: service_completed_successfully
```

## Anchors and `$$var__`

`$$var__NAME` is string substitution, so it works inside anchored values too:

```yaml
x-app-environment: &app-environment
  APP_NAME: $$var__APP_NAME
  DATABASE_URL: postgres://postgres:$$var__DB_PASSWORD@db:5432/app

services:
  web:
    environment: *app-environment
  worker:
    environment: *app-environment
```

When `$$var__APP_NAME` is substituted, both services get the same value.

## Anchors and `path:` bindings

`path:` writes to the **compiled** YAML structure. Aliases are resolved during YAML load; the editor walks the structure once. Writing to `services.web.environment.APP_NAME` does NOT propagate to the aliased other service — they were already separate nodes after the alias expansion.

If you want the same value in two services via a path binding, list both paths:

```yaml
x-fibe.gg:
  variables:
    APP_NAME:
      name: "App name"
      paths:
        - services.web.environment.APP_NAME
        - services.worker.environment.APP_NAME
```

Or use inline `$$var__NAME` inside an anchored block — that propagates because substitution runs on the raw template text before aliases expand.

## Anchors and label keys

You can anchor a labels block too:

```yaml
x-fibe-app-labels: &fibe-app-labels
  fibe.gg/repo_url: $$var__REPO_URL
  fibe.gg/branch: $$var__BRANCH
  fibe.gg/dockerfile: Dockerfile
  fibe.gg/source_mount: /app

services:
  web:
    labels:
      <<: *fibe-app-labels
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: $$var__SUBDOMAIN
  jobs:
    labels:
      <<: *fibe-app-labels
      fibe.gg/start_command: bin/jobs
```

Use this when several roles build from the same repository but expose different commands or routes.

## Limits

- Anchors and aliases are **YAML-level** — they're expanded by the parser before any Fibe processing.
- The schema validates the expanded form. If your anchor produces invalid labels, validation fails at that service after expansion.
- Some YAML tools strip aliases on round-trip — if you reformat with a custom tool, verify aliases survive.

## Pitfalls

- **Anchor used before declared** — YAML 1.2 requires the anchor to appear in document order before its alias. Place `x-*` blocks at the top of the file.
- **Aliases inside `x-fibe.gg.variables` definitions** — works, but the runtime treats variable definitions as a flat hash. Anchors there are over-engineered.
- **Cycles** — YAML aliases cannot loop. `<<: *foo` inside the `&foo`-anchored block is invalid.
- **Stripping aliases for "readability"** — fine, but the template gets longer. Choose taste over DRY only when the duplication is small.

## Related skills

[recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-inline-variables](recipe-inline-variables.md), [playbook-multi-service](playbook-multi-service.md), [playbook-rails-app](playbook-rails-app.md).
