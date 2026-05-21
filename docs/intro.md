---
title: Welcome to Fibe
description: Fibe runs Docker environments on your hosts from a browser. Add a Marquee, connect a Prop, launch a Playground.
slug: /intro
sidebar_position: 1
sidebar_label: Welcome
image: /img/og/intro.png
keywords: [Fibe, getting started, Docker environments, dev environments, AI agent, Genie]
---

Fibe runs Docker environments on hosts you control, fed from Git, steered from a browser. Launch in seconds, share a URL, attach an AI assistant, stop or extend when done.

## The shortest path

1. Add a [Marquee](/concepts/marquees/). A host that runs containers.
2. Connect a [Prop](/concepts/props/). A Git repo.
3. Pick or write a [Template](/concepts/playspecs/#templates). A Compose file plus a few Fibe labels.
4. Launch a [Playground](/concepts/playgrounds/) from a [Playspec](/concepts/playspecs/). Open the URL.

## Two shapes of work

| | What it is | When |
| --- | --- | --- |
| **[Playground](/concepts/playgrounds/)** | Long-running environment. URLs, logs, terminal. | Web apps, dashboards, dev servers. |
| **[Trick](/concepts/tricks/)** | One-shot run. Records pass/fail, cleans up. | Tests, migrations, backups, cron, CI. |

If the task should finish, use a Trick. If it should stay up, use a Playground.

## Bring a Genie

A [Genie](/concepts/agents/) is a configured AI assistant. Run one standalone or attach it to a Playground. It reads logs, edits source, runs commands, commits.

Keep many. One per job — refactoring, tests, docs. Each holds many conversations.

## What's next

- **New here?** [Marquees](/concepts/marquees/) → [Props](/concepts/props/) → [Templates](/concepts/playspecs/#templates) → [Playspecs](/concepts/playspecs/) → [Playgrounds](/concepts/playgrounds/).
- **Authoring a Template?** [Compose → Fibe](/authoring/compose-to-fibe/).
- **Driving from a script or CI?** [Fibe SDK](/sdk/intro/) ships the `fibe` CLI and a Go library.
- **Wiring an AI agent that should know Fibe?** [`llms.txt`](https://whats.fibe.gg/llms.txt), [`llm-skills.txt`](https://whats.fibe.gg/llm-skills.txt), [reference library](/reference/intro/). For agents that should act, run the [MCP server](/sdk/mcp-server/).
