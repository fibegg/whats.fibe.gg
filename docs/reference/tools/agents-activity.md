---
title: "Agents Activity"
description: "Use when you need persisted Agent activity, optionally scoped to a conversation. Overseer-only."
slug: /reference/tools/agents-activity
sidebar_label: "Agents Activity"
image: /img/og/reference-tools-agents-activity.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "activity"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Read-only.

Reads persisted Agent activity. Use this to inspect tool calls, steps, and outcomes after a conversation turn.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific conversation/thread ID |

## Gotchas
- For multi-conversation Agents, pass `conversation_id` or you may inspect the wrong thread.
- Use `fibe_agents_live_state` when the current turn has not persisted yet.

## Related
- `fibe_agents_messages` — persisted message history.
- `fibe_agents_live_state` — transient processing state.
