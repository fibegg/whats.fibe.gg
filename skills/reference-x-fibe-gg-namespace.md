---
name: reference-x-fibe-gg-namespace
description: Use as the definitive reference for the `x-fibe.gg` template namespace - variables, metadata, job mode, schedule config, and trigger config blocks.
---

# Reference: `x-fibe.gg` top-level namespace

`x-fibe.gg` is an **optional** root key on a Fibe Compose template. The Compose root still requires `services:`. The namespace key is the Compose convention for vendor extensions — Docker Compose silently ignores it, so the document remains valid for `docker compose up` testing.

The namespace value is an object with these recognized keys. Unknown keys are not part of the public contract; avoid them unless another Fibe feature explicitly documents them.

```yaml
x-fibe.gg:
  variables: { ... }       # launch-time inputs
  metadata: { ... }        # template metadata and execution settings
```

Schema accepts `job_mode`, `schedule_config`, and `trigger_config` both at `x-fibe.gg.<key>` and under `x-fibe.gg.metadata.<key>`. For current launch/import behavior, put execution settings under `metadata`; a root-level copy can be kept as a compatibility mirror, but do not rely on root-only execution settings.

## `variables`

Map of launch-time inputs. Keys must match `^[A-Za-z0-9_]+$`. Each value is an object:

```yaml
variables:
  SUBDOMAIN:
    name: "Subdomain"           # required (string, non-empty)
    required: true              # boolean
    random: false               # boolean — Fibe generates 32-char hex if true
    default: "demo"             # string | number | integer | boolean | null
    validation: "/^[a-z]+$/"    # empty string or `/.../`-wrapped regex
    path: services.web.labels.fibe.gg/subdomain
    paths:                      # OR an array form
      - services.web.environment.A
      - services.worker.environment.A
```

Fields:

| Field | Type | Notes |
|---|---|---|
| `name` | non-empty string | Display name shown in launcher. Missing or empty → `missing_name` error. |
| `required` | bool | Required at launch (unless default or random) |
| `random` | bool | Fibe generates a stable 32-character hex value when no value is supplied. |
| `default` | string/number/integer/boolean/null | Used when no launch value. |
| `validation` | empty string or `/regex/` | Slash-wrapped validation pattern. Not wrapping in `/.../` → `invalid_regex_format` error. |
| `path` | template path | Whole-node replacement. See [reference-yaml-paths](reference-yaml-paths.md). |
| `paths` | single path or array | Same as `path` but writes multiple nodes. |

Some launchers understand optional UI hints such as `secret: true` and `sensitive: true`. Treat those as UI hints, not storage security.

**Variable usage rule:** a declared variable must either be referenced via `$$var__NAME` somewhere in the template OR define a `path`/`paths`. Otherwise the runtime emits `unused_var`.

**Reference rule:** every `$$var__NAME` reference must have a declared variable. Otherwise `undeclared_var`.

## `metadata`

Public template description and category. Required when publishing to Pantry.

```yaml
metadata:
  description: "Production-ready Wiki.js with Postgres"   # free-form string
  category: "Productivity"                                # free-form string
  source_defaults: true                                   # boolean
  job_mode: false                                         # boolean
  schedule_config: { ... }                                # cron-driven launches
  trigger_config: { ... }                                 # VCS-triggered launches
```

`source_defaults: true` tells the runtime: when this template is imported from a source Prop, auto-fill `fibe.gg/repo_url`/`fibe.gg/branch` on dynamic services that lack them, and seed `trigger_config.repo_url`/`branch` when triggers are enabled.

## `job_mode`

Boolean. `true` marks the template as job-mode (one-shot). At least one service must have `fibe.gg/job_watch: "true"`. Job-mode templates:

- Cannot have services exposed via `fibe.gg/expose` (job-mode runtime rejects).
- Get `restart: "no"` forced and `deploy.replicas: 1` forced on every service at runtime.
- Complete when all watched services exit. Non-zero exit on any watched service fails the run.

See [mode-job-trick](mode-job-trick.md).

## `schedule_config`

```yaml
schedule_config:
  enabled: true            # boolean
  cron: "0 * * * *"        # cron expression string (5-field POSIX)
  marquee_id: 1            # positive integer or its string form (`^[1-9][0-9]*$`)
```

Used in combination with `job_mode: true` for scheduled jobs. Fibe resolves `marquee_id` to a Marquee the Player owns; validation first checks shape.

See [mode-schedule-cron](mode-schedule-cron.md).

## `trigger_config`

```yaml
trigger_config:
  enabled: true
  event_type: push          # enum: "push" | "pull_request"
  repo_url: "https://github.com/owner/repo"
  branch: "main"
  prop_id: 1                # positive integer or string form
  marquee_id: 1             # positive integer or string form
```

Used with `job_mode: true` to fire the job on VCS events. With `source_defaults: true` and a source-backed import, `repo_url`/`branch` auto-fill from the source Prop.

See [mode-trigger-vcs](mode-trigger-vcs.md).

## Putting it together

```yaml
x-fibe.gg:
  variables:
    APP_NAME:
      name: "App name"
      required: true
      default: "demo"
      validation: "/^[a-z0-9-]+$/"
      paths:
        - services.web.environment.APP_NAME
    DB_PASSWORD:
      name: "Database password"
      required: true
      random: true
      path: services.db.environment.POSTGRES_PASSWORD
  metadata:
    description: "Demo web app + Postgres"
    category: "Web"
    source_defaults: true
    job_mode: false
```

## Validation summary

Validation catches: shape, key names, regex-wrapped validations, types, declared-vs-referenced variables, required-but-missing values, resource ID existence, repo URL provider validity, and trigger permissions.

Both layers run; both must pass. See [reference-validation-pipeline](reference-validation-pipeline.md).

## Related skills

[reference-template-variables](reference-template-variables.md), [reference-yaml-paths](reference-yaml-paths.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-whole-node-paths](recipe-whole-node-paths.md), [recipe-inline-variables](recipe-inline-variables.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [mode-job-trick](mode-job-trick.md), [mode-schedule-cron](mode-schedule-cron.md), [mode-trigger-vcs](mode-trigger-vcs.md), [reference-validation-pipeline](reference-validation-pipeline.md).
