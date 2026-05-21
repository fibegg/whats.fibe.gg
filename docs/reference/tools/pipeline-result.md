---
title: "Pipeline Result"
description: "Use when you need to re-fetch a cached fibe_pipeline result by id, optionally projecting a specific JSONPath, within 5 minutes of the original run."
slug: /reference/tools/pipeline-result
sidebar_label: "Pipeline Result"
image: /img/og/reference-tools-pipeline-result.png
keywords: ["Fibe", "Tool", "fibe", "tool", "pipeline", "result"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Looks up the cached output of a prior `fibe_pipeline` invocation. Cache is per-session, TTL 5 minutes. Both successful and partial-failure results are cached.

## When to use
- Pipeline returned a large `bindings` map and you want a single field without re-running.
- Pipeline failed mid-run; need to inspect specific step outputs to plan cleanup.
- Resuming work after switching task and losing the original tool result from your context.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `pipeline_id` | string | yes | From the prior pipeline's `pipeline_id` |
| `path` | string | no | JSONPath; rooted at step bindings, falls back to full response |

## Path resolution
- `"$.step_id.field"` — looks up inside `bindings` (the `steps` map).
- `"$.status"`, `"$.error"`, `"$.completed_step_ids"` — fall back to the full cached envelope.
- Empty `path` returns the entire cached response.

## Output
On hit: the projected JSON or full cached object.

On expiry/miss:
```json
{ "expired": true, "pipeline_id": "<id>" }
```

## Gotchas
- Cache is keyed by **session ID**, not pipeline ID alone — another session cannot read your cache.
- TTL is 5 minutes hardcoded; long-running flows that wait then look up should re-run if past that window.
- `path` is JSONPath (PaesslerAG/jsonpath v1) — slice indexing, recursive descent, and filter expressions all work.

## Recipe
After a `fibe_pipeline` returns `pipeline_id="abc"`:
- Get the failed step's API code: `{pipeline_id:"abc", path:"$.error.code"}`.
- Get just one created ID: `{pipeline_id:"abc", path:"$.create_pg.id"}`.

## Related
- `fibe_pipeline` — the producer.
