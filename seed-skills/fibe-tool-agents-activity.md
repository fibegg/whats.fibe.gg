---
name: fibe-tool-agents-activity
description: Use when you need persisted Agent activity, optionally scoped to a runtime conversation. Overseer-only.
---

# fibe_agents_activity

[MODE:OVERSEER] Tier: overseer. Read-only.

Reads persisted Agent activity. Use this to inspect tool calls, runtime steps, and outcomes after a conversation turn.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific runtime conversation/thread ID |

## Gotchas
- For multi-conversation Agents, pass `conversation_id` or you may inspect the wrong thread.
- Use `fibe_agents_live_state` when the current turn has not persisted yet.

## Related
- `fibe_agents_messages` — persisted message history.
- `fibe_agents_live_state` — transient processing state.
