---
title: "Agents Live State"
description: "Use when you need current conversation-scoped live stream state for a managed Agent. Overseer-only."
slug: /reference/tools/agents-live-state
sidebar_label: "Agents Live State"
image: /img/og/reference-tools-agents-live-state.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "live", "state"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Tier: overseer. Read-only.

Live state requires the chat Marquee to be funded. Unpaid Marquees return `MARQUEE_NOT_FUNDED`.

Reads transient live state for one Agent conversation. Use it when you need processing state, streamed text, queued turns, or the current activity id without waiting for persisted monitor events.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific conversation/thread ID |

## Output
Live state object, typically including `conversationId`, `isProcessing`, `streamText`, `currentActivityId`, `queuedTurns`, and `startedAt` when available.

## Gotchas
- For multi-conversation Agents, pass `conversation_id`; otherwise the default conversation state may be returned.
- This is transient state. Persisted history lives in `fibe_agents_messages` and `fibe_agents_activity`.
- Empty `streamText` does not prove the Agent is idle; check `isProcessing` and `queuedTurns`.

## Related
- `fibe_agents_send_message` — enqueue work.
- `fibe_agents_interrupt` — stop a stuck turn.
- `fibe_agents_messages` / `fibe_agents_activity` — persisted history.
