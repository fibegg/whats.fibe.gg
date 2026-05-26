---
title: "Runtime Implied Semantics"
description: "Use when you need to know what behavior Fibe infers from Compose YAML/labels at runtime (forced lifecycle fields, hidden constraints, stripped keys, and required co-conditions)."
slug: /reference/reference-runtime-implied-semantics
sidebar_label: "Runtime Implied Semantics"
image: /img/og/reference-reference-runtime-implied-semantics.png
keywords: ["Fibe", "Reference", "reference", "runtime", "implied", "semantics"]
tags: ["reference", "reference"]
format: md
---

These behaviors are not full "syntax rules"; they are **platform inferences** derived from how the template is interpreted. They are stable in behavior even though they are not all visible as schema fields.

Use this as a preflight checklist whenever you touch lifecycle, routing, scaling, or source-backed blocks.

## One-off setup services (migrations/tests/maintenance)

When a template runs as a job (`x-fibe.gg.metadata.job_mode: true` and at least one `fibe.gg/job_watch: "true"` service), Fibe treats the run as one-shot and applies runtime overrides:

- `restart: "no"` on every service
- `deploy.replicas: 1` on every service
- completion when all watched services exit `0`
- teardown of all services once watched services finish

If your setup service runs under a long-running command (`sleep`, dev server, watch mode), the job will never finish.

```yaml
services:
  migrate:
    image: myapp:latest
    command: bin/rails db:migrate
    labels:
      fibe.gg/job_watch: "true"   # watched service
      fibe.gg/production: "false"

x-fibe.gg:
  metadata:
    job_mode: true
```

Keep `restart: "no"` on setup services for clarity, even if Fibe would force it in job mode anyway.

## Zero-downtime service implies extra shape restrictions

`fibe.gg/zerodowntime: "true"` is a strong signal:

- service must be exposed: `fibe.gg/port` required
- Compose `ports:` must be absent
- `container_name:` must be absent

Rolling updates with ports/explicit names create conflicts in replicas and are rejected.

```yaml
services:
  web:
    image: ghcr.io/owner/app:latest
    deploy:
      replicas: 4
    labels:
      fibe.gg/port: 3000
      fibe.gg/visibility: external
      fibe.gg/zerodowntime: "true"
      fibe.gg/healthcheck_path: /up
      fibe.gg/healthcheck_interval: 10s
      fibe.gg/healthcheck_timeout: 5s
      fibe.gg/healthcheck_retries: "3"
      fibe.gg/healthcheck_start_period: 30s
```

## Dynamic source/build mode is inferred and validated

These fields require `fibe.gg/repo_url` together with a source-friendly label:

- `fibe.gg/source_mount` (live mount path)
- `build:` (Docker build input)

If either appears without `fibe.gg/repo_url`, preview/compile fails.

```yaml
services:
  web:
    build: .
    labels:
      fibe.gg/source_mount: /app
    # invalid: needs fibe.gg/repo_url
```

## Runtime-owned / stripped semantics

- `hostname:` lines are removed from compiled output. Add them for local only if useful, but they will not survive runtime generation.
- In job-mode templates, Fibe strips `fibe.gg/*` labels before handing the resulting compose to the launcher. Labels are used for orchestration setup only.
- Unknown `fibe.gg/*` keys fail early as hard errors.

## Path-rule and label constraints that affect behavior

`fibe.gg/path_rule` is allowed, but host-level matcher families are blocked because routing host is controlled by Fibe:

- Allowed: `Path`, `PathPrefix`, `PathRegexp`
- Forbidden as primary constructs inside a path rule: `Host`, `HostRegexp`, `HostSNI`, `HostSNIRegexp`, `Headers`, `HeadersRegexp`, `Method`, `Query`, `ClientIP`

This prevents routes from bypassing the hosted domain model.

## Boolean labels and implicit conversion

Runtime boolean checks for these labels only treat exact logical values (`true`/`false`, including string form and equivalent YAML booleans) as expected. Use quoted `"true"`/`"false"` to avoid YAML ambiguity.

Good:

```yaml
labels:
  fibe.gg/production: "false"
  fibe.gg/zerodowntime: "true"
```

Avoid `yes/no` and integer-style booleans.

## Variable binding precedence gotcha worth encoding

Template interpolation happens in order:

1. `$$var__` replacement on raw YAML text
2. `path`/`paths` rewrite into parsed nodes

So if the same variable is declared both inline and with `path`, the path write is the last write.

```yaml
services:
  api:
    image: myapp:$$var__TAG
    labels:
      fibe.gg/subdomain: example

x-fibe.gg:
  variables:
    TAG:
      name: "Image tag"
      default: "dev"
      path: services.api.image
```

`x-fibe.gg.variables.TAG` above replaces the whole `services.api.image`, so image tag becomes `myapp:dev` only if there is no path rewrite from another mechanism.

For one-shot job-mode behavior and zero-downtime behavior check details, see:

- [decide-job-mode](decide-job-mode.md)
- [mode-job-trick](mode-job-trick.md)
- [decide-zero-downtime](decide-zero-downtime.md)
- [reference-fibe-labels](reference-fibe-labels.md)
- [recipe-strip-incompatible-keys](recipe-strip-incompatible-keys.md)
