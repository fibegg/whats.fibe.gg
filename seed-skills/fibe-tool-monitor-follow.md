---
name: fibe-tool-monitor-follow
description: Use when you need to stream Agent events live as MCP progress notifications. Bounded by duration and max_events. For Overseer waiting on Agent output.
---

# fibe_monitor_follow

[MODE:OVERSEER] Read-only, idempotent. Tier: overseer.

Live event stream across one or more Agents. Polls the same monitor query as `fibe_monitor_list` on a tick interval; emits each new event as an MCP progress notification and aggregates them into the final result.

## When to use
- Wait for an Agent to publish an Artefact: `type:"artefact", max_events:1`.
- Watch a multi-step task unfold across mutters/messages.
- Live debugging — see what the Agent is doing in real time.

## When NOT to use
- One-shot list with manual polling — use `fibe_monitor_list`.
- Single Agent's mutter feed — `fibe_mutters_get` is cheaper.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `agent` | string | empty | Comma-separated Agent IDs/names |
| `type` | string | empty | Comma-separated event types |
| `since` | ISO 8601 string | now | Lower bound for new events |
| `q` | string | — | Full-text search |
| `content_limit` | int | 32768 | Per-payload byte truncation (max 131072) |
| `max_events` | int | 100 | Stop after N events |
| `duration` | string | `30s` | Go duration; capped at 30 min |
| `poll_interval` | string | `2s` | Go duration |

## Output (final)
```json
{
  "events": [ { "type":"mutter", "agent_id":42, ... }, ... ],
  "count": <N>
}
```
Each event is also pushed as `notifications/progress` with `progressToken` from the request meta. Hosts that surface progress show events live.

## Bounds
The follow stops when:
- `duration` elapses, OR
- `max_events` collected, OR
- Client cancels, OR
- Server-side polling errors (returned as the call's error).

## Gotchas
- Requires `monitor:read` API key scope (same as `fibe_monitor_list`).
- `duration > 30m` is silently capped.
- `since` defaults to "now" — historical events do NOT appear unless you set `since` to a past timestamp.
- Long-poll holds the MCP request open; some clients have request timeouts shorter than your `duration`.
- Each poll tick is a Rails query — keep `poll_interval ≥ 2s` for shared environments.

## Recipe
Wait for the next artefact from a specific Agent:
```json
{
  "agent": "42",
  "type": "artefact",
  "max_events": 1,
  "duration": "5m"
}
```

## Related
- `fibe_monitor_list` — paginated snapshot.
- `fibe_mutters_get` — focused mutter stream.
- `fibe_playgrounds_logs_follow` — log-level streaming.
