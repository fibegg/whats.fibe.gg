---
title: "Build Args And Target"
description: "Use to map Compose `build.args` / `build.target` into Fibe `fibe.gg/build_args` (comma-separated KEY=value) and `fibe.gg/build_target`. Includes variable interpolation and parsing rules."
slug: /reference/recipe-build-args-and-target
sidebar_label: "Build Args And Target"
image: /img/og/reference-recipe-build-args-and-target.png
keywords: ["Fibe", "Recipe", "recipe", "build", "args", "and", "target"]
tags: ["reference", "recipe"]
format: md
---

Map Compose `build.args` / `build.target` into Fibe labels. The labels are string-typed; multiple args are flattened into one comma-separated string.

## `fibe.gg/build_target`

A single string — the name of the Dockerfile stage to build:

```yaml
labels:
  fibe.gg/build_target: production
```

The Dockerfile must contain a matching `FROM ... AS production` stage. If unset, the final stage is built (default Docker behavior).

## `fibe.gg/build_args`

A **comma-separated string** of `KEY=value` pairs:

```yaml
labels:
  fibe.gg/build_args: "RAILS_ENV=production,NODE_VERSION=20,RUBY_VERSION=3.3"
```

Parsing rules:

- Split on `,`.
- For each part, split on the first `=`.
- Whitespace around key and value is trimmed.
- Empty keys are skipped.
- Empty values are kept as empty strings.

So `"K1=,K2=value,, K3 = v3 "` parses to `{ K1: "", K2: "value", K3: "v3" }`.

## Variable interpolation

Values can contain `$$var__NAME`:

```yaml
labels:
  fibe.gg/build_args: "NODE_VERSION=$$var__NODE_VERSION,RAILS_ENV=$$var__RAILS_ENV"
  fibe.gg/build_target: $$var__BUILD_TARGET
```

The whole label value can also be a variable (less common; usually you want a hardcoded list):

```yaml
labels:
  fibe.gg/build_args: $$var__BUILD_ARGS

x-fibe.gg:
  variables:
    BUILD_ARGS:
      name: "Build args (KEY=value,...)"
      default: "NODE_VERSION=20"
```

## Mapping from Compose

```yaml
# BEFORE (Compose)
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        RAILS_ENV: production
        NODE_VERSION: "20"
        DEBIAN_FRONTEND: noninteractive

# AFTER (Fibe)
services:
  web:
    labels:
      fibe.gg/repo_url: https://github.com/owner/repo
      fibe.gg/dockerfile: Dockerfile
      fibe.gg/build_target: production
      fibe.gg/build_args: "RAILS_ENV=production,NODE_VERSION=20,DEBIAN_FRONTEND=noninteractive"
```

## When values contain commas

The simple comma split breaks if a value itself contains a comma. There is no escape syntax. Avoid commas in build arg values; encode out-of-band if you need them (base64, URL encoding, etc.).

```yaml
# BAD — comma in value confuses parser
fibe.gg/build_args: "ALLOWED_HOSTS=a.com,b.com,LANG=en_US.UTF-8"

# GOOD — split, or encode
fibe.gg/build_args: "ALLOWED_HOSTS_B64=YS5jb20sYi5jb20=,LANG=en_US.UTF-8"
```

## When values contain `=`

The first `=` is the separator; subsequent `=` go into the value. So `K=foo=bar` parses as `{ K: "foo=bar" }`. Safe.

## Confirming the build args are passed

After launching, you can verify the args were honored by inspecting the build log via `fibe_playgrounds_logs` or `fibe_playgrounds_debug`. Check that the build command shows `--build-arg KEY=VALUE` lines for each pair.

## Pitfalls

- **Forgetting to quote** the value — most build arg strings won't trip YAML, but `RAILS_ENV: production` (with space) inside YAML needs care. Use quoted form to be explicit:
  ```yaml
  fibe.gg/build_args: "RAILS_ENV=production,NODE_VERSION=20"
  ```
- **Comma in values** — parser splits, you lose data. Encode or split into multiple args.
- **Wrong stage name** — typo in `fibe.gg/build_target` → build fails at the docker-build step with a "stage not found" error. Read `Dockerfile` to confirm.
- **Build args used but not declared in Dockerfile** — Docker silently ignores. `ARG NAME` must appear in the Dockerfile stage.
- **Multi-stage Dockerfile with shared args** — each stage that uses an arg needs its own `ARG NAME` directive. Docker doesn't propagate.
- **Trying to override `target` via env var** — there is no `fibe.gg/target_env`; use `$$var__BUILD_TARGET` interpolation.

## Related skills

[recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-source-mount](recipe-source-mount.md), [recipe-inline-variables](recipe-inline-variables.md), [decide-static-vs-dynamic](decide-static-vs-dynamic.md), [reference-fibe-labels](reference-fibe-labels.md).
