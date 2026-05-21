---
name: fibe-tool-agent-defaults-get
description: Use when reading the current Player's Agent default overrides (LLM provider, settings, etc.) — the JSON shape used by the profile UI.
---

# fibe_agent_defaults_get

[MODE:DIALOG] Read-only, idempotent. Tier: base.

Returns the authenticated Player's `agent_defaults` JSON. Maps to Rails `GET /api/agent_defaults` (`Api::AgentDefaultsController#show`). Requires API key scope `agents:read`.

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
