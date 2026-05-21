---
title: "Pipeline"
description: "Chain multiple Fibe tool calls into one round-trip with JSONPath bindings. Use when latency matters or multi-step jobs (create→wait→link) need atomicity."
slug: /reference/tools/pipeline
sidebar_label: "Pipeline"
image: /img/og/reference-tools-pipeline.png
keywords: ["Fibe", "Tool", "fibe", "tool", "pipeline"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: meta. The most powerful Fibe tool.

Executes an ordered list of tool steps in one MCP request. Each step's output is normalized to plain JSON and stored in `bindings` keyed by `step.id`; later steps reference prior outputs with JSONPath strings (`"$.create_pg.id"`).

## When to use
- Create+wait+link greenfield flow.
- Roll out a template change and immediately wait for `running`.
- Bulk operations (`for_each` across a list returned by a prior step).
- Eliminating round-trip latency — saves 100s of ms per chained step.
- Atomic-ish flows where mid-failure must surface partial results for cleanup.

## Step shapes

**Single tool call:**
```json
{ "id": "pg", "tool": "fibe_resource_get", "args": { "resource": "playground", "id": 123 } }
```

**Parallel block** — independent steps run concurrently:
```json
{ "parallel": [
  { "id": "a", "tool": "fibe_resource_list", "args": {"resource":"prop"} },
  { "id": "b", "tool": "fibe_resource_list", "args": {"resource":"marquee"} }
]}
```

**Fanout (`for_each`)** — iterate a list with `as` alias:
```json
{
  "id": "rolls",
  "for_each": "$.list.data",
  "as": "pg",
  "steps": [
    { "id": "rollout", "tool": "fibe_playgrounds_action",
      "args": { "playground_id": "$.pg.id", "action_type": "rollout", "confirm": true } }
  ],
  "collect": "$.rollout"
}
```

## JSONPath bindings
- `"$.step_id"` — entire step output.
- `"$.step_id.field"` — specific field.
- `"$$."` — escapes to literal `"$."`.
- Bindings live in a shared map; nested objects/arrays are walked recursively.

## Top-level inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `steps` | array | required | At least 1; max 25 by default (`FIBE_MCP_PIPELINE_MAX_STEPS`) |
| `return` | string \| object | bindings map | JSONPath or object literal projecting the final return |
| `dry_run` | bool | `false` | Validates refs+schemas without running |
| `cache` | bool | `true` | Whether to cache for `fibe_pipeline_result` |
| `idempotency_key` | string | — | Threaded as a per-step idempotency-key (sha256 of `key:step_id`); Fibe caches responses 24h |

## Output
```json
{
  "steps": { "create": {...}, "wait": {...} },
  "result": <projected via "return">,
  "status": "completed",
  "pipeline_id": "<id>",        // present unless cache=false
  "truncated": false             // when cached payload exceeded buffer
}
```

**On failure mid-run:**
```json
{
  "steps": { "create": {...} },                // partial bindings
  "result": null,
  "status": "partial",
  "error": { "step_index": 1, "step_id": "wait", "tool": "...", "message": "...", "code": "...", "status": 422 },
  "completed_step_ids": ["create"],
  "pipeline_id": "..."
}
```

`completed_step_ids` is your cleanup hint — those resources exist; the failed step never started its mutation.

## Step-level options
| Field | Notes |
|---|---|
| `on_error` | `"abort"` (default) or `"continue"` (record `{error:...}` in bindings, keep going) |
| `input_path` | JSONPath that filters resolved args before calling |
| `output_path` | JSONPath that projects the result before storing in bindings |

## Per-step idempotency
With pipeline-level `idempotency_key`, every step ID gets `sha256("<key>:<step_id>")` as its `Idempotency-Key` header. Retrying the whole pipeline does NOT recreate completed resources — Fibe returns the cached prior response.

## Gotchas
- **No nested pipelines.** A step calling `fibe_pipeline` rejects with `"nested fibe_pipeline is not allowed"`.
- `for_each` requires both `as` and `steps`; the value must resolve to a JSON array (not an object).
- Maximum total `for_each` iterations across a pipeline: `FIBE_MCP_PIPELINE_MAX_ITERATIONS` (default 50).
- Destructive tools still need `confirm:true` even inside a pipeline (unless server is `--yolo`).
- Step output is JSON-marshaled before bindings — typed Go structs become plain maps. Field names follow JSON tags, not Go field names.
- Steps without an `id` produce no binding (useful for fire-and-forget side effects within a parallel block).

## Recipes

**Create greenfield, wait, get URL:**
```json
{
  "steps": [
    { "id": "gf",   "tool": "fibe_greenfield_create",
      "args": { "name": "demo", "wait_timeout": "10m" } },
    { "id": "urls", "tool": "fibe_local_playgrounds_info",
      "args": { "view": "urls", "playground_id": "$.gf.playground.id" } }
  ],
  "return": "$.urls"
}
```

**Roll out every running playground in a marquee:**
```json
{
  "steps": [
    { "id": "list", "tool": "fibe_resource_list",
      "args": { "resource":"playground", "params":{"marquee_id":42,"status":"running"} } },
    { "id": "rolls", "for_each":"$.list.data", "as":"pg",
      "steps":[{"id":"r","tool":"fibe_playgrounds_action",
                 "args":{"playground_id":"$.pg.id","action_type":"rollout","confirm":true}}],
      "collect": "$.r"
    }
  ]
}
```

## Related
- `fibe_pipeline_result` — re-query cached results within 5 min.
- `fibe_call` — single hidden-tool invocation; pipelines wrap many.
