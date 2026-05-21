---
title: MCP server
description: Run fibe mcp serve to expose 42 typed tools to your AI agent. Stdio for single-tenant, SSE/HTTP for multi-tenant. Plug into Claude Code, Cursor, Antigravity, Codex.
slug: /sdk/mcp-server
sidebar_position: 6
sidebar_label: MCP server
image: /img/og/sdk-mcp-server.png
keywords: [MCP, Model Context Protocol, Claude Code, Cursor, AI agent, fibe mcp serve, Antigravity, Codex]
---

The `fibe` binary doubles as an **MCP server** — exposing the same resource surface as the CLI and library, but as **typed tools** an AI agent can call directly. No subprocess overhead, no shell parsing, no string-matching the help text. Your agent gets a real tool API.

42 tools across 9 families. Each one is documented individually under [Reference → Tools](/reference/tools/playgrounds-transform/). The [Tools catalog](/sdk/tools-catalog/) page is the table-of-contents.

## Run the server

```sh
# Stdio (default) — for local single-tenant agents like Claude Code.
fibe mcp serve

# SSE — Server-Sent Events over HTTP. Multi-tenant capable.
fibe mcp serve --transport sse --port 4400

# HTTP — Plain HTTP, JSON-RPC. Multi-tenant capable.
fibe mcp serve --transport http --port 4400
```

The server inherits your active CLI profile by default. For multi-tenant deployments, see "Multi-tenant auth" below.

Tools preserve funding failures as structured MCP errors. When a target Marquee is unpaid, tools return `MARQUEE_NOT_FUNDED` with status `402`.

## Install into a client

The `fibe mcp install` helper writes the right config snippet for popular clients:

```sh
fibe mcp install --client claude-code
fibe mcp install --client claude-desktop
fibe mcp install --client cursor
fibe mcp install --client vscode
fibe mcp install --client antigravity
fibe mcp install --client codex
```

If your client isn't on that list, the snippet is small enough to write by hand. The `mcp install` command also prints what it added — copy-paste it into a config file the client picks up.

### Manual configuration (Claude Code example)

```jsonc
{
  "mcpServers": {
    "fibe": {
      "command": "fibe",
      "args": ["mcp", "serve"],
      "env": {
        "FIBE_API_KEY": "fibe_live_yourkeyhere"  // or omit and use the default profile
      }
    }
  }
}
```

Restart the client; it picks up the server on start. Tools appear as `fibe_*` in the agent's tool list.

## Tool surface filters

42 tools is a lot for an agent to keep in working memory. You can narrow the surface:

```sh
FIBE_MCP_TOOLS=core fibe mcp serve         # essential tools only (~12 tools)
FIBE_MCP_TOOLS=full fibe mcp serve         # everything (default)
FIBE_MCP_TOOLS=meta,resource fibe mcp serve  # specific tiers
```

The categories are listed on the [Tools catalog](/sdk/tools-catalog/) page. Most agents do fine with `core` for everyday work and `full` only when they need the deeper escape hatches.

## What the tools cover

Each family has its own group on the [Tools catalog](/sdk/tools-catalog/) page, but the headline:

| Family | Examples |
| --- | --- |
| **Auth & Meta** | `fibe_auth_set`, `fibe_doctor`, `fibe_status`, `fibe_schema`, `fibe_help`, `fibe_tools_catalog`, `fibe_call`, `fibe_run` |
| **Resource CRUD** | `fibe_resource_list`, `_get`, `_mutate`, `_delete`, `_watch` |
| **Playgrounds** | `fibe_playgrounds_wait`, `_logs`, `_logs_follow`, `_action`, `_debug`, `_transform` |
| **Agents** | `fibe_agents_duplicate`, `_runtime_status`, `_send_message`, `_start_chat` |
| **Greenfield** | `fibe_launch_create`, `fibe_greenfield_create`, `fibe_templates_launch`, `_search`, `_change`, `fibe_github_repos_create`, `fibe_gitea_repos_create` |
| **Monitoring** | `fibe_monitor_list`, `_follow`, `fibe_mutter`, `_mutters_get`, `_feedbacks_*` |
| **Local dev** | `fibe_local_playgrounds_info`, `_link` |
| **Pipelines** | `fibe_pipeline`, `_pipeline_result` (multi-step composition) |
| **Repos** | `fibe_find_github_repos`, `_get_github_token`, `_repo_status_check` |

