---
name: fibe-tool-agents-start-chat
description: Use when you need to start (or reconnect) an Agent's runtime chat session on the current Marquee. First step before sending messages.
---

# fibe_agents_start_chat

[MODE:SIDEEFFECTS] Tier: overseer. Not idempotent.

Starts an Agent chat container on the Marquee. Maps to Rails `POST /api/agents/:id/start_chat` (`Api::AgentsController#start_chat`) which uses `AgentChatService#start!` and enqueues `AgentChatStartJob` if the chat is `pending`.

## When to use
- Initial bring-up of a new Agent.
- After Marquee was unreachable and chats fell over — reconnects to existing session when possible.
- Following `fibe_agents_runtime_status` returning `status:"missing"`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |

`marquee_id` is read from `FIBE_MARQUEE_ID` env — failing fast if unset.

## Output
HTTP 202 envelope describing the chat session (`pending` initially, transitions to `running` once `AgentChatStartJob` finishes provisioning).

## Behavior
1. Validates the Agent and its target Marquee.
2. Refuses if Marquee is not `chat_launchable` (returns `MARQUEE_NOT_READY`).
3. Reuses an existing chat record where possible (idempotent reconnect for the same Marquee).
4. Enqueues `AgentChatStartJob` to deploy the runtime container if needed.

## Gotchas
- `FIBE_MARQUEE_ID` is **required** in the Agent's environment — without it the SDK errors before hitting Rails.
- Marquee not `running` → `MARQUEE_NOT_READY`. Bring the Marquee up first (`fibe_resource_mutate(resource:"marquee", operation:"test_connection")` then status check).
- Existing chats on a different Marquee are preserved; new deployment goes on the requested Marquee.
- Status flips async — call `fibe_agents_runtime_status` to confirm `running`.
- Authentication state is separate; the Agent may need `authenticate` before processing messages even when chat is `running`.

## Related
- `fibe_agents_runtime_status` — health check after start.
- `fibe_agents_send_message` — first-message after bring-up.
- `fibe_resource_mutate(resource:"agent", operation:"restart_chat")` — equivalent flow for an existing chat.
