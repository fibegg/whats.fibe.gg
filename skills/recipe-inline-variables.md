---
name: recipe-inline-variables
description: Use to embed `$$var__NAME` (and `$$random__NAME`) inside Compose string values, label values, image tags, URLs, and partial strings - and to understand when the inline form is required vs optional.
---

# Recipe: inline `$$var__NAME` interpolation

`$$var__NAME` is **string-level** variable substitution that runs **before** the Compose YAML is reparsed by the runtime. Use it when:

- The value is a **fragment** of a larger string (URL, label value with prefix/suffix, image tag).
- The whole node form (`path:`) would be ugly because the surrounding context is part of the contract.

## Pattern

```
$$var__NAME
```

Where `NAME` matches `[A-Za-z0-9_]+` and is declared in `x-fibe.gg.variables`. Prefer `$$var__NAME`. `$$random__NAME` is legacy alias language in older templates and should be migrated to `$$var__`.

## Where you can put it

- **Compose string values:** image tags, environment values, command strings, volume mount paths, healthcheck commands.
- **Known `fibe.gg/*` label values:** the schema's `templatedFibeLabelString` permits `$$var__NAME` inline.
- **`x-fibe.gg.variables.*.default`**: technically a string, but referencing other variables here is not supported by the compiler.
- **Variable path targets** (`path:`/`paths:`): NO — paths are dotted identifiers, not template strings.

## Examples

### Image tag

```yaml
services:
  web:
    image: ghcr.io/owner/app:$$var__TAG

x-fibe.gg:
  variables:
    TAG:
      name: "Image tag"
      default: "latest"
      validation: "/^[A-Za-z0-9_.-]+$/"
```

### Composite URL in env

```yaml
services:
  app:
    environment:
      DATABASE_URL: "postgres://user:$$var__DB_PASSWORD@db:5432/$$var__DB_NAME"
      PUBLIC_URL: "https://$$var__SUBDOMAIN.$$root_domain"
```

`$$root_domain` is special — always replaced with the Marquee root domain.

### Label fragment

```yaml
services:
  web:
    labels:
      fibe.gg/port: $$var__PORT
      fibe.gg/visibility: external
      fibe.gg/subdomain: $$var__SUBDOMAIN
      fibe.gg/path_rule: PathPrefix(`/$$var__PATH_PREFIX`)
```

### Build args

```yaml
services:
  web:
    labels:
      fibe.gg/build_args: "RUBY_VERSION=$$var__RUBY_VERSION,NODE_VERSION=$$var__NODE_VERSION"
```

### Command line

```yaml
services:
  app:
    command:
      - /bin/sh
      - -c
      - "echo Starting $$var__APP_NAME && exec ./serve --port $$var__PORT"
```

## What runtime does

1. Reads the raw template body as a string.
2. For every `$$var__([A-Za-z0-9_]+)` match, looks up the declared variable.
3. Substitutes with: user-supplied value → default → random (if `random: true`) → literal string `placeholder` (only when no required validation fires).
4. Re-parses the resulting YAML, then applies `path:` / `paths:` writes on top.
5. `$$root_domain` is replaced separately with the Marquee root domain.

Inline substitution happens before YAML structure is finalized. So `$$var__NAME` works anywhere in the body, including inside YAML anchors.

### Inline/path behavior matrix

| Declaration | Binding style | Output behavior |
|---|---|---|
| `default` provided | inline only | `$$var__NAME` becomes the default when launcher omits the value |
| `required: true`, no `default`, no launcher input | inline only | Compile error (`Variable '<name>' is required`) |
| `random: true`, launcher omits value | inline only | Compiles with a 32-char hex secret (same value reused for every inline occurrence) |
| No `default`, no `random`, no launcher input | inline only | Replaced with literal `placeholder` |
| Same declaration, no source value, `path:`/`paths:` present | path only | Final YAML node is empty string (`""`) |

### Concrete edge-case examples

#### Numeric-looking `default` preserves string in inline

