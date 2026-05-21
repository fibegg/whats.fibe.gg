---
title: "Agents Runtime Status"
description: "Use when you need to check an Agent's reachability, authentication, queue depth, and processing state. Diagnostics for Agent chat health."
slug: /reference/tools/agents-runtime-status
sidebar_label: "Agents Runtime Status"
image: /img/og/reference-tools-agents-runtime-status.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "runtime", "status"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Read-only, idempotent. Tier: overseer.

Live checks require the chat Marquee to be funded. Unpaid Marquees return `MARQUEE_NOT_FUNDED`.

Pulls the combined chat envelope and live status for an Agent through `GET /api/agents/:id/runtime_status`.

## When to use
- Before sending messages — confirm the Agent is up.
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
- `runtime_reachable` — Agent responded to the status check.
- `authenticated` — Agent reports valid LLM provider credentials.
- `is_processing` — Agent is currently mid-turn.
- `queue_count` — pending messages waiting for the Agent.

## Gotchas
- `runtime_reachable:false` despite `status:"running"` usually means the Agent is still starting or has failed; check `fibe_playgrounds_debug` on the chat's Playground.
- "missing" status means no chat ever started — call `fibe_agents_start_chat`.
- Returns immediately; does not poll.

## Related
- `fibe_agents_start_chat` — bring chat online.
- `fibe_agents_send_message` — only sensible after `runtime_reachable:true`.
- `fibe_resource_get(resource:"agent")` — config-side info.
