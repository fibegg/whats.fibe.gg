---
name: fibe-tool-agents-create-conversation
description: Use when you need to create or upsert a deterministic Agent runtime conversation. Overseer-only.
---

# fibe_agents_create_conversation

[MODE:OVERSEER] Tier: overseer. Not idempotent from the caller perspective, but safe to retry for the same `conversation_id`.

Creates or upserts a runtime conversation for an Agent before sending messages to it.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | yes | Stable runtime conversation/thread ID |
| `title` | string | no | Human-readable title |

## Gotchas
- Use stable caller-owned ids for deterministic routing.
- Never expose `conversation_id` as user authorization. It is routing metadata only.

## Related
- `fibe_agents_send_message` — send into the conversation.
- `fibe_agents_delete_conversation` — cleanup.
