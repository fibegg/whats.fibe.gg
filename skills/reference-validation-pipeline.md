---
name: reference-validation-pipeline
description: Use to understand which public validation stage catches which class of Fibe template error and how to drive validation from MCP/CLI without relying on source code internals.
---

# Reference: Fibe template validation pipeline

Validation runs in **layers**. Each layer is authoritative for its scope. Higher layers may pass while later layers fail — never assume schema success means runtime success.

## The layers, in order

```
[1] YAML syntax         ← parse the document
[2] Compose shape       ← root must be a mapping with `services:`
[3] Template schema     ← public Fibe Compose schema
[4] Label semantics     ← cross-label rules
[5] Template variables  ← declared-vs-referenced, regex, name
[6] Template compiler   ← required-but-missing, validation patterns
[7] Runtime API         ← resource existence, repo URL provider, trigger permissions
```

Validation returns all errors it can find for the early layers. Preview or launch can still fail later when values, ownership, or external resources are involved.

## [1] YAML syntax

Catches: bad indentation, unclosed quotes, tab-vs-space mistakes.

Drive from MCP: any tool that takes `compose_yaml` will surface this first.

## [2] Compose shape

Catches:

- Root is not a mapping.
- Missing `services:` key.
- A service's value is not a mapping.

Errors look like: `Template body must be a YAML mapping` or `Service '<name>' must be an object`.

## [3] Template schema

The public Fibe Compose schema catches:

- Unknown `fibe.gg/*` label name (whitelist enforced).
- Label values that don't match per-label regex:
  - `expose`: empty or `(internal|external):?[0-9]+`
  - `subdomain`: empty, `@`, or `[a-z0-9]([a-z0-9-]*[a-z0-9])?`
  - `path_rule`: contains `Path|PathPrefix|PathRegexp(`, does not contain `Host|HostRegexp|HostSNI|HostSNIRegexp|Headers|HeadersRegexp|Method|Query|ClientIP(`
  - `dockerfile|env_file|source_mount`: `^[A-Za-z0-9_./-]+$`
  - durations: `^[0-9]+(ms|s|m)$`
  - boolean labels: `true` / `false`
  - positive int label: `[1-9][0-9]*`
- `x-fibe.gg.variables.<KEY>` key not matching `^[A-Za-z0-9_]+$`.
- `path` not matching `^[A-Za-z0-9_./\[\]-]+$`.
- `validation` not wrapped in `/.../` or empty.
- `trigger_config.event_type` not in `["push","pull_request"]`.
- `schedule_config.marquee_id` / `trigger_config.prop_id|marquee_id` not a positive integer (or string form).

Does NOT catch: declared-vs-used variables, repo URL provider validity, resource existence, runtime cross-label rules.

Drive from MCP: `fibe_schema(resource: "compose", operation: "validate", payload: { "compose_yaml": "..." })`.

## [4] Label semantics

Catches cross-label rules the shape schema cannot express:

- Compose `build:` without `fibe.gg/repo_url` → `Service '<n>' has a build directive but lacks a fibe.gg/repo_url label`.
- `fibe.gg/source_mount` without `fibe.gg/repo_url` → `Service '<n>' has source_mount but no repo_url`.
- `fibe.gg/zerodowntime: "true"` without `fibe.gg/expose` → `Service '<n>': zerodowntime services must have 'fibe.gg/expose' set`.
- `fibe.gg/zerodowntime: "true"` with Compose `ports:` → `Service '<n>': zerodowntime services cannot have 'ports'`.
- `fibe.gg/zerodowntime: "true"` with `container_name:` → `Service '<n>': zerodowntime services cannot have 'container_name'`.
- Invalid `repo_url` URL (not GitHub/Gitea, not HTTPS).
- Static service with no `image:` → warning, not error.

Also produces a warning when a static service has no image and no build.

## [5] Template variables

Catches:

- `undeclared_var` — `$$var__X` referenced but `X` not declared.
- `unused_var` — variable declared but never referenced AND no `path`/`paths`.
- `missing_name` — variable has no/empty `name`.
- `invalid_regex_format` — `validation` not wrapped in `/.../`.
- `invalid_regex` — body inside `/.../` is not a valid validation pattern.

## [6] Template compiler

Catches at compile time:

- `Variable '<key>' is required` — required, no value, no default, not random.
- `Variable '<key>' fails validation pattern <pattern>` — supplied value doesn't match the variable's regex.

The compiler also performs the substitution work — it is the layer that actually produces the final compose YAML.

## [7] Runtime API

Drive through MCP, CLI, API, or UI launch/preview. Catches:

- `trigger_config.prop_id` / `marquee_id` / `schedule_config.marquee_id` not found or not owned by Player.
- `trigger_config.repo_url` not authorized (no installed GitHub app, no Gitea token).
- Source defaults can't be applied (template imported from non-existent Prop).
- Conflicts during launch (e.g. subdomain already taken at the chosen Marquee — only surfaces at launch).

## Driving each layer

| Layer | MCP / Tool |
|---|---|
| 1-5 (everything but compile + runtime) | `fibe_schema(resource: "compose", operation: "validate", payload: { "compose_yaml": "..." })` |
| 6 (compile / preview) | `fibe_templates_change(operation: "preview", ...)` or `fibe_templates_launch(dry_run: true, ...)` |
| 7 (runtime) | `fibe_templates_launch` for real, or `fibe_resource_mutate(resource: "playspec", operation: "create", ...)` for import |

## Common confusion

- A schema-valid template can still fail compile. Example: declared `required: true`, no default, no random — only the compiler catches this.
- The schema **does not** prove the template compiles to runnable Compose. Always run a preview/launch.
- Quoting matters: YAML 1.1 treats `yes`/`no`/`on`/`off` as booleans. Boolean Fibe labels accept only `true`/`false`. Quote your boolean strings.

## Related skills

[reference-fibe-labels](reference-fibe-labels.md), [reference-x-fibe-gg-namespace](reference-x-fibe-gg-namespace.md), [reference-template-variables](reference-template-variables.md), [common-errors-and-fixes](common-errors-and-fixes.md), [templates-publish-checklist](templates-publish-checklist.md).
