---
title: "Schema"
description: "Use before calling Fibe mutation/list tools that need schemas. Authoritative source for resource/operation JSON schemas. Required reading before calling fibe_resource_mutate, fibe_resource_list, or any tool with a payload field."
slug: /reference/tools/schema
sidebar_label: "Schema"
image: /img/og/reference-tools-schema.png
keywords: ["Fibe", "Tool", "fibe", "tool", "schema"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Returns the shared `resourceschema` registry used to validate every `fibe_resource_*` call. Two roles:
1. **Discovery** — `resource:"list"` enumerates resources, aliases, and supported operations.
2. **Validation source** — pre-call schema fetch so payloads pass server-side validation.

Also runs side-effect-free Compose YAML validation when called with `resource:"compose", operation:"validate"`.

## When to use
- Before any `fibe_resource_mutate` — never guess payload shape.
- Before `fibe_resource_list` with non-trivial filters.
- Discovering valid resource names (singular snake_case canonical, plus aliases).
- Validating a Compose YAML before creating a Playspec/Trick.

## Inputs
| Field | Type | Notes |
|---|---|---|
| `resource` | string | Canonical name or alias; pass `"list"` for the full catalog |
| `operation` | string | One of `create`, `update`, `delete`, `get`, `list`, plus per-resource extras (`attach`, `mirror`, `sync`, `fork`, `trigger`, `rerun`, `action`, `validate`, `develop`, `event_types`, ...) |
| `payload` | object | Only for `compose.validate` (see below) |

## Output shapes

**`resource:"list"`**
```json
{
  "resources": [
    { "canonical": "playground", "aliases": ["playgrounds"], "operations": ["list","get","create","update","delete","action"] },
    ...
  ]
}
```

**`resource:"<name>"` (no operation)** — all operation schemas keyed by op name.

**`resource:"<name>", operation:"<op>"`** — single JSON Schema for that op's payload.

**`resource:"compose", operation:"validate"`** — calls `POST /api/playspecs/validate_compose`; returns Compose validation result + errors.

## Compose validate payload
```json
{
  "resource": "compose",
  "operation": "validate",
  "payload": {
    "compose_yaml": "...",
    "target_type": "trick" | "playground",
    "job_mode": true | false   // optional
  }
}
```
Inline `compose_yaml` OR `compose_path` (local filesystem only).

## Gotchas
- Canonical names are singular, snake_case: `playground`, not `Playgrounds`. Aliases (`playgrounds`, `playground-id`) are accepted but the registry normalizes internally.
- `fibe_resource_mutate` validates against this same schema **locally** before any HTTP call — failures are reported with the same field names.
- The schema is the source of truth even when other docs disagree. SDK schema is authoritative because the SDK validates with it.

## Related
- `fibe_resource_list` / `fibe_resource_get` / `fibe_resource_delete` — schema-validated.
- `fibe_resource_mutate` — every payload validated against `(resource, operation)` here.
- `fibe_tools_catalog` with `include_schema:true` — for non-resource tools.
