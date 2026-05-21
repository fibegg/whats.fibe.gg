---
title: "Agents Duplicate"
description: "Use when you need to duplicate an existing Agent's configuration (settings, mounted files, defaults). Overseer tool — operates on managed Agents."
slug: /reference/tools/agents-duplicate
sidebar_label: "Agents Duplicate"
image: /img/og/reference-tools-agents-duplicate.png
keywords: ["Fibe", "Tool", "fibe", "tool", "agents", "duplicate"]
tags: ["reference", "tool", "tool"]
format: md
---

[MODE:OVERSEER] Idempotent. Tier: overseer.

Creates a copy of an Agent's configuration through `POST /api/agents/:id/duplicate`.

## When to use
- Cloning a tuned Agent for parallel evaluation.
- Spawning a sibling Agent with different runtime params.

## Inputs
| Field | Type | Required | Notes |
|---|---|---|---|
| `agent_id` | int or string | yes | Agent ID or name |

## Output
The new Agent's full JSON, including a fresh `id`/`name` (suffixed) and copied settings/mounts.

## Behavior
- Copies: agent settings, agent_defaults, mounted_files, default playground reference (`build_in_public_playground_id`), provider config.
- Does NOT copy: chat history, mutters, artefacts, feedbacks, or active chat sessions.
- New Agent starts unauthenticated; running `chat`/`message` requires re-auth.

## Gotchas
- The new Agent has no `agent_chats` — `start_chat` first if you want runtime interaction.
- Mounted file *contents* are copied; their volume mounts are re-created on first chat.
- Quota counted: counts against the player's max-agents quota.
- The duplicate's name is auto-suffixed when needed.

## Related
- `fibe_agents_start_chat` — bring the duplicate online.
- `fibe_resource_get(resource:"agent")` — inspect the original.
- `fibe_resource_mutate(resource:"agent", operation:"create")` — start from scratch instead.
