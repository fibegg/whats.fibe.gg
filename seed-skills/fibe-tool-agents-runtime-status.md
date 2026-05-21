---
name: fibe-tool-agents-runtime-status
description: Use when you need to check an Agent's runtime reachability, authentication, queue depth, and processing state. Diagnostics for Agent chat health.
---

# fibe_agents_runtime_status

[MODE:OVERSEER] Read-only, idempotent. Tier: overseer.

Pulls combined chat envelope + live runtime probe for an Agent. Maps to Rails `GET /api/agents/:id/runtime_status` (`Api::AgentsController#runtime_status`). When the chat is `running`, also pings the Agent runtime via `Agent::MessageSender#check_status`.

## When to use
- Before sending messages — confirm runtime is up.
- Investigating why messages aren't being processed.
- Quick health check across managed Agents.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |

## Output
Without an active chat:
```json
{ "status": "missing", "runtime_reachable": false, "authenticated": false, "is_processing": false, "queue_count": 0 }
```

With a chat:
```json
{
  "id": <chat_id>, "status": "running", "marquee_id": ...,
  "runtime_reachable": true,
  "authenticated": true,
  "is_processing": false,
  "queue_count": 0,
  "started_at": "...", "stopped_at": null,
  ... (other chat_api_payload fields)
}
```

## Field meanings
- `runtime_reachable` — runtime container responded to status probe.
- `authenticated` — runtime reports valid LLM provider creds.
- `is_processing` — runtime is currently mid-turn.
- `queue_count` — pending messages waiting for runtime.

## Gotchas
- `runtime_reachable:false` despite `status:"running"` usually means the runtime container is up but the inner HTTP server is starting or has crashed; check `fibe_playgrounds_debug` on the chat's playground.
- "missing" status means no chat ever started — call `fibe_agents_start_chat`.
- Returns immediately; does not poll.

## Related
- `fibe_agents_start_chat` — bring runtime online.
- `fibe_agents_send_message` — only sensible after `runtime_reachable:true`.
- `fibe_resource_get(resource:"agent")` — config-side info.
