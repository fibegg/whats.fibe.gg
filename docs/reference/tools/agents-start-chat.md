---
title: "Agents Start Chat"
description: "Use when you need to start (or reconnect) an Agent chat session on the current Marquee. First step before sending messages."
slug: /reference/tools/agents-start-chat
sidebar_label: "Agents Start Chat"
image: /img/og/reference-tools-agents-start-chat.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "start", "chat"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: overseer. Not idempotent.

Starts an Agent chat container on the Marquee through `POST /api/agents/:id/start_chat`.

The Marquee must be funded. Unpaid Marquees return `MARQUEE_NOT_FUNDED`.

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
4. Prepares the chat environment if needed.

## Gotchas
- `FIBE_MARQUEE_ID` is **required** in the Agent's environment — without it the SDK errors before sending a request.
- Marquee not `running` → `MARQUEE_NOT_READY`. Unpaid Marquee → `MARQUEE_NOT_FUNDED`. Bring the Marquee up and fund it first (`fibe_resource_mutate(resource:"marquee", operation:"test_connection")` then status check).
- Existing chats on a different Marquee are preserved; new deployment goes on the requested Marquee.
- Status flips async — call `fibe_agents_runtime_status` to confirm `running`.
- Authentication state is separate; the Agent may need `authenticate` before processing messages even when chat is `running`.

## Related
- `fibe_agents_runtime_status` — health check after start.
- `fibe_agents_send_message` — first-message after bring-up.
- `fibe_resource_mutate(resource:"agent", operation:"restart_chat")` — equivalent flow for an existing chat.
