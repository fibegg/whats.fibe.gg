---
title: "Agent Defaults Update"
description: "Use when you need to replace the current Player's Agent default overrides. Same JSON shape the profile UI uses. Affects new Agents and unset fields on existing ones."
slug: /reference/tools/agent-defaults-update
sidebar_label: "Agent Defaults Update"
image: /img/og/reference-tools-agent-defaults-update.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agent", "defaults", "update"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: base. Not idempotent (last write wins).

Replaces (not merges) the Player's `agent_defaults` JSON through `PUT /api/agent_defaults`. Requires API key scope `agents:write`. Concurrent updates are serialized by the server.

## When to use
- Setting platform-wide LLM provider/model preference.
- Configuring `provider_overrides` (per-provider API keys / endpoints).
- Updating runtime tuning fields — temperature, max_tokens, system prompt, etc.

## When NOT to use
- Tweaking a single Agent — use `fibe_resource_mutate(resource:"agent", operation:"update")`.
- Resetting to admin defaults — use `fibe_agent_defaults_reset`.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_defaults` | object | yes | Replacement JSON (full state) |

## Output
The updated payload (same shape as `fibe_agent_defaults_get`).

## Behavior
1. Authorizes via `agents:write` API key scope.
2. Normalizes via `AgentDefaultsNormalizer.normalize` (validates shape, coerces enums).
3. Locks the Player row.
4. Writes the new defaults atomically.

## Gotchas
- **Replacement, not merge.** To keep existing fields, fetch current via `fibe_agent_defaults_get` first, deep-merge yourself, then send.
- `provider_overrides` may include API keys — make sure you're connected to the right tenant.
- Without `agents:write` scope: 403.
- Normalizer rejects unknown enum values (e.g., misspelled provider names) with `ParameterMissing`/`InvalidParameter`.
- Existing Agents that already have explicit overrides keep them; defaults only apply to fields NOT set on the Agent.

## Related
- `fibe_agent_defaults_get` — read current state first.
- `fibe_agent_defaults_reset` — start over.
- `fibe_resource_mutate(resource:"agent", operation:"update")` — per-Agent overrides.
