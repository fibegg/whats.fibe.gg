---
name: recipe-whole-node-paths
description: Use to bind a variable to a whole YAML node (env scalar, label value, replica count, image, command element) via `path:` or `paths:`. Includes typing, multiple paths, and label-key path patterns.
---

# Recipe: `path:` / `paths:` whole-node bindings

Use a `path:` (or `paths:`) binding when the **entire value** at a YAML node should be a variable. The compiler writes the typed value after inline substitution has run, replacing whatever was there.

## Single path

```yaml
x-fibe.gg:
  variables:
    APP_NAME:
      name: "App name"
      required: true
      default: "demo"
      path: services.web.environment.APP_NAME

services:
  web:
    environment:
      APP_NAME: placeholder        # overwritten by the path write
```

The placeholder string can be anything — it just makes the YAML parseable as Compose for non-Fibe tooling. After compile, the node holds the variable value.

## Multiple paths

```yaml
x-fibe.gg:
  variables:
    RAILS_ENV:
      name: "Rails environment"
      required: true
      default: "beta"
      paths:
        - services.setup.environment.RAILS_ENV
        - services.web.environment.RAILS_ENV
        - services.web-for-anycable.environment.RAILS_ENV
        - services.jobs.environment.RAILS_ENV
```

One launch input → four locations updated.

## Typing

Values are auto-typed when written:

| String matches | Written as |
|---|---|
| `^[0-9]+$` | YAML integer |
| `^(?i)(true|false)$` | YAML boolean |
| anything else | YAML string |

Examples:

```yaml
WEB_REPLICAS:
  default: "4"
  path: services.web.deploy.replicas     # written as integer 4

PRODUCTION:
  default: "true"
  path: services.web.labels.fibe.gg/production   # written as boolean true

APP_NAME:
  default: "my-app"
  path: services.web.environment.APP_NAME   # written as string "my-app"
```

If you need a literal string `"3"` and not integer `3`, you currently cannot force it via `path:`. Use inline `$$var__` instead (string substitution preserves quote-friendliness).

## Path syntax

Dotted segments. Special cases:

- `[N]` — array index when the parent is an array.
- `\.` — literal `.` in a key (rarely needed).
- The editor matches the **longest contiguous run** of dotted segments against existing keys before descending. This lets you target `fibe.gg/expose` as a single key with a dot in it.

Allowed regex: `^[A-Za-z0-9_./\[\]-]+$`.

See [reference-yaml-paths](reference-yaml-paths.md) for full grammar.

## Common path patterns

### Env scalar

```yaml
paths:
  - services.web.environment.RAILS_ENV
  - services.worker.environment.RAILS_ENV
```

### `fibe.gg/*` label value

```yaml
paths:
  - services.web.labels.fibe.gg/expose
  - services.web.labels.fibe.gg/subdomain
  - services.web.labels.fibe.gg/production
  - services.web.labels.fibe.gg/branch
```

The dot in `fibe.gg/expose` is matched as a key, not a path separator.

### Replica count

```yaml
WEB_REPLICAS:
  name: "Web replicas"
  required: true
  default: "4"
  path: services.web.deploy.replicas
```

### Image tag (whole value)

```yaml
WEB_IMAGE:
  name: "Web image"
  default: "nginx:alpine"
  path: services.web.image
```

For partial image with parameterized tag, use inline `$$var__TAG` instead.

### Metadata field

```yaml
DESCRIPTION:
  name: "Description"
  path: x-fibe.gg.metadata.description
```

### Array element

```yaml
COMMAND_ARG:
  name: "Command arg"
  default: "--verbose"
  path: services.web.command[1]
```

Use sparingly — fragile if command structure changes.

## Edge cases to document in conversion notes

### Optional variable with no value source

If a variable is path-bound and has no value/default/random, it writes an empty string:

```yaml
x-fibe.gg:
  variables:
    POST_URL:
      name: Post endpoint path
      required: false
      path: services.web.labels.fibe.gg/path_rule
```

This is valid, but you should usually either:
- supply `default`, or
- keep it inline where `placeholder` is easier to spot.

### Mixed inline + path on same variable

```yaml
x-fibe.gg:
  variables:
    PORT:
      name: Port
      default: "3000"
      path: services.web.labels.fibe.gg/expose
```

```yaml
services:
  web:
    labels:
      fibe.gg/expose: external:$$var__PORT
      fibe.gg/subdomain: web
```

In this pattern, `services.web.labels.fibe.gg/expose` is finally set to `PORT` from the path step, so inline is effectively ignored at that node.

### When to avoid path-binding

- Numeric-looking values in path bindings are always parsed (`"4"` becomes integer `4`).
- You can’t use `path:` to inject nested structures (arrays/maps); use inline string templates for those.
## When the destination exists

The default behavior is `create_missing: true` — intermediate hashes are created. So even if `services.web.environment` doesn't exist statically, the path write creates it.

For arrays, the array must already exist; `path` does not create new array slots.

To be safe, declare empty placeholders in the static YAML:

```yaml
services:
  web:
    environment: {}
    deploy:
      replicas: 1
    labels:
      fibe.gg/expose: ""
```

## `path:` vs `paths:`

Both fields accept either a single path string or an array. Use whichever reads better:

```yaml
# Single path — both work
APP_NAME:
  path: services.web.environment.APP_NAME

APP_NAME:
  paths: services.web.environment.APP_NAME

# Multiple paths — must use `paths:`
APP_NAME:
  paths:
    - services.web.environment.APP_NAME
    - services.worker.environment.APP_NAME
```

## Combining with inline `$$var__`

Both run on the same variable name, but you usually want one or the other:

- `$$var__NAME` is **string substitution**, runs first.
- `path:` is **node write**, runs second — and overwrites whatever string substitution produced.

So `path:` always wins on the destination node. Use inline ONLY when the destination is part of a bigger string. Use `path:` for everything else.

See [recipe-inline-variables](recipe-inline-variables.md) for inline-only patterns.

## Pitfalls

- **Wrong typing** — `default: "0"` lands as integer 0, not string "0". If you need string, use inline.
- **Path doesn't exist and parent is a scalar/array** — silent failure for that path; other paths still process.
- **Path includes invalid characters** — regex `^[A-Za-z0-9_./\[\]-]+$` only. No spaces, no `=`, no `:`.
- **Trying to inject YAML structure** — `path:` writes one scalar/bool/int. You cannot inject `[a, b, c]` or `{ k: v }` as a node via `path:`.

## Related skills

[recipe-inline-variables](recipe-inline-variables.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [reference-yaml-paths](reference-yaml-paths.md), [reference-template-variables](reference-template-variables.md).
