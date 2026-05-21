---
title: "Agents Delete Conversation"
description: "Use when you need to delete a specific Agent conversation. Overseer-only."
slug: /reference/tools/agents-delete-conversation
sidebar_label: "Agents Delete Conversation"
image: /img/og/reference-tools-agents-delete-conversation.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "delete", "conversation"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Destructive.

Deletes one conversation for an Agent. Use during project/user cleanup flows after any needed exports or archives have completed.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | yes | Runtime conversation/thread ID |

## Gotchas
- Deletion is scoped to the Agent and conversation id.
- Do not delete conversations as part of normal iteration.
- Archive or export needed project data before cleanup.

## Related
- `fibe_agents_create_conversation` — create/upsert.
- `fibe_agents_messages` / `fibe_agents_activity` — inspect before deletion.
