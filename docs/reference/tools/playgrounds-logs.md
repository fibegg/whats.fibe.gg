---
title: "Playgrounds Logs"
description: "Use when you need to fetch a bounded log snapshot for a single Playground service. Returns terminal payload after polling."
slug: /reference/tools/playgrounds-logs
sidebar_label: "Playgrounds Logs"
image: /img/og/reference-tools-playgrounds-logs.png
keywords: ["Fibe", "Tool", "fibe", "tool", "playgrounds", "logs"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: brownfield.

Live log collection requires a funded Marquee and returns `MARQUEE_NOT_FUNDED` when unpaid.

One-shot service log fetch through `GET /api/playgrounds/:id/logs/:service`; the SDK polls the resulting request_id and returns the final payload.

## When to use
- Debug a specific service's startup error.
- Read a known-bounded chunk (`tail` lines) before deciding whether to follow.
- Pair with `fibe_playgrounds_debug` for full context (debug surfaces names; logs surface causes).

## When NOT to use
- Need to wait for a pattern to appear — use `fibe_playgrounds_logs_follow`.
- Need debug summary, not raw logs — use `fibe_playgrounds_debug`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground_id` | number | one of | Numeric ID |
| `playground_identifier` | string | one of | Numeric ID or slug-safe name |
| `service` | string | yes | Compose service name (must exist in the Playspec) |
| `tail` | number | no | Lines to fetch; default 50, clamped to `Docker::LogFetcher::MAX_TAIL_LINES` |

## Output
```json
{
  "playground_id": 42,
  "service": "web",
  "tail": 200,
  "logs": "...",          // raw mixed stdout+stderr
  "stdout": "...",        // present when fetcher separates streams
  "stderr": "...",
  "fetched_at": "2026-..."
}
```

Schema varies slightly by Marquee Docker version; the `logs` field is always populated.

## Behavior
1. Fibe validates `service` against the Playspec's declared services (rejects unknown).
2. Clamps `tail` to `[1, MAX_TAIL_LINES]`.
3. Enqueues `PlaygroundLogSnapshotJob` (the worker SSHes to the Marquee and runs `docker logs --tail <N>`).
4. Returns request_id + status_url; the SDK polls.

## Gotchas
- "Service not found" usually means a typo — service names come from the Playspec's `services[*].name`, not always the Compose service name (Fibe sometimes prefixes/normalizes).
- Marquee unreachable → polling eventually returns an error envelope. Re-check Marquee status.
- Logs may be truncated by Docker's own log driver (`max-size` etc.); `tail` is best-effort.
- Container restarts reset stdout/stderr buffers — recent crashes may have logs that no longer exist.

## Related
- `fibe_playgrounds_debug` — names + ports + per-service status.
- `fibe_playgrounds_logs_follow` — live streaming with pattern matching.
- `fibe-debug` skill — broader troubleshooting recipes.
