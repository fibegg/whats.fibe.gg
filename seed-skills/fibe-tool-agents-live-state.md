---
name: fibe-tool-agents-live-state
description: Use when you need current conversation-scoped runtime stream state for a managed Agent. Overseer-only.
---

# fibe_agents_live_state

[MODE:OVERSEER] Tier: overseer. Read-only.

Reads transient runtime state for one Agent conversation. Use it when you need live processing state, streamed text, queued turns, or the current activity id without waiting for persisted monitor events.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific runtime conversation/thread ID |

## Output
Runtime live state object, typically including `conversationId`, `isProcessing`, `streamText`, `currentActivityId`, `queuedTurns`, and `startedAt` when the runtime exposes them.

## Gotchas
- For multi-conversation Agents, pass `conversation_id`; otherwise the runtime may return default conversation state.
- This is transient state. Persisted history lives in `fibe_agents_messages` and `fibe_agents_activity`.
- Empty `streamText` does not prove the Agent is idle; check `isProcessing` and `queuedTurns`.

## Related
- `fibe_agents_send_message` — enqueue work.
- `fibe_agents_interrupt` — stop a stuck turn.
- `fibe_agents_messages` / `fibe_agents_activity` — persisted history.
