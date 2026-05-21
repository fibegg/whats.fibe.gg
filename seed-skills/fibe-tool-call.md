---
name: fibe-tool-call
description: Use when you need to invoke a Fibe MCP tool that is registered server-side but not advertised in the current client tool surface (typical when running --tools core).
---

# fibe_call

[MODE:SIDEEFFECTS] Tier: meta. Mirrors safety/auth/idempotency of the target tool.

Dispatches an arbitrary registered tool by name. Same dispatcher path as a direct MCP call, so destructive gating, schema validation, and idempotency keys behave identically to a native invocation.

## When to use
- Target tool is hidden by `--tools <tier>` filter.
- Tool name is dynamic (chosen at runtime from `fibe_tools_catalog`).
- Reaching `fibe_props_*`, `fibe_marquees_*`, `fibe_secrets_*`, `fibe_webhooks_*`, etc. when running on `core` tier.

## When NOT to use
- The concrete tool is already advertised — call it directly for cleaner traces.
- You need to call `fibe_pipeline` — call it directly. Nesting is rejected.
- You need to recursively call `fibe_call` itself — rejected.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `tool` | string | yes | Full registered name, e.g. `fibe_props_get`. Case-sensitive. |
| `args` | object | no | The target tool's argument object verbatim |
| `confirm` | bool | no | Forwarded to `args.confirm` for destructive tools |

## Output
Whatever the target tool returns. Errors propagate transparently with the same codes/structure.

## Examples
```json
{
  "tool": "fibe_props_get",
  "args": { "id": 123 }
}
```

```json
{
  "tool": "fibe_playgrounds_delete",
  "args": { "id": 456 },
  "confirm": true
}
```

## Gotchas
- Args go in `args`, NOT at top-level. The call shape is `{tool, args, confirm}`, not the target tool's flat input.
- `confirm` is mirrored into `args.confirm` automatically. You can pass it at either spot.
- Schema validation runs inside the dispatched tool, so a malformed payload fails with the target tool's normal error, not `fibe_call`'s.
- `tool: "fibe_call"` errors. `tool: "fibe_pipeline"` errors. Use those directly.

## Discovery flow
1. `fibe_tools_catalog({tier:"all", name_pattern:"<area>"})` to find the tool name.
2. (Optional) `fibe_schema(resource:"<resource>", operation:"<op>")` if it's a `fibe_resource_*` tool.
3. (Optional) `fibe_tools_catalog({name_pattern:"<name>", include_schema:true})` for arbitrary tools.
4. `fibe_call({tool:"...", args:{...}})`.

## Related
- `fibe_tools_catalog` — discover targets.
- `fibe_pipeline` — preferred for multi-step chains; do not nest.
- `fibe_run` — last-resort CLI escape hatch (less safe; avoid).
