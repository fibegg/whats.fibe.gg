---
title: "Monitor List"
description: "Use when you need to list Agent-produced events (messages, activities, mutters, artefacts) with standard pagination. Snapshot mode — for one-shot reads."
slug: /reference/tools/monitor-list
sidebar_label: "Monitor List"
image: /img/og/reference-tools-monitor-list.png
keywords: ["Fibe", "Tool", "fibe", "tool", "monitor", "list"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Read-only, idempotent. Tier: overseer.

Returns a paginated event feed across one or more Agents through `GET /api/monitor`. Requires API key scope `monitor:read`.

## When to use
- Compiling an Agent's recent activity into a report.
- Periodic polling without keeping a long-poll open.
- Filtered cross-Agent event search by full-text.

## When NOT to use
- Need real-time push — use `fibe_monitor_follow`.
- Just one Agent's mutter stream — use `fibe_mutters_get`.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `agent` | string | empty (= all accessible) | Comma-separated Agent IDs/names |
| `type` | string | empty (= all) | Comma-separated: `message`, `activity`, `mutter`, `artefact` |
| `since` | ISO 8601 string | — | Lower bound for `created_at` |
| `q` | string | — | Full-text search across event content |
| `page` | int | 1 | 1-based |
| `per_page` | int | 25 | Max 100 |
| `content_limit` | int | 32768 | Truncate each event payload to N bytes (max 131072) |

## Output
```json
{
  "data": [
    {
      "type": "mutter" | "message" | "activity" | "artefact",
      "agent_id": 42,
      "item_id": "...",
      "created_at": "...",
      "payload": { ... }   // shape varies per type
    }
  ],
  "meta": { "page": 1, "per_page": 25, "total": <N> }
}
```

## Filter resolution
- `agent` accepts numeric IDs and slug names; unknown identifiers are silently dropped.
- `type` is a denylist-resilient enum match; unknown types are dropped.
- `since` accepts any Time-parseable string; ambiguous strings use UTC.

## Gotchas
- Requires `monitor:read` API key scope. Without it: 403 `FORBIDDEN`.
- Events from Agents you can't `read` are filtered out before pagination.
- `content_limit` truncates; long messages won't be returned in full. Use `fibe_resource_get(resource:"artefact_attachment")` for full file content.
- The `total` meta counts visible events post-filter, not the global count.

## Related
- `fibe_monitor_follow` — long-poll variant.
- `fibe_mutters_get` — single-Agent mutter stream.
- `fibe_resource_list(resource:"artefact")` — when you only want artefacts.
