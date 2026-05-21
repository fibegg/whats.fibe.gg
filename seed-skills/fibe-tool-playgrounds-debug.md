---
name: fibe-tool-playgrounds-debug
description: Use when you need to fetch comprehensive Playground diagnostics — service/container names, ports, paths, labels, status, urls, recent logs — when troubleshooting a deployment.
---

# fibe_playgrounds_debug

[MODE:DIALOG] Read-only, idempotent. Tier: brownfield.

Returns the unified Playground diagnostic envelope. Maps to Rails `GET /api/playgrounds/:id/debug` (`Api::PlaygroundsController#debug`). Two paths:
- `refresh:false` — read DB-cached diagnostics computed at last refresh (fast, returns immediately).
- `refresh:true` (default) — enqueue `PlaygroundDebugRequestJob`, poll request status until terminal, then return the fresh diagnostics.

## When to use
- Anything wrong with a Playground (missing URL, container crashing, stale state).
- First call when investigating any service issue — gives you names/ports/labels in one shot, avoiding manual `docker ps` grepping.
- Right after `fibe_playgrounds_action` reports failure.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground_id` | number | one of | Numeric ID |
| `playground_identifier` | string | one of | Numeric ID or slug-safe name |
| `mode` | enum | no | `summary` (default) or `full` — `full` includes raw compose / volumes / network details |
| `refresh` | bool | no | Default `true`. Set `false` for cached read. |
| `service` | string | no | Restrict diagnostics to one Compose service |
| `logs_tail` | number | no | Include last N log lines per service (clamped to `MAX_LOG_TAIL`) |

## Output (summary, fresh)
```json
{
  "playground": {
    "id": 42, "name": "...", "status": "running",
    "marquee_id": 7, "playspec_id": 13,
    "compose_project": "fibe_42",
    "urls": [ ... ],
    "expires_at": "..."
  },
  "services": [
    {
      "name": "web",
      "image": "ruby:3.3",
      "container_name": "fibe_42_web_1",
      "container_status": "running",
      "exit_code": null,
      "ports": [ { "container":3000, "published":80 } ],
      "labels": { "fibe.gg/...": "..." },
      "logs": "..."   // present when logs_tail set
    }
  ],
  "issues": [ { "level":"warn", "message":"..." } ],
  "host": { "marquee_root_domain":"...", "docker_version":"..." }
}
```

`mode:"full"` adds raw compose YAML, volume mounts, network IPs, env (with secrets redacted).

## Async refresh flow
The default `refresh:true` path:
1. SDK calls `GET /api/playgrounds/:id/debug?refresh=true&service=...&logs_tail=...`.
2. Rails enqueues `PlaygroundDebugRequestJob`, returns `request_id` + `status_url`.
3. SDK polls `GET /api/playgrounds/:id/debug/:request_id` until terminal.
4. Returns the final payload.

Cached read (`refresh:false`) skips the job and uses `PlaygroundDiagnosticsService` synchronously.

## Gotchas
- The Marquee must be reachable via SSH for `refresh:true` to succeed; if it's down, expect `playground_debug` to error.
- `logs_tail` is clamped server-side to `PlaygroundDiagnosticsService::MAX_LOG_TAIL` (currently a few hundred). Use `fibe_playgrounds_logs` for larger tails.
- `service` filter narrows the response but doesn't speed up the refresh meaningfully (Marquee-side debug runs all services anyway).
- `summary` is what 95% of agent flows want. Use `full` only when summary's redacted/elided fields aren't enough.
- Cached debug is per-Playground, single-slot — frequent `refresh:false` calls return identical payloads until someone refreshes.

## Recipe
1. `fibe_playgrounds_debug({ playground_id, mode:"summary" })` — first.
2. If a service shows `container_status:"exited"` with non-zero exit code → `fibe_playgrounds_logs(service:"<name>", tail:200)`.
3. If still unclear → `fibe_playgrounds_debug({ ..., mode:"full", service:"<name>", logs_tail:200 })`.

## Related
- `fibe_playgrounds_logs` — single-service logs.
- `fibe_playgrounds_logs_follow` — stream until pattern.
- `fibe_playgrounds_wait` — wait for state transitions.
- `fibe-debug` skill — broader debugging playbook.
