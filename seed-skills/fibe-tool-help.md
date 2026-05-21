---
name: fibe-tool-help
description: Use when you need to read the cobra CLI Long help for any fibe subcommand (flag descriptions, examples, payload shapes).
---

# fibe_help

[MODE:DIALOG] Read-only, idempotent. Tier: meta.

Returns cobra's Short/Long/help text for a `fibe <path>` command. No API call, no auth required.

## When to use
- Need exact flag names/types for `fibe_run` or a CLI invocation.
- Looking for argument shape examples that don't appear in the MCP tool description.
- Discovering subcommands under a CLI namespace.

## Inputs
| Field | Type | Default | Notes |
|---|---|---|---|
| `path` | string | empty (= root) | Space-separated subcommand path, e.g. `"playgrounds create"` |

## Output
```json
{
  "path": "playgrounds create",
  "short": "Create a new playground",
  "long": "Long description...",
  "help": "Usage:\n  fibe playgrounds create [flags]\n\nFlags:\n  -n, --name string ..."
}
```

## Examples
- Root commands list: `{ "path": "" }`.
- All `playgrounds` subcommands: `{ "path": "playgrounds" }`.
- Specific subcommand: `{ "path": "templates versions create" }`.

## Gotchas
- Errors with `unknown command` for typos — the matcher is exact prefix on cobra command names.
- Requires the SDK was started with a `CobraRoot` (always true for the standard `fibe mcp serve`).
- For *MCP* tool descriptions/schemas, prefer `fibe_tools_catalog` — `fibe_help` is for the CLI surface.

## Related
- `fibe_tools_catalog` — MCP tool descriptions.
- `fibe_schema` — payload schemas for `fibe_resource_*` calls.
- `fibe_run` — last-resort CLI invocation; use this skill to learn its args.
