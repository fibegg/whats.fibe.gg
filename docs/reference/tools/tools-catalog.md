---
title: "Tools Catalog"
description: "Use when you need to discover the full Fibe MCP tool surface (advertised + hidden). Required first step before fibe_call when targeting a tool not visible in ToolSearch."
slug: /reference/tools/tools-catalog
sidebar_label: "Tools Catalog"
image: /img/og/reference-tools-tools-catalog.png
keywords: ["Fibe", "Tool", "fibe", "tool", "tools", "catalog"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Lists every tool registered on the Fibe MCP server, including ones not advertised by the current `--tools` tier. Always available even in `--tools core`.

## When to use
- Tool appears in CLI but not in your client → check if hidden tier.
- About to write `fibe_call` → confirm exact tool name and tier first.
- Researching capability surface ("does Fibe support X?").
- Need an input schema before invoking via `fibe_call`.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `tier` | enum | `all` | `meta`, `base`, `greenfield`, `brownfield`, `overseer`, `local`, `other`, `core` (= meta+base+greenfield+brownfield), `full`/`all` |
| `name_pattern` | string | empty | Case-insensitive substring match on tool name |
| `include_schema` | bool | `false` | Attach each tool's JSON input schema (large payload) |

## Output shape
```json
{
  "count": 42,
  "tool_set": "core",
  "tools": [
    {
      "name": "fibe_resource_get",
      "description": "...",
      "tier": "base",
      "advertised": true,
      "hidden": false,
      "read_only": true,
      "destructive": false,
      "idempotent": true,
      "input_schema": { ... }   // only when include_schema=true
    }
  ]
}
```

`advertised: false` means the tool is registered server-side but not exposed to this MCP session — reach it via `fibe_call`.

## Recipes
- Discover all webhook-related tools: `{tier:"all", name_pattern:"webhook"}`.
- Inspect a tool's args before calling it: `{name_pattern:"props_get", include_schema:true}`.
- Quick survey of admin-only tools: `{tier:"overseer"}`.

## Gotchas
- Returns the SDK-side registration, not OpenAPI docs. For payload validation use `fibe_schema`.
- `include_schema:true` can multiply response size by 10×; filter with `name_pattern`.
- The list reflects the **server's** registered tools, not what each client UI displays. UIs may further filter (e.g., Codex hides destructive tools by default).

## Related
- `fibe_call` — invoke a tool returned here.
- `fibe_schema` — authoritative for resource payload shapes.
- `fibe_help` — CLI-level help for the same tool path.