```yaml
services:
  web:
    environment:
      EXTERNAL_PORT: "$$var__EXT_PORT"

x-fibe.gg:
  variables:
    EXT_PORT:
      name: "External port"
      default: "08080"
```

`EXT_PORT` is stringy in inline usage, so `08080` stays as text.

#### Mixed inline + path (path wins)

```yaml
services:
  web:
    environment:
      API_URL: "https://api.example.$$var__DOMAIN/api"
    labels:
      fibe.gg/subdomain: example

x-fibe.gg:
  variables:
    DOMAIN:
      name: "Subdomain domain"
      default: "dev"
      path: services.web.labels.fibe.gg/subdomain
```

The inline render in `API_URL` becomes `https://api.example.dev/api`, but
`services.web.labels.fibe.gg/subdomain` is later forced to `dev` by the path binding.

#### Optional path-bound empty string

```yaml
x-fibe.gg:
  variables:
    BASE_PATH:
      name: "Optional base path"
      path: services.web.labels.fibe.gg/path_rule

services:
  web:
    labels:
      fibe.gg/path_rule: ""
```

With no default/user value, `fibe.gg/path_rule` becomes empty string.

## When to choose inline vs `path:`

| Scenario | Choose |
|---|---|
| `services.web.environment.RAILS_ENV` should be the variable | `path:` (whole node, cleaner) |
| `services.web.image: gcr.io/x/y:$$var__TAG` | inline (fragment) |
| `services.web.labels.fibe.gg/port: $$var__PORT` | either; `path:` cleaner for a whole port value |
| `services.web.labels.fibe.gg/subdomain` is exactly the variable | either; `path:` cleaner |
| `services.web.deploy.replicas` should be a typed integer | `path:` (the binding writes integer, not string) |

Use `path:` for whole-node bindings such as replica counts, passwords, port labels, and environment names. Use inline variables for fragments such as image tags.

## Why inline over `${VAR:-default}` Compose substitution

`${VAR:-default}` is interpreted by the Docker Compose engine at container start. `$$var__NAME` is interpreted by Fibe at template compile (before Docker sees the YAML).

Practical differences:

- `$$var__` integrates with `x-fibe.gg.variables` validation, `random`, `required` semantics.
- `$$var__` is bypassed by Docker's `${...}` engine — it doesn't accidentally try to expand from the Marquee host's environment.
- The double-dollar `$$` in `$$var__` is also how you escape a single `$` in Compose to prevent its substitution — convenient by design.

## Escaping `$` in Compose values

Outside of Fibe templating: a literal `$` in a Compose value must be written `$$`. So `$$VAR` in a regular Compose file becomes `$VAR` at runtime. In Fibe templates, `$$var__NAME` is the Fibe marker, not Compose-escaped `$$`. Fibe handles the whole `$$var__NAME` token before Compose sees it.

If you need an actual `$$` in a final Compose value (e.g. in a shell command), write `$$$$` — Fibe doesn't touch it (no `var__` follows) and Compose un-escapes one level to `$$`.

## Pitfalls

- **Lowercase / mixed-case variable names** — allowed by regex (`[A-Za-z0-9_]+`) but inconsistent with most templates' uppercase convention.
- **`$$var__` without declaration** — `undeclared_var` runtime error.
- **Splitting `$$var__NAME` across YAML lines via line-continuation** — the literal text must appear unbroken; YAML folded scalars (`>`) might collapse the marker — quote the value.
- **Using `$VAR` instead of `$$var__VAR`** — `$VAR` is Compose substitution from the host env; Fibe ignores it.
- **Variable used inline only AND template imported across Marquees with different defaults** — be deliberate about defaults; they live in the template, not the launcher.

## Related skills

[recipe-whole-node-paths](recipe-whole-node-paths.md), [recipe-extract-env-variables](recipe-extract-env-variables.md), [recipe-random-and-secrets](recipe-random-and-secrets.md), [reference-template-variables](reference-template-variables.md), [reference-yaml-paths](reference-yaml-paths.md).
