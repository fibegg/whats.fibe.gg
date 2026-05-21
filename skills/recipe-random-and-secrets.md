---
name: recipe-random-and-secrets
description: Use to generate random values for passwords/secrets via `random: true`, mark variables sensitive for launcher UI, and persist them across rollouts in Fibe templates.
---

# Recipe: random values, secrets, and sensitive variables

Fibe templates can declare a variable as `random: true` to have the platform generate the value once and persist it. Optional `secret: true` and `sensitive: true` flags hide the value in launcher UI / telemetry.

## `random: true` semantics

When a variable has `random: true`:

1. At compile time, if the user did not supply a value, Fibe generates 32 lowercase hex characters.
2. The generated value is persisted for the launch — subsequent compiles reuse the same value.
3. Combined with `required: true`, random generation runs **before** the required check, so the combination always succeeds with no user input.

```yaml
DB_PASSWORD:
  name: "Database password"
  required: true
  random: true
  path: services.db.environment.POSTGRES_PASSWORD
```

## Sharing one random across multiple services

```yaml
x-fibe.gg:
  variables:
    PGPASSWORD:
      name: "Postgres password"
      required: true
      random: true
      paths:
        - services.postgres.environment.POSTGRES_PASSWORD
        - services.pgbouncer.environment.DB_PASSWORD
        - services.setup.environment.FIBE_DB_PASS
        - services.web.environment.FIBE_DB_PASS
        - services.jobs.environment.FIBE_DB_PASS
```

Same hex value lands in every listed path. Use this pattern whenever one generated secret must be shared by multiple services.

## Inline random

Same variable can be referenced inline anywhere:

```yaml
services:
  app:
    environment:
      DATABASE_URL: "postgres://postgres:$$var__PGPASSWORD@pgbouncer:5432/app"

x-fibe.gg:
  variables:
    PGPASSWORD:
      name: "Postgres password"
      required: true
      random: true
      paths:
        - services.postgres.environment.POSTGRES_PASSWORD
        - services.pgbouncer.environment.DB_PASSWORD
```

The inline reference and the `paths:` writes all receive the same 32-hex value within one compile pass.

## `secret: true` / `sensitive: true`

Launcher UIs interpret these optional flags:

- `secret: true` — mask the value in the form (show `••••`, allow reveal-click).
- `sensitive: true` — exclude the value from logs/telemetry.

Example:

```yaml
slack_webhook_url:
  name: "Slack Incoming Webhook URL"
  required: false
  secret: true
  sensitive: true
  default: ""
  paths:
    - services.slack-notify-awaken.environment.SLACK_WEBHOOK_URL
    - services.slack-notify-coming.environment.SLACK_WEBHOOK_URL
    - services.slack-notify.environment.SLACK_WEBHOOK_URL
```

The default empty string + `required: false` + `secret: true` makes this a "paste your own webhook here, leave blank to skip" launcher field.

## Random vs. Secret resource

When to choose `random: true` vs a Fibe **Secret** resource:

| Concern | `random: true` | Fibe Secret |
|---|---|---|
| Value lives in this template only | yes | no |
| Value is the Player's external credential (Stripe key, OpenAI token) | no | yes |
| Need to rotate without changing template | hard (`regenerate_variables` flow) | easy (update the Secret) |
| Visibility in launcher UI | masked if `secret: true` | not shown — only metadata |
| Auditability | low | high |

For a Postgres password that lives inside this Playground: `random: true`. For a Stripe API key the Player owns: Fibe Secret. See [decide-secrets-and-randoms](decide-secrets-and-randoms.md).

## Rotating a random value

Template-author tooling can request regeneration for selected variable names. Variables listed there have their stored value deleted, then re-randomized if `random: true`.

## When NOT to use `random: true`

- **Already-shared values** — if the Postgres password is also stored elsewhere (e.g. Player's password manager), use a regular variable with no default. The Player supplies once, Fibe stores.
- **Truly sensitive long-lived secrets** — prefer Fibe Secrets.
- **Values the Player wants to control** — `random: true` makes the value invisible by default; surface it only via launcher reveal-click on `secret: true`.

## Patterns for common secrets

### Database password

```yaml
DB_PASSWORD:
  name: "Database password"
  required: true
  random: true
  secret: true
  sensitive: true
  paths:
    - services.db.environment.POSTGRES_PASSWORD
    - services.app.environment.DATABASE_PASSWORD
```

### Framework/application master key (long-lived, should not be generated)

```yaml
RAILS_MASTER_KEY:
  name: "Application master key"
  required: true
  secret: true
  sensitive: true
  paths:
    - services.setup.environment.RAILS_MASTER_KEY
    - services.web.environment.RAILS_MASTER_KEY
    - services.jobs.environment.RAILS_MASTER_KEY
```

(No `random: true` — this must match the value the application already uses to decrypt credentials. The launcher supplies it.)

### Webhook URL (optional, sensitive, no default)

```yaml
SLACK_WEBHOOK_URL:
  name: "Slack webhook URL"
  required: false
  secret: true
  sensitive: true
  default: ""
  paths:
    - services.notify.environment.SLACK_WEBHOOK_URL
```

### Generated signing secret used by app only

```yaml
JWT_SECRET:
  name: "JWT signing secret"
  required: true
  random: true
  secret: true
  paths:
    - services.web.environment.JWT_SECRET
    - services.worker.environment.JWT_SECRET
```

## Pitfalls

- **Resetting `random: true` between launches** — without explicit `regenerate_variables`, the stored value persists. If you redeploy and the password changed, your existing DB volume is now inaccessible.
- **Using `random` for values the app can't accept** — e.g. an app expects a 64-char Base64 secret, but `random` gives 32 hex chars. Either change the app's spec to accept hex, or supply manually.
- **Treating `secret: true` as encryption** — it's a UI hint, not at-rest encryption. Real secrets use Fibe Secrets.
- **Not listing the variable in `paths:`** — if you only use `$$var__NAME` inline AND don't declare `paths:`, the variable is "used" by inline reference; that's fine. But if you list NO inline use AND no path, it's `unused_var`.

## Related skills

[decide-secrets-and-randoms](decide-secrets-and-randoms.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-whole-node-paths](recipe-whole-node-paths.md), [recipe-inline-variables](recipe-inline-variables.md), [reference-template-variables](reference-template-variables.md).
