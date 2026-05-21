---
title: "Auth Set"
description: "Use when you need to switch session-scoped Fibe API key and/or domain mid-session for multi-tenant work. Validates new creds via /api/me ping by default."
slug: /reference/tools/auth-set
sidebar_label: "Auth Set"
image: /img/og/reference-tools-auth-set.png
keywords: ["Fibe", "Tool", "fibe", "tool", "auth", "set"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: other. Not idempotent.

Overrides the API key and/or domain for the current MCP session. Validates the new credentials via a Ping (`GET /api/me`) before committing — so a typo in `api_key` cannot poison the session.

## When to use
- Switching between production / staging / local in one MCP session.
- Multi-tenant HTTP MCP server — each session needs its own credentials.
- Temporary impersonation: switch to a service account, do work, switch back.

## When NOT to use
- Stdio transports running on a single tenant — env vars (`FIBE_API_KEY`, `FIBE_DOMAIN`) are simpler.
- You only need to read with current creds — no override needed.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `api_key` | string | one of | New API key, e.g. `fibe_test_...` |
| `domain` | string | one of | New base domain, e.g. `next.fibe.live` |
| `validate` | bool | no | Default `true`; set `false` to skip the ping |

At least one of `api_key`/`domain` must be set.

## Output
```json
{
  "ok": true,
  "api_key_set": true,
  "domain_set": false,
  "validated": true
}
```

## Behavior
1. Snapshots the current session creds.
2. Applies the new ones (`s.setSessionAuth`).
3. If `validate:true` (default): rebuilds the SDK client and Pings `/api/me`. On failure, **rolls back** to the snapshot and returns `validation failed (credentials NOT saved)`.
4. On success or `validate:false`, the override persists for the rest of the session.

## Persistence scope
- Lives in MCP session state — not on disk.
- Only the current session sees the override; other sessions on the same server keep their own creds.
- Re-call to update further; pass `api_key:""` is treated as "not set" (only domain changes), not as "clear".

## Gotchas
- `validate:false` saves silently even on bad credentials — every later tool call returns 401 until you call `fibe_auth_set` again. Default is `true` for a reason.
- `domain` must include scheme-friendly host (`next.fibe.live`, `rails.test:3000`). Don't include `https://`.
- This affects the **HTTP client** the server uses — env vars (`FIBE_*`) are not mutated.
- Switching tenants does NOT clear the cached resource tools / catalog state; if you cached `pipeline_id`s, they remain valid only for the original session.

## Related
- `fibe_doctor` — confirm new identity after switching.
- `FIBE_API_KEY` / `FIBE_DOMAIN` env vars — for stdio single-tenant setup.
