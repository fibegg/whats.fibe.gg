---
name: fibe-tool-agents-messages
description: Use when you need persisted Agent messages, optionally scoped to a runtime conversation. Overseer-only.
---

# fibe_agents_messages

[MODE:OVERSEER] Tier: overseer. Read-only.

Reads persisted Agent messages. Use `conversation_id` whenever the Agent is reused across multiple user/project conversations.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific runtime conversation/thread ID |

## Gotchas
- This is persisted history, not live streaming state. Use `fibe_agents_live_state` for live output.
- Without `conversation_id`, results may include only the runtime default conversation.

## Related
- `fibe_agents_activity` — persisted activity log.
- `fibe_agents_live_state` — transient processing state.