The full annotated list is on [Tools catalog](/sdk/tools-catalog/).

Any tool that launches, rebuilds, streams, inspects, schedules, stops, deletes, cleans up, or talks to a Marquee requires that Marquee to be funded.

## Multi-tenant auth

When you host the MCP server somewhere shared (a SaaS, a team relay, a Cloudflare Worker), every connecting agent needs its own credentials.

Three options stack:

1. **`Authorization: Bearer <fibe-api-key>` HTTP header** — the agent sends its key with each request. Use this when the agent's API key is known up front.
2. **`fibe_auth_set` tool** — the agent calls this tool first to set its credentials for the rest of the session. Useful when the credential is discovered at run time (e.g. fetched from a vault).
3. **Default profile fallback** — single-tenant; not for shared deployments.

Force the multi-tenant model with:

```sh
FIBE_MCP_REQUIRE_AUTH=1 fibe mcp serve --transport http --port 4400
```

With that env var set, the server refuses any request that doesn't carry credentials. No accidental privilege escalation from the host's default profile.

## The "yolo" flag

By default, destructive tools (delete, rollout, transform) prompt the agent for confirmation through a protocol-level confirm step. For known-good automation, you can skip it:

```sh
FIBE_MCP_YOLO=1 fibe mcp serve
```

Use this sparingly. The confirm step exists because LLM agents occasionally request more than they should — losing it on a multi-tenant server means a confused agent can delete things.

## Progress notifications

Long-running tools (`fibe_playgrounds_logs_follow`, `fibe_monitor_follow`, `fibe_pipeline`) emit MCP-protocol progress events while they work. Compatible clients (Claude Code, Cursor) render these as a streaming status indicator in the chat.

The agent gets a "still going, here's what I've seen so far" experience instead of a long silent wait.

## Pipelines

`fibe_pipeline` is the most powerful tool in the catalog. It runs multiple Fibe calls in sequence, threads results between them via JSONPath bindings, can run blocks in parallel, supports `for_each` loops, and caches results for 5 minutes.

A typical use: "create a new Prop, then create a Playspec from a template against it, then launch a Playground from the Playspec, then wait for it to be ready, then return the URL". One tool call, one result, with full backoff and error handling under the hood.

See [Common workflows → Pipelines](/sdk/workflows/) for an example.

## Inspect what's available

The agent itself can introspect:

```
fibe_tools_catalog        # list every tool with descriptions
fibe_schema               # ask for the JSON schema of a tool's args
fibe_help <command>       # CLI help for an equivalent command
```

These are first-class tools so an agent that doesn't know what you're asking can figure it out.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| The client can't find `fibe` | Make sure it's on `PATH` for the user the client runs as. `command: "/usr/local/bin/fibe"` in the config is sometimes needed. |
| Calls fail with "no credentials" | Either the profile isn't set, or `FIBE_API_KEY` is missing for the env. Run `fibe doctor` outside the client to confirm. |
| Tools list is empty | Check `FIBE_MCP_TOOLS` — it might be set to a tier with no matching tools. |
| Agent gets stuck waiting | The agent probably has the destructive-confirm gate enabled. Either confirm in the client UI or set `FIBE_MCP_YOLO=1` if you trust the workflow. |
| `Authorization` header isn't being honored | Make sure `FIBE_MCP_REQUIRE_AUTH=1` and the transport is `http`/`sse` (stdio is single-tenant). |

## Next step

The [Tools catalog](/sdk/tools-catalog/) is the table of contents for every tool. From there, each tool's detail page is one click away.
