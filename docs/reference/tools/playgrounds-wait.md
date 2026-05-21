---
title: "Playgrounds Wait"
description: "Use when you need to block-and-poll until a Playground reaches a target status (running, stopped, has_changes, destroyed, etc.). Required after rollout/start/restart/job triggers."
slug: /reference/tools/playgrounds-wait
sidebar_label: "Playgrounds Wait"
image: /img/og/reference-tools-playgrounds-wait.png
keywords: ["Fibe", "Tool", "fibe", "tool", "playgrounds", "wait"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: brownfield.

Polls `GET /api/playgrounds/:id/status` on a fixed interval until it reaches the target status, errors out, or hits the timeout. Sends MCP progress notifications on every tick.

## When to use
- After `fibe_playgrounds_action(action_type:"rollout")` to confirm `running`.
- After `fibe_resource_delete(resource:"playground")` to confirm `destroyed`.
- After `fibe_resource_mutate(resource:"trick", operation:"trigger")` to wait for `completed`.
- Inside a `fibe_pipeline` to gate later steps on a state transition.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground_id` | number | one of | Numeric ID |
| `playground_identifier` | string | one of | Numeric ID or slug-safe name |
| `status` | string | yes | Target status; `running`, `stopped`, `has_changes`, `completed`, `destroyed`, etc. |
| `timeout` | string | no | Go duration; default `10m` |
| `interval` | string | no | Go duration; default `3s` |

## Output
- Success — the Playground's status response payload at the moment the target was reached.
- Failure — error envelope:
  - `timeout after <dur> — last status: <state>` if the deadline expires.
  - Terminal failure (`error`/`failed`/`destroyed` not matching `target`) returns `PlaygroundTerminalStateError(pg)` with the reason populated from `failure_diagnostics`.

## Behavior
1. Sends a progress notification each tick (`status: <state>`).
2. Returns immediately on `status == target`.
3. Errors immediately on a terminal state that does not match `target` (won't keep polling forever on a permanently-failed playground).
4. Returns `ctx.Err()` on client cancellation.

## Targets cheat sheet
| Target | When to use |
|---|---|
| `running` | After `rollout`, `start`, `hard_restart`, `retry_compose` |
| `stopped` | After `stop` |
| `has_changes` | After Prop sync that introduced rollout-able diff |
| `completed` | Tricks (job-mode) |
| `destroyed` | After `fibe_resource_delete(resource:"playground")` |

## Gotchas
- Hard-coded terminal-failure shortcut: `error`, `failed`, `destroyed`. If `target == "destroyed"`, `destroyed` is the success path; otherwise it errors out.
- `timeout` and `interval` accept bare integers as seconds (`"30"` = 30 s).
- This polls the **DB-cached** status — the Marquee writes there asynchronously. There's a small lag between actual container state and what `wait` observes.
- Don't call this from within `fibe_playgrounds_action`'s output — that already polls the action's request_id; `wait` is for the *post-action* state confirmation.

## Recipe (pipeline)
```json
{
  "steps": [
    { "id":"act", "tool":"fibe_playgrounds_action",
      "args":{ "playground_id":42, "action_type":"rollout", "confirm":true } },
    { "id":"wait", "tool":"fibe_playgrounds_wait",
      "args":{ "playground_id":42, "status":"running", "timeout":"5m" } }
  ]
}
```

## Related
- `fibe_playgrounds_action` — the producer of state transitions.
- `fibe_playgrounds_debug` — diagnose why wait timed out.
- `fibe_playgrounds_logs_follow` — alternative for log-based readiness signals.
