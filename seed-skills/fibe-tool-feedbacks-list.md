---
name: fibe-tool-feedbacks-list
description: Use when you need to list all feedback entries (Player comments on Artefacts/Mutters/etc.) for the current Agent. Required reading after major milestones.
---

# fibe_feedbacks_list

[MODE:OVERSEER] Read-only, idempotent. Tier: brownfield.

Lists feedback rows attached to the **current Agent** (read from `FIBE_AGENT_ID` env). Maps to Rails `GET /api/agents/:agent_id/feedbacks` (`Api::FeedbacksController#index`). Filterable by source, playground, and date range.

## When to use
- After completing a meaningful task — check whether the Player commented on outputs.
- At least once per response when running as an Agent (per `system.md`).
- Before deciding whether to retry/rework an Artefact.

## Inputs
The MCP tool exposes `fibe.FeedbackListParams`:
| Field | Type | Notes |
|---|---|---|
| `Query` | string | Substring search across `comment`, `selected_text`, `context` |
| `SourceType` | string | `Artefact`, `Mutter`, etc. (Rails `source_type` column) |
| `SourceID` | string | Restrict to one source's feedback (used with `SourceType`) |
| `PlaygroundID` | string | Resolve to numeric — name accepted |
| `CreatedAfter` / `CreatedBefore` | ISO date | Date range |
| `Sort` | string | `created_at` (desc default) |
| `Page` / `PerPage` | int | Standard pagination |

`agent_id` is **NOT** an input — it's read from `FIBE_AGENT_ID` env. Without that env var, the tool errors fast.

## Output
Standard paginated envelope:
```json
{
  "data": [
    {
      "id": 1,
      "source_type": "Artefact",
      "source_id": 7,
      "selection_start": 0,
      "selection_end": 120,
      "selected_text": "...",
      "comment": "Player comment...",
      "line_text": "...",
      "context": "...",
      "playground_id": 42,
      "player_id": 11,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "meta": { "page":1, "per_page":25, "total":<N> }
}
```

## Gotchas
- Requires `FIBE_AGENT_ID` env to be set (it's set automatically inside Agent containers).
- Cross-Agent search isn't supported here — use `fibe_resource_list(resource:"feedback")` if/when added in your env.
- A feedback's `source_id` doesn't auto-link — pair with `fibe_resource_get(resource:"artefact", id:<source_id>)` to see what the Player commented on.

## Related
- `fibe_feedbacks_get` — full single feedback record.
- `fibe_mutters_get` — when feedback's `source_type:"Mutter"`.
- `fibe_resource_get(resource:"artefact")` — when `source_type:"Artefact"`.
