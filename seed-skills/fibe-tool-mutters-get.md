---
name: fibe-tool-mutters-get
description: Use when you need to retrieve one Agent's mutter stream — the "thinking out loud" feed of progress, proof, problem, and blocker notes — with optional query/status/severity/playground filters.
---

# fibe_mutters_get

[MODE:OVERSEER] Read-only, idempotent. Tier: overseer.

Returns the mutter feed for one Agent. Maps to Rails `GET /api/agents/:id/mutter` (`Api::MuttersController#show`). Mutters are stored as a single JSONB record per Agent (with optional Playground filter), each containing an `items` array.

## When to use
- Reviewing an Agent's recent reasoning/progress.
- Filtering mutters by `playground_id` while triaging a specific work item.
- After major milestones — Player feedback often references specific mutters.

## When NOT to use
- Cross-Agent search — use `fibe_monitor_list/follow`.
- You only need the latest event ASAP — `fibe_monitor_follow` with `type:"mutter"`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `playground_id` | int | no | Filter to mutters tagged with this Playground |
| `query` | string | no | Substring match across all string fields in each item |
| `status` | string | no | Filter by item's `status` field |
| `severity` | string | no | Filter by item's `severity` field |
| `page` | int | no | 1-based; default 1 |
| `per_page` | int | no | Default per server config |

## Output
```json
{
  "data": [
    { "type":"proof", "body":"...", "created_at":"...", "status":"...", "severity":"..." },
    ...
  ],
  "meta": { "page": 1, "per_page": 25, "total": 137 },
  "id": <mutter_record_id>,
  "agent_id": 42,
  "playground_id": 7,
  "created_at": "...",
  "updated_at": "..."
}
```

The top-level fields describe the AgentMutter record; `data` is the filtered, paginated `items` array.

## Filter semantics
- `query` lowercase-matches against any string value in each item.
- `status`/`severity` are case-insensitive exact match on the item's field of that name.
- All filters are AND-combined.

## Gotchas
- A 404 means the Agent has no AgentMutter record — they haven't posted any mutter yet.
- `total` is the count after filtering; the underlying record may have far more items.
- Items are typed by their `type` field (`proof`, `problem`, `blocker`, `milestone`, `info`...) — the same field used by `fibe_mutter` when creating.
- Pagination operates on the in-memory filtered array — large mutter histories work but each request loads the entire JSONB.
- `playground_id` resolves names too (e.g., "demo-app") via Rails' resource resolver.

## Related
- `fibe_mutter` — create new mutter items.
- `fibe_monitor_list` / `fibe_monitor_follow` — broader event stream.
- `fibe_feedbacks_list` — Player comments on specific mutters/artefacts.
