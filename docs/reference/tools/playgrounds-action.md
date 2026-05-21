---
title: "Playgrounds Action"
description: "Use when you need to run a single Playground lifecycle action — rollout, hard_restart, stop, start, retry_compose, enable_maintenance, or disable_maintenance. Destructive; requires confirm:true."
slug: /reference/tools/playgrounds-action
sidebar_label: "Playgrounds Action"
image: /img/og/reference-tools-playgrounds-action.png
keywords: ["Fibe", "Tool", "fibe", "tool", "playgrounds", "action"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: brownfield. Destructive, idempotent (per identifier+action).

Runs one async lifecycle action on a Playground through `POST /api/playgrounds/:id/action`. The SDK polls action status until terminal.

Actions that use the target Marquee require it to be funded and fail with `MARQUEE_NOT_FUNDED` when unpaid. This includes `stop`.

## When to use
- Re-deploying after code changes (`rollout`).
- Hung container, need to nuke and re-up (`hard_restart`).
- Cost / quota — pause without losing state (`stop` / `start`).
- Compose generation failed; retry without other state changes (`retry_compose`).
- Planned downtime — route exposed service URLs to the 503 maintenance page without changing runtime status (`enable_maintenance` / `disable_maintenance`).

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `playground_id` | number | one of | Numeric ID |
| `playground_identifier` | string | one of | Numeric ID or slug-safe name |
| `action_type` | enum | yes | `rollout` \| `hard_restart` \| `stop` \| `start` \| `retry_compose` \| `enable_maintenance` \| `disable_maintenance` |
| `force` | bool | no | Bypass eligible state guards when allowed |
| `confirm` | bool | yes (unless `--yolo`) | Must be `true` |

## Action semantics

| Action | Effect | Required state | `force` allows |
|---|---|---|---|
| `rollout` | Re-render compose, rebuild images, recreate containers | `running`, `has_changes`, stale `in_progress` | `error`, other in_progress |
| `hard_restart` | Compose down + recreate (volumes preserved) | not `completed`/`destroyed` | rare cases |
| `stop` | Compose stop, container memory freed | `running`/`building` etc. | rare cases |
| `start` | Compose start without re-rolling | `stopped` | rare cases |
| `retry_compose` | Re-emit compose YAML, re-up; preserves env | `error`, `running`, `has_changes`, stale `in_progress` | `in_progress` (non-stale) |
| `enable_maintenance` | Route exposed service URLs to `maintenance is ongoing` with HTTP 503 | any non-destroying status | no |
| `disable_maintenance` | Restore normal routing when runtime is healthy; stopped/error playgrounds have no runtime route | maintenance enabled | no |

Rejected actions return `INVALID_STATE` with `current_status`, `allowed_statuses`, and `force_allowed` hints.

## Output
The Playground's updated detail JSON after the action returns terminal (success/error). Failure surfaces as the standard `APIError` with code/details.

## Behavior detail
1. Fibe authorizes update permission on the Playground.
2. Validates `action_type` is allowed.
3. Validates whether the current status allows the requested action.
4. Refuses creation-mutating actions during active Playground creation.
5. Enqueues `PlaygroundActionRequestJob` with `request_id` from `queue_remote_request!`.
6. Returns 202 with `status_url`; the SDK polls `GET /api/playgrounds/:id/action/:request_id`.

## Gotchas
- **You almost never want `force:true`.** Use it only when you know the state guard is bogus (stuck `in_progress`, manual recovery from a failed Marquee).
- `retry_compose` does NOT change source code — it just retries Compose generation. If your code changed, use `rollout`.
- Maintenance is an overlay. It does not start, stop, retry, redeploy, or mutate Playground `status`.
- `stop`+`start` is gentler than `hard_restart`. `hard_restart` can lose container-only state (non-volume tmpfs etc.).
- Idempotency-Key honored — concurrent retries with the same key dedupe.
- Action status polling has a built-in deadline; for long rollouts pair with `fibe_playgrounds_wait(status:"running")`.
- `rollout` of a Job-mode Trick is conceptually wrong — Tricks use `trick.rerun` or `trick.trigger`.

## Related
- `fibe_resource_get(resource:"playground", ...)` — pre-flight state check.
- `fibe_playgrounds_wait` — confirm terminal status.
- `fibe_playgrounds_debug` — diagnose action failure.
- `fibe_playgrounds_logs` — read service logs after action.
- `fibe_resource_mutate(resource:"playground", operation:"action")` — equivalent (uses same dispatch).
