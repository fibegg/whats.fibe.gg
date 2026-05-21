---
name: fibe-tool-agents-interrupt
description: Use when you need to stop a running Agent turn. Overseer-only.
---

# fibe_agents_interrupt

[MODE:OVERSEER] Tier: overseer. Not idempotent.

Requests the runtime to interrupt the currently running Agent turn. Use this only when the user explicitly asks to stop/cancel, or when an automated controller must halt a bad loop.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |
| `conversation_id` | string | no | Specific runtime conversation/thread ID |

## Gotchas
- Prefer passing `conversation_id` for multi-conversation Agents.
- Interrupting does not delete queued messages or persisted history.
- After interrupt, check `fibe_agents_live_state` or `fibe_agents_runtime_status` before sending more work.

## Related
- `fibe_agents_live_state` — inspect the current turn.
- `fibe_agents_send_message` — continue after stopping.
