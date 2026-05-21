---
title: "Yaml Paths"
description: "Use as the definitive reference for the dotted-path syntax used by `x-fibe.gg.variables.*.path` and `paths` to write whole YAML nodes during template compilation."
slug: /reference/reference-yaml-paths
sidebar_label: "Yaml Paths"
image: /img/og/reference-reference-yaml-paths.png
keywords: ["Fibe", "Reference", "reference", "yaml", "paths"]
tags: ["reference", "reference"]
format: md
---

The `path` and `paths` fields on a variable declaration are dotted paths into the compiled YAML document. After inline `$$var__` substitution runs, the compiler edits each path to the typed variable value.

Pattern (schema-enforced): `^[A-Za-z0-9_./\[\]-]+$`.

## Segment rules

Path is split on `.` with three special cases:

1. **Escaped dot `\.`** — becomes a literal `.` in the segment. Use this when a key actually contains a dot (e.g. label keys like `fibe.gg/subdomain` — see below).
2. **Bracketed index `[N]`** — normalized to `N`; used as an array index when the parent is an array.
3. **Longest-prefix-key match** — when navigating a Hash, the editor first tries the longest contiguous run of dotted segments that matches an existing key, then falls back to single-segment descent. This is the reason `fibe.gg/subdomain` works as a single segment despite containing dots.

## Practical paths you will write

### Environment scalar

```yaml
paths:
  - services.web.environment.RAILS_ENV
  - services.web.environment.DEBUG
```

### Replica count (deploy block)

```yaml
path: services.web.deploy.replicas
```

### A `fibe.gg/*` label key (the dot in the key is matched automatically)

```yaml
paths:
  - services.web.labels.fibe.gg/expose
  - services.web.labels.fibe.gg/subdomain
  - services.gitea.labels.fibe.gg/subdomain
```

You may also write `services.web.labels.fibe\.gg/expose` for clarity; both work.

### A namespace-level field

```yaml
path: x-fibe.gg.metadata.description
```

### An array element

```yaml
paths:
  - services.web.environment[0]
  - services.web.command[2]
```

Bracketed `[N]` is array-only — it errors if the parent is a Hash.

### A nested `configs` block

```yaml
path: configs.app_config.content
```

## Typing

The value being written is detected from its string form:

| Input | Type written |
|---|---|
| `^[0-9]+$` | integer |
| `^(?i)(true|false)$` | boolean |
| anything else | string |

So `default: 3` paths into `deploy.replicas` lands as YAML integer `3`. `default: "true"` paths into a boolean key lands as boolean `true`. If you need a literal string `"3"`, you must accept the typing — the runtime does not currently support an explicit "string" hint.

## Multiple paths

```yaml
DB_PASSWORD:
  name: "Database password"
  required: true
  random: true
  paths:
    - services.postgres.environment.POSTGRES_PASSWORD
    - services.pgbouncer.environment.DB_PASSWORD
    - services.setup.environment.FIBE_DB_PASS
    - services.web.environment.FIBE_DB_PASS
    - services.jobs.environment.FIBE_DB_PASS
```

Use this pattern when one generated value must be shared across all services that need it.

## Single string vs array

The `paths:` value accepts either a single template path OR an array of paths. The single-string form is identical to declaring `path:` alone, just under the `paths:` key — use the form that reads best:

```yaml
paths: services.web.environment.APP_NAME   # single
paths:                                      # array
  - services.web.environment.APP_NAME
  - services.worker.environment.APP_NAME
```

## When the path does not exist

By default, `create_missing: true` is used — intermediate hashes are created if missing. The path is still expected to make sense (cannot index a scalar). For a path that touches a non-existent service, the compile fails silently for that path; runtime validation surfaces this only via missing-reference checks.

To be safe, ensure every path's parent already exists in the static portion of your template (declare the env block as an empty object if you need: `environment: {}`).

### Edge behavior you should expect

- Path writes happen **after** inline substitution.
- The compiler ignores write failures per-path (it does not fail the compile when one path cannot be written); this is most visible when the destination parent is a scalar, an out-of-range array index is targeted, or YAML shape has drifted.
- `path` and `paths` are independent from inline `$$var__`; if both appear for a variable, the path write is the final value at that destination.
- `paths` accepts either a single string or an array; prefer the explicit array form when the same variable touches multiple destination nodes.

```yaml
x-fibe.gg:
  variables:
    GOOD_PREFIX_PATH:
      paths: services.web.labels.fibe.gg/path_rule   # explicit scalar-label destination
    BAD_INDEX:
      path: services.web.environment[0]              # ❌ no-op: `environment` is a map, not an array
```

```yaml
x-fibe.gg:
  variables:
    REPLIES:
      paths:
        services.web.environment.PATH_PREFIX
        services.web.labels.fibe.gg/path_rule
```

## Mixing inline + path on the same variable

If the same variable name appears as both `$$var__NAME` inline AND has a `path:`, both happen — inline substitution first, then whole-node write. Be careful: the path will overwrite anything at that node, including the result of inline substitution. Pick one mechanism per variable usage:

- Inline when the variable is a fragment of a larger string (URL components, port numbers in colon-separated values, image tags).
- Path when the whole value at that node is the variable (env scalars, label values, replica counts).

## Related skills

[reference-template-variables](reference-template-variables.md), [recipe-whole-node-paths](recipe-whole-node-paths.md), [recipe-inline-variables](recipe-inline-variables.md), [recipe-extract-env-variables](recipe-extract-env-variables.md).
