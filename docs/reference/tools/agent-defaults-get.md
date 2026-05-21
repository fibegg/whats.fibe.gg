---
title: "Agent Defaults Get"
description: "Use when reading the current Player's Agent default overrides (LLM provider, settings, etc.) — the JSON shape used by the profile UI."
slug: /reference/tools/agent-defaults-get
sidebar_label: "Agent Defaults Get"
image: /img/og/reference-tools-agent-defaults-get.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agent", "defaults", "get"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: base.

Returns the authenticated Player's `agent_defaults` JSON through `GET /api/agent_defaults`. Requires API key scope `agents:read`.

## When to use
- Reviewing default LLM provider/model/temperature for new Agents.
- Before `fibe_agent_defaults_update` — to compute a delta.
- Confirming an admin-set default is in effect (Player's overrides take priority).

## Inputs
None.

## Output
```json
{
  "agent_defaults": { "provider":"anthropic", "model":"claude-opus-4-7", "...":"..." },
  "player": { "id": 11, "username": "viktor" }
}
```

## Gotchas
- Player overrides ARE NOT global admin defaults — empty `agent_defaults` means the platform's admin defaults apply.
- Without `agents:read` scope: 403 `FORBIDDEN`.
- Returned shape mirrors what `fibe_agent_defaults_update` accepts.

## Related
- `fibe_agent_defaults_update` — replace overrides.
- `fibe_agent_defaults_reset` — clear overrides.
- `fibe_resource_mutate(resource:"agent", operation:"update")` — per-Agent overrides instead.
