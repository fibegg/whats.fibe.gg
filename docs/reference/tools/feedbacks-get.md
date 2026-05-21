---
title: "Feedbacks Get"
description: "Use when you need to fetch one feedback entry by id, including the full Player comment, source reference, and context."
slug: /reference/tools/feedbacks-get
sidebar_label: "Feedbacks Get"
image: /img/og/reference-tools-feedbacks-get.png
keywords: ["Fibe", "Tool", "fibe", "tool", "feedbacks", "get"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Read-only, idempotent. Tier: brownfield.

Returns the full Feedback record for one ID on the current Agent through `GET /api/agents/:agent_id/feedbacks/:id`.

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
