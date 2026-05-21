---
title: The Fibe SDK
description: One binary, three modes — a fibe CLI for the terminal, a Go library to embed, and an MCP server for AI agents. The interface to Fibe.
slug: /sdk/intro
sidebar_position: 1
sidebar_label: Overview
image: /img/og/sdk-intro.png
keywords: [Fibe SDK, fibe CLI, MCP server, Go library, automation, AI agent]
---

The Fibe SDK is the **interface to Fibe** — a single Go binary that runs in three modes depending on who's calling:

- **CLI**: you, at a terminal. `fibe playgrounds list`, `fibe agents chat`, `fibe trick run`.
- **Go library**: programs you write in Go that embed Fibe directly. Automate deployments, build a custom dashboard, write a control plane.
- **MCP server**: AI agents (Claude Code, Cursor, Antigravity, anything that speaks the Model Context Protocol). Agents call `fibe_*` tools and Fibe responds.

All three share the same authentication, the same resource model, the same retry / circuit-breaker / rate-limit logic. Pick your interface; the platform is the same.

## When to use which mode

| You are… | Use… |
| --- | --- |
| At a terminal | The **CLI**: `fibe ...` |
| A Go program that needs to drive Fibe | The **Go library** at `github.com/fibegg/sdk/fibe` |
| An LLM agent (Claude Code, Cursor, Codex, etc.) | The **MCP server**: `fibe mcp serve` and 42 tools |
| Writing a one-off shell script | The **CLI** with `-o json` for parseable output |
| Building CI/CD automation | The **CLI** from a workflow, with an API key |
| Embedding Fibe in your own SaaS | The **Go library** |

## The 60-second tour

```sh
# Install (macOS / Linux)
brew install fibegg/sdk/fibe

# First-time setup
fibe login                # browser device-code flow
fibe doctor               # check connectivity + auth

# Daily use
fibe playgrounds list
fibe agents chat my-genie --text "Hello"
fibe tricks trigger --playspec-id 42 --from-file inputs.json

# Run an MCP server for your AI agent
fibe mcp serve
fibe mcp install --client claude-code
```

That's the whole product surface, in a paragraph.

## What it talks to

The SDK is a **client** to the Fibe API. It doesn't run anything itself; it tells the platform what to do. On the other end is Fibe, which orchestrates [Marquees](/concepts/marquees/) (your Docker hosts), [Props](/concepts/props/) (your Git repos), [Templates](/concepts/playspecs/#templates), [Playgrounds](/concepts/playgrounds/), [Tricks](/concepts/tricks/), and [Genies](/concepts/agents/).

So the SDK is what gets you those resources from a script, an agent, or a CI job — same as the web UI gets them from a browser.

## The three modes in detail

### CLI

```sh
fibe <resource> <action> [flags]
```

A standard command tree. Every top-level resource family has the usual list / get / create / update / delete plus action-specific subcommands. Output defaults to a readable table; `-o json` and `-o yaml` produce parseable output for scripts. Many commands accept `-f file.json` to load a payload from a file or `-` for stdin.

Read on: [Install the CLI](/sdk/install/), [Authentication](/sdk/authentication/), [CLI reference](/sdk/cli-reference/).

### Go library

```go
import "github.com/fibegg/sdk/fibe"

client, _ := fibe.NewClient(fibe.WithAPIKey(os.Getenv("FIBE_API_KEY")))
pg, _ := client.Playgrounds.Create(ctx, &fibe.PlaygroundCreate{Name: "demo", PlayspecID: 5})
```

A thin Go wrapper over the Fibe HTTP API with sensible defaults: automatic retry on transient failures, circuit-breaker when the upstream is sick, idempotency-key generation for safe re-tries, rate-limit awareness, structured errors. Resource "managers" (`client.Playgrounds`, `client.Agents`, `client.Tricks`, …) mirror the REST shape.

Read on: [Go library](/sdk/go-library/).

### MCP server

```sh
fibe mcp serve                       # stdio, single-tenant
fibe mcp serve --transport sse       # SSE, multi-tenant
fibe mcp install --client claude-code
```

The same Go binary doubles as an MCP server. AI agents call `fibe_*` tools (41 of them across resource CRUD, playground actions, agent control, greenfield setup, multi-step pipelines, monitoring, repo management, and a few escape hatches). The catalog is in [Tools catalog](/sdk/tools-catalog/) and each tool has its own detail page under [Reference → Tools](/reference/tools/playgrounds-transform/).

Read on: [MCP server](/sdk/mcp-server/), [Tools catalog](/sdk/tools-catalog/).

## What's next

- [Install the CLI](/sdk/install/) — Homebrew, Go install, release binaries, Docker.
- [Authentication](/sdk/authentication/) — login flows, profiles, env vars.
- [CLI reference](/sdk/cli-reference/) — every command grouped by resource.
- [Go library](/sdk/go-library/) — embedding the SDK in your own programs.
- [MCP server](/sdk/mcp-server/) — running it for your AI agent.
- [Tools catalog](/sdk/tools-catalog/) — every MCP tool, in one place.
- [Common workflows](/sdk/workflows/) — greenfield, brownfield, pipelines, CI.
- [Troubleshooting](/sdk/troubleshooting/) — debug, common errors, schema introspection.
