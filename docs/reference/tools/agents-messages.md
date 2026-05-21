---
title: "Agents Messages"
description: "Use when you need persisted Agent messages, optionally scoped to a conversation. Overseer-only."
slug: /reference/tools/agents-messages
sidebar_label: "Agents Messages"
image: /img/og/reference-tools-agents-messages.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "messages"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Read-only.

Reads persisted Agent messages. Use `conversation_id` whenever the Agent is reused across multiple user/project conversations.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific conversation/thread ID |

## Gotchas
- This is persisted history, not live streaming state. Use `fibe_agents_live_state` for live output.
- Without `conversation_id`, results may include only the default conversation.

## Related
- `fibe_agents_activity` — persisted activity log.
- `fibe_agents_live_state` — transient processing state.
