---
title: "Playgrounds Logs Follow"
description: "Use when you need to stream a Playground service's live logs as MCP progress notifications until duration elapses or max_lines reached. For waiting on a specific log pattern."
slug: /reference/tools/playgrounds-logs-follow
sidebar_label: "Playgrounds Logs Follow"
image: /img/og/reference-tools-playgrounds-logs-follow.png
keywords: ["Fibe", "Tool", "fibe", "tool", "playgrounds", "logs", "follow"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: brownfield. Read-only API but emits progress events.

Following live logs requires a funded Marquee and returns `MARQUEE_NOT_FUNDED` when unpaid.

Streams service logs line-by-line as MCP progress notifications, returning a final aggregate when bounded by duration/max_lines. Uses `/api/playgrounds/:id/logs/:service?follow=true`.

## When to use
- "Wait until I see 'listening on :8080'."
- Watching a slow boot to confirm a service settled.
- Tailing a worker after triggering a job.

## When NOT to use
- One-shot snapshot — use `fibe_playgrounds_logs`.
- Need cross-service context — use `fibe_playgrounds_debug` with `logs_tail`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground_id` | number | yes | Numeric ID only (no name resolution here) |
| `service` | string | yes | Compose service name |
| `tail` | number | no | Initial lines from history (default 50) |
| `duration` | string | no | Go duration; default `30s`, max constrained by transport timeout |
| `max_lines` | number | no | Stop after N new lines (default 500) |

## Output (final)
```json
{
  "playground_id": 42,
  "service": "web",
  "lines": [
    { "text": "...", "source": "stdout|stderr" },
    ...
  ],
  "count": 257
}
```

While streaming, each line is also delivered as an MCP `notifications/progress` event tagged with the request's `progressToken` (when the client provided one). Hosts that surface progress (Claude Desktop, etc.) display lines in real time.

## Bounds
The stream stops when:
- `duration` elapses, OR
- `max_lines` are observed, OR
- The client cancels the call, OR
- The server-side stream closes (container exits, network drops).

Whichever comes first.

## Gotchas
- Only `playground_id` (numeric) is accepted; named identifiers are not supported.
- `duration` strings: `"30s"`, `"5m"`. Bare integers are interpreted as seconds.
- Some MCP clients drop progress notifications between request and final result — even then you still get the aggregated `lines` array at the end.
- If the underlying Marquee SSH connection drops, the stream just stops; reconnect and re-call to resume.
- This is the right primitive for "verify the service is up" but `fibe_playgrounds_wait(status:"running")` is usually simpler when the signal is the Playground status flip.

## Related
- `fibe_playgrounds_logs` — bounded snapshot.
- `fibe_playgrounds_wait` — wait for status transitions instead.
- `fibe_playgrounds_debug` — get service names before following.
