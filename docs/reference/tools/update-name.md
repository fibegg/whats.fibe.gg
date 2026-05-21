---
title: "Update Name"
description: "Use when you need to update the current Agent's display name. Trigger when the conversation topic changes materially."
slug: /reference/tools/update-name
sidebar_label: "Update Name"
image: /img/og/reference-tools-update-name.png
keywords: ["Fibe", "Tool", "fibe", "tool", "update", "name"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Tier: base. Not idempotent.

Renames the current Agent through `PATCH /api/agents/:id` with `name` and an optional `rename_context` payload identifying the conversation that prompted the change.

## When to use
- First non-trivial Player message — set a meaningful name reflecting current focus.
- Conversation pivots to a new topic that changes scope (per `system.md` `<your_status>`).
- Agent default name is generic ("agent-42") and Player just gave it a topic.

## When NOT to use
- During `[SYSCHECK]` — the system explicitly excludes that.
- Trivial follow-ups within the same topic.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | New display name |

`agent_id` is read from `FIBE_AGENT_ID` env; `CONVERSATION_ID` env, when set, is forwarded as `rename_context.conversation_client_id` so Fibe can record which conversation triggered the rename.

## Output
The updated Agent's full JSON.

## Gotchas
- `FIBE_AGENT_ID` env required; missing → fail-fast.
- Name uniqueness is enforced server-side per Player; collisions return `VALIDATION_FAILED`.
- Slug-safe characters preferred, but any non-empty string is accepted.
- The `rename_context` is informational; it's stored to track who/what renamed the agent. Without `CONVERSATION_ID` env, just the bare rename happens.

## Related
- `fibe_resource_mutate(resource:"agent", operation:"update")` — non-self updates and other field changes.
- `fibe_doctor` — pre-flight check that you have an Agent identity.
