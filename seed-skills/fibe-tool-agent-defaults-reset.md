---
name: fibe-tool-agent-defaults-reset
description: Use when you need to clear all Player Agent default overrides so the platform's admin defaults apply.
---

# fibe_agent_defaults_reset

[MODE:SIDEEFFECTS] Tier: base. Not idempotent (but safe to retry — empty stays empty).

Wipes the Player's `agent_defaults` to `{}`. Maps to Rails `DELETE /api/agent_defaults` (`Api::AgentDefaultsController#destroy`). Requires `agents:write` API key scope.

## When to use
- Player wants fresh-start defaults from the platform.
- Reverting a botched `fibe_agent_defaults_update`.
- Cleaning up before tearing down the account.

## Inputs
None.

## Output
The post-reset payload (same shape as `fibe_agent_defaults_get` — `agent_defaults: {}`).

## Gotchas
- Reset only affects the Player's overrides; existing Agents retain their per-Agent settings until updated separately.
- Cannot reset another Player's defaults — scoped to the authenticated user.
- Without `agents:write` scope: 403.

## Related
- `fibe_agent_defaults_get` — confirm post-reset state.
- `fibe_agent_defaults_update` — re-apply specific overrides.
