---
title: "Run"
description: "Use when no native MCP tool fits and you need a last-resort escape hatch to invoke an arbitrary fibe CLI command when no MCP tool fits. Avoid; native MCP tools and fibe_call are safer."
slug: /reference/tools/run
sidebar_label: "Run"
image: /img/og/reference-tools-run.png
keywords: ["Fibe", "Tool", "fibe", "tool", "run"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:SIDEEFFECTS] Tier: meta. Not idempotent.

Executes a `fibe <args>` CLI command process-internally (cobra `ExecuteContext`), captures stdout/stderr, returns both. Forces `--output json` automatically. Serializes calls under a per-server lock — concurrent `fibe_run` invocations queue.

## When to use
- A CLI subcommand has no MCP equivalent and is not registered in `fibe_tools_catalog`.
- Reproducing the exact behavior of a CLI invocation a Player ran in their terminal.

## When NOT to use
- A native MCP tool exists — use it.
- A registered tool exists but is hidden — use `fibe_call`.
- You need a multi-step workflow — use `fibe_pipeline`.

The runtime returns a `recommended_tool` warning when it detects a CLI path that maps to a dedicated MCP tool (e.g., `playgrounds create` → `fibe_resource_mutate`). Heed it.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `args` | array of scalars | yes | CLI tokens after `fibe`, e.g. `["playgrounds","list","--limit","5"]`. String/number/bool only. |
| `timeout_ms` | integer | no | Per-call timeout in milliseconds. Strongly recommended. |

## Output
```json
{
  "args": ["--output","json","playgrounds","list"],
  "stdout": "...",
  "stderr": "...",
  "timeout_ms": 30000,
  "recommended_tool": "fibe_resource_list",
  "warning": "prefer fibe_resource_list over fibe_run when possible",
  "error": "...",                // only if cobra returned non-nil
  "timed_out": true,             // only if context deadline was hit
  "stdout_truncated": true,      // only if output exceeded capture buffer
  "stdout_total_bytes": 1500000,
  "capture_limit_bytes": 1048576
}
```

Capture buffer is 1MB per stream. When truncated, `total_bytes` shows the real size.

## Gotchas
- Args are JSON scalars — pass `["--limit","5"]`, not `["--limit",5]` mixed with quoting concerns. Numbers/bools auto-stringify.
- `--output json` is prepended; do not pass it yourself.
- stdout/stderr are buffered to memory for the entire run, then returned at once. Long-running CLI commands block until they exit (or `timeout_ms` fires).
- The CLI's output is also recommended to be JSON; non-JSON stdout is returned as-is.
- The lock is process-wide. Two parallel `fibe_run` calls in different MCP sessions still serialize.

## Related
- `fibe_call` — preferred when the target is a registered tool.
- `fibe_help` — read flag docs before running.
- `fibe_pipeline` — for chained workflows.
