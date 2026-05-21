---
title: "Agents Create Conversation"
description: "Use when you need to create or upsert a deterministic Agent conversation. Overseer-only."
slug: /reference/tools/agents-create-conversation
sidebar_label: "Agents Create Conversation"
image: /img/og/reference-tools-agents-create-conversation.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "create", "conversation"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Not idempotent from the caller perspective, but safe to retry for the same `conversation_id`.

Creates or upserts a conversation for an Agent before sending messages to it.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | yes | Stable conversation/thread ID |
| `title` | string | no | Human-readable title |

## Gotchas
- Use stable caller-owned ids for deterministic routing.
- Never expose `conversation_id` as user authorization. It is routing metadata only.

## Related
- `fibe_agents_send_message` — send into the conversation.
- `fibe_agents_delete_conversation` — cleanup.
