---
title: "Status"
description: "Use when you need to dashboard the current player's resource counts, quota usage, rate-limit budget, and subscription plan in one call."
slug: /reference/tools/status
sidebar_label: "Status"
image: /img/og/reference-tools-status.png
keywords: ["Fibe", "Tool", "fibe", "tool", "status"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Aggregated workspace dashboard. Resource counts, plan, quotas, per-parent caps, and rate-limit snapshot.

Endpoint: `GET /api/status`. Counts match what the authenticated Player can actually manage.

## When to use
- "How many playgrounds do I have left on my plan?"
- Before bulk-creating resources (check quota headroom).
- Quick sanity check after creating/destroying many resources.
- Before/after tenant switch to confirm scope.

## Output shape
```json
{
  "playgrounds": { "total": 12, "active": 9, "stopped": 1 },
  "agents": { "total": 4, "authenticated": 3 },
  "props": 7,
  "playspecs": 11,
  "marquees": 2,
  "secrets": 5,
  "teams": 1,
  "api_keys": 3,
  "subscription": { "plan": "single", "playground_limit": 50 },
  "resource_quotas": { ... },     // only when authenticated via API key
  "per_parent_caps": { ... },     // only when authenticated via API key
  "rate_limits": { "api": { ... } }
}
```

## Gotchas
- `playgrounds.active` counts `running` + `building` (not `stopped`, not `error`).
- `subscription.playground_limit: -1` means unlimited.
- `resource_quotas` / `rate_limits` only appear when called with an API key (not via session-cookie auth from the web UI).
- This is a pure read; no side effects, no events, no logs.

## Related
- `fibe_doctor` — verify *who* you are; this tells you *what* you have.
- `fibe_resource_list` — drill into any of these counters.
