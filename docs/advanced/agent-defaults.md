---
title: Agent Defaults
description: Account-wide defaults for new Genies — CLI version, system prompt, environment, MCP servers, mounted files, post-init.
slug: /advanced/agent-defaults
sidebar_position: 8
keywords: [agent defaults, Genie defaults, system prompt, MCP, mounted files, CLI version]
---

Account-wide defaults for new Genies. Two levels:

- **General defaults** — apply to every new Genie regardless of provider.
- **Per-provider defaults** — apply to new Genies of a specific provider (Claude, Gemini, OpenCode, etc.) and override the general default.

The settings cascade for a Genie is: per-Genie → per-provider default → general default → platform default → built-in default. See [Genies → Settings cascade](/concepts/agents/#settings-cascade).

## Configurable fields

| Field | What it controls |
| --- | --- |
| **CLI version** | Pin a provider CLI version (e.g. `v0.12.3`). Blank = latest. |
| **Image tag** | Docker image tag. Blank = provider default. |
| **CPU limit** | Container CPU (e.g. `1.5` or `2`). |
| **Build in public** | Default visibility on new Genies. |
| **June15 (PTY-wrapped Claude)** | Route Claude through a PTY-driven TUI wrapper. Feature-parity transparent. |
| **MCP JSON** | Custom MCP server configuration. Merged with admin defaults. |
| **Custom environment** | KEY=VALUE pairs. Highest precedence in the env merge. One per line. Drop a `.env` file or type. |
| **Agent rules** | Rules file content (e.g. `CLAUDE.md`, `GEMINI.md`). Synced to the agent workspace on every run. |
| **System prompt** | Default system prompt for new Genies. |
| **Mounted files** | Files auto-mounted into the Genie's workspace. |
| **Post-init script** | Runs once on environment setup. |

## Content modes

For text fields that already have an upstream value (per-provider, platform, or built-in default), three modes:

- **Use default** — inherit verbatim.
- **Append** — extend the upstream value.
- **Override** — replace entirely.

Append is the safe default. Override only when the upstream value gets in the way.

## Per-provider page

Click a provider to open its defaults. The page mirrors the general defaults page with the provider's own values. Save propagates to all Genies of that provider that don't override the field per-Genie.

## Reset

Each field has a reset action: drop the account value and fall back to the next level in the cascade.

## Related

- [Your Genies](/concepts/agents/) — per-Genie configuration.
- [MCP server](/sdk/mcp-server/) — what custom MCP JSON points at.
