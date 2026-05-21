---
title: "Memorize"
description: "Use when you need to create or update one Memory grounded in a local source conversation. Persistent agent memory tied to evidence (groundings + conversation snapshot)."
slug: /reference/tools/memorize
sidebar_label: "Memorize"
image: /img/og/reference-tools-memorize.png
keywords: ["Fibe", "Tool", "fibe", "tool", "memorize"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: base. Idempotent (per `memory_key` or content hash).

Persists one Memory after attaching the latest local conversation snapshot through `POST /api/memories/memorize`.

The flow:
1. Read local conversation by `conversation_id` (Codex/Claude Code/Claude Desktop transcript) via `localconversations.Get`.
2. Build a payload `{conversation: <snapshot>, memory: {content,...}, source:"mcp"}`.
3. Fibe upserts the conversation archive then upserts the Memory keyed by `memory_key` or computed hash of `(content, tags, conversation_id, groundings)`.

## When to use
- Capturing durable knowledge: lessons learned, working patterns, configuration recipes.
- Recording a Player decision the Agent should respect across sessions.
- Building searchable evidence trail tying knowledge to specific transcript moments.

## When NOT to use
- Short-term progress — that's a `fibe_mutter`.
- Files / generated outputs — that's an Artefact (`fibe_artefact_upload`).

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `conversation_id` | string | yes | Stable local UUID (not a Fibe numeric ID) — discover via `fibe_local_conversations_list` |
| `content` | string | yes | The memory body |
| `tags` | array of string | no | Lowercase slug-like tags |
| `confidence` | number | no | 0.0–1.0 |
| `agent_id` | int or string | no | Defaults to `FIBE_AGENT_ID` env |
| `memory_key` | string | no | Explicit idempotency key; otherwise auto-computed |
| `metadata` | object | no | Free-form |
| `groundings` | array | no | Proof references — see below |

### Groundings (proof structure)
Each grounding points to a span in either a normalized message OR a raw provider event.

```json
{
  "message_position": 12,
  "provider_message_uuid": "...",
  "start_character": 0,
  "end_character": 1500,
  "quote": "<excerpt up to 2000 chars>",
  "raw_event_index": 7,
  "raw_start_character": 0,
  "raw_end_character": 200,
  "metadata": { ... }
}
```

## Output
The created/updated Memory record + grounding records, matching `MemorySerializer`.

## Behavior
- The local conversation is fetched, sanitized (token counts, timestamps, raw events), and packaged as a single archive payload.
- Fibe creates/updates the conversation keyed by `(provider, uuid)` and the Memory keyed by `memory_key`.
- Idempotency: same `memory_key` → upsert; same content+tags+groundings without `memory_key` → server-computed key collides → upsert.

## Gotchas
- `conversation_id` MUST be a stable local UUID. The SDK calls `localconversations.Get` first; failure means the conversation isn't on this machine.
- Quote text is truncated to 2000 chars server-side.
- Tags are normalized lowercase + slug-like; non-conforming tags get coerced.
- `agent_id` falls back to env; passing your own overrides env. Mismatch with `FIBE_AGENT_ID` may break association policies.
- Memory search/get/delete go through `fibe_resource_*` with `resource:"memory"`.
- Local conversation files are ephemeral on a remote MCP transport — the SDK likely fails outside local mode for unfamiliar transcripts.

## Related
- `fibe_local_conversations_list` / `fibe_local_conversations_get` — find conversation IDs.
- `fibe_resource_list(resource:"memory")` — search persisted memories.
- `fibe_resource_get(resource:"memory")` — fetch a specific memory.
- `fibe_resource_delete(resource:"memory")` — forget.
- `fibe_schema(resource:"memory", operation:"memorize")` — exact JSON shape.
