---
name: reference-fibe-labels
description: Use as the definitive reference for every supported `fibe.gg/*` Docker Compose label - exact value regexes, defaults, required-when rules, and what runtime/schema each enforces.
---

# Reference: `fibe.gg/*` labels

The label prefix is `fibe.gg/` (configurable to a different prefix in self-hosted setups via `Compose.configuration.label_prefix`, but `fibe.gg/` is what every public template uses). Unknown `fibe.gg/*` labels FAIL parsing. Non-`fibe.gg/` labels pass through to Docker.

## All 19 supported labels

| Label | Value | Default | Required when |
|---|---|---|---|
| `fibe.gg/repo_url` | URL (https://) to GitHub or Gitea repo, or `$$var__NAME` | — | service is dynamic (has `build:`, `source_mount`, or is source-backed) |
| `fibe.gg/source_mount` | Path inside the container (`^[A-Za-z0-9_./-]+$`) | `/app` | source-backed live-mount |
| `fibe.gg/dockerfile` | Path relative to repo root | `Dockerfile` | non-default Dockerfile location |
| `fibe.gg/branch` | Git ref name | repo default branch | pin to non-default branch |
| `fibe.gg/start_command` | shell command string | image `CMD` | overriding runtime command |
| `fibe.gg/env_file` | path relative to repo root | `.env.example` | non-default env example |
| `fibe.gg/expose` | `internal:PORT`, `external:PORT`, or bare port | not exposed | service must serve HTTP to humans |
| `fibe.gg/subdomain` | `@` (root), or `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` | service name | non-default routing host |
| `fibe.gg/path_rule` | Traefik path matcher (`Path`, `PathPrefix`, `PathRegexp` only) | `/` | multiple services share one subdomain |
| `fibe.gg/production` | `true` / `false` (string or boolean) | unset | distinguish built-image vs mounted-source dev |
| `fibe.gg/zerodowntime` | `true` / `false` | unset (single instance, restart-style rollout) | want rolling updates |
| `fibe.gg/healthcheck_path` | HTTP path beginning with `/` | `/up` when zero-downtime generates a healthcheck | custom zero-downtime readiness path |
| `fibe.gg/healthcheck_interval` | duration `Nms` / `Ns` / `Nm` | `10s` when zero-downtime generates a healthcheck | custom zero-downtime timing |
| `fibe.gg/healthcheck_timeout` | duration | `5s` when zero-downtime generates a healthcheck | custom zero-downtime timing |
| `fibe.gg/healthcheck_retries` | positive integer (`[1-9][0-9]*`) | `3` when zero-downtime generates a healthcheck | custom zero-downtime timing |
| `fibe.gg/healthcheck_start_period` | duration | `30s` when zero-downtime generates a healthcheck | custom zero-downtime timing |
| `fibe.gg/build_target` | Dockerfile stage name | unset | multi-stage build |
| `fibe.gg/build_args` | comma-separated `KEY=value` pairs | unset | build needs `--build-arg` |
| `fibe.gg/job_watch` | `true` / `false` | `false` | watched-exit job-mode service |

Any of the above values may also be a `$$var__NAME` interpolation (whole or partial) — runtime substitutes before final compose generation. See [reference-template-variables](reference-template-variables.md).

## Value rules

### Booleans

Allowed: `true`, `false`, YAML booleans (in map form), empty string. NOT allowed: `yes`/`no`/`on`/`off`/`1`/`0`. Quoted strings are recommended for forward-compat with YAML 1.1 truthy parsing:

```yaml
labels:
  fibe.gg/production: "true"
  fibe.gg/zerodowntime: "false"
```

Internally only the literal string `"true"` is treated as true (`TRUTHY_VALUES = ["true"]`). Anything else parses to false.

### `fibe.gg/expose`

Schema allows the empty string and `(internal|external):PORT` or just `PORT`. Runtime requires `1 ≤ PORT ≤ 65535`.

- `external:3000` — public HTTPS route via Traefik.
- `internal:3000` — internal route with Basic Auth middleware per Marquee.
- `3000` (bare) — accepted as internal/default.

### `fibe.gg/subdomain`

Allowed values:
- `@` — bind the route at the root of the Marquee domain.
- lowercase alnum/hyphen, no leading/trailing hyphen: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`.
- empty string — fall back to the default (service name).
- `$$var__NAME` interpolation.

Scalar values are coerced to strings before validation (`true`/`false`/integer become `"true"`/`"false"`/`"123"`), then validated by the slug regex.

Examples:

```yaml
services:
  api:
    labels:
      fibe.gg/expose: external:3000
      # valid:
      fibe.gg/subdomain: api
      fibe.gg/subdomain: "@"
      fibe.gg/subdomain: ""   # fallback to service name
      # string templates:
      fibe.gg/subdomain: "$$var__SUBDOMAIN"
      # invalid in runtime validation:
      fibe.gg/subdomain: 42
      fibe.gg/subdomain: true
      fibe.gg/subdomain: "bad-subdomain-"
```

If omitted, the public host is `<service-name>.<marquee-root-domain>`.

### `fibe.gg/path_rule`

Allowed matchers in the value: `Path`, `PathPrefix`, `PathRegexp`. The value must contain at least one of these (`Path|PathPrefix|PathRegexp\s*\(` regex check).

**Forbidden** matchers — Fibe owns the host, you cannot override it: `Host`, `HostRegexp`, `HostSNI`, `HostSNIRegexp`, `Headers`, `HeadersRegexp`, `Method`, `Query`, `ClientIP`.

Multiple matchers can be combined with `&&` / `||`:

```yaml
fibe.gg/path_rule: Path(`/cable`) || Path(`/health`)
```

### `fibe.gg/healthcheck_interval` / `_timeout` / `_start_period`

Duration regex: `^[0-9]+(?:ms|s|m)$`. Examples: `500ms`, `10s`, `1m`. Bigger units (`h`, `d`) are not accepted.

### `fibe.gg/healthcheck_retries`

Positive integer (or its string form). `^[1-9][0-9]*$`.

### `fibe.gg/build_args`

Comma-separated `KEY=value` pairs. Whitespace tolerated:

```yaml
fibe.gg/build_args: "RAILS_ENV=production, NODE_VERSION=20"
```

Parsed into a key→value map.

### `fibe.gg/repo_url`

Must start with `https://` and resolve through `Configuration::validate_repo_url` (GitHub or Gitea host). Inline `$$var__NAME` interpolation is allowed and bypasses validation until compile time.

## Two forms accepted

**Map form (preferred — easier to target with `path:` bindings):**

```yaml
services:
  web:
    labels:
      fibe.gg/expose: external:3000
      fibe.gg/subdomain: api
      traefik.enable: "true"   # non-fibe labels are pass-through
```

**Array form (legacy Compose):**

```yaml
services:
  worker:
    labels:
      - fibe.gg/job_watch=true
      - com.example.owner=team
```

In array form each item is `<name>=<value>`. The schema applies the same `fibeLabelString` regex per item.

## Cross-label semantics

These are enforced by the **runtime parser**, not the JSON Schema:

- Compose `build:` requires `fibe.gg/repo_url`.
- `fibe.gg/source_mount` requires `fibe.gg/repo_url`.
- `fibe.gg/zerodowntime: "true"` requires:
  - `fibe.gg/expose` set,
  - service does **not** define Compose `ports:`,
  - service does **not** define `container_name`.
- `fibe.gg/healthcheck_*` labels are optional zero-downtime overrides. When they are omitted, Fibe generates rollout healthcheck settings from defaults.
- An unknown `fibe.gg/*` key is a hard error: `Service '<name>': unknown label '<key>'`.

## Inline variable interpolation

Any of the labels above may contain `$$var__NAME` inline. The schema's `templatedFibeLabelString` pattern accepts it. The label value is template-substituted at compile time:

```yaml
labels:
  fibe.gg/expose: external:$$var__PORT
  fibe.gg/subdomain: $$var__SUBDOMAIN
  fibe.gg/repo_url: $$var__REPO_URL
```

The variable must be declared in `x-fibe.gg.variables`. See [recipe-inline-variables](recipe-inline-variables.md).

## Defaults applied at runtime

If unset, the runtime fills:

- `fibe.gg/dockerfile` → `Dockerfile`
- `fibe.gg/env_file` → `.env.example`
- `fibe.gg/source_mount` → `/app` (only for dynamic services; never invented for static ones)
- `fibe.gg/branch` → repo default branch

## Source defaults (auto-fill for source-backed templates)

When a template imports from a source Prop and `x-fibe.gg.metadata.source_defaults: true`, the runtime fills:

- `fibe.gg/repo_url` on services that have `build:`, `source_mount`, or already declare `repo_url`/`branch` — with the source Prop's URL.
- `fibe.gg/branch` similarly with the source ref.
- `trigger_config.repo_url` / `branch` if the template is `job_mode: true` and a `trigger_config` exists.

See [recipe-source-mount](recipe-source-mount.md) for source-mount specifics and [mode-trigger-vcs](mode-trigger-vcs.md) for trigger defaults.

## Related skills

[recipe-ports-to-expose](recipe-ports-to-expose.md), [recipe-add-subdomain](recipe-add-subdomain.md), [recipe-add-path-rule](recipe-add-path-rule.md), [recipe-zero-downtime-healthcheck](recipe-zero-downtime-healthcheck.md), [recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-build-args-and-target](recipe-build-args-and-target.md), [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md), [reference-template-variables](reference-template-variables.md), [reference-validation-pipeline](reference-validation-pipeline.md).
