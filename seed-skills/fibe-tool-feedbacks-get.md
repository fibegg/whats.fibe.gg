---
name: fibe-tool-feedbacks-get
description: Use when you need to fetch one feedback entry by id, including the full Player comment, source reference, and context.
---

# fibe_feedbacks_get

[MODE:OVERSEER] Read-only, idempotent. Tier: brownfield.

Returns the full Feedback row for one ID (current Agent). Maps to Rails `GET /api/agents/:agent_id/feedbacks/:id` (`Api::FeedbacksController#show`).

## When to use
- After `fibe_feedbacks_list` returns rows truncated by serialization — pull the full entry.
- Need the full `selected_text` / `context` to understand what the Player highlighted.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `feedback_id` | int | yes | Feedback record ID |

Like `fibe_feedbacks_list`, requires `FIBE_AGENT_ID` env.

## Output
The same row shape as `fibe_feedbacks_list`'s `data[i]` but always full content (no truncation).

## Gotchas
- 404 on cross-agent IDs — feedback is scoped to the current Agent.
- `source_type` + `source_id` together identify the commented resource; load that resource separately if you need the original.
- `playground_id` may be null for feedback unattached to a specific Playground.

## Related
- `fibe_feedbacks_list` — discover IDs.
- `fibe_resource_get(resource:"artefact")` — load the source.
