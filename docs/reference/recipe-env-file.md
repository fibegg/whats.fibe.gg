---
title: "Env File"
description: "Use to set `fibe.gg/env_file` for dynamic services so Fibe knows which example env file in the repo to read defaults from. Covers the difference between Compose `env_file:` and Fibe `fibe.gg/env_file`."
slug: /reference/recipe-env-file
sidebar_label: "Env File"
image: /img/og/reference-recipe-env-file.png
keywords: ["Fibe", "Recipe", "recipe", "env", "file"]
tags: ["reference", "recipe"]
format: md
---

`fibe.gg/env_file` tells Fibe where to find an **example** env file in the cloned repo. Fibe reads it during build/setup to seed unset env variables with safe defaults. Default: `.env.example`.

## Confusing twin: Compose `env_file:`

Compose `env_file:` loads a file into the container's environment at runtime:

```yaml
services:
  web:
    env_file:
      - .env                # loaded into container env at start
```

`fibe.gg/env_file:` points to an **example template** Fibe inspects:

```yaml
services:
  web:
    labels:
      fibe.gg/env_file: env.example
```

The two are independent. A template can use either, both, or neither.

## When to set `fibe.gg/env_file`

- The repo has a non-default example file path (`env-beta.example`, `.env.dist`, `config/env.example`).
- The example file lives in a subdirectory.
- You explicitly want a *different* example file used per template (e.g. one template for dev, one for production, each pointing to a different example).

Default fallback `.env.example` is fine for most projects.

## Schema

Value must match `^[A-Za-z0-9_./-]+$` — path-like. Empty value is also valid.

## Examples

```yaml
labels:
  fibe.gg/env_file: env-beta.example
```

```yaml
# example file in a subdir
labels:
  fibe.gg/env_file: deploy/env.example
```

```yaml
# variable-driven
labels:
  fibe.gg/env_file: $$var__ENV_FILE

x-fibe.gg:
  variables:
    ENV_FILE:
      name: "Env example file"
      default: ".env.example"
```

## What Fibe does with the file

The runtime parses the file as KEY=value lines, then uses the values as defaults for the corresponding `environment:` keys when launching. The file is **NOT** copied into the running container — only the values are read at setup time.

This is why the file is called "example" — it's a template the repo author maintains, not the actual env. Real env values come from the template's `environment:` + `x-fibe.gg.variables` bindings.

## Static services + `fibe.gg/env_file`

Doesn't make sense — static services don't clone a repo, so there's no file to read. Setting `fibe.gg/env_file` on a static service is silently ignored.

## Pitfalls

- **Pointing at a path outside the repo root** — the file is interpreted relative to the cloned repo root. No `../` traversal.
- **Confusing with Compose `env_file:`** — read this skill again. They're different.
- **Expecting the file to be live-reloaded** — it isn't. Env values are baked at launch.
- **Putting real secrets in the example file** — example files are committed to the repo. Secrets must come from template variables or Fibe Secrets.

## Related skills

[recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-build-to-repo-url](recipe-build-to-repo-url.md), [recipe-source-mount](recipe-source-mount.md), [reference-fibe-labels](reference-fibe-labels.md), [decide-secrets-and-randoms](decide-secrets-and-randoms.md).
