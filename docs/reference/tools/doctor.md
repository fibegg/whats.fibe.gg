---
title: "Doctor"
description: "Use when you need to verify Fibe MCP connectivity, API key validity, and current player profile. First call when troubleshooting auth or environment selection."
slug: /reference/tools/doctor
sidebar_label: "Doctor"
image: /img/og/reference-tools-doctor.png
keywords: ["Fibe", "Tool", "fibe", "tool", "doctor"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Runs a self-diagnostic: validates the API key against `/api/me`, returns SDK version, and surfaces the authenticated player.

Endpoint: `GET /api/me`. Auth uses bearer token from `FIBE_API_KEY` (or session-scoped override from `fibe_auth_set`).

## When to use
- `[SYSCHECK]` step.
- After switching tenant via `fibe_auth_set`.
- Tool calls failing with 401/403 — confirm key validity before chasing other causes.
- Confirming which environment (production / staging / local) you're connected to.

## Output shape (success)
```json
{
  "domain": "https://fibe.gg",
  "version": "<sdk semver>",
  "authenticated": true,
  "user_id": 42,
  "username": "viktor",
  "github_handle": "viktorvsk",
  "email": "...",
  "avatar_url": "...",
  "api_key_scopes": ["agents:read", "playgrounds:write", "..."]
}
```

## Output shape (failure)
```json
{
  "domain": "...",
  "version": "...",
  "authenticated": false,
  "error": "401 Unauthorized: ..."
}
```

## Gotchas
- `domain` reflects the Fibe Client's resolved base URL, including any `fibe_auth_set` override. If that surprises you, your session has a tenant override.
- `api_key_scopes` is empty for legacy keys without explicit scopes; missing scopes mean broad access, not zero access.
- `version` is the SDK build, not the server version.
- This tool requires no inputs — passing args is silently ignored.

## Related
- `fibe_auth_set` — change the key/domain mid-session.
- `fibe_status` — workload/quota dashboard (also requires valid auth).
- `fibe_help` — meta CLI help (no auth).
